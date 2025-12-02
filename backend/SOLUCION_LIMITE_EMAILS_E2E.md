# 🔧 Solución al Límite de Emails en Pruebas E2E

## 📋 Problema

Durante la ejecución de pruebas E2E, el sistema intenta enviar emails reales a través de Gmail. Después de varias pruebas (especialmente las relacionadas con recuperación de contraseña), Gmail bloquea los envíos con el error:

```
Error al enviar email de recuperación: Data command failed: 550-5.4.5 Daily user sending limit exceeded
```

Esto causa que las pruebas se detengan o fallen.

## ✅ Solución Implementada

Se ha modificado el servicio de email (`backend/src/services/email.js`) para que detecte automáticamente cuando está en modo de pruebas E2E y **simule** el envío de emails en lugar de enviarlos realmente.

### Características:

1. **Detección automática** del modo E2E mediante variables de entorno
2. **Simulación de emails** - Los emails se registran en consola pero no se envían
3. **Sin cambios en el código de pruebas** - Las pruebas funcionan igual, solo que no se envían emails reales
4. **Compatibilidad total** - El código sigue funcionando normalmente en producción

## 🚀 Cómo Usar

### Opción 1: Variable de Entorno DISABLE_EMAIL (Recomendado)

Agrega esta variable a tu archivo `.env` del backend:

```env
# Deshabilitar envío de emails durante pruebas E2E
DISABLE_EMAIL=true
```

### Opción 2: Variable de Entorno E2E_MODE

```env
# Modo E2E (también deshabilita emails)
E2E_MODE=true
```

### Opción 3: NODE_ENV=test

Si `NODE_ENV` está configurado como `test`, también se deshabilitan los emails automáticamente.

## 📝 Ejemplo de Salida en Consola

Cuando está en modo E2E, verás mensajes como estos en lugar de intentar enviar emails reales:

```
📧 [E2E MODE] Email de recuperación simulado:
   Para: comprador@test.com
   Nombre: Comprador Test
   Código: 123456
```

## 🔍 Verificación

Para verificar que está funcionando:

1. **Inicia el backend** con `DISABLE_EMAIL=true` en el `.env`
2. **Ejecuta una prueba E2E** que requiera envío de email (ej: recuperación de contraseña)
3. **Revisa la consola del backend** - Deberías ver mensajes `[E2E MODE]` en lugar de intentos de conexión SMTP

## ⚠️ Importante

- **En producción**: Asegúrate de que `DISABLE_EMAIL=false` o que la variable no esté definida
- **En desarrollo local**: Puedes dejar `DISABLE_EMAIL=true` si no necesitas enviar emails reales
- **Las pruebas E2E** seguirán funcionando normalmente, solo que no se enviarán emails reales

## 🎯 Beneficios

1. ✅ **No más límites de Gmail** - No se envían emails reales durante pruebas
2. ✅ **Pruebas más rápidas** - No hay espera por conexiones SMTP
3. ✅ **Sin costos** - No se consumen cuotas de envío de email
4. ✅ **Más confiable** - Las pruebas no fallan por problemas de red o límites de servicio

## 📚 Archivos Modificados

- `backend/src/services/email.js` - Agregada detección de modo E2E
- `backend/.env.example` - Agregada variable `DISABLE_EMAIL` con documentación

## 🔄 Próximos Pasos

Si necesitas probar el envío real de emails en algún momento:

1. Cambia `DISABLE_EMAIL=false` en tu `.env`
2. Reinicia el backend
3. Ejecuta las pruebas nuevamente

---

**Nota**: Esta solución es compatible con todas las funciones de email del sistema:
- Recuperación de contraseña
- Verificación de cuenta
- Notificaciones de suspensión/reactivación
- Alertas de nueva sesión
- Bloqueo por productos peligrosos


