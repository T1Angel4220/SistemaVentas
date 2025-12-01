# 📝 Guía de Inserción de Datos de Prueba - Ecuador

Este documento explica cómo insertar usuarios, productos y servicios de prueba en el sistema con ubicaciones de Ecuador.

## 🔑 Credenciales

**Contraseña para todos los usuarios:** `Angel_4220`

**Hash de contraseña:** `$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO`

## 📋 Datos que se Insertan

### Usuarios
- **1 Administrador**
- **3 Moderadores**
- **6 Vendedores**
- **6 Compradores**

**Total: 16 usuarios**

### Productos
- **10 productos** variados (electrónicos, muebles, deportes, etc.)
- Todos con ubicaciones de **Ecuador** (provincias y cantones)
- Incluyen imágenes de ejemplo

### Servicios
- **6 servicios** profesionales (limpieza, clases, reparación, diseño, fotografía)
- Todos con ubicaciones de **Ecuador**
- Incluyen horarios y días disponibles

## 🚀 Métodos de Inserción

### Método 1: Script Batch para Windows (Más Fácil) ⭐

**Para Azure PostgreSQL:**

#### Opción A: Script Node.js (Recomendado)
```batch
# Doble clic en el archivo o desde la terminal:
insertar-datos-ecuador.bat
```

#### Opción B: Script SQL
```batch
# Doble clic en el archivo o desde la terminal:
insertar-datos-ecuador-sql.bat
```

Estos scripts configuran automáticamente las credenciales de Azure PostgreSQL.

### Método 2: Script Node.js Manual

```bash
# Configurar variables de entorno (Windows)
set PGHOST=postgres-sistema-ventas.postgres.database.azure.com
set PGUSER=azureuser
set PGPORT=5432
set PGDATABASE=sistema_ventas_multiempresa
set PGPASSWORD=Angel_4220

# Ejecutar script
cd backend
node insertar-datos-prueba-ecuador.js
```

### Método 3: Script SQL Manual

```bash
# Configurar variables de entorno (Windows)
set PGHOST=postgres-sistema-ventas.postgres.database.azure.com
set PGUSER=azureuser
set PGPORT=5432
set PGDATABASE=sistema_ventas_multiempresa
set PGPASSWORD=Angel_4220

# Ejecutar script
cd backend
psql -h %PGHOST% -U %PGUSER% -d %PGDATABASE% -f insertar-datos-prueba-ecuador.sql
```

**Para Linux/Mac:**
```bash
export PGHOST=postgres-sistema-ventas.postgres.database.azure.com
export PGUSER=azureuser
export PGPORT=5432
export PGDATABASE=sistema_ventas_multiempresa
export PGPASSWORD=Angel_4220

psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f insertar-datos-prueba-ecuador.sql
```

**Ventajas del script Node.js:**
- Maneja automáticamente usuarios existentes (los actualiza en lugar de crear duplicados)
- Busca categorías de forma inteligente (por nombre parcial)
- Maneja errores de forma más robusta
- Proporciona mejor feedback durante la ejecución

## ⚠️ Requisitos Previos

1. **Base de datos creada y configurada**
2. **Ubicaciones de Ecuador insertadas** (usar `update-ecuador-locations.sql` si no están)
3. **Categorías creadas** (el sistema debería tener categorías básicas)

### Verificar ubicaciones de Ecuador

```sql
SELECT COUNT(*) FROM ubicaciones WHERE provincia IN ('Pichincha', 'Guayas', 'Azuay', 'Tungurahua', 'Manabí');
```

Si el resultado es 0, ejecuta primero:
```bash
psql -U postgres -d sistema_ventas_multiempresa -f update-ecuador-locations.sql
```

### Verificar categorías

```sql
SELECT COUNT(*) FROM categorias WHERE activa = true;
```

Si no hay categorías, el script Node.js usará la primera disponible o fallará con un mensaje claro.

## 📍 Ubicaciones de Ecuador Incluidas

Los productos y servicios se distribuyen en las siguientes provincias:

- **Pichincha** (Quito)
- **Guayas** (Guayaquil)
- **Azuay** (Cuenca)
- **Tungurahua** (Ambato)
- **Manabí** (Portoviejo)
- **Chimborazo** (Riobamba)

## 👥 Usuarios Creados

### Administrador
- **Email:** `admin@sistemaventas.com`
- **Cédula:** `1000000001`
- **Ubicación:** Quito, Pichincha

### Moderadores
- **María González:** `maria.moderador@sistemaventas.com` (Guayaquil)
- **Carlos Rodríguez:** `carlos.moderador@sistemaventas.com` (Cuenca)
- **Javier García:** `javier.moderador@sistemaventas.com` (Ambato)

### Vendedores
- **Ana Martínez:** `ana.vendedor@sistemaventas.com` (Quito)
- **Luis Hernández:** `luis.vendedor@sistemaventas.com` (Guayaquil)
- **Carmen López:** `carmen.vendedor@sistemaventas.com` (Cuenca)
- **Roberto Sánchez:** `roberto.vendedor@sistemaventas.com` (Ambato)
- **Miguel Lopez:** `miguel.vendedor@sistemaventas.com` (Riobamba)
- **Patricia Morales:** `patricia.vendedor@sistemaventas.com` (Portoviejo)

### Compradores
- **Sofia Ramírez:** `sofia.comprador@sistemaventas.com` (Quito)
- **Diego Castro:** `diego.comprador@sistemaventas.com` (Guayaquil)
- **Valeria Morales:** `valeria.comprador@sistemaventas.com` (Cuenca)
- **Andrés Vargas:** `andres.comprador@sistemaventas.com` (Ambato)
- **Camila Torres:** `camila.comprador@sistemaventas.com` (Riobamba)
- **Sebastián Jiménez:** `sebastian.comprador@sistemaventas.com` (Portoviejo)

