# 🧪 Pruebas de Integración - Sistema de Ventas

## 📋 Descripción

Este documento describe las **pruebas de integración** implementadas para el módulo de autenticación del sistema de ventas multiempresa.

### ✅ Tecnología Elegida por el Grupo

**Framework:** Mocha + Chai + Supertest

**Tipo de prueba:** Funcionales (Integración)

**Justificación:**
- ✅ Adecuado para pruebas de integración en APIs Express
- ✅ Soporta tests asíncronos y mocks
- ✅ Valida comunicación entre módulos y endpoints
- ✅ Interactúa con base de datos real (PostgreSQL)

---

## 📂 Estructura de Archivos

```
backend/
├── .mocharc.js                                    # Configuración de Mocha
├── src/
│   └── __tests__/
│       ├── unit/                                  # Pruebas unitarias (Jest)
│       │   └── authController.test.js
│       └── integration/                           # Pruebas de integración (Mocha)
│           ├── setup/
│           │   ├── hooks.js                      # Setup/teardown global
│           │   ├── testDatabase.js               # Configuración BD prueba
│           │   ├── testHelpers.js                # Funciones auxiliares
│           │   └── testData.js                   # Datos de prueba
│           └── auth.integration.test.js          # Tests de autenticación
└── package.json                                   # Scripts de prueba
```

---

## 🚀 Comandos de Prueba

### Ejecutar todas las pruebas de integración
```bash
npm run test:integration
```

### Ejecutar solo pruebas de autenticación
```bash
npm run test:integration:auth
```

### Modo watch (desarrollo)
```bash
npm run test:integration:watch
```

### Ejecutar todas las pruebas (unitarias + integración)
```bash
npm run test:all
```

---

## 🧪 Cobertura de Pruebas de Autenticación

### 1️⃣ Registro de Usuarios (7 pruebas)
- ✅ Registro exitoso de comprador
- ✅ Registro exitoso de vendedor
- ❌ Rechazo de email duplicado
- ❌ Rechazo de cédula duplicada
- ❌ Rechazo de email inválido
- ❌ Rechazo de contraseña corta
- ❌ Rechazo de tipo de usuario inválido

### 2️⃣ Verificación de Email (4 pruebas)
- ✅ Verificación exitosa con código válido
- ❌ Rechazo de código incorrecto
- ❌ Rechazo sin código
- ❌ Rechazo de email inexistente

### 3️⃣ Reenvío de Código (3 pruebas)
- ✅ Reenvío exitoso
- ❌ Rechazo si cuenta ya verificada
- ❌ Rechazo de email inexistente

### 4️⃣ Login (6 pruebas)
- ✅ Login exitoso con credenciales válidas
- ❌ Rechazo de email inexistente
- ❌ Rechazo de contraseña incorrecta
- ❌ Rechazo de cuenta no verificada
- ❌ Rechazo de cuenta suspendida
- ❌ Rechazo de cuenta inactiva

### 5️⃣ Recuperación de Contraseña (2 pruebas)
- ✅ Envío de código exitoso
- ✅ Respuesta genérica por seguridad

### 6️⃣ Reseteo de Contraseña (4 pruebas)
- ✅ Reseteo exitoso con código válido
- ❌ Rechazo de código inválido
- ❌ Rechazo de contraseña igual a la anterior
- ❌ Rechazo de contraseña muy corta

### 7️⃣ Obtener Perfil (3 pruebas)
- ✅ Obtención exitosa con token válido
- ❌ Rechazo sin token
- ❌ Rechazo de token inválido

### 8️⃣ Logout (2 pruebas)
- ✅ Cierre de sesión exitoso
- ❌ Rechazo sin token

### 9️⃣ Gestión de Sesiones Múltiples (2 pruebas)
- ✅ Múltiples sesiones activas
- ✅ Cierre independiente de sesiones

---

## 📊 Resumen de Cobertura

**Total de pruebas:** 35 pruebas de integración

| Suite | Pruebas | Cobertura |
|-------|---------|-----------|
| Registro | 7 | Flujo completo |
| Verificación Email | 5 | Flujo completo |
| Reenvío Código | 3 | Flujo completo |
| Login | 6 | Todos los estados |
| Recuperación Password | 2 | Flujo completo |
| Reseteo Password | 5 | Validaciones |
| Perfil | 3 | Autenticación |
| Logout | 2 | Sesiones |
| Sesiones Múltiples | 2 | Concurrencia |

