# 🧹 LIMPIEZA DE BASE DE DATOS

## 📋 Descripción

Este conjunto de scripts permite limpiar completamente la base de datos del sistema, eliminando todos los datos **EXCEPTO** el usuario administrador.

---

## ⚠️ ADVERTENCIA IMPORTANTE

**Esta acción es IRREVERSIBLE**. Una vez ejecutado el script, todos los datos serán eliminados permanentemente.

### Se eliminarán:
- ❌ **Todos los compradores**
- ❌ **Todos los vendedores**
- ❌ **Todos los moderadores**
- ❌ **Todos los productos y servicios**
- ❌ **Todas las sesiones de usuario**
- ❌ **Todos los chats y mensajes**
- ❌ **Todos los reportes**
- ❌ **Todas las imágenes de productos**
- ❌ **Todos los productos guardados**

### Se mantendrá:
- ✅ **Usuario administrador** (único usuario que permanece)
- ✅ **Estructura de la base de datos** (tablas, índices, etc.)
- ✅ **Categorías** (se mantienen para futuros productos)

---

## 🚀 Cómo Usar

### Opción 1: Script Batch con Node.js (Windows - Recomendado) ⭐

1. Abre una terminal en la carpeta `backend`
2. Ejecuta el script:
   ```bash
   limpiar-base-datos.bat
   ```
3. Lee la advertencia cuidadosamente
4. Presiona cualquier tecla para continuar (o CTRL+C para cancelar)
5. Espera a que el proceso termine

**Ventajas:**
- ✅ No requiere configurar `psql` en el PATH
- ✅ Usa Node.js que ya tienes instalado
- ✅ Lee credenciales desde tu archivo `.env`
- ✅ Muestra progreso detallado con emojis

### Opción 2: Node.js Directo

```bash
cd backend
node limpiar-base-datos.js
```

### Opción 3: SQL Directo (Manual)

1. Abre pgAdmin o tu cliente PostgreSQL preferido
2. Conéctate a la base de datos `sistema_ventas_multiempresa`
3. Abre el archivo `limpiar-base-datos.sql`
4. Ejecuta el script completo

### Opción 4: Línea de Comandos con psql (Requiere configuración)

```bash
psql -U postgres -d sistema_ventas_multiempresa -f limpiar-base-datos.sql
```

**Nota:** Si ves el error "psql no se reconoce como comando", usa la Opción 1 o 2.

---

## 📊 ¿Qué hace el script?

El script ejecuta los siguientes pasos en orden:

1. **Muestra el administrador actual** - Para confirmar qué usuario se mantendrá
2. **Elimina todas las sesiones** - Incluidas las del administrador (se pueden recrear)
3. **Elimina todos los mensajes de chat** - Conversaciones completas
4. **Elimina todos los chats** - Salas de chat
5. **Elimina productos guardados** - Favoritos de usuarios
6. **Elimina todos los reportes** - Reportes de moderación
7. **Elimina imágenes de productos** - Referencias en BD (archivos físicos no se eliminan automáticamente)
8. **Elimina productos/servicios** - Todos los productos del sistema
9. **Elimina usuarios no administradores** - Compradores, vendedores, moderadores
10. **Verificación final** - Muestra conteos de registros restantes

---

## 🔍 Verificación Post-Limpieza

Después de ejecutar el script con Node.js, verás un progreso detallado como este:

```
=====================================================
  🧹 LIMPIEZA DE BASE DE DATOS
=====================================================

🔍 Conectando a la base de datos...

📋 Usuario Administrador que se mantendrá:
┌────┬───────────┬───────┬─────────┬──────────────────────────┬───────────────┐
│ id │ cedula    │ nombre│ apellido│ correo                   │ tipo_usuario  │
├────┼───────────┼───────┼─────────┼──────────────────────────┼───────────────┤
│  1 │ 123456789 │ Admin │ Sistema │ admin@sistemaventas.com  │ administrador │
└────┴───────────┴───────┴─────────┴──────────────────────────┴───────────────┘

🗑️  Paso 1/9: Eliminando todas las sesiones...
   ✅ Sesiones eliminadas

🗑️  Paso 2/9: Eliminando todos los mensajes...
   ✅ Mensajes eliminados

... (continúa con cada paso)

========================================
  📊 VERIFICACIÓN FINAL
========================================

👥 Usuarios restantes:
┌───────────────┬───────┐
│ tipo_usuario  │ total │
├───────────────┼───────┤
│ administrador │     1 │
└───────────────┴───────┘

📦 Productos restantes: 0
🔐 Sesiones restantes: 0
💬 Chats restantes: 0
📨 Mensajes restantes: 0
📋 Reportes restantes: 0
🖼️  Imágenes restantes: 0

========================================
  ✅ USUARIO ADMINISTRADOR PRESERVADO
========================================

┌────┬───────────┬───────┬─────────┬──────────────────────────┬───────────────┬────────┬──────────────────┐
│ id │ cedula    │ nombre│ apellido│ correo                   │ tipo_usuario  │ estado │ email_verificado │
├────┼───────────┼───────┼─────────┼──────────────────────────┼───────────────┼────────┼──────────────────┤
│  1 │ 123456789 │ Admin │ Sistema │ admin@sistemaventas.com  │ administrador │ activo │ true             │
└────┴───────────┴───────┴─────────┴──────────────────────────┴───────────────┴────────┴──────────────────┘

========================================
  ✅ ¡LIMPIEZA COMPLETADA EXITOSAMENTE!
========================================
  Solo el usuario administrador permanece
  Puedes crear nuevos usuarios desde el registro
========================================
```

