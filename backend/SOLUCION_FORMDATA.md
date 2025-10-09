# Solución al Error "req.body is undefined" con FormData

## 🚨 Problema Identificado

El usuario reportó el error:
```
TypeError: Cannot destructure property 'codigo' of 'req.body' as it is undefined.
```

Este error ocurría al intentar crear productos con imágenes desde el frontend.

## 🔍 Causa Raíz

El problema era que el frontend enviaba datos usando `FormData` (para incluir archivos), pero el backend no tenía configurado el middleware `multer` para manejar este tipo de datos.

### Flujo del problema:
1. **Frontend**: Envía `FormData` con campos de texto + archivos
2. **Backend**: Solo tenía `express.json()` y `express.urlencoded()`
3. **Resultado**: `req.body` era `undefined` porque `FormData` no se procesaba correctamente

## ✅ Solución Implementada

### 1. **Instalación de Multer**
```bash
npm install multer
```

### 2. **Creación del Middleware de Upload**

**Archivo:** `backend/src/middlewares/upload.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Verificar que es una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 5 // Máximo 5 archivos
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB por imagen.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo 5 imágenes por producto.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos de imagen.'
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleMulterError
};
```

### 3. **Actualización de las Rutas**

**Archivo:** `backend/src/routes/products.js`

```javascript
const { upload, handleMulterError } = require('../middlewares/upload');

// Ruta para crear productos con imágenes
router.post('/', 
  authenticate, 
  requireProductCreate, 
  upload.array('images', 5), // ✅ Middleware de multer
  handleMulterError,         // ✅ Manejo de errores
  validateProductCreate, 
  ProductsController.createProduct
);
```

### 4. **Actualización del Controlador**

**Archivo:** `backend/src/controllers/productsController.js`

```javascript
static async createProduct(req, res) {
  try {
    console.log('📊 Datos recibidos:', {
      body: req.body,    // ✅ Ahora contiene los datos del formulario
      files: req.files ? req.files.map(f => ({ 
        filename: f.filename, 
        originalname: f.originalname 
      })) : 'No files'
    });

    const { 
      codigo, 
      nombre, 
      descripcion, 
      precio, 
      ubicacion_id, 
      tipo, 
      categoria_id, 
      horario_atencion, 
      dias_disponibles, 
      duracion_estimada 
    } = req.body; // ✅ Ahora funciona correctamente

    // ... lógica de creación del producto ...

    // Manejar imágenes si se enviaron
    if (req.files && req.files.length > 0) {
      console.log('📸 Procesando imágenes:', req.files.length);
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const esPrincipal = i === 0; // La primera imagen es la principal
        
        await query(
          `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
           VALUES ($1, $2, $3, $4)`,
          [producto.id, `/uploads/${file.filename}`, i + 1, esPrincipal]
        );
      }
      
      console.log('✅ Imágenes guardadas exitosamente');
    }

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: config.server.nodeEnv === 'development' ? error.message : {}
    });
  }
}
```

### 5. **Configuración de Archivos Estáticos**

**Archivo:** `backend/src/app.js`

```javascript
// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));
```

### 6. **Creación del Directorio de Uploads**

```bash
mkdir uploads
```

## 🔧 Cómo Funciona Ahora

### Flujo Corregido:
1. **Frontend**: Envía `FormData` con campos + archivos
2. **Multer**: Procesa el `FormData` y extrae:
   - `req.body`: Campos de texto del formulario
   - `req.files`: Array de archivos subidos
3. **Backend**: Procesa ambos correctamente
4. **Base de datos**: Guarda producto + referencias a imágenes
5. **Servidor**: Sirve imágenes estáticas desde `/uploads/`

### Estructura de Datos:

**req.body** (después de multer):
```javascript
{
  codigo: "PROD-001",
  nombre: "Mi Producto",
  descripcion: "Descripción del producto",
  precio: "100.00",
  tipo: "producto",
  categoria_id: "1",
  ubicacion_id: "1"
}
```

**req.files** (después de multer):
```javascript
[
  {
    fieldname: "images",
    originalname: "imagen1.jpg",
    filename: "product-1694267890123-456789.jpg",
    path: "/path/to/uploads/product-1694267890123-456789.jpg",
    mimetype: "image/jpeg",
    size: 1234567
  }
]
```

## 📊 Comparación Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **req.body** | `undefined` | ✅ Datos del formulario |
| **req.files** | `undefined` | ✅ Array de archivos |
| **Middleware** | Solo `express.json()` | ✅ `multer` + `express.json()` |
| **Validación** | ❌ Fallaba | ✅ Funciona correctamente |
| **Imágenes** | ❌ No se procesaban | ✅ Se guardan en BD |
| **Archivos estáticos** | ❌ No servidos | ✅ Accesibles via `/uploads/` |

## 🎯 Beneficios de la Solución

### 1. **Manejo Correcto de FormData**
- ✅ `req.body` contiene los datos del formulario
- ✅ `req.files` contiene los archivos subidos
- ✅ Validación funciona correctamente

### 2. **Gestión de Archivos Robusta**
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Límite de tamaño (5MB por archivo)
- ✅ Límite de cantidad (5 archivos máximo)
- ✅ Nombres únicos para evitar conflictos

### 3. **Manejo de Errores Mejorado**
- ✅ Errores específicos de multer
- ✅ Mensajes claros para el usuario
- ✅ Validación de archivos antes de procesar

### 4. **Servicio de Archivos Estáticos**
- ✅ Imágenes accesibles via HTTP
- ✅ URLs directas a las imágenes
- ✅ Optimización de rendimiento

## 🚀 Próximos Pasos Recomendados

### 1. **Optimización de Imágenes**
```javascript
// Comprimir imágenes automáticamente
const sharp = require('sharp');

const compressedImage = await sharp(file.path)
  .resize(800, 600)
  .jpeg({ quality: 80 })
  .toFile(compressedPath);
```

### 2. **Almacenamiento en la Nube**
```javascript
// Usar AWS S3 o similar para producción
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadToS3 = async (file) => {
  const params = {
    Bucket: 'mi-bucket',
    Key: `products/${file.filename}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  
  return s3.upload(params).promise();
};
```

### 3. **Validación Avanzada**
```javascript
// Validar dimensiones de imagen
const imageInfo = await sharp(file.path).metadata();
if (imageInfo.width < 300 || imageInfo.height < 300) {
  throw new Error('La imagen debe ser al menos 300x300 píxeles');
}
```

## ✅ Resultado

**El error "req.body is undefined" ha sido completamente resuelto:**

1. ✅ **FormData procesado correctamente** por multer
2. ✅ **req.body contiene los datos** del formulario
3. ✅ **req.files contiene los archivos** subidos
4. ✅ **Imágenes guardadas** en la base de datos
5. ✅ **Archivos servidos** estáticamente
6. ✅ **Validación funciona** correctamente

El usuario ahora puede crear productos con imágenes sin problemas de procesamiento de datos.
