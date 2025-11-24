# 📋 Documentación de Pruebas de Integración - Sistema de Ventas

## Tabla Resumen de Casos de Prueba

| Número del Caso de Prueba | Componente | Descripción de lo que se Probará | Prerrequisitos |
|---------------------------|------------|----------------------------------|----------------|
| CF0001 | Configuración | Verificación de conexión a base de datos | Servidor de base de datos activo |
| CF0002 | Configuración | Verificación de respuesta en rutas principales | Servidor Express activo |
| CF0003 | Configuración | Verificación de variables de entorno esenciales | Archivo .env configurado |
| CF0004 | Configuración | Verificación de helpers de prueba disponibles | Archivos de helpers en ruta correcta |
| CF0005 | Autenticación - Registro | Registro exitoso de comprador con código de verificación | Base de datos limpia |
| CF0006 | Autenticación - Registro | Registro exitoso de vendedor | Base de datos limpia |
| CF0007 | Autenticación - Verificación | Verificación de email con código válido | Usuario registrado pendiente de verificación |
| CF0008 | Autenticación - Verificación | Rechazo de códigos de verificación inválidos | Usuario registrado pendiente de verificación |
| CF0009 | Autenticación - Registro | Rechazo de registro con email duplicado | Usuario existente con mismo email |
| CF0010 | Autenticación - Registro | Rechazo de registro con cédula duplicada | Usuario existente con misma cédula |
| CF0011 | Autenticación - Registro | Rechazo de registro sin correo o con correo inválido | Base de datos limpia |
| CF0012 | Autenticación - Registro | Rechazo de registro sin campos requeridos o contraseña muy corta | Base de datos limpia |
| CF0013 | Autenticación - Verificación | Rechazo de código de verificación ya utilizado | Usuario con código verificado previamente |
| CF0014 | Autenticación - Login | Login exitoso con usuario activo y creación de sesión | Usuario activo con email verificado |
| CF0015 | Autenticación - Login | Rechazo de login con contraseña incorrecta | Usuario registrado y activo |
| CF0016 | Autenticación - Login | Rechazo de login con email no registrado | Base de datos limpia |
| CF0017 | Autenticación - Login | Bloqueo de login para usuario suspendido | Usuario con estado suspendido |
| CF0018 | Autenticación - Login | Bloqueo de login para usuario sin verificar email | Usuario con estado pendiente_verificacion |
| CF0019 | Autenticación - Sesiones | Múltiples sesiones simultáneas y acceso con token válido | Usuario activo |
| CF0020 | Autenticación - Sesiones | Rechazo de token malformado o ausente | Endpoint protegido |
| CF0021 | Autenticación - Logout | Cierre de sesión e invalidación de token | Usuario con sesión activa |
| CF0022 | Autenticación - Login | Almacenamiento de IP y User-Agent en sesión creada | Usuario activo |
| CF0023 | Autenticación - Recuperación | Solicitud de reset con correo válido y generación de código | Usuario activo registrado |
| CF0024 | Autenticación - Recuperación | Solicitud de reset con correo no existente (respuesta genérica) | Base de datos sin el correo |
| CF0025 | Autenticación - Recuperación | Reset exitoso con código válido e invalidación de sesiones | Usuario con código de recuperación generado |
| CF0026 | Autenticación - Recuperación | Rechazo de reset con misma contraseña | Usuario con código de recuperación |
| CF0027 | Autenticación - Recuperación | Rechazo de códigos inválidos y contraseña muy corta | Usuario con código de recuperación |
| CF0028 | Autenticación - Recuperación | Bloqueo de reset para usuario suspendido | Usuario con estado suspendido |
| CF0029 | Autenticación - Perfil | Obtención de perfil del usuario autenticado | Usuario con sesión activa |
| CF0030 | Autenticación - Perfil | Rechazo de acceso sin token o con token inválido | Endpoint protegido |
| CF0031 | Autenticación - Perfil | Actualización de campos individuales y múltiples campos | Usuario con sesión activa |
| CF0032 | Autenticación - Perfil | Rechazo de actualización sin campos o sin autenticación | Usuario con sesión activa |
| CF0033 | Autenticación - Perfil | Validación de campos inmutables (cédula, correo, tipo_usuario) | Usuario con sesión activa |
| CF0034 | Autenticación - Perfil | Cambio de contraseña exitoso e invalidación de anterior | Usuario con sesión activa |
| CF0035 | Autenticación - Perfil | Validaciones de cambio de contraseña (incorrecta, misma, corta) | Usuario con sesión activa |
| CF0036 | Autenticación - Perfil | Seguridad: usuario solo accede a su propio perfil | Múltiples usuarios registrados |
| CF0037 | Autenticación - Perfil | Persistencia de datos y actualización de fecha_actualizacion | Usuario con sesión activa |
| CF0038 | Autenticación - Perfil | Validación de valores válidos de género | Usuario con sesión activa |
| CF0039 | Moderación - Gestión | Registro de moderador por administrador | Usuario administrador con sesión activa |
| CF0040 | Moderación - Gestión | Suspensión de usuarios por moderador/admin | Moderador o admin con sesión activa, usuarios comprador/vendedor existentes |
| CF0041 | Moderación - Gestión | Rechazo de login de usuario suspendido y reactivación exitosa | Usuario suspendido, moderador con sesión activa |
| CF0042 | Moderación - Gestión | Lista de usuarios con paginación y filtros | Moderador o admin con sesión activa |
| CF0043 | Moderación - Gestión | Registro de acciones en auditoría | Moderador con sesión activa |
| CF0044 | Moderación - Gestión | Suspensión y reactivación por administrador | Admin con sesión activa, usuarios existentes |
| CF0045 | Moderación - Gestión | Rechazo de suspensión por usuarios regulares (comprador/vendedor) | Comprador y vendedor con sesión activa |
| CF0046 | Moderación - Gestión | Rechazo de suspensión de administrador por moderador | Moderador con sesión activa, admin existente |
| CF0047 | Moderación - Gestión | Acceso denegado para usuario suspendido en todos los endpoints | Usuario suspendido con token activo |
| CF0048 | Moderación - Gestión | Cierre de sesiones al suspender y no reactivarlas automáticamente | Usuario con múltiples sesiones activas |
| CF0049 | Moderación - Gestión | Rechazo de registro de moderador sin permisos de admin | Moderador o comprador con sesión activa |
| CF0050 | Moderación - Gestión | Validación de campos en lista de usuarios y filtros combinados | Admin con sesión activa, múltiples usuarios |

---

## Plantillas Detalladas de Casos de Prueba

### CF0001: Verificación de Conexión a Base de Datos

Datos de Entrada del Caso:
- No aplica. Verificación técnica sin parámetros.

Resultado Esperado del Caso:
- La conexión a base de datos se establece exitosamente y se confirma que está activa.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Ejecutar verificación de conexión a la base de datos | La función checkDatabaseConnection() retorna true | | |
| 2 | Verificar que la conexión fue exitosa | Se confirma que isConnected es true | | |

---

### CF0002: Verificación de Respuesta en Rutas Principales

Datos de Entrada del Caso:
- Endpoint: GET "/"
- Método HTTP: GET
- Sin parámetros ni headers adicionales.

Resultado Esperado del Caso:
- El sistema responde correctamente con un mensaje de bienvenida en la ruta principal.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Acceder a la ruta principal del sistema | Respuesta HTTP 200, body contiene success: true y message | | |

---

### CF0003: Verificación de Variables de Entorno Esenciales

Datos de Entrada del Caso:
- Variables de entorno a verificar: process.env.NODE_ENV, process.env.DB_HOST, process.env.DB_NAME, process.env.JWT_SECRET
- Verificación mediante acceso directo a process.env

