# 🔍 Diagnóstico: Emails de Reactivación de Cuenta

## ❌ Problema Reportado

Los emails de reactivación de cuenta (cuando se levanta la suspensión) **no se están enviando**.

---

## ✅ Soluciones Implementadas

### 1. **Mejora del Logging** 📊

Se agregaron logs detallados para rastrear el envío de emails:

```javascript
// ANTES (silencioso)
try {
  await sendEmail(...);
} catch (error) {
  console.error('Error:', error.message);
}

// DESPUÉS (detallado)
console.log('📧 Intentando enviar email de reactivación a:', user.correo);
try {
  await sendEmail(...);
  console.log('✅ Email de reactivación enviado exitosamente');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('❌ Stack:', error.stack);
}
```

**Archivos modificados**:
- `backend/src/routes/auth.js` (líneas 290-304 y 460-474)

---

### 2. **Construcción Correcta del Nombre** 👤

Se corrigió la forma en que se obtiene el nombre del usuario:

```javascript
// ANTES
user.nombre  // Solo el primer nombre

// DESPUÉS
const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo;
```

**Beneficio**: Maneja casos donde `nombre` o `apellido` puedan estar vacíos.

---

### 3. **Script de Prueba** 🧪

Se creó un script específico para probar ambos emails:

```bash
# Ubicación
backend/test-reactivation-email.js
backend/test-reactivation-email.bat
```

**Uso**:
```bash
cd backend
test-reactivation-email.bat
```

Este script:
- ✅ Envía un email de suspensión de prueba
- ✅ Envía un email de reactivación de prueba
- ✅ Muestra logs detallados de cada operación
- ✅ Captura y muestra cualquier error

---

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Reiniciar el Backend

**Importante**: Los cambios en `email.js` y `auth.js` requieren reiniciar el servidor.

```bash
cd backend
reiniciar-backend.bat
```

O manualmente:
1. Detener el servidor (Ctrl+C)
2. Ejecutar: `npm start`

---

### Paso 2: Ejecutar el Script de Prueba

```bash
cd backend
test-reactivation-email.bat
```

Ingresa:
- **Email**: Tu correo electrónico de prueba
- **Nombre**: Cualquier nombre de prueba

**Qué buscar en los logs**:

✅ **Si funciona correctamente**:
```
📧 Intentando enviar email de suspensión a: test@email.com
✅ Email de suspensión enviado exitosamente

📧 Intentando enviar email de reactivación a: test@email.com
✅ Email de reactivación enviado exitosamente
```

❌ **Si hay un error**:
```
📧 Intentando enviar email de reactivación a: test@email.com
❌ Error enviando email de reactivación: [mensaje de error]
❌ Stack: [detalle del error]
```

---

### Paso 3: Probar desde la Interfaz

1. **Iniciar sesión** como Administrador o Moderador
2. Ir a **Gestión de Usuarios**
3. **Suspender** un usuario de prueba
   - ✅ Debe aparecer: `📧 Intentando enviar email de suspensión...`
   - ✅ Debe aparecer: `✅ Email de suspensión enviado exitosamente`
4. **Reactivar** el mismo usuario
   - ✅ Debe aparecer: `📧 Intentando enviar email de reactivación...`
   - ✅ Debe aparecer: `✅ Email de reactivación enviado exitosamente`

---

## 🐛 Posibles Causas del Problema

### 1. **Backend No Reiniciado** 🔄

**Síntoma**: El código nuevo no se ejecuta

**Solución**:
```bash
cd backend
reiniciar-backend.bat
```

---

### 2. **Error en la Configuración SMTP** 📧

**Síntoma**: Error al conectar con el servidor de email

**Verificar** en `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM=Sistema de Ventas <tu_email@gmail.com>
```

**Probar conexión**:
```bash
cd backend
node test-connection.js
```

---

### 3. **Función No Exportada** 📦

**Síntoma**: Error "sendAccountReactivatedEmail is not a function"

**Verificar** en `backend/src/services/email.js`:
```javascript
module.exports = {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountStatusEmail,
  sendAccountSuspendedEmail,      // ✅ Debe estar
  sendAccountReactivatedEmail,    // ✅ Debe estar
  sendNewSessionEmail
};
```

