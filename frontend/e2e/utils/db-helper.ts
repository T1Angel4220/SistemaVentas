/**
 * Helper para interactuar con la base de datos durante los tests E2E
 * 
 * Este helper permite obtener códigos de verificación, tokens, etc.
 * desde la base de datos para automatizar flujos que requieren verificación.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env (ruta relativa desde la raíz del proyecto frontend)
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Configuración de conexión a la BD (usar variables de entorno o valores por defecto)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_ventas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

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
