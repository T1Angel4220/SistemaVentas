# Script de Inserción de Productos de Prueba

Este script inserta productos de prueba en la base de datos con imágenes reales de alta calidad de Unsplash.

## 📦 Productos Incluidos

El script inserta **15 productos variados**:

### Productos Tecnológicos (10)
1. **Laptop HP Pavilion 15** - $599.99
2. **Samsung Galaxy A54 5G** - $449.99
3. **Cámara Canon EOS Rebel T7** - $479.00
4. **Apple Watch Series 8** - $399.00
5. **PlayStation 5 Digital Edition** - $449.99
6. **Sony WH-1000XM5 Auriculares** - $379.99
7. **iPad Air 5ta Generación** - $599.00
8. **Impresora Epson EcoTank L3250** - $299.00
9. **Escritorio Gaming RGB** - $299.99
10. **Refrigerador Samsung French Door** - $1,299.99

### Productos Diversos (2)
11. **Sofá 3 Puestos Moderno** - $389.50
12. **Bicicleta de Montaña Trek 29"** - $520.00

### Servicios (3)
13. **Servicio de Limpieza Profunda** - $85.00/servicio
14. **Servicio de Plomería 24/7** - $45.00/hora
15. **Clases Particulares de Matemáticas** - $25.00/hora

## 📸 Imágenes

Cada producto incluye **3 imágenes de alta calidad** de Unsplash:
- La primera imagen se marca como **imagen principal**
- Las imágenes están ordenadas (1, 2, 3)
- URLs de imágenes reales y funcionales

## 🚀 Cómo Ejecutar

### Requisitos Previos

1. **Base de datos configurada** con las tablas creadas
2. **Al menos 1 vendedor activo** en la base de datos
3. **Categorías activas** en la base de datos
4. **Ubicaciones** insertadas en la base de datos

### Opción 1: Script Windows (.bat)

```bash
cd backend
insert-products.bat
```

### Opción 2: Node.js directo

```bash
cd backend
node insert-test-products.js
```

## ⚙️ Configuración

El script usa las variables de entorno del archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas
DB_USER=postgres
DB_PASSWORD=tu_password
```

## 📊 Características del Script

✅ **Distribución aleatoria**: Los productos se asignan aleatoriamente a:
- Vendedores existentes
- Categorías activas
- Ubicaciones disponibles

✅ **Estado activo**: Los productos se insertan con estado `activo` (visible y disponible) para facilitar las pruebas

✅ **Disponibilidad activa**: Todos los productos están disponibles por defecto

✅ **Códigos únicos**: Cada producto tiene un código único (LAPTOP-001, PHONE-001, etc.)

## 🔍 Verificación

Después de ejecutar el script, verás un resumen como este:

```
═══════════════════════════════════════════════════════
🎉 ¡INSERCIÓN COMPLETADA EXITOSAMENTE!
═══════════════════════════════════════════════════════
📦 Total productos insertados: 15
📸 Total imágenes insertadas: 45
📊 Promedio de imágenes por producto: 3.0
═══════════════════════════════════════════════════════
```

## 📝 Consultas SQL de Verificación

### Ver todos los productos insertados
```sql
SELECT id, codigo, nombre, precio, tipo, estado 
FROM items 
ORDER BY id DESC 
LIMIT 15;
```

### Ver productos con sus imágenes
```sql
SELECT 
  i.id,
  i.nombre,
  i.precio,
  COUNT(img.id) as total_imagenes
FROM items i
LEFT JOIN item_imagenes img ON i.id = img.item_id
GROUP BY i.id, i.nombre, i.precio
ORDER BY i.id DESC;
```

### Ver imágenes de un producto específico
```sql
SELECT * 
FROM item_imagenes 
WHERE item_id = 1 
ORDER BY orden;
```

## 🔄 Ejecutar Múltiples Veces

⚠️ **Nota**: El script puede ejecutarse múltiples veces, pero generará un error de código duplicado si los productos ya existen.

Para reinsertar:
1. Elimina los productos existentes manualmente
2. O modifica los códigos en el script

## 🛠️ Personalización

Para agregar más productos, edita el array `productos` en `insert-test-products.js`:

```javascript
const productos = [
  {
    codigo: 'TU-CODIGO',
    nombre: 'Tu Producto',
    descripcion: 'Descripción detallada...',
    precio: 99.99,
    tipo: 'producto', // o 'servicio'
    imagenes: [
      'https://url-imagen-1.com',
      'https://url-imagen-2.com',
      'https://url-imagen-3.com'
    ]
  },
  // ... más productos
];
```

## 📚 Recursos de Imágenes

Las imágenes utilizan URLs de **Unsplash**, que son:
- ✅ Gratuitas
- ✅ De alta calidad
- ✅ Sin marca de agua
- ✅ Permanentes

Para encontrar más imágenes: https://unsplash.com/

## 🐛 Solución de Problemas

### Error: "No hay vendedores activos"
```sql
-- Crear un vendedor de prueba
INSERT INTO usuarios (cedula, nombre, apellido, correo, password_hash, tipo_usuario, estado, email_verificado)
VALUES ('9999999999', 'Vendedor', 'Prueba', 'vendedor@test.com', '$2b$10$XYZ...', 'vendedor', 'activo', true);
```

### Error: "No hay categorías activas"
```bash
# Ejecutar script de categorías
node create-hierarchical-categories.js
```

### Error: "No hay ubicaciones"
```sql
-- Ejecutar el script de ubicaciones o SQL de datos iniciales
\i src/config/initial_data.sql
```

## 🗑️ Eliminar Productos de Prueba

Si necesitas eliminar los productos de prueba:

### Opción 1: Script Windows (.bat)
```bash
cd backend
delete-products.bat
```

### Opción 2: Node.js directo
```bash
cd backend
node delete-test-products.js
```

⚠️ **ADVERTENCIA**: Esta acción elimina permanentemente los productos y sus imágenes. No se puede deshacer.

## 📞 Soporte

Si tienes problemas ejecutando el script, verifica:
1. ✅ Conexión a la base de datos
2. ✅ Tablas creadas correctamente
3. ✅ Datos básicos insertados (vendedores, categorías, ubicaciones)
4. ✅ Variables de entorno configuradas en `.env`

## 📝 Archivos Incluidos

```
backend/
├── insert-test-products.js      # Script principal de inserción
├── insert-products.bat           # Ejecutor Windows para inserción
├── delete-test-products.js      # Script de eliminación
├── delete-products.bat           # Ejecutor Windows para eliminación
└── README_TEST_PRODUCTS.md      # Esta documentación
```

