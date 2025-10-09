# Diagrama de Permisos por Rol - Sistema de Productos

## Flujo de Permisos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE PERMISOS POR ROL                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ COMPRADOR   │    │ VENDEDOR    │    │ MODERADOR   │    │ADMINISTRADOR│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PERMISOS  │    │   PERMISOS  │    │   PERMISOS  │    │   PERMISOS  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│✅ Ver       │    │✅ Ver       │    │✅ Ver       │    │✅ Ver       │
│❌ Crear     │    │✅ Crear     │    │✅ Crear     │    │✅ Crear     │
│❌ Actualizar│    │🔒 Actualizar│    │✅ Actualizar│    │✅ Actualizar│
│❌ Eliminar  │    │🔒 Eliminar  │    │✅ Eliminar  │    │✅ Eliminar  │
│❌ Moderar   │    │❌ Moderar   │    │✅ Moderar   │    │✅ Moderar   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Estados de Productos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ESTADOS DE PRODUCTOS                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PENDIENTE_      │    │     ACTIVO       │    │    RECHAZADO    │
│ REVISION        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SUSPENDIDO    │    │   PELIGROSO     │    │    INACTIVO     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Flujo de Moderación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE MODERACIÓN                                │
└─────────────────────────────────────────────────────────────────────────────┘

VENDEDOR CREA PRODUCTO
         │
         ▼
┌─────────────────┐
│ PENDIENTE_      │
│ REVISION        │
└─────────────────┘
         │
         ▼
    MODERADOR REVISA
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────┐
│ APROBAR │ │ RECHAZAR│
└─────────┘ └─────────┘
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ ACTIVO  │ │ RECHAZADO│
└─────────┘ └─────────┘
    │
    ▼
┌─────────┐
│ SUSPENDER│
└─────────┘
    │
    ▼
┌─────────┐
│SUSPENDIDO│
└─────────┘
```

## Middleware de Autenticación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE DE AUTENTICACIÓN                         │
└─────────────────────────────────────────────────────────────────────────────┘

REQUEST
    │
    ▼
┌─────────────┐
│ Extraer     │
│ Token JWT   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Verificar   │
│ Token       │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Obtener     │
│ Usuario     │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Verificar   │
│ Estado      │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Agregar     │
│ req.user    │
└─────────────┘
    │
    ▼
   NEXT
```

## Middleware de Autorización

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE DE AUTORIZACIÓN                           │
└─────────────────────────────────────────────────────────────────────────────┘

req.user
    │
    ▼
┌─────────────┐
│ Verificar   │
│ Rol         │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Verificar   │
│ Permisos    │
└─────────────┘
    │
    ▼
┌─────────────┐
│ ¿Acción     │
│ "own"?      │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Verificar   │
│ Propiedad   │
└─────────────┘
    │
    ▼
   NEXT
```

## Rutas Protegidas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RUTAS PROTEGIDAS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

RUTAS PÚBLICAS:
├── GET /api/products              (Ver productos)
└── GET /api/products/:id          (Ver producto específico)

RUTAS PROTEGIDAS:
├── POST /api/products             (Crear producto)
│   └── authenticate + requireProductCreate
├── PUT /api/products/:id          (Actualizar producto)
│   └── authenticate + requireProductUpdate
├── DELETE /api/products/:id       (Eliminar producto)
│   └── authenticate + requireProductDelete
├── PATCH /api/products/:id/availability (Cambiar disponibilidad)
│   └── authenticate + requireProductUpdate
├── GET /api/products/my/products  (Mis productos)
│   └── authenticate
├── PATCH /api/products/:id/moderate (Moderar producto)
│   └── authenticate + requireProductModerate
└── GET /api/products/moderation/pending (Productos pendientes)
    └── authenticate + requireProductModerate
```

## Matriz de Permisos

| Acción        | Comprador | Vendedor | Moderador | Administrador |
|---------------|-----------|----------|-----------|---------------|
| Ver productos | ✅        | ✅       | ✅        | ✅            |
| Crear         | ❌        | ✅       | ✅        | ✅            |
| Actualizar    | ❌        | 🔒*      | ✅        | ✅            |
| Eliminar      | ❌        | 🔒*      | ✅        | ✅            |
| Moderar       | ❌        | ❌       | ✅        | ✅            |

*🔒 = Solo productos propios

## Seguridad

- ✅ Tokens JWT con información de rol
- ✅ Verificación de estado de usuario
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Verificación de permisos por acción
- ✅ Auditoría de acciones de moderación
- ✅ Validación de propiedad para acciones "own"
- ✅ Verificación de sesiones activas