## 📦 Productos Incluidos

1. **PROD-001:** Celular tecno 18p - $158.00 (Ambato) - Estado: Pendiente revisión
2. **PROD-002:** Laptop HP Pavilion - $450.00 (Quito) - Estado: Activo
3. **PROD-003:** Tablet Samsung Galaxy Tab - $280.00 (Guayaquil) - Estado: Activo
4. **PROD-004:** Sofá de 3 plazas - $320.00 (Cuenca) - Estado: Activo
5. **PROD-005:** Refrigeradora Samsung - $580.00 (Ambato) - Estado: Activo
6. **PROD-006:** Bicicleta de montaña - $420.00 (Quito) - Estado: Activo
7. **PROD-007:** Zapatos deportivos Nike - $95.00 (Guayaquil) - Estado: Activo
8. **PROD-008:** Libro de Programación - $35.00 (Cuenca) - Estado: Activo
9. **PROD-009:** Cámara Canon EOS - $650.00 (Quito) - Estado: Activo
10. **PROD-010:** Escritorio de oficina - $180.00 (Portoviejo) - Estado: Activo

## 🔧 Servicios Incluidos

1. **SERV-001:** Servicio de limpieza - $60.00 (Ambato) - Estado: Rechazado
2. **SERV-002:** Clases de guitarra - $25.00 (Quito) - Estado: Activo
3. **SERV-003:** Reparación de computadoras - $40.00 (Guayaquil) - Estado: Activo
4. **SERV-004:** Clases de inglés - $30.00 (Cuenca) - Estado: Activo
5. **SERV-005:** Diseño gráfico profesional - $80.00 (Quito) - Estado: Activo
6. **SERV-006:** Fotografía de eventos - $150.00 (Guayaquil) - Estado: Activo

## 🔄 Re-ejecutar el Script

### Script SQL
Si ejecutas el script SQL múltiples veces, puede generar errores de duplicados. Para evitar esto:

1. **Opción 1:** Eliminar datos existentes primero
2. **Opción 2:** Modificar el script para usar `ON CONFLICT DO UPDATE`

### Script Node.js
El script Node.js está diseñado para ser **idempotente**:
- Si un usuario ya existe, lo **actualiza** (incluyendo la contraseña)
- Si un producto/servicio ya existe, lo **actualiza**
- Si no existe, lo **crea**

Puedes ejecutarlo múltiples veces sin problemas.

## 🐛 Solución de Problemas

### Error: "No se encontraron ubicaciones"
**Solución:** Ejecuta primero el script de ubicaciones de Ecuador:
```bash
psql -U postgres -d sistema_ventas_multiempresa -f update-ecuador-locations.sql
```

### Error: "No se encontraron categorías"
**Solución:** Asegúrate de tener categorías en la base de datos. Puedes insertarlas manualmente o usar el script de categorías.

### Error: "Usuario duplicado"
**Solución:** El script Node.js maneja esto automáticamente. Si usas el script SQL, elimina los usuarios existentes primero o modifica el script.

### Error de conexión a la base de datos
**Solución:** Para Azure PostgreSQL, las credenciales están configuradas en los scripts batch:
```
PGHOST=postgres-sistema-ventas.postgres.database.azure.com
PGUSER=azureuser
PGPORT=5432
PGDATABASE=sistema_ventas_multiempresa
PGPASSWORD=Angel_4220
```

Si ejecutas manualmente, asegúrate de configurar estas variables de entorno antes de ejecutar el script.

## 📊 Verificar Datos Insertados

### Ver usuarios
```sql
SELECT tipo_usuario, COUNT(*) as total 
FROM usuarios 
GROUP BY tipo_usuario;
```

### Ver productos por estado
```sql
SELECT estado, COUNT(*) as total 
FROM items 
WHERE tipo = 'producto'
GROUP BY estado;
```

### Ver servicios por estado
```sql
SELECT estado, COUNT(*) as total 
FROM items 
WHERE tipo = 'servicio'
GROUP BY estado;
```

### Ver productos por provincia
```sql
SELECT ubicacion_provincia, COUNT(*) as total 
FROM items 
WHERE ubicacion_provincia IS NOT NULL
GROUP BY ubicacion_provincia
ORDER BY total DESC;
```

## ✅ Checklist de Verificación

Después de ejecutar el script, verifica:

- [ ] 16 usuarios creados (1 admin, 3 moderadores, 6 vendedores, 6 compradores)
- [ ] 10 productos insertados
- [ ] 6 servicios insertados
- [ ] Imágenes asociadas a productos
- [ ] Datos específicos de servicios (horarios, días, duración)
- [ ] Todos los usuarios pueden iniciar sesión con `Angel_4220`
- [ ] Productos tienen ubicaciones de Ecuador
- [ ] Servicios tienen horarios y días configurados

## 📝 Notas Adicionales

- Las imágenes usan URLs de placeholder. Reemplázalas con URLs reales de tus imágenes.
- Los precios están en dólares (USD), que es la moneda de Ecuador.
- Los teléfonos usan el formato ecuatoriano (10 dígitos, empezando con 09).
- Las direcciones incluyen provincia, cantón y dirección específica.

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del script
2. Verifica que las ubicaciones y categorías existan
3. Asegúrate de que la base de datos esté correctamente configurada
4. Revisa los permisos de la base de datos

---

**Última actualización:** 2024
**Versión:** 1.0

