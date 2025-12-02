/**
 * Helper para interactuar con la base de datos durante los tests E2E
 * 
 * Este helper permite obtener códigos de verificación, tokens, etc.
 * desde la base de datos para automatizar flujos que requieren verificación.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Obtener el directorio del archivo actual (compatible con ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Intentar múltiples rutas posibles para el archivo .env
const possiblePaths = [
  // Ruta relativa desde el DBHelper (frontend/e2e/utils/ -> frontend/)
  resolve(__dirname, '../../..', '.env'),
  // Ruta desde process.cwd() (si se ejecuta desde frontend/)
  resolve(process.cwd(), '.env'),
  // Ruta desde process.cwd() con subdirectorio (si se ejecuta desde raíz del proyecto)
  resolve(process.cwd(), 'frontend', '.env'),
];

let envPath: string | null = null;
let result: dotenv.DotenvConfigOutput | null = null;

// Intentar cargar desde cada ruta posible
for (const path of possiblePaths) {
  if (existsSync(path)) {
    envPath = path;
    result = dotenv.config({ path });
    if (!result.error) {
      console.log(`✅ Variables de entorno cargadas desde: ${envPath}`);
      console.log(`   Variables cargadas: ${Object.keys(result.parsed || {}).length}`);
      break;
    }
  }
}

// Si ninguna ruta funcionó, intentar cargar sin ruta específica (desde process.cwd())
if (!result || result.error) {
  console.warn('⚠️  No se encontró .env en las rutas esperadas. Intentando carga por defecto...');
  result = dotenv.config();
  if (result.error) {
    console.error('❌ Error cargando variables de entorno:', result.error.message);
  } else {
    console.log('✅ Variables de entorno cargadas (ruta por defecto)');
  }
}

// Configuración de conexión a la BD (usar variables de entorno o valores por defecto)
// Nota: Si DB_PASSWORD no está definida, se usa undefined (no cadena vacía) para evitar errores de SCRAM
const poolConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_ventas',
  user: process.env.DB_USER || 'postgres',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Solo incluir password si está definida (evita errores de SCRAM)
// Si no está definida en .env, usar la contraseña por defecto del sistema
const dbPassword = process.env.DB_PASSWORD;
if (dbPassword !== undefined && dbPassword !== '' && dbPassword.trim() !== '') {
  // Eliminar espacios en blanco y caracteres de nueva línea
  poolConfig.password = dbPassword.trim().replace(/\r?\n/g, '');
  console.log('✅ DB_PASSWORD cargada desde .env');
} else {
  // Contraseña por defecto para pruebas E2E
  poolConfig.password = '7dejunio';
  console.warn('⚠️  DB_PASSWORD no está configurada en .env. Usando contraseña por defecto para E2E.');
}

// Log de configuración (sin mostrar la contraseña completa por seguridad)
console.log('🔌 Configuración de BD:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  hasPassword: !!poolConfig.password,
  passwordLength: poolConfig.password?.length || 0,
  passwordSource: dbPassword ? 'env' : 'default'
});

const pool = new Pool(poolConfig);

export class DBHelper {
  /**
   * Obtener código de verificación de email para un usuario
   */
  async getVerificationCode(email: string): Promise<string | null> {
    try {
      const result = await pool.query(
        'SELECT token_verificacion FROM usuarios WHERE correo = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].token_verificacion || null;
    } catch (error) {
      console.error('Error obteniendo código de verificación:', error);
      return null;
    }
  }

  /**
   * Verificar email de un usuario directamente en la BD
   * Útil para tests que no requieren probar el flujo de verificación
   */
  async verifyUserEmail(email: string): Promise<boolean> {
    try {
      // Primero verificar que el usuario existe
      const checkResult = await pool.query(
        'SELECT id, estado, email_verificado FROM usuarios WHERE correo = $1',
        [email]
      );
      
      if (checkResult.rows.length === 0) {
        console.error(`Usuario con email ${email} no encontrado en la BD`);
        return false;
      }
      
      const estadoAnterior = checkResult.rows[0].estado;
      console.log(`Estado anterior del usuario ${email}: ${estadoAnterior}`);
      
      // Actualizar el usuario
      const result = await pool.query(
        `UPDATE usuarios 
         SET email_verificado = true, 
             estado = 'activo'::estado_usuario,
             token_verificacion = NULL,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE correo = $1
         RETURNING id, estado, email_verificado`,
        [email]
      );
      
      if (result.rows.length === 0) {
        console.error(`No se pudo actualizar el usuario ${email}`);
        return false;
      }
      
      const estadoNuevo = result.rows[0].estado;
      console.log(`Estado nuevo del usuario ${email}: ${estadoNuevo}`);
      
      // Verificar que realmente se actualizó
      const verifyResult = await pool.query(
        'SELECT estado, email_verificado FROM usuarios WHERE correo = $1',
        [email]
      );
      
      if (verifyResult.rows.length > 0) {
        const estadoFinal = verifyResult.rows[0].estado;
        const emailVerificado = verifyResult.rows[0].email_verificado;
        console.log(`Verificación final - Estado: ${estadoFinal}, Email verificado: ${emailVerificado}`);
        
        return estadoFinal === 'activo' && emailVerificado === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }

  /**
   * Obtener el estado de un usuario
   */
  async getUserStatus(email: string): Promise<string | null> {
    try {
      const result = await pool.query(
        'SELECT estado FROM usuarios WHERE correo = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].estado || null;
    } catch (error) {
      console.error('Error obteniendo estado del usuario:', error);
      return null;
    }
  }

  /**
   * Obtener código de recuperación de contraseña
   * El código se guarda en token_recuperacion de la tabla usuarios
   */
  async getPasswordResetCode(email: string): Promise<string | null> {
    try {
      const result = await pool.query(
        `SELECT token_recuperacion FROM usuarios 
         WHERE correo = $1 AND token_recuperacion IS NOT NULL`,
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].token_recuperacion || null;
    } catch (error) {
      console.error('Error obteniendo código de reset:', error);
      return null;
    }
  }

  /**
   * Restaurar contraseña de un usuario a un hash específico
   * Útil para restaurar contraseñas después de tests
   */
  async restorePassword(email: string, passwordHash: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE usuarios 
         SET password_hash = $1, 
             token_recuperacion = NULL,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE correo = $2
         RETURNING id`,
        [passwordHash, email]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error restaurando contraseña:', error);
      return false;
    }
  }

  /**
   * Limpiar datos de prueba
   */
  async cleanupTestData(emailPrefix: string = 'test-'): Promise<void> {
    try {
      await pool.query(
        'DELETE FROM usuarios WHERE correo LIKE $1',
        [`${emailPrefix}%`]
      );
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
    }
  }

  /**
   * Cerrar conexión
   * NOTA: El pool es compartido entre todos los tests, por lo que no se cierra
   * para evitar errores cuando otros tests intentan usarlo.
   * El pool se cerrará automáticamente cuando termine el proceso de Node.js.
   */
  async disconnect(): Promise<void> {
    // No cerrar el pool compartido - se reutiliza entre tests
    // await pool.end();
  }
}