Resultado Esperado del Caso:
- Todas las variables de entorno críticas existen y están configuradas (NODE_ENV, DB_HOST, DB_NAME, JWT_SECRET).

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Verificar que existe la variable de entorno del entorno de ejecución | process.env.NODE_ENV existe y tiene valor | | |
| 2 | Verificar que existe la variable de host de base de datos | process.env.DB_HOST existe y tiene valor | | |
| 3 | Verificar que existe la variable de nombre de base de datos | process.env.DB_NAME existe y tiene valor | | |
| 4 | Verificar que existe la variable de secreto para tokens | process.env.JWT_SECRET existe y tiene valor | | |

---

### CF0004: Verificación de Helpers de Prueba Disponibles

Datos de Entrada del Caso:
- Archivo de helpers de BD: "../helpers/db.helpers"
- Archivo de helpers de autenticación: "../helpers/auth.helpers"
- Propiedades a verificar: dbHelpers.cleanAuthTables, authHelpers.createTestUser, authHelpers.getAuthHeaders

Resultado Esperado del Caso:
- Las funciones de helpers de BD y autenticación están disponibles para su uso en pruebas.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Cargar las funciones auxiliares de base de datos | dbHelpers tiene propiedad cleanAuthTables | | |
| 2 | Cargar las funciones auxiliares de autenticación | authHelpers tiene propiedades createTestUser y getAuthHeaders | | |

---

### CF0005: Registro Exitoso de Comprador con Código de Verificación

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Usuario tipo "comprador" registrado con estado "pendiente_verificación" y código de verificación de 6 dígitos generado.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Limpiar las tablas de autenticación en la base de datos | Las tablas quedan limpiadas sin errores | | |
| 2 | Enviar solicitud de registro de comprador | Respuesta HTTP 201, success: true, tipo_usuario: "comprador", estado: "pendiente_verificacion" | | |
| 3 | Verificar que el usuario fue creado en la base de datos | userExists() retorna true para el correo del usuario | | |
| 4 | Verificar que se generó un código de verificación | token_verificacion es un código de 6 dígitos, email_verificado es false | | |

---