---

## 🎯 Qué Validan las Pruebas de Integración

### vs. Pruebas Unitarias (Jest)
- **Unitarias:** Validan funciones aisladas con mocks
- **Integración:** Validan flujos completos con BD real

### Componentes Integrados
✅ **Express API** - Endpoints REST completos
✅ **PostgreSQL** - Base de datos real (no mocks)
✅ **JWT Service** - Generación real de tokens
✅ **Bcrypt** - Encriptación real de contraseñas
✅ **Email Service** - Generación de códigos reales

---

## 🔧 Configuración

### Base de Datos
- Usa la **misma BD** que desarrollo pero limpia datos entre tests
- **NO elimina** usuarios del sistema (admin, moderador)
- **Solo elimina** usuarios de prueba (`@test.com`, `@ejemplo.com`)

### Hooks Globales
```javascript
before()     // Conecta a BD y limpia antes de todo
beforeEach() // Limpia antes de cada test
afterEach()  // Limpia después de cada test
after()      // Cierra conexiones al finalizar
```

---

## 🛠️ Helpers Disponibles

### testHelpers.js
```javascript
createTestUser()       // Crear usuario de prueba
createTestSeller()     // Crear vendedor
createTestModerator()  // Crear moderador
createTestAdmin()      // Crear administrador
getUserByEmail()       // Buscar usuario
getVerificationCode()  // Obtener código verificación
countActiveSessions()  // Contar sesiones activas
```

### testData.js
```javascript
testUsers.buyer        // Comprador estándar
testUsers.seller       // Vendedor estándar
testUsers.moderator    // Moderador
testUsers.admin        // Administrador
testUsers.unverified   // No verificado
testUsers.suspended    // Suspendido
testUsers.inactive     // Inactivo
```

---

## 📈 Próximas Pruebas de Integración

### Pendientes de Implementar
1. **Productos** - Ciclo de vida completo (crear, moderar, aprobar)
2. **Permisos** - Validación de roles y accesos
3. **Imágenes** - Subida y gestión de archivos
4. **Búsqueda** - Filtros y paginación

---

## ⚡ Ejecución Rápida

```bash
# Backend
cd backend

# Solo integración de autenticación
npm run test:integration:auth

# Todas las pruebas de integración
npm run test:integration

# TODO (unitarias + integración)
npm run test:all
```

---

## 📝 Notas Importantes

1. **Tiempo de ejecución:** ~10-15 segundos por suite completa
2. **Requiere BD activa:** PostgreSQL debe estar corriendo
3. **Variables de entorno:** `.env` debe estar configurado
4. **Puerto:** Backend debe estar disponible en puerto configurado
5. **Limpieza automática:** Los datos de prueba se eliminan automáticamente

---

## 🆚 Comparación con Jest

| Aspecto | Jest (Unitarias) | Mocha (Integración) |
|---------|------------------|---------------------|
| Velocidad | ⚡ Muy rápido (~2s) | 🐢 Más lento (~15s) |
| BD Real | ❌ No (mocks) | ✅ Sí |
| Aislamiento | ✅ Total | ⚠️ Parcial |
| Cobertura | Funciones | Flujos completos |
| Uso | Desarrollo TDD | Validación E2E API |

---

## ✅ Criterios de Éxito

Una prueba de integración es exitosa si:

1. ✅ Todos los endpoints responden correctamente
2. ✅ Los datos se persisten en la base de datos
3. ✅ Los tokens JWT son válidos y funcionales
4. ✅ Las validaciones de negocio se cumplen
5. ✅ Los errores se manejan apropiadamente
6. ✅ El estado de la BD es consistente después de cada test

---

## 📞 Soporte

Si encuentras problemas ejecutando las pruebas:

1. Verifica que PostgreSQL esté corriendo
2. Verifica las variables de entorno en `.env`
3. Ejecuta `npm install` para asegurar dependencias
4. Revisa los logs de la base de datos
5. Limpia la BD manualmente si es necesario

---

**Última actualización:** Octubre 2025
**Tecnología:** Mocha v11.7.4 + Chai v6.2.0 + Supertest v7.1.4
**Autor:** Grupo de Pruebas e Implantación de Software

