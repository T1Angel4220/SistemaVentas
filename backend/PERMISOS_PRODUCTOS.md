# Sistema de Permisos para Productos - Sistema de Ventas Multiempresa

## Descripción General

Este documento describe el sistema de permisos basado en roles para la gestión de productos en el Sistema de Ventas Multiempresa. El sistema utiliza tokens JWT para autenticación y middleware específico para autorización por roles.

## Roles del Sistema

Según la base de datos (`database.sql`), existen 4 tipos de usuarios:

1. **comprador** - Usuarios que pueden comprar productos
2. **vendedor** - Usuarios que pueden vender productos
3. **moderador** - Usuarios que pueden moderar productos y usuarios
4. **administrador** - Usuarios con acceso completo al sistema

## Permisos por Rol para Productos

### 🔍 **COMPRADOR**
- ✅ **Ver productos** - Puede listar y ver detalles de productos
- ❌ **Crear productos** - No puede crear productos
- ❌ **Actualizar productos** - No puede modificar productos
- ❌ **Eliminar productos** - No puede eliminar productos
- ❌ **Moderar productos** - No puede moderar productos

### 🛒 **VENDEDOR**
- ✅ **Ver productos** - Puede ver todos los productos
- ✅ **Crear productos** - Puede crear nuevos productos
- 🔒 **Actualizar productos** - Solo puede actualizar sus propios productos
- 🔒 **Eliminar productos** - Solo puede eliminar sus propios productos
- ❌ **Moderar productos** - No puede moderar productos de otros

### 🛡️ **MODERADOR**
- ✅ **Ver productos** - Puede ver todos los productos
- ✅ **Crear productos** - Puede crear productos
- ✅ **Actualizar productos** - Puede actualizar cualquier producto
- ✅ **Eliminar productos** - Puede eliminar cualquier producto
- ✅ **Moderar productos** - Puede aprobar, rechazar, suspender o marcar como peligroso

### 👑 **ADMINISTRADOR**
- ✅ **Ver productos** - Puede ver todos los productos
- ✅ **Crear productos** - Puede crear productos
- ✅ **Actualizar productos** - Puede actualizar cualquier producto
- ✅ **Eliminar productos** - Puede eliminar cualquier producto
- ✅ **Moderar productos** - Puede realizar todas las acciones de moderación

## Implementación Técnica

### Middleware de Autenticación

```javascript
// Verificar token JWT
const authenticate = async (req, res, next) => {
  // Extrae y verifica el token
  // Agrega información del usuario a req.user
}

// Verificar permisos específicos para productos
const requireProductPermission = (action) => {
  // Verifica permisos según el rol y la acción
  // Para acciones 'own', verifica propiedad del producto
}
```

### Rutas Protegidas

```javascript
// Rutas públicas
router.get('/', ProductsController.getProducts);           // Ver productos
router.get('/:id', ProductsController.getProductById);     // Ver producto específico

// Rutas protegidas por rol
router.post('/', authenticate, requireProductCreate, ProductsController.createProduct);
router.put('/:id', authenticate, requireProductUpdate, ProductsController.updateProduct);
router.delete('/:id', authenticate, requireProductDelete, ProductsController.deleteProduct);

// Rutas de moderación (solo moderadores y administradores)
router.patch('/:id/moderate', authenticate, requireProductModerate, ProductsController.moderateProduct);
router.get('/moderation/pending', authenticate, requireProductModerate, ProductsController.getPendingModeration);
```

### Controlador de Productos

El controlador incluye métodos específicos para moderación:

- `moderateProduct()` - Aprobar, rechazar, suspender o marcar como peligroso
- `getPendingModeration()` - Obtener productos pendientes de moderación

## Estados de Productos

Los productos pueden tener los siguientes estados:

- `pendiente_revision` - Recién creado, esperando moderación
- `activo` - Aprobado y visible para compradores
- `inactivo` - Deshabilitado por el vendedor
- `rechazado` - Rechazado por moderación
- `peligroso` - Marcado como peligroso por moderación
- `suspendido` - Suspendido por moderación

## Flujo de Moderación

1. **Vendedor crea producto** → Estado: `pendiente_revision`
2. **Moderador revisa** → Puede:
   - Aprobar → Estado: `activo`
   - Rechazar → Estado: `rechazado`
   - Suspender → Estado: `suspendido`
   - Marcar como peligroso → Estado: `peligroso`

## Seguridad

- Todos los tokens JWT incluyen información del rol del usuario
- El middleware verifica la validez del token y el estado del usuario
- Los permisos se verifican en cada endpoint
- Las acciones de moderación se registran en la tabla `acciones_moderacion`

## Ejemplos de Uso

### Crear Producto (Vendedor)
```bash
POST /api/products
Authorization: Bearer <token_vendedor>
Content-Type: application/json

{
  "codigo": "PROD001",
  "nombre": "Producto de ejemplo",
  "descripcion": "Descripción del producto",
  "precio": 100.00,
  "tipo": "producto",
  "categoria_id": 1
}
```

### Moderar Producto (Moderador)
```bash
PATCH /api/products/123/moderate
Authorization: Bearer <token_moderador>
Content-Type: application/json

{
  "accion": "aprobar",
  "motivo": "Producto cumple con las políticas",
  "decision_final": "Aprobado para publicación"
}
```

### Ver Productos Pendientes (Moderador)
```bash
GET /api/products/moderation/pending
Authorization: Bearer <token_moderador>
```

## Consideraciones Importantes

1. **Productos Peligrosos**: No pueden ser editados ni eliminados por vendedores
2. **Auditoría**: Todas las acciones de moderación se registran
3. **Sesiones**: El sistema verifica que las sesiones estén activas
4. **Validación**: Se valida la integridad de los datos en cada operación

## Archivos Relacionados

- `backend/src/middlewares/auth.js` - Middleware de autenticación y autorización
- `backend/src/controllers/productsController.js` - Controlador de productos
- `backend/src/routes/products.js` - Rutas de productos
- `backend/src/services/jwt.js` - Servicio de tokens JWT
- `backend/src/config/database.sql` - Esquema de base de datos
