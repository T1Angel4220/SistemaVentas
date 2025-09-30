# Gestión de Productos y Servicios - Frontend

Este documento describe las páginas y componentes creados para la gestión de productos y servicios en el frontend del Sistema de Ventas Multiempresa.

## Páginas Creadas

### 1. ProductsPage (`/products`)
- **Descripción**: Página principal que muestra todos los productos y servicios disponibles
- **Funcionalidades**:
  - Lista paginada de productos/servicios
  - Filtros avanzados (categoría, tipo, precio, ubicación, búsqueda)
  - Cards de productos con información básica
  - Acceso público (no requiere autenticación)
  - Enlaces a crear producto para vendedores

### 2. ProductDetailPage (`/products/:id`)
- **Descripción**: Página de detalle de un producto/servicio específico
- **Funcionalidades**:
  - Visualización completa del producto
  - Galería de imágenes (hasta 5 imágenes)
  - Información del vendedor
  - Detalles específicos para servicios (horarios, duración)
  - Botones de acción (guardar como favorito, agregar al carrito)
  - Opciones de edición/eliminación para propietarios
  - Acceso público

### 3. CreateProductPage (`/products/create` y `/products/:id/edit`)
- **Descripción**: Formulario para crear o editar productos/servicios
- **Funcionalidades**:
  - Formulario completo con validación
  - Campos específicos para productos y servicios
  - Upload de imágenes (hasta 5 imágenes)
  - Validación en tiempo real
  - Solo para vendedores y administradores
  - Modo edición para productos existentes

### 4. MyProductsPage (`/my-products`)
- **Descripción**: Panel de gestión para vendedores
- **Funcionalidades**:
  - Lista de productos del vendedor actual
  - Estadísticas rápidas (total, activos, pendientes, rechazados)
  - Filtros por estado
  - Acciones rápidas (ver, editar, cambiar disponibilidad, eliminar)
  - Paginación
  - Solo para vendedores y administradores

## Componentes UI Creados

### Badge
- Componente para mostrar estados y etiquetas
- Variantes: default, secondary, destructive, outline

### Select
- Componente de selección con dropdown
- Incluye: SelectTrigger, SelectContent, SelectItem, SelectValue

### Textarea
- Componente de texto multilínea
- Estilo consistente con otros inputs

### Label
- Componente de etiqueta para formularios
- Estilo consistente con el diseño

## Componentes Específicos

### ProductCard
- Componente reutilizable para mostrar productos
- Props configurables para diferentes contextos
- Acciones opcionales (guardar, agregar al carrito)

## Servicios

### ProductsService
- Servicio centralizado para operaciones de productos
- Métodos para CRUD completo
- Manejo de filtros y paginación
- Integración con productos guardados (favoritos)
- Manejo de errores consistente

## Rutas Configuradas

```typescript
// Rutas públicas
/products - Lista de productos
/products/:id - Detalle de producto

// Rutas protegidas (vendedores y administradores)
/products/create - Crear producto
/products/:id/edit - Editar producto
/my-products - Mis productos
```

## Integración con Backend

Las páginas están completamente integradas con el backend existente:

- **Endpoints utilizados**:
  - `GET /api/products` - Listar productos con filtros
  - `GET /api/products/:id` - Obtener producto específico
  - `POST /api/products` - Crear producto
  - `PUT /api/products/:id` - Actualizar producto
  - `DELETE /api/products/:id` - Eliminar producto
  - `PATCH /api/products/:id/availability` - Cambiar disponibilidad
  - `GET /api/products/my/products` - Mis productos
  - `GET /api/categories` - Listar categorías
  - `GET /api/locations` - Listar ubicaciones
  - `POST/DELETE /api/saved-products/:id` - Guardar/quitar favoritos

## Características Implementadas

### ✅ CRUD Completo
- Crear productos/servicios
- Leer productos con filtros
- Actualizar productos existentes
- Eliminar productos (con validaciones)

### ✅ Gestión de Disponibilidad
- Cambiar estado de disponibilidad
- Indicadores visuales de estado
- Validaciones de permisos

### ✅ Filtros y Búsqueda
- Búsqueda por texto
- Filtros por categoría, tipo, precio, ubicación
- Paginación eficiente

### ✅ Gestión de Imágenes
- Upload de hasta 5 imágenes por producto
- Preview de imágenes
- Galería en página de detalle

### ✅ Productos Favoritos
- Guardar/quitar productos como favoritos
- Verificación de estado guardado
- Integración con API

### ✅ Validaciones
- Validación de formularios en tiempo real
- Validación de permisos por rol
- Manejo de errores del servidor

### ✅ Responsive Design
- Diseño adaptable a diferentes pantallas
- Componentes optimizados para móvil
- Grid responsive para productos

## Navegación Actualizada

- **Navbar**: Enlaces a productos y "Mis Productos" para vendedores
- **Dashboard**: Accesos rápidos a funcionalidades de productos
- **Rutas protegidas**: Control de acceso por roles

## Próximos Pasos Sugeridos

1. **Implementar funcionalidad de carrito de compras**
2. **Agregar sistema de valoraciones y comentarios**
3. **Implementar notificaciones en tiempo real**
4. **Agregar funcionalidad de reportes de productos**
5. **Implementar sistema de mensajería con vendedores**
6. **Agregar funcionalidad de comparación de productos**

## Notas Técnicas

- Todas las páginas mantienen consistencia con el diseño existente
- Uso de Tailwind CSS para estilos
- Componentes reutilizables y modulares
- Manejo de estados con React hooks
- Integración completa con el sistema de autenticación existente
- Validaciones tanto en frontend como backend