---

### 4. **Error en el HTML del Email** 🎨

**Síntoma**: Error de sintaxis en el template

**Verificar**: Los nuevos diseños de email tienen HTML complejo. Ejecutar:
```bash
cd backend
node test-reactivation-email.js test@email.com "Juan Pérez"
```

Si hay un error de sintaxis, se mostrará en los logs.

---

### 5. **Base de Datos - Campos Faltantes** 🗄️

**Síntoma**: `user.nombre` o `user.apellido` son `undefined`

**Solución**: El código ya maneja esto:
```javascript
const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo;
```

Si ambos están vacíos, usa el `correo` como nombre.

---

## 📋 Checklist de Verificación

Marca cada paso que hayas completado:

- [ ] ✅ Backend reiniciado después de los cambios
- [ ] ✅ Script de prueba ejecutado (`test-reactivation-email.bat`)
- [ ] ✅ Emails de prueba recibidos (revisar spam)
- [ ] ✅ Logs muestran "Email enviado exitosamente"
- [ ] ✅ Configuración SMTP verificada en `.env`
- [ ] ✅ Funciones exportadas correctamente en `email.js`
- [ ] ✅ Prueba desde interfaz (suspender y reactivar)

---

## 📊 Logs Esperados

### Al Suspender un Usuario:
```bash
📧 Intentando enviar email de suspensión a: usuario@email.com
✅ Email de cuenta suspendida enviado a: usuario@email.com
✅ Email de suspensión enviado exitosamente a: usuario@email.com
```

### Al Reactivar un Usuario:
```bash
📧 Intentando enviar email de reactivación a: usuario@email.com
✅ Email de cuenta reactivada enviado a: usuario@email.com
✅ Email de reactivación enviado exitosamente a: usuario@email.com
```

---

## 🔧 Archivos Modificados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `backend/src/routes/auth.js` | Mejorado logging en `/activate-user` | 290-304 |
| `backend/src/routes/auth.js` | Mejorado logging en `/suspend-user` | 460-474 |
| `backend/src/services/email.js` | Headers centrados | 238, 390 |
| `backend/src/services/email.js` | Listas alineadas | 293-323, 445-475 |
| `backend/test-reactivation-email.js` | ✨ Nuevo script de prueba | - |
| `backend/test-reactivation-email.bat` | ✨ Nuevo ejecutable | - |

---

## 🚀 Pasos para el Usuario

### Opción A: Prueba Rápida (Recomendado)

```bash
# 1. Ir al backend
cd backend

# 2. Ejecutar script de prueba
test-reactivation-email.bat

# 3. Ingresar tu email
# Email: tu@email.com
# Nombre: Tu Nombre

# 4. Revisar:
# - Logs en consola
# - Bandeja de entrada
# - Carpeta de spam
```

---

### Opción B: Prueba Desde Interfaz

```bash
# 1. Reiniciar backend
cd backend
reiniciar-backend.bat

# 2. Abrir navegador
# http://localhost:5173

# 3. Login como Admin/Moderador

# 4. Ir a Gestión de Usuarios

# 5. Suspender un usuario de prueba
# → Revisar logs del backend
# → Revisar email

# 6. Reactivar el usuario
# → Revisar logs del backend
# → Revisar email
```

---

## 📞 Si el Problema Persiste

Si después de seguir todos estos pasos el email **aún no se envía**:

1. **Captura los logs** completos del backend cuando reactivas un usuario
2. **Revisa el archivo** `.env` (asegúrate de que no tenga errores)
3. **Ejecuta** el script de prueba y copia el output completo
4. **Verifica** que tu proveedor de email (Gmail, etc.) no esté bloqueando los envíos

---

## ✅ Resultado Esperado

Después de las correcciones:

1. ✅ Al **suspender** un usuario → Email rojo 🚫 llega inmediatamente
2. ✅ Al **reactivar** un usuario → Email verde ✅ llega inmediatamente
3. ✅ Logs del backend muestran cada paso del envío
4. ✅ Cualquier error se muestra claramente en consola

---

**Documento generado**: 22 de Octubre, 2025  
**Estado**: 🔧 Diagnóstico y Soluciones Implementadas  
**Versión**: 1.0

