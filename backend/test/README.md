# 🧪 Suite de Pruebas de Integración

Este directorio contiene todas las pruebas de integración y unitarias del sistema de ventas multiempresa.

## 📁 Estructura de Carpetas

```
test/
├── setup.js                      # Configuración global de Mocha
├── helpers/                      # Utilidades para pruebas
│   ├── db.helpers.js            # Helpers de base de datos
│   ├── auth.helpers.js          # Helpers de autenticación
│   └── fixtures.js              # Datos de prueba predefinidos
├── integration/                  # Pruebas de integración
│   ├── auth/                    # Pruebas de autenticación
│   │   ├── register.test.js
│   │   ├── login.test.js
│   │   ├── verify-email.test.js
│   │   ├── password-reset.test.js
│   │   └── sessions.test.js
│   └── moderation/              # Pruebas de moderación
│       ├── user-management.test.js
│       ├── permissions.test.js
│       ├── suspend-users.test.js
│       └── session-management.test.js
└── unit/                        # Pruebas unitarias
    ├── middlewares/             # Pruebas de middlewares
    └── services/                # Pruebas de servicios
```

## 🚀 Ejecutar Pruebas

### Todas las pruebas
```bash
npm test
```

### Solo pruebas de integración
```bash
npm run test:integration
```

### Solo pruebas unitarias
```bash
npm run test:unit
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### Con cobertura de código
```bash
npm run test:coverage
```

## 📊 Reportes de Cobertura

Después de ejecutar `npm run test:coverage`, puedes ver el reporte HTML en:
```
coverage/index.html
```

## 🛠️ Configuración

### Variables de Entorno
Las pruebas usan el archivo `.env` del directorio raíz. Asegúrate de tener configuradas:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

### Base de Datos
⚠️ **IMPORTANTE**: Las pruebas limpian la base de datos antes de cada suite. 
Se recomienda usar una base de datos separada para pruebas.

## 📝 Escribir Nuevas Pruebas

### Ejemplo de prueba de integración:

```javascript
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { cleanAuthTables } = require('../helpers/db.helpers');
const { testUsers } = require('../helpers/fixtures');

describe('POST /api/auth/register', () => {
  before(async () => {
    await cleanAuthTables();
  });

  it('debe registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUsers.validBuyer)
      .expect(201);

    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('user');
  });
});
```

## 🔍 Helpers Disponibles

### Base de Datos (`db.helpers.js`)
- `cleanDatabase()` - Limpia toda la base de datos
- `cleanAuthTables()` - Limpia solo tablas de autenticación
- `cleanModerationTables()` - Limpia tablas de moderación
- `userExists(email)` - Verifica si existe un usuario
- `getUserByEmail(email)` - Obtiene usuario por email
- `getUserById(id)` - Obtiene usuario por ID
- `countActiveSessions(userId)` - Cuenta sesiones activas
- `countModerationActions(moderatorId)` - Cuenta acciones de moderación

### Autenticación (`auth.helpers.js`)
- `createTestUser(data)` - Crea usuario de prueba
- `createTestBuyer(data)` - Crea comprador de prueba
- `createTestSeller(data)` - Crea vendedor de prueba
- `createTestModerator(data)` - Crea moderador de prueba
- `createTestAdmin(data)` - Crea administrador de prueba
- `createUnverifiedUser(data)` - Crea usuario sin verificar
- `createSuspendedUser(data)` - Crea usuario suspendido
- `getAuthHeaders(token)` - Genera headers de autorización
- `loginUser(email, password)` - Login manual
- `closeAllUserSessions(userId)` - Cierra todas las sesiones

### Fixtures (`fixtures.js`)
- `testUsers` - Usuarios de prueba predefinidos
- `loginCredentials` - Credenciales de login
- `verificationCodes` - Códigos de verificación
- `errorMessages` - Mensajes de error esperados
- Y más...

## ✅ Mejores Prácticas

1. **Limpia la BD antes de cada suite**: Usa `before()` con helpers de limpieza
2. **Usa fixtures**: No crees datos hardcodeados en las pruebas
3. **Nombres descriptivos**: Usa `describe` e `it` con descripciones claras
4. **Aserciones específicas**: Verifica valores exactos, no solo tipos
5. **Manejo de errores**: Prueba tanto casos exitosos como errores
6. **Timeouts**: Ajusta timeouts para pruebas lentas (base de datos, emails)
7. **Independencia**: Cada prueba debe poder ejecutarse de forma independiente

## 🐛 Debugging

Para ver logs detallados durante las pruebas, descomenta las líneas en `setup.js`:
```javascript
// console.log = () => {};
// console.info = () => {};
```

## 📚 Recursos

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Istanbul/NYC Coverage](https://istanbul.js.org/)