### CF0006: Registro Exitoso de Vendedor

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Body JSON: { "cedula": "987654321", "nombre": "María", "apellido": "González", "correo": "maria.gonzalez@test.com", "telefono": "77777777", "direccion": "Heredia, Costa Rica", "genero": "femenino", "password": "Password456!", "tipo_usuario": "vendedor" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Usuario tipo "vendedor" registrado con estado "pendiente_verificación".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Limpiar las tablas de autenticación en la base de datos | Las tablas quedan limpiadas sin errores | | |
| 2 | Enviar solicitud de registro de vendedor | Respuesta HTTP 201, success: true, tipo_usuario: "vendedor", estado: "pendiente_verificacion" | | |
| 3 | Verificar que el usuario fue creado en la base de datos | userExists() retorna true para el correo del usuario | | |

---

### CF0007: Verificación de Email con Código Válido

Datos de Entrada del Caso:
- Usuario comprador registrado previamente con correo "juan.perez@test.com"
- Endpoint: POST "/api/auth/verify-email"
- Body JSON: { "code": "<código_de_6_dígitos_obtenido_desde_BD>" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Email verificado exitosamente, estado del usuario cambia a "activo" y se elimina el código de verificación.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Registrar un nuevo usuario comprador | Respuesta HTTP 201, usuario registrado exitosamente | | |
| 2 | Obtener el código de verificación desde la base de datos | Se obtiene un código de 6 dígitos numérico | | |
| 3 | Enviar solicitud de verificación de email con el código obtenido | Respuesta HTTP 200, success: true, mensaje incluye "verificado" | | |
| 4 | Verificar que el usuario fue actualizado correctamente | email_verificado es true, estado es "activo", token_verificacion es null | | |

---

### CF0008: Rechazo de Códigos de Verificación Inválidos

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/verify-email"
- Intento 1 - Body JSON: { "code": "000000" }
- Intento 2 - Body JSON: { "code": "ABC123" }
- Intento 3 - Body JSON: { "code": "123" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Todos los intentos con códigos inválidos son rechazados con mensajes de error apropiados.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar verificar email con código inválido de solo ceros | Respuesta HTTP 400, success: false | | |
| 2 | Intentar verificar email con código que contiene letras | Respuesta HTTP 400, success: false | | |
| 3 | Intentar verificar email con código muy corto | Respuesta HTTP 400, success: false | | |

---

### CF0009: Rechazo de Registro con Email Duplicado

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Primer registro - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Segundo intento - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El primer registro se completa exitosamente. El segundo intento con el mismo correo es rechazado con mensaje de error indicando que el email ya está registrado.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Registrar un usuario comprador | Respuesta HTTP 201, usuario registrado exitosamente | | |
| 2 | Intentar registrar otro usuario con el mismo correo electrónico | Respuesta HTTP 400, success: false, mensaje indica que el email ya está registrado | | |

---

### CF0010: Rechazo de Registro con Cédula Duplicada

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Primer registro - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Segundo intento - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "otro@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El primer registro se completa exitosamente. El segundo intento con la misma cédula pero diferente correo es rechazado con mensaje de error indicando que la cédula ya está registrada.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Registrar un usuario comprador | Respuesta HTTP 201, usuario registrado exitosamente | | |
| 2 | Intentar registrar otro usuario con la misma cédula pero diferente correo | Respuesta HTTP 400, success: false, mensaje indica que la cédula ya está registrada | | |

---

### CF0011: Rechazo de Registro sin Correo o con Correo Inválido

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Intento 1 - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" } (sin campo correo)
- Intento 2 - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "correo-invalido", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Ambos intentos son rechazados: el primero con mensaje indicando que el correo es requerido, el segundo con mensaje indicando que el formato del correo es inválido.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar registrar usuario sin proporcionar correo electrónico | Respuesta HTTP 400, success: false, mensaje indica que el correo es requerido | | |
| 2 | Intentar registrar usuario con formato de correo inválido | Respuesta HTTP 400, success: false, mensaje indica que el formato del correo es inválido | | |

---

### CF0012: Rechazo de Registro sin Campos Requeridos o Contraseña Muy Corta

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/register"
- Intento 1 - Body JSON: { "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" } (sin campo cédula)
- Intento 2 - Body JSON: { "cedula": "123456789", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "Password123!", "tipo_usuario": "comprador" } (sin campo nombre)
- Intento 3 - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "tipo_usuario": "comprador" } (sin campo password)
- Intento 4 - Body JSON: { "cedula": "123456789", "nombre": "Juan", "apellido": "Pérez", "correo": "juan.perez@test.com", "telefono": "88888888", "direccion": "San José, Costa Rica", "genero": "masculino", "password": "123", "tipo_usuario": "comprador" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Todos los intentos son rechazados con mensajes de error apropiados: cédula requerida, nombre requerido, contraseña requerida, y contraseña muy corta respectivamente.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar registrar usuario sin proporcionar cédula | Respuesta HTTP 400, success: false, mensaje indica que la cédula es requerida | | |
| 2 | Intentar registrar usuario sin proporcionar nombre | Respuesta HTTP 400, success: false, mensaje indica que el nombre es requerido | | |
| 3 | Intentar registrar usuario sin proporcionar contraseña | Respuesta HTTP 400, success: false, mensaje indica que la contraseña es requerida | | |
| 4 | Intentar registrar usuario con contraseña muy corta | Respuesta HTTP 400, success: false, mensaje indica que la contraseña es muy corta | | |

---

### CF0013: Rechazo de Código de Verificación Ya Utilizado

Datos de Entrada del Caso:
- Usuario comprador registrado previamente con correo "juan.perez@test.com"
- Código de verificación obtenido desde BD: token_verificacion del usuario
- Endpoint: POST "/api/auth/verify-email"
- Primera verificación - Body JSON: { "code": "<código_obtenido>" }
- Segunda verificación - Body JSON: { "code": "<mismo_código>" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se registra exitosamente y recibe un código de verificación. La primera verificación con el código es exitosa. El segundo intento con el mismo código es rechazado con mensaje de error indicando que el código ya fue utilizado o es inválido.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Registrar un usuario comprador | Respuesta HTTP 201, usuario registrado exitosamente | | |
| 2 | Obtener el código de verificación desde la base de datos | Se obtiene un código de 6 dígitos numérico | | |
| 3 | Verificar el email con el código obtenido (primera vez) | Respuesta HTTP 200, success: true, email verificado exitosamente | | |
| 4 | Intentar verificar el email nuevamente con el mismo código | Respuesta HTTP 400, success: false, mensaje indica que el código ya fue utilizado o es inválido | | |

---

### CF0014: Login Exitoso con Usuario Activo y Creación de Sesión

Datos de Entrada del Caso:
- Usuario creado previamente: correo "test@login.com", contraseña "Password123!", estado "activo", email_verificado: true, sin sesiones activas
- Endpoint: POST "/api/auth/login"
- Body JSON: { "correo": "test@login.com", "password": "Password123!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente sin sesiones activas. El inicio de sesión es exitoso, muestra mensaje de "Login exitoso", proporciona un token de acceso y se crea una sesión activa.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario de prueba con estado activo y email verificado | Usuario creado exitosamente sin sesiones activas | | |
| 2 | Verificar que el usuario no tiene sesiones activas antes del login | countActiveSessions() retorna 0 | | |
| 3 | Enviar solicitud de inicio de sesión con las credenciales del usuario | Respuesta HTTP 200, success: true, mensaje "Login exitoso", se proporciona accessToken | | |
| 4 | Verificar que se creó una sesión después del login | countActiveSessions() retorna 1 | | |

---

### CF0015: Rechazo de Login con Contraseña Incorrecta

Datos de Entrada del Caso:
- Usuario creado previamente: correo "test@fail.com", contraseña "CorrectPassword123!"
- Endpoint: POST "/api/auth/login"
- Body JSON: { "correo": "test@fail.com", "password": "WrongPassword123!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente. El intento de login con contraseña incorrecta es rechazado con mensaje de error indicando que las credenciales son inválidas.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario de prueba | Usuario creado exitosamente | | |
| 2 | Intentar iniciar sesión con una contraseña incorrecta | Respuesta HTTP 401, success: false, mensaje indica que las credenciales son inválidas | | |

---

### CF0016: Rechazo de Login con Email No Registrado

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/login"
- Body JSON: { "correo": "noexiste@test.com", "password": "Password123!" }
- Headers: Content-Type: application/json
- Nota: El correo no existe en la base de datos

Resultado Esperado del Caso:
- El sistema rechaza el inicio de sesión y muestra mensaje de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar iniciar sesión con un correo que no está registrado en el sistema | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0017: Bloqueo de Login para Usuario Suspendido

Datos de Entrada del Caso:
- Usuario creado previamente: correo "suspended@test.com", contraseña "Password123!", estado "suspendido", sin sesiones activas
- Endpoint: POST "/api/auth/login"
- Body JSON: { "correo": "suspended@test.com", "password": "Password123!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea con estado suspendido y sin sesiones activas. El intento de login es rechazado con mensaje de error indicando que la cuenta está suspendida. No se crea ninguna sesión.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario con estado suspendido | Usuario creado con estado "suspendido" y sin sesiones activas | | |
| 2 | Intentar iniciar sesión con el usuario suspendido | Respuesta HTTP 401, success: false, accountStatus: "suspendido", mensaje indica que la cuenta está suspendida | | |
| 3 | Verificar que no se creó ninguna sesión | countActiveSessions() retorna 0 | | |

---

### CF0018: Bloqueo de Login para Usuario sin Verificar Email

Datos de Entrada del Caso:
- Usuario creado previamente: correo "unverified@test.com", contraseña "Password123!", estado "pendiente_verificacion", email_verificado: false
- Endpoint: POST "/api/auth/login"
- Body JSON: { "correo": "unverified@test.com", "password": "Password123!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea con estado pendiente de verificación. El intento de login es rechazado con mensaje de error indicando que el email debe ser verificado o que la cuenta está pendiente de verificación.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario con estado pendiente de verificación y email no verificado | Usuario creado con estado "pendiente_verificacion" | | |
| 2 | Intentar iniciar sesión con el usuario no verificado | Respuesta HTTP 401, success: false, mensaje indica que el email debe ser verificado o que la cuenta está pendiente de verificación | | |

---

### CF0019: Múltiples Sesiones Simultáneas y Acceso con Token Válido

Datos de Entrada del Caso:
- Usuario creado previamente: correo "multi@session.com", contraseña "Password123!", estado "activo", sin sesiones activas
- Endpoint login 1: POST "/api/auth/login"
- Body login 1: { "correo": "multi@session.com", "password": "Password123!" }
- Endpoint login 2: POST "/api/auth/login"
- Body login 2: { "correo": "multi@session.com", "password": "Password123!" }
- Endpoint perfil: GET "/api/auth/profile"
- Headers perfil: Authorization: Bearer <token_segundo_login>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente sin sesiones activas. Ambos inicios de sesión son exitosos y se obtienen tokens de acceso. El usuario tiene dos sesiones activas simultáneas. El acceso al perfil con el token del segundo login es exitoso y muestra los datos del usuario correctamente.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo | Usuario creado exitosamente sin sesiones activas | | |
| 2 | Realizar el primer inicio de sesión | Respuesta HTTP 200, se obtiene un accessToken | | |
| 3 | Realizar un segundo inicio de sesión con las mismas credenciales | Respuesta HTTP 200, se obtiene un segundo accessToken | | |
| 4 | Verificar que el usuario tiene múltiples sesiones activas | countActiveSessions() retorna 2 | | |
| 5 | Acceder al perfil del usuario usando el token del segundo inicio de sesión | Respuesta HTTP 200, success: true, se muestran los datos del usuario correctamente | | |

---

### CF0020: Rechazo de Token Malformado o Ausente

Datos de Entrada del Caso:
- Endpoint: GET "/api/auth/profile"
- Intento 1 - Headers: Authorization: Bearer invalid-token, Content-Type: application/json
- Intento 2 - Headers: Content-Type: application/json (sin Authorization)

Resultado Esperado del Caso:
- Ambos intentos de acceso al perfil son rechazados con mensajes de error apropiados: el primero por token inválido, el segundo indicando que se requiere un token.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar acceder al perfil del usuario con un token inválido | Respuesta HTTP 401, success: false, mensaje de error | | |
| 2 | Intentar acceder al perfil del usuario sin proporcionar token | Respuesta HTTP 401, success: false, mensaje indica que se requiere un token | | |

---

### CF0021: Cierre de Sesión e Invalidación de Token

Datos de Entrada del Caso:
- Usuario creado previamente: correo "logout@test.com", contraseña "Password123!", estado "activo"
- Endpoint login: POST "/api/auth/login"
- Body login: { "correo": "logout@test.com", "password": "Password123!" }
- Endpoint logout: POST "/api/auth/logout"
- Headers logout: Authorization: Bearer <accessToken>, Content-Type: application/json
- Endpoint verificación: GET "/api/auth/profile"
- Headers verificación: Authorization: Bearer <token_invalidado>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente sin sesiones activas. El inicio de sesión es exitoso y se obtiene un token de acceso. El usuario tiene una sesión activa. El cierre de sesión es exitoso. El usuario no tiene sesiones activas después del logout. El intento de acceso con el token invalidado es rechazado con mensaje de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo | Usuario creado exitosamente sin sesiones activas | | |
| 2 | Realizar inicio de sesión | Respuesta HTTP 200, se obtiene un accessToken | | |
| 3 | Verificar que el usuario tiene una sesión activa | countActiveSessions() retorna 1 | | |
| 4 | Enviar solicitud de cierre de sesión | Respuesta HTTP 200, sesión cerrada exitosamente | | |
| 5 | Verificar que la sesión fue cerrada | countActiveSessions() retorna 0 | | |
| 6 | Intentar acceder al sistema con el token que fue invalidado | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0022: Almacenamiento de IP y User-Agent en Sesión Creada

Datos de Entrada del Caso:
- Usuario creado previamente: correo "metadata@test.com", contraseña "Password123!", estado "activo"
- Endpoint: POST "/api/auth/login"
- Body: { "correo": "metadata@test.com", "password": "Password123!" }
- Headers: Content-Type: application/json, User-Agent: TestBrowser/1.0
- IP de la solicitud: 192.168.1.1 (simulada o real según el entorno)

Resultado Esperado del Caso:
- El usuario se crea exitosamente sin sesiones activas. El inicio de sesión es exitoso y se obtiene un token de acceso. El usuario tiene una sesión activa que contiene la dirección IP y la información del navegador utilizados.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo | Usuario creado exitosamente sin sesiones activas | | |
| 2 | Realizar inicio de sesión con información de navegador y dirección IP | Respuesta HTTP 200, se obtiene un accessToken | | |
| 3 | Verificar que la sesión creada almacena la información de IP y navegador | countActiveSessions() retorna 1, la sesión contiene IP y User-Agent | | |

---

### CF0023: Solicitud de Reset con Correo Válido y Generación de Código

Datos de Entrada del Caso:
- Usuario creado previamente: correo "reset@test.com", contraseña "OldPassword123!", estado "activo"
- Endpoint solicitud 1: POST "/api/auth/request-password-reset"
- Body solicitud 1: { "correo": "reset@test.com" }
- Endpoint solicitud 2: POST "/api/auth/request-password-reset"
- Body solicitud 2: { "correo": "reset@test.com" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente. La solicitud de recuperación de contraseña se procesa exitosamente y muestra mensaje indicando que se envió un correo. El usuario tiene un código de recuperación de 6 dígitos almacenado. Al solicitar reset nuevamente, el código de recuperación es actualizado y es diferente al código anterior.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo | Usuario creado exitosamente | | |
| 2 | Enviar solicitud de recuperación de contraseña | Respuesta HTTP 200, success: true, mensaje indica que se envió un correo | | |
| 3 | Verificar que se generó un código de recuperación en la base de datos | token_recuperacion es un código de 6 dígitos | | |
| 4 | Solicitar reset de contraseña nuevamente con el mismo correo | Respuesta HTTP 200, success: true | | |
| 5 | Verificar que el código de recuperación fue actualizado | El nuevo token_recuperacion es diferente al código anterior | | |

---

### CF0024: Solicitud de Reset con Correo No Existente (Respuesta Genérica)

Datos de Entrada del Caso:
- Endpoint: POST "/api/auth/request-password-reset"
- Body: { "correo": "noexiste@test.com" }
- Headers: Content-Type: application/json
- Nota: El correo no existe en la base de datos

Resultado Esperado del Caso:
- El sistema procesa la solicitud y muestra un mensaje genérico (por seguridad no indica si el correo existe o no). No existe ningún usuario con ese correo en la base de datos.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Enviar solicitud de recuperación de contraseña con un correo que no existe | Respuesta HTTP 200, success: true, mensaje genérico (no indica si el correo existe) | | |
| 2 | Verificar que no se creó ningún usuario con ese correo | getUserByEmail() retorna null | | |

---

### CF0025: Reset Exitoso con Código Válido e Invalidación de Sesiones

Datos de Entrada del Caso:
- Usuario creado previamente: correo "reset-success@test.com", contraseña "OldPassword123!", estado "activo"
- Endpoint login inicial: POST "/api/auth/login"
- Body login: { "correo": "reset-success@test.com", "password": "OldPassword123!" }
- Endpoint solicitud reset: POST "/api/auth/request-password-reset"
- Body solicitud: { "correo": "reset-success@test.com" }
- Código de recuperación obtenido desde BD: token_recuperacion del usuario
- Endpoint reset: POST "/api/auth/reset-password"
- Body reset: { "code": "<código_obtenido>", "newPassword": "NewPassword456!" }
- Endpoint login nuevo: POST "/api/auth/login"
- Body login nuevo: { "correo": "reset-success@test.com", "password": "NewPassword456!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente. El inicio de sesión es exitoso y se obtiene un token de acceso. El sistema genera un código de recuperación. El restablecimiento de contraseña es exitoso y muestra mensaje de confirmación. El código de recuperación es eliminado. El inicio de sesión con la nueva contraseña es exitoso. El intento de acceso con el token anterior al restablecimiento es rechazado con mensaje de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo sin sesiones | Usuario creado exitosamente | | |
| 2 | Crear una sesión activa mediante inicio de sesión | Respuesta HTTP 200, se obtiene un accessToken | | |
| 3 | Solicitar recuperación de contraseña | Respuesta HTTP 200, se genera un código de recuperación | | |
| 4 | Obtener el código de recuperación desde la base de datos | Se obtiene un código de 6 dígitos | | |
| 5 | Enviar solicitud de restablecimiento de contraseña con el código obtenido | Respuesta HTTP 200, success: true, mensaje indica que la contraseña fue restablecida | | |
| 6 | Verificar que el código de recuperación fue eliminado | token_recuperacion es null | | |
| 7 | Intentar iniciar sesión con la nueva contraseña | Respuesta HTTP 200, success: true, login exitoso | | |
| 8 | Intentar acceder al sistema con el token anterior al restablecimiento | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0026: Rechazo de Reset con Misma Contraseña

Datos de Entrada del Caso:
- Usuario creado previamente: correo "reset-same@test.com", contraseña "SamePassword123!", estado "activo"
- Endpoint solicitud reset: POST "/api/auth/request-password-reset"
- Body solicitud: { "correo": "reset-same@test.com" }
- Código de recuperación obtenido desde BD: token_recuperacion del usuario
- Endpoint reset: POST "/api/auth/reset-password"
- Body reset: { "code": "<código_obtenido>", "newPassword": "SamePassword123!" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente. El sistema genera un código de recuperación. El intento de restablecer la contraseña con la misma contraseña actual es rechazado con mensaje de error indicando que la nueva contraseña no puede ser igual a la actual.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario activo | Usuario creado exitosamente | | |
| 2 | Solicitar recuperación de contraseña | Respuesta HTTP 200, se genera un código de recuperación | | |
| 3 | Obtener el código de recuperación desde la base de datos | Se obtiene un código de 6 dígitos | | |
| 4 | Intentar restablecer la contraseña con la misma contraseña actual | Respuesta HTTP 400, success: false, mensaje indica que la nueva contraseña no puede ser igual a la actual | | |

---

### CF0027: Rechazo de Códigos Inválidos y Contraseña Muy Corta

Datos de Entrada del Caso:
- Usuario creado previamente con código de recuperación generado
- Endpoint: POST "/api/auth/reset-password"
- Intento 1 - Body JSON: { "code": "000000", "newPassword": "NewPassword123!" }
- Intento 2 - Body JSON: { "code": "ABC123", "newPassword": "NewPassword123!" }
- Usuario para intento 3: correo "reset-short@test.com", contraseña "OldPassword123!"
- Código válido obtenido desde BD: token_recuperacion del usuario
- Intento 3 - Body JSON: { "code": "<código_válido>", "newPassword": "123" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- Los intentos 1 y 2 son rechazados con mensajes de error. El sistema genera un código de recuperación para el usuario. El intento 3 con contraseña muy corta es rechazado con mensaje de error indicando que la contraseña es muy corta.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar restablecer contraseña con un código que no existe | Respuesta HTTP 400, success: false, mensaje de error | | |
| 2 | Intentar restablecer contraseña con un código con formato incorrecto | Respuesta HTTP 400, success: false, mensaje de error | | |
| 3 | Crear un usuario y solicitar recuperación de contraseña | Usuario creado, respuesta HTTP 200, se genera código de recuperación | | |
| 4 | Obtener el código de recuperación válido desde la base de datos | Se obtiene un código de 6 dígitos | | |
| 5 | Intentar restablecer contraseña con una contraseña muy corta | Respuesta HTTP 400, success: false, mensaje indica que la contraseña es muy corta | | |

---

### CF0028: Bloqueo de Reset para Usuario Suspendido

Datos de Entrada del Caso:
- Usuario creado previamente: correo "suspended-reset@test.com", contraseña "Password123!", estado "suspendido"
- Endpoint: POST "/api/auth/request-password-reset"
- Body: { "correo": "suspended-reset@test.com" }
- Headers: Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea con estado suspendido. El intento de solicitar recuperación de contraseña es rechazado con mensaje de error indicando que la cuenta está suspendida. El usuario no tiene código de recuperación almacenado.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario con estado suspendido | Usuario creado con estado "suspendido" | | |
| 2 | Intentar solicitar recuperación de contraseña con el usuario suspendido | Respuesta HTTP 403, success: false, accountStatus: "suspendido", mensaje indica que la cuenta está suspendida | | |
| 3 | Verificar que no se generó código de recuperación | token_recuperacion es null | | |

---

### CF0029: Obtención de Perfil del Usuario Autenticado

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa
- Token de acceso obtenido del login
- Endpoint: GET "/api/auth/profile"
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. El sistema muestra los datos del perfil del usuario correctamente, incluyendo ID, correo y tipo de usuario "comprador".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Solicitar los datos del perfil del usuario autenticado | Respuesta HTTP 200, success: true, se muestran datos del perfil incluyendo ID, correo y tipo_usuario "comprador" | | |

---

### CF0030: Rechazo de Acceso sin Token o con Token Inválido

Datos de Entrada del Caso:
- Endpoint: GET "/api/auth/profile"
- Intento 1 - Headers: Content-Type: application/json (sin Authorization)
- Intento 2 - Headers: Authorization: Bearer token_invalido_12345, Content-Type: application/json

Resultado Esperado del Caso:
- Ambos intentos de acceso al perfil son rechazados con mensajes de error apropiados.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Intentar acceder al perfil sin proporcionar token de autenticación | Respuesta HTTP 401, success: false, mensaje de error | | |
| 2 | Intentar acceder al perfil con un token inválido | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0031: Actualización de Campos Individuales y Múltiples Campos

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa
- Token de acceso obtenido del login
- Endpoint: PUT "/api/auth/profile"
- Actualización 1 - Body JSON: { "nombre": "NuevoNombre" }
- Actualización 2 - Body JSON: { "apellido": "NuevoApellido", "telefono": "0991112233", "direccion": "Avenida Nueva 789", "genero": "otro" }
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. El sistema actualiza el nombre exitosamente, el apellido mantiene su valor original. El sistema actualiza todos los campos solicitados exitosamente, el nombre mantiene el cambio anterior.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Actualizar solo el campo nombre del perfil | Respuesta HTTP 200, success: true, nombre actualizado, apellido mantiene valor original | | |
| 3 | Actualizar múltiples campos del perfil simultáneamente | Respuesta HTTP 200, success: true, todos los campos actualizados, nombre mantiene cambio anterior | | |

---

### CF0032: Rechazo de Actualización sin Campos o sin Autenticación

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa
- Token de acceso obtenido del login
- Endpoint: PUT "/api/auth/profile"
- Intento 1 - Body JSON: {} (objeto vacío)
- Intento 1 - Headers: Authorization: Bearer <accessToken>, Content-Type: application/json
- Intento 2 - Body JSON: { "nombre": "NuevoNombre" }
- Intento 2 - Headers: Content-Type: application/json (sin Authorization)

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. El intento 1 es rechazado con mensaje de error indicando que se debe proporcionar al menos un campo. El intento 2 es rechazado con mensaje de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Intentar actualizar el perfil sin proporcionar ningún campo a actualizar | Respuesta HTTP 400, success: false, mensaje indica que se debe proporcionar al menos un campo | | |
| 3 | Intentar actualizar el perfil sin autenticación | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0033: Validación de Campos Inmutables

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa (valores originales: cédula, correo, tipo_usuario)
- Token de acceso obtenido del login
- Endpoint: PUT "/api/auth/profile"
- Body JSON: { "cedula": "9999999999", "correo": "nuevo@correo.com", "tipo_usuario": "administrador", "nombre": "NuevoNombre" }
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente, se guardan los valores originales de cédula, correo y tipo de usuario. El sistema solo actualiza el nombre, los campos inmutables no se modifican. La cédula, el correo y el tipo de usuario mantienen sus valores originales en la base de datos.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se guardan valores originales de cédula, correo y tipo_usuario | | |
| 2 | Intentar actualizar campos inmutables (cédula, correo, tipo de usuario) junto con el nombre | Respuesta HTTP 200, success: true, solo se actualiza el nombre | | |
| 3 | Verificar en la base de datos que los campos inmutables no cambiaron | La cédula, correo y tipo_usuario mantienen sus valores originales en BD | | |

---

### CF0034: Cambio de Contraseña Exitoso e Invalidación de Anterior

Datos de Entrada del Caso:
- Usuario comprador creado previamente: contraseña actual "Password123!", sesión activa
- Token de acceso obtenido del login
- Endpoint cambio: PUT "/api/auth/change-password"
- Body JSON: { "currentPassword": "Password123!", "newPassword": "NuevaPassword123!" }
- Endpoint login nuevo: POST "/api/auth/login"
- Body login nuevo: { "correo": "<correo_usuario>", "password": "NuevaPassword123!" }
- Endpoint login antiguo: POST "/api/auth/login"
- Body login antiguo: { "correo": "<correo_usuario>", "password": "Password123!" }
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. El sistema cambia la contraseña exitosamente y muestra mensaje de confirmación. El inicio de sesión con la nueva contraseña es exitoso. El intento de inicio de sesión con la contraseña antigua es rechazado con mensaje de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Enviar solicitud de cambio de contraseña | Respuesta HTTP 200, success: true, mensaje indica que la contraseña fue actualizada | | |
| 3 | Intentar iniciar sesión con la nueva contraseña | Respuesta HTTP 200, success: true, login exitoso | | |
| 4 | Intentar iniciar sesión con la contraseña antigua | Respuesta HTTP 401, success: false, mensaje de error | | |

---

### CF0035: Validaciones de Cambio de Contraseña

Datos de Entrada del Caso:
- Usuario comprador creado previamente: contraseña "Password123!", sesión activa
- Token de acceso obtenido del login
- Endpoint: PUT "/api/auth/change-password"
- Intento 1 - Body JSON: { "currentPassword": "PasswordIncorrecta123", "newPassword": "NuevaPassword123!" }
- Intento 2 - Body JSON: { "currentPassword": "Password123!", "newPassword": "Password123!" }
- Intento 3 - Body JSON: { "currentPassword": "Password123!", "newPassword": "12345" }
- Intento 4 - Body JSON: { "newPassword": "NuevaPassword123!" } (sin currentPassword)
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. Todos los intentos de cambio de contraseña son rechazados con mensajes de error apropiados.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Intentar cambiar contraseña proporcionando una contraseña actual incorrecta | Respuesta HTTP 401, success: false, mensaje de error | | |
| 3 | Intentar cambiar contraseña usando la misma contraseña como nueva | Respuesta HTTP 400, success: false, mensaje de error | | |
| 4 | Intentar cambiar contraseña con una nueva contraseña muy corta | Respuesta HTTP 400, success: false, mensaje de error | | |
| 5 | Intentar cambiar contraseña sin proporcionar la contraseña actual | Respuesta HTTP 400, success: false, mensaje de error | | |

---

### CF0036: Seguridad: Usuario Solo Accede a su Propio Perfil

Datos de Entrada del Caso:
- Usuario 1 (comprador) creado previamente: correo "user1@test.com", contraseña "Password123!"
- Usuario 2 (vendedor) creado previamente: correo "user2@test.com", contraseña "Password456!"
- Token de acceso del usuario 1 obtenido del login
- Endpoint perfil usuario 1: GET "/api/auth/profile"
- Endpoint actualización usuario 1: PUT "/api/auth/profile"
- Body actualización: { "nombre": "NombreModificado" }
- Headers: Authorization: Bearer <token_usuario_1>, Content-Type: application/json

Resultado Esperado del Caso:
- Ambos usuarios se crean exitosamente y se obtienen tokens de acceso. El sistema muestra los datos del perfil del usuario 1, no los del usuario 2. El sistema actualiza el perfil del usuario 1 exitosamente. El usuario 1 tiene el nombre actualizado, el usuario 2 mantiene su nombre original.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario 1 creado exitosamente, se obtiene token de acceso | | |
| 2 | Crear un usuario vendedor y generar una sesión activa | Usuario 2 creado exitosamente, se obtiene token de acceso | | |
| 3 | El usuario 1 solicita su propio perfil | Respuesta HTTP 200, success: true, se muestran datos del usuario 1, no del usuario 2 | | |
| 4 | El usuario 1 actualiza su propio perfil | Respuesta HTTP 200, success: true, perfil del usuario 1 actualizado exitosamente | | |
| 5 | Verificar en la base de datos que solo cambió el perfil del usuario 1 | Usuario 1 tiene nombre actualizado, usuario 2 mantiene nombre original | | |

---

### CF0037: Persistencia de Datos y Actualización de fecha_actualizacion

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa
- Token de acceso obtenido del login
- Fecha de actualización inicial obtenida desde BD
- Endpoint: PUT "/api/auth/profile"
- Body JSON: { "nombre": "NombrePersistente", "telefono": "0999777666" }
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json
- Verificación en BD después de la actualización

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. Se guarda la fecha de actualización actual. El sistema actualiza el perfil exitosamente. El nombre y el teléfono fueron actualizados en la base de datos. La nueva fecha de actualización es mayor que la fecha anterior.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Obtener la fecha de actualización antes de modificar el perfil | Se guarda la fecha de actualización actual | | |
| 3 | Esperar un breve período de tiempo | Tiempo transcurrido | | |
| 4 | Actualizar el perfil del usuario | Respuesta HTTP 200, success: true, perfil actualizado exitosamente | | |
| 5 | Verificar en la base de datos que los cambios se guardaron correctamente | Nombre y teléfono fueron actualizados en la base de datos | | |
| 6 | Verificar que la fecha de actualización fue modificada | La nueva fecha de actualización es mayor que la fecha anterior | | |

---

### CF0038: Validación de Valores Válidos de Género

Datos de Entrada del Caso:
- Usuario comprador creado previamente con sesión activa
- Token de acceso obtenido del login
- Endpoint: PUT "/api/auth/profile"
- Actualización 1 - Body JSON: { "genero": "masculino" }
- Actualización 2 - Body JSON: { "genero": "femenino" }
- Actualización 3 - Body JSON: { "genero": "otro" }
- Headers: Authorization: Bearer <accessToken>, Content-Type: application/json

Resultado Esperado del Caso:
- El usuario se crea exitosamente y se obtiene un token de acceso. Todas las actualizaciones de género son exitosas y el usuario queda con el género correspondiente en cada caso.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario comprador y generar una sesión activa | Usuario creado exitosamente, se obtiene un accessToken | | |
| 2 | Actualizar el género del perfil a "masculino" | Respuesta HTTP 200, success: true, género actualizado a "masculino" | | |
| 3 | Actualizar el género del perfil a "femenino" | Respuesta HTTP 200, success: true, género actualizado a "femenino" | | |
| 4 | Actualizar el género del perfil a "otro" | Respuesta HTTP 200, success: true, género actualizado a "otro" | | |

---

### CF0039: Registro de Moderador por Administrador

Datos de Entrada del Caso:
- Usuario administrador creado previamente: correo "admin@test.com", contraseña "AdminPass123!"
- Token de acceso del administrador obtenido del login
- Endpoint: POST "/api/auth/register-moderator"
- Body JSON: { "cedula": "999999999", "nombre": "Nuevo", "apellido": "Moderador", "correo": "nuevo-mod@test.com", "telefono": "88888888", "direccion": "Dirección Test", "genero": "masculino", "password": "ModPassword123!", "tipo_usuario": "moderador" }
- Headers: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint login moderador: POST "/api/auth/login"
- Body login: { "correo": "nuevo-mod@test.com", "password": "ModPassword123!" }

Resultado Esperado del Caso:
- El administrador se crea exitosamente y se obtiene un token de acceso. El sistema registra al moderador exitosamente, el tipo de usuario es "moderador" y el estado es "activo". El usuario moderador existe y su email está verificado. El inicio de sesión con el nuevo moderador es exitoso.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear un usuario administrador y generar una sesión activa | Administrador creado exitosamente, se obtiene un accessToken | | |
| 2 | Preparar los datos del nuevo moderador a registrar | Datos listos para el registro | | |
| 3 | Enviar solicitud de registro de moderador por parte del administrador | Respuesta HTTP 201, success: true, tipo_usuario: "moderador", estado: "activo" | | |
| 4 | Verificar que el moderador fue creado en la base de datos | Usuario moderador existe, email_verificado es true | | |
| 5 | Intentar iniciar sesión inmediatamente con el nuevo moderador | Respuesta HTTP 200, success: true, login exitoso | | |

---

### CF0040: Suspensión de Usuarios por Moderador/Admin

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), administrador (correo "admin@test.com"), comprador (correo "buyer@test.com"), vendedor (correo "seller@test.com")
- Tokens de acceso obtenidos del login para cada usuario
- Endpoint suspensión 1: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión 1: { "motivo": "Violación de políticas" }
- Headers suspensión 1: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Endpoint suspensión 2: PUT "/api/auth/suspend-user/<id_vendedor>"
- Body suspensión 2: { "motivo": "Admin acción" }
- Headers suspensión 2: Authorization: Bearer <token_admin>, Content-Type: application/json

Resultado Esperado del Caso:
- Todos los usuarios se crean exitosamente. El sistema suspende al comprador exitosamente, el estado cambia a "suspendido" y se cierran todas sus sesiones. El sistema suspende al vendedor exitosamente y el estado cambia a "suspendido".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador, administrador, comprador y vendedor con sesiones activas | Todos los usuarios creados exitosamente | | |
| 2 | El moderador suspende al comprador | Respuesta HTTP 200, success: true, comprador suspendido exitosamente | | |
| 3 | Verificar que el estado del comprador cambió a suspendido | Estado del comprador es "suspendido" | | |
| 4 | Verificar que se cerraron todas las sesiones del comprador | countActiveSessions() retorna 0 para el comprador | | |
| 5 | El administrador suspende al vendedor | Respuesta HTTP 200, success: true, vendedor suspendido exitosamente | | |
| 6 | Verificar que el estado del vendedor cambió a suspendido | Estado del vendedor es "suspendido" | | |

---

### CF0041: Rechazo de Login de Usuario Suspendido y Reactivación Exitosa

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), comprador (correo "buyer@test.com", contraseña "BuyerPass123!")
- Token de acceso del moderador obtenido del login
- Endpoint suspensión: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión: { "motivo": "Suspensión temporal" }
- Headers suspensión: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Endpoint login rechazado: POST "/api/auth/login"
- Body login: { "correo": "buyer@test.com", "password": "BuyerPass123!" }
- Endpoint reactivación: PUT "/api/auth/activate-user/<id_comprador>"
- Body reactivación: { "motivo": "Revisión completada" }
- Headers reactivación: Authorization: Bearer <token_moderador>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El sistema suspende al comprador exitosamente y el estado cambia a "suspendido". El intento de login es rechazado con mensaje de error indicando que la cuenta está suspendida. El sistema reactiva al comprador exitosamente y el estado cambia a "activo". El inicio de sesión después de la reactivación es exitoso.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | El moderador suspende al comprador | Respuesta HTTP 200, success: true, comprador suspendido exitosamente | | |
| 3 | Verificar que el estado del comprador cambió a suspendido | Estado del comprador es "suspendido" | | |
| 4 | Intentar iniciar sesión con el comprador suspendido | Respuesta HTTP 401, success: false, mensaje indica que la cuenta está suspendida | | |
| 5 | El moderador reactiva al comprador | Respuesta HTTP 200, success: true, comprador reactivado exitosamente | | |
| 6 | Verificar que el estado del comprador cambió a activo | Estado del comprador es "activo" | | |
| 7 | Intentar iniciar sesión después de la reactivación | Respuesta HTTP 200, success: true, login exitoso | | |

---

### CF0042: Lista de Usuarios con Paginación y Filtros

Datos de Entrada del Caso:
- Usuarios creados previamente: administrador (correo "admin@test.com"), moderador (correo "moderator@test.com"), comprador (correo "buyer@test.com"), vendedor (correo "seller@test.com")
- Tokens de acceso obtenidos del login
- Endpoint lista completa admin: GET "/api/auth/users"
- Headers lista admin: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint lista completa moderador: GET "/api/auth/users"
- Headers lista moderador: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Endpoint lista paginada: GET "/api/auth/users?page=1&limit=2"
- Headers paginada: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint lista filtrada: GET "/api/auth/users?role=comprador"
- Headers filtrada: Authorization: Bearer <token_admin>, Content-Type: application/json

Resultado Esperado del Caso:
- Todos los usuarios se crean exitosamente. El sistema muestra la lista de usuarios correctamente para administrador y moderador, incluyendo al menos 4 usuarios. La lista paginada muestra un límite de 2 usuarios por página. La lista filtrada muestra solo usuarios con tipo "comprador".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios administrador, moderador, comprador y vendedor | Todos los usuarios creados exitosamente | | |
| 2 | El administrador solicita la lista de usuarios | Respuesta HTTP 200, success: true, lista incluye al menos 4 usuarios | | |
| 3 | El moderador solicita la lista de usuarios | Respuesta HTTP 200, success: true, lista mostrada correctamente | | |
| 4 | Solicitar la lista de usuarios con paginación | Respuesta HTTP 200, success: true, lista paginada con límite de 2 usuarios por página | | |
| 5 | Solicitar la lista de usuarios filtrada por tipo de usuario | Respuesta HTTP 200, success: true, solo usuarios con tipo "comprador" | | |

---

### CF0043: Registro de Acciones en Auditoría

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), comprador (correo "buyer@test.com")
- Token de acceso del moderador obtenido del login
- ID del moderador para contar acciones de auditoría
- Endpoint suspensión: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión: { "motivo": "Test suspensión" }
- Headers suspensión: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Endpoint reactivación: PUT "/api/auth/activate-user/<id_comprador>"
- Body reactivación: { "motivo": "Reactivación" }
- Headers reactivación: Authorization: Bearer <token_moderador>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El sistema suspende al comprador y registra la acción en la auditoría, el número de acciones aumenta. El sistema reactiva al comprador y registra la acción en la auditoría, el número de acciones aumenta nuevamente.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | Contar el número de acciones de moderación registradas antes de la suspensión | Se obtiene el número inicial de acciones | | |
| 3 | El moderador suspende al comprador | Respuesta HTTP 200, success: true, acción registrada en auditoría | | |
| 4 | Contar el número de acciones de moderación después de la suspensión | El número de acciones aumentó respecto al anterior | | |
| 5 | Contar el número de acciones de moderación antes de la reactivación | Se obtiene el número actual de acciones | | |
| 6 | El moderador reactiva al comprador | Respuesta HTTP 200, success: true, acción registrada en auditoría | | |
| 7 | Contar el número de acciones de moderación después de la reactivación | El número de acciones aumentó respecto al anterior | | |

---

### CF0044: Suspensión y Reactivación por Administrador

Datos de Entrada del Caso:
- Usuarios creados previamente: administrador (correo "admin@test.com"), comprador (correo "buyer@test.com")
- Token de acceso del administrador obtenido del login
- Endpoint suspensión: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión: { "motivo": "Admin suspendiendo" }
- Headers suspensión: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint reactivación: PUT "/api/auth/activate-user/<id_comprador>"
- Body reactivación: { "motivo": "Admin reactivando" }
- Headers reactivación: Authorization: Bearer <token_admin>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El sistema suspende al comprador exitosamente y el estado cambia a "suspendido". El sistema reactiva al comprador exitosamente y el estado cambia a "activo".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios administrador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | El administrador suspende al comprador | Respuesta HTTP 200, success: true, comprador suspendido exitosamente | | |
| 3 | Verificar que el estado del comprador cambió a suspendido | Estado del comprador es "suspendido" | | |
| 4 | El administrador reactiva al comprador | Respuesta HTTP 200, success: true, comprador reactivado exitosamente | | |
| 5 | Verificar que el estado del comprador cambió a activo | Estado del comprador es "activo" | | |

---

### CF0045: Rechazo de Suspensión por Usuarios Regulares

Datos de Entrada del Caso:
- Usuarios creados previamente: comprador (correo "buyer@test.com"), vendedor (correo "seller@test.com")
- Tokens de acceso obtenidos del login para cada usuario
- Endpoint intento 1: PUT "/api/auth/suspend-user/<id_vendedor>"
- Body intento 1: { "motivo": "No permitido" }
- Headers intento 1: Authorization: Bearer <token_comprador>, Content-Type: application/json
- Endpoint intento 2: PUT "/api/auth/suspend-user/<id_comprador>"
- Body intento 2: { "motivo": "No permitido" }
- Headers intento 2: Authorization: Bearer <token_vendedor>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. Ambos intentos de suspensión son rechazados con mensajes de error indicando que no tienen permisos.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios comprador y vendedor con sesiones activas | Usuarios creados exitosamente | | |
| 2 | El comprador intenta suspender al vendedor | Respuesta HTTP 403, success: false, mensaje indica que no tiene permisos | | |
| 3 | El vendedor intenta suspender al comprador | Respuesta HTTP 403, success: false, mensaje de error | | |

---

### CF0046: Rechazo de Suspensión de Administrador por Moderador

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), administrador (correo "admin@test.com")
- Token de acceso del moderador obtenido del login
- Endpoint: PUT "/api/auth/suspend-user/<id_admin>"
- Body: { "motivo": "No debería permitirse" }
- Headers: Authorization: Bearer <token_moderador>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El intento de suspensión es rechazado con mensaje de error indicando que no se puede suspender a un administrador. El administrador sigue con estado activo.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador y administrador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | El moderador intenta suspender al administrador | Respuesta HTTP 403, success: false, mensaje indica que no se puede suspender a un administrador | | |
| 3 | Verificar que el administrador sigue con estado activo | Estado del administrador es "activo" | | |

---

### CF0047: Acceso Denegado para Usuario Suspendido en Todos los Endpoints

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), comprador (correo "buyer@test.com")
- Token de acceso del comprador obtenido del login (antes de suspensión)
- Token de acceso del moderador obtenido del login
- Endpoint perfil antes: GET "/api/auth/profile"
- Headers perfil antes: Authorization: Bearer <token_comprador>, Content-Type: application/json
- Endpoint suspensión: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión: { "motivo": "Test revocación" }
- Headers suspensión: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Endpoint perfil después: GET "/api/auth/profile"
- Headers perfil después: Authorization: Bearer <token_comprador_suspendido>, Content-Type: application/json
- Endpoint lista usuarios: GET "/api/auth/users"
- Headers lista: Authorization: Bearer <token_comprador_suspendido>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El sistema permite el acceso al perfil antes de la suspensión. El sistema suspende al comprador exitosamente. Todos los intentos de acceso con el token del comprador suspendido son rechazados con mensajes de error.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | Verificar que el comprador puede acceder a su perfil antes de ser suspendido | Respuesta HTTP 200, success: true, acceso al perfil permitido | | |
| 3 | El moderador suspende al comprador | Respuesta HTTP 200, success: true, comprador suspendido exitosamente | | |
| 4 | Intentar acceder al perfil con el token del comprador suspendido | Respuesta HTTP 401 o 403, success: false, mensaje de error | | |
| 5 | Intentar acceder a la lista de usuarios con el token del comprador suspendido | Respuesta HTTP 401 o 403, success: false, mensaje de error | | |

---

### CF0048: Cierre de Sesiones al Suspender y No Reactivarlas Automáticamente

Datos de Entrada del Caso:
- Usuarios creados previamente: administrador (correo "admin@test.com"), comprador (correo "buyer@test.com", contraseña "BuyerPass123!")
- Token de acceso del administrador obtenido del login
- Endpoint login adicional: POST "/api/auth/login"
- Body login adicional: { "correo": "buyer@test.com", "password": "BuyerPass123!" }
- Endpoint suspensión: PUT "/api/auth/suspend-user/<id_comprador>"
- Body suspensión: { "motivo": "Cierre de sesiones" }
- Headers suspensión: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint reactivación: PUT "/api/auth/activate-user/<id_comprador>"
- Body reactivación: { "motivo": "Reactivado" }
- Headers reactivación: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint login después: POST "/api/auth/login"
- Body login después: { "correo": "buyer@test.com", "password": "BuyerPass123!" }

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. El comprador tiene dos sesiones activas antes de la suspensión. El sistema suspende al comprador exitosamente y todas las sesiones son cerradas. El sistema reactiva al comprador exitosamente pero las sesiones no se reactivan automáticamente. El inicio de sesión después de la reactivación es exitoso y se crea una nueva sesión.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios administrador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | Crear una sesión adicional para el comprador | Se crea una segunda sesión activa | | |
| 3 | Verificar que el comprador tiene múltiples sesiones antes de ser suspendido | countActiveSessions() retorna 2 | | |
| 4 | El administrador suspende al comprador | Respuesta HTTP 200, success: true, comprador suspendido exitosamente | | |
| 5 | Verificar que todas las sesiones fueron cerradas después de la suspensión | countActiveSessions() retorna 0 | | |
| 6 | El administrador reactiva al comprador | Respuesta HTTP 200, success: true, comprador reactivado exitosamente | | |
| 7 | Verificar que las sesiones no se reactivaron automáticamente | countActiveSessions() retorna 0 | | |
| 8 | El comprador realiza inicio de sesión nuevamente | Respuesta HTTP 200, success: true, login exitoso | | |
| 9 | Verificar que se creó una nueva sesión después del login | countActiveSessions() retorna 1 | | |

---

### CF0049: Rechazo de Registro de Moderador sin Permisos de Admin

Datos de Entrada del Caso:
- Usuarios creados previamente: moderador (correo "moderator@test.com"), comprador (correo "buyer@test.com")
- Tokens de acceso obtenidos del login para cada usuario
- Endpoint: POST "/api/auth/register-moderator"
- Body JSON: { "cedula": "777777777", "nombre": "Intento", "apellido": "Moderador", "correo": "intento-mod@test.com", "telefono": "88888888", "direccion": "Dirección Test", "genero": "masculino", "password": "ModPassword123!", "tipo_usuario": "moderador" }
- Intento 1 - Headers: Authorization: Bearer <token_moderador>, Content-Type: application/json
- Intento 2 - Headers: Authorization: Bearer <token_comprador>, Content-Type: application/json

Resultado Esperado del Caso:
- Los usuarios se crean exitosamente. Ambos intentos de registro de moderador son rechazados con mensajes de error indicando que no tienen permisos. No existe ningún usuario con el correo "intento-mod@test.com" en la base de datos.

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios moderador y comprador con sesiones activas | Usuarios creados exitosamente | | |
| 2 | Preparar los datos de un nuevo moderador a registrar | Datos listos para el registro | | |
| 3 | El moderador intenta registrar un nuevo moderador | Respuesta HTTP 403, success: false, mensaje indica que no tiene permisos | | |
| 4 | El comprador intenta registrar un moderador | Respuesta HTTP 403, success: false, mensaje de error | | |
| 5 | Verificar que no se creó ningún usuario con ese correo | getUserByEmail() retorna null | | |

---

### CF0050: Validación de Campos en Lista de Usuarios y Filtros Combinados

Datos de Entrada del Caso:
- Usuarios creados previamente: administrador (correo "admin@test.com"), comprador (correo "buyer@test.com"), vendedor (correo "seller@test.com")
- Token de acceso del administrador obtenido del login
- Endpoint lista completa: GET "/api/auth/users"
- Headers lista completa: Authorization: Bearer <token_admin>, Content-Type: application/json
- Endpoint lista filtrada: GET "/api/auth/users?role=comprador&status=activo"
- Headers lista filtrada: Authorization: Bearer <token_admin>, Content-Type: application/json

Resultado Esperado del Caso:
- Todos los usuarios se crean exitosamente. El sistema muestra la lista de usuarios correctamente. Cada usuario en la lista tiene los campos esenciales: ID, correo, tipo de usuario y estado. La lista con filtros combinados muestra solo usuarios con tipo "comprador" y estado "activo".

| Paso | Descripción de pasos a seguir | Resultado Obtenido | Observaciones |
|------|-------------------------------|-------------------|---------------|
| 1 | Crear usuarios administrador, comprador y vendedor con sesiones activas | Todos los usuarios creados exitosamente | | |
| 2 | El administrador solicita la lista de usuarios | Respuesta HTTP 200, success: true, lista mostrada correctamente | | |
| 3 | Verificar que cada usuario en la lista tiene los campos esenciales | Cada usuario tiene: ID, correo, tipo_usuario y estado | | |
| 4 | Solicitar la lista de usuarios con filtros combinados (tipo de usuario y estado) | Respuesta HTTP 200, success: true, lista filtrada mostrada correctamente | | |
| 5 | Verificar que los filtros se aplicaron correctamente | Todos los usuarios mostrados tienen tipo "comprador" y estado "activo" | | |

---

## Notas Finales

- **Total de Pruebas Documentadas:** 50 casos de prueba
- **Áreas Cubiertas:** Configuración, Registro, Login, Sesiones, Recuperación de Contraseña, Gestión de Perfil, Moderación de Usuarios
- **Formato:** Cada caso de prueba incluye:
  - **Datos de Entrada del Caso:** Bloque consolidado con todos los datos de entrada necesarios para la prueba completa
  - **Resultado Esperado del Caso:** Bloque consolidado con el resultado esperado para toda la prueba
  - **Tabla de Pasos:** Columnas: Paso, Descripción de pasos a seguir, Resultado Obtenido, Observaciones
