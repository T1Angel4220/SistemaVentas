# 🗑️ Scripts de Limpieza de Base de Datos

Este directorio contiene scripts para limpiar completamente la base de datos, eliminando todos los datos pero manteniendo la estructura de las tablas.

## ⚠️ ADVERTENCIA IMPORTANTE

**ESTOS SCRIPTS ELIMINAN TODOS LOS DATOS DE LA BASE DE DATOS**

- ✅ Se mantienen las tablas y su estructura
- ✅ Se mantienen los datos de `categorias` y `ubicaciones`
- ❌ Se eliminan TODOS los usuarios, productos, chats, reportes, apelaciones, etc.
- ❌ Esta acción **NO se puede deshacer**

## 📋 Archivos Disponibles

1. **`limpiar-base-datos-completo.sql`** - Script SQL puro
2. **`limpiar-base-datos.bat`** - Script para Windows (ejecuta el SQL)
3. **`limpiar-base-datos.sh`** - Script para Linux/Mac (ejecuta el SQL)
4. **`limpiar-base-datos-node.js`** - Script en Node.js (alternativa si no tienes psql)

## 🔧 Configuración

Los scripts están configurados con estas credenciales:

```
PGHOST=postgres-sistema-ventas.postgres.database.azure.com
PGUSER=azureuser
PGPORT=5432
PGDATABASE=sistema_ventas_multiempresa
PGPASSWORD=Angel_4220
```

Si necesitas cambiar las credenciales, edita el archivo correspondiente.

## 📝 Uso

### Opción 1: Script SQL Directo (Recomendado)

**Windows:**
```bash
cd backend
limpiar-base-datos.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x limpiar-base-datos.sh
./limpiar-base-datos.sh
```

**O usando psql directamente:**
```bash
psql -h postgres-sistema-ventas.postgres.database.azure.com -U azureuser -d sistema_ventas_multiempresa -p 5432 -f limpiar-base-datos-completo.sql
```

### Opción 2: Script Node.js

```bash
cd backend
node limpiar-base-datos-node.js
```

## 📊 Tablas que se Limpian

El script limpia las siguientes tablas (en este orden):

1. `mensajes_chat` - Mensajes de chat
2. `chats` - Conversaciones
3. `valoraciones` - Valoraciones de usuarios
4. `productos_guardados` - Productos favoritos
5. `apelaciones` - Apelaciones de productos
6. `reportes` - Reportes de productos
7. `acciones_moderacion` - Historial de moderación
8. `sesiones_usuario` - Sesiones de usuarios
9. `item_imagenes` - Imágenes de productos
10. `servicios` - Información de servicios
11. `items` - Productos y servicios
12. `usuarios` - Todos los usuarios

## 🔒 Tablas que NO se Limpian

- `categorias` - Se mantienen las categorías
- `ubicaciones` - Se mantienen las ubicaciones

## 🔄 Secuencias Reiniciadas

Después de limpiar, todas las secuencias se reinician a 1:

- `usuarios_id_seq`
- `items_id_seq`
- `chats_id_seq`
- `mensajes_chat_id_seq`
- `reportes_id_seq`
- `apelaciones_id_seq`
- `productos_guardados_id_seq`
- `valoraciones_id_seq`
- `item_imagenes_id_seq`
- `servicios_id_seq`
- `acciones_moderacion_id_seq`
- `sesiones_usuario_id_seq`

## ✅ Verificación

Después de ejecutar el script, verifica que:

1. Todas las tablas están vacías (0 registros)
2. Las secuencias están reiniciadas
3. Las tablas `categorias` y `ubicaciones` mantienen sus datos
4. La estructura de las tablas se mantiene intacta

## 🐛 Solución de Problemas

### Error: "psql: command not found"
- **Solución:** Instala PostgreSQL o usa el script Node.js

### Error: "permission denied"
- **Solución:** Verifica que el usuario tenga permisos de TRUNCATE

### Error: "connection refused"
- **Solución:** Verifica las credenciales y que el servidor esté accesible

### Error: "SSL connection required"
- **Solución:** El script Node.js ya incluye SSL. Para psql, agrega `?sslmode=require` a la conexión

## 📝 Notas

- El script usa `TRUNCATE CASCADE` que es más eficiente que `DELETE`
- Las restricciones de claves foráneas se deshabilitan temporalmente durante la limpieza
- Todas las operaciones se ejecutan en una transacción implícita
- El script muestra el conteo de registros antes y después de la limpieza

## 🔐 Seguridad

⚠️ **NUNCA subas estos scripts a un repositorio público con las credenciales**

Si vas a compartir el código, usa variables de entorno:

```bash
export PGPASSWORD=tu_password
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f limpiar-base-datos-completo.sql
```