---

## 🔄 Después de la Limpieza

### 1. **Cerrar todas las sesiones activas**
   - Cierra el navegador o borra cookies
   - El administrador deberá iniciar sesión nuevamente

### 2. **Crear nuevos usuarios**
   - Usa el formulario de registro normal
   - O usa el script `create-admin.js` para crear moderadores

### 3. **Insertar productos de prueba** (opcional)
   - Ejecuta `insert-products.bat` para agregar productos de ejemplo

---

## 🛡️ Seguridad

### El administrador está protegido porque:
- El script filtra explícitamente: `WHERE tipo_usuario != 'administrador'`
- Se verifica antes y después de la eliminación
- No se tocan las credenciales del administrador

### Credenciales del administrador por defecto:
- **Email**: `admin@sistemaventas.com`
- **Contraseña**: `Admin123!`
- **Cédula**: `123456789`

---

## 📝 Casos de Uso

Este script es útil para:

1. **Reiniciar el sistema de pruebas** - Comenzar con datos limpios
2. **Preparar demos** - Sistema limpio para presentaciones
3. **Desarrollo** - Limpiar datos de prueba rápidamente
4. **Testing** - Estado conocido para pruebas automatizadas
5. **Troubleshooting** - Eliminar datos corruptos o conflictivos

---

## ⚡ Solución de Problemas

### Error: "psql no se reconoce como un comando" ✅ SOLUCIONADO
**Solución:** Usa el script de Node.js en lugar de psql
```bash
limpiar-base-datos.bat   # Usa automáticamente Node.js
```
O directamente:
```bash
node limpiar-base-datos.js
```

**¿Por qué?** El script de Node.js:
- No requiere `psql` en el PATH
- Usa las mismas dependencias del proyecto
- Lee credenciales desde `.env` automáticamente

### Error: "password authentication failed"
- Verifica las credenciales en el script
- Edita el script `.bat` si tu usuario no es `postgres`

### Error: "database does not exist"
- Verifica que la base de datos `sistema_ventas_multiempresa` existe
- Ejecuta el script de creación de BD primero

### Error: "cannot delete because of foreign key constraint"
- El orden de eliminación está optimizado para evitar esto
- Si persiste, revisa las relaciones de la base de datos

---

## 📁 Archivos Incluidos

- **`limpiar-base-datos.js`** ⭐ - Script Node.js (Recomendado)
- **`limpiar-base-datos.bat`** - Script ejecutable para Windows
- **`limpiar-base-datos.sql`** - Script SQL para ejecución manual
- **`LIMPIEZA_BASE_DATOS.md`** - Esta documentación

---

## 🔗 Archivos Relacionados

- `truncate-tables.sql` - Limpia TODAS las tablas (más agresivo)
- `insert-test-products.js` - Inserta productos de prueba
- `create-admin.js` - Crea usuarios administradores/moderadores

---

## ⚙️ Configuración Avanzada

Si necesitas personalizar el script:

### Cambiar el usuario a preservar:
```sql
-- En lugar de:
WHERE tipo_usuario != 'administrador'

-- Usa:
WHERE correo != 'admin@sistemaventas.com'
```

### Mantener también moderadores:
```sql
-- Cambia:
WHERE tipo_usuario IN ('comprador', 'vendedor', 'moderador')

-- Por:
WHERE tipo_usuario IN ('comprador', 'vendedor')
```

---

## 📞 Soporte

Si tienes problemas:
1. Verifica los logs de PostgreSQL
2. Asegúrate de tener permisos de administrador
3. Revisa que la BD no esté en uso por otras aplicaciones
4. Contacta al equipo de desarrollo

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0  
**Compatibilidad:** PostgreSQL 12+  
**Sistema:** Sistema de Ventas Multiempresa

