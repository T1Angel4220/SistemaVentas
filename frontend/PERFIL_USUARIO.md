# 👤 Funcionalidad de Perfil de Usuario

## 📋 Resumen

Se ha implementado una página completa de perfil de usuario que permite a los usuarios ver y editar su información personal, así como cambiar su contraseña de forma segura.

## ✨ Características Implementadas

### 🔧 Backend (Nuevos Endpoints)

#### 1. **PUT /api/auth/profile** - Actualizar Perfil
- **Ruta**: `/api/auth/profile`
- **Método**: PUT
- **Autenticación**: Requerida
- **Campos editables**:
  - `nombre` - Nombre del usuario
  - `apellido` - Apellido del usuario
  - `telefono` - Número de teléfono
  - `direccion` - Dirección física
  - `genero` - Género (M, F, Otro)

**Validaciones**:
- Al menos un campo debe ser proporcionado
- Actualización dinámica (solo actualiza los campos enviados)
- Retorna el usuario actualizado

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "cedula": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@example.com",
    "telefono": "0991234567",
    "direccion": "Av. Principal 123",
    "genero": "M",
    "tipo_usuario": "comprador",
    "estado": "activo"
  }
}
```

#### 2. **PUT /api/auth/change-password** - Cambiar Contraseña
- **Ruta**: `/api/auth/change-password`
- **Método**: PUT
- **Autenticación**: Requerida
- **Campos requeridos**:
  - `currentPassword` - Contraseña actual
  - `newPassword` - Nueva contraseña

**Validaciones**:
- Contraseña actual debe ser correcta
- Nueva contraseña debe tener al menos 6 caracteres
- Nueva contraseña debe ser diferente de la actual
- Previene reutilización de contraseñas

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### 🎨 Frontend (Nueva Página)

#### Página de Perfil (`/profile`)

**Ubicación**: `frontend/src/pages/ProfilePage.tsx`

**Secciones**:

##### 1. **Header del Perfil**
- Avatar circular con iniciales del usuario
- Nombre completo
- Descripción de la sección

##### 2. **Información Personal**
- **Campos de solo lectura**:
  - ✅ Cédula
  - ✅ Correo electrónico
  - ✅ Tipo de usuario
  - ✅ Estado de cuenta

- **Campos editables**:
  - ✏️ Nombre
  - ✏️ Apellido
  - ✏️ Teléfono
  - ✏️ Género
  - ✏️ Dirección

**Flujo de edición**:
1. Hacer clic en "Editar Perfil"
2. Los campos se habilitan para edición
3. Realizar cambios
4. Hacer clic en "Guardar Cambios" o "Cancelar"
5. Mensaje de éxito/error animado

##### 3. **Seguridad (Cambio de Contraseña)**
- **Estados**:
  - Vista inicial: Botón "Cambiar Contraseña"
  - Vista de edición: Formulario completo

- **Campos**:
  - 🔒 Contraseña actual (con botón mostrar/ocultar)
  - 🔒 Nueva contraseña (con botón mostrar/ocultar)
  - 🔒 Confirmar nueva contraseña (con botón mostrar/ocultar)

**Validaciones en tiempo real**:
- ✅ Todos los campos son obligatorios
- ✅ Nueva contraseña mínimo 6 caracteres
- ✅ Las contraseñas nuevas deben coincidir
- ✅ No se puede usar la contraseña actual como nueva

## 🎨 Diseño e Interfaz

### Consistencia Visual
- ✅ Paleta de colores del sistema (gradientes azul-índigo, púrpura-rosa)
- ✅ Cards con bordes redondeados y sombras suaves
- ✅ Headers con gradientes
- ✅ Iconos de Lucide React
- ✅ Animaciones suaves y profesionales

### Mensajes de Usuario

#### Mensaje de Éxito
```tsx
- Fondo: Gradiente verde claro
- Icono: CheckCircle animado
- Animaciones:
  - slideInDown (entrada)
  - bounceIn (icono)
  - fadeIn (texto)
  - ping (efecto de fondo)
```

#### Mensaje de Error
```tsx
- Fondo: Gradiente rojo claro
- Icono: AlertTriangle animado
- Animaciones:
  - slideInDown (entrada)
  - bounceIn (icono)
  - fadeIn (texto)
  - ping (efecto de fondo)
```

### Responsive Design
- ✅ Grid adaptativo (1 columna en móvil, 2 en desktop)
- ✅ Espaciado consistente
- ✅ Botones responsivos

## 🔐 Seguridad

### Backend
- ✅ Autenticación JWT obligatoria
- ✅ Validación de contraseña actual antes de cambiar
- ✅ Encriptación bcrypt para nuevas contraseñas
- ✅ Prevención de reutilización de contraseñas
- ✅ Actualización de `fecha_actualizacion` en cada cambio

### Frontend
- ✅ Token JWT en localStorage
- ✅ Mensajes de error genéricos (no revelan información sensible)
- ✅ Validación en cliente antes de enviar al servidor
- ✅ Limpieza automática de campos de contraseña

## 📱 Experiencia de Usuario (UX)

### Flujos Optimizados
1. **Edición de Perfil**:
   - Modo vista → Clic en "Editar" → Modo edición → Guardar/Cancelar
   - Scroll automático al tope en mensajes de éxito/error

2. **Cambio de Contraseña**:
   - Vista inicial → Clic en "Cambiar Contraseña" → Formulario → Actualizar/Cancelar
   - Limpieza automática de campos tras éxito

### Feedback Visual
- ✅ Estados de carga (`loading`) con spinners
- ✅ Botones deshabilitados durante operaciones
- ✅ Mensajes que desaparecen automáticamente después de 5 segundos
- ✅ Colores diferenciados para estados (activo=verde, suspendido=rojo)

## 🛠️ Uso e Integración

### Acceso a la Página
```tsx
// En el Navbar, el ícono de usuario ya redirecciona a /profile
<Link to="/profile">
  <Button variant="ghost" size="icon">
    <User className="h-4 w-4" />
  </Button>
</Link>
```

### Ejemplo de Actualización de Perfil
```typescript
const handleUpdateProfile = async () => {
  const token = localStorage.getItem('accessToken'); // ⚠️ IMPORTANTE: Usar 'accessToken'
  
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: 'Nuevo Nombre',
      telefono: '0991234567'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    refreshUser(); // Actualiza el contexto global
  }
};
```

### Ejemplo de Cambio de Contraseña
```typescript
const handleChangePassword = async () => {
  const token = localStorage.getItem('accessToken'); // ⚠️ IMPORTANTE: Usar 'accessToken'
  
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword: 'contraseña123',
      newPassword: 'nuevaContraseña456'
    })
  });
  
  const data = await response.json();
  // Manejar respuesta
};
```

## 🧪 Pruebas

### Casos de Prueba Recomendados

#### Actualización de Perfil
1. ✅ Actualizar solo el nombre
2. ✅ Actualizar múltiples campos a la vez
3. ✅ Intentar actualizar sin cambios
4. ✅ Cancelar edición restaura valores originales
5. ✅ Verificar que cédula y correo no son editables

#### Cambio de Contraseña
1. ✅ Cambiar contraseña con datos válidos
2. ✅ Intentar con contraseña actual incorrecta
3. ✅ Intentar con nueva contraseña igual a la actual
4. ✅ Intentar con contraseña nueva muy corta (<6 caracteres)
5. ✅ Intentar con contraseñas nuevas que no coinciden
6. ✅ Verificar visibilidad/ocultar contraseña

## 📂 Archivos Modificados/Creados

### Backend
- ✅ `backend/src/controllers/authController.js` - Nuevas funciones `updateProfile` y `changePassword`
- ✅ `backend/src/routes/auth.js` - Nuevas rutas PUT `/profile` y `/change-password`

### Frontend
- ✅ `frontend/src/pages/ProfilePage.tsx` - Nueva página completa de perfil
- ✅ `frontend/src/App.tsx` - Ruta `/profile` agregada

## 🚀 Despliegue

### Variables de Entorno Requeridas
```bash
# Backend
BCRYPT_SALT_ROUNDS=10

# Frontend
VITE_API_URL=http://localhost:3001
```

### Comandos
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## ✅ Checklist de Implementación

- [x] Endpoints del backend creados y funcionando
- [x] Rutas protegidas con autenticación
- [x] Validaciones de seguridad implementadas
- [x] Página de perfil con diseño profesional
- [x] Formulario de edición de perfil funcional
- [x] Formulario de cambio de contraseña funcional
- [x] Mensajes de éxito/error animados
- [x] Validaciones en frontend
- [x] Responsive design
- [x] Integración con contexto de autenticación
- [x] Scroll automático a mensajes
- [x] Documentación completa

## 📝 Notas Adicionales

- La cédula y el correo electrónico **NO** son editables por seguridad
- El tipo de usuario y estado son campos de solo lectura
- Los mensajes de éxito/error desaparecen automáticamente después de 5 segundos
- El contexto de autenticación se actualiza automáticamente tras editar el perfil
- La contraseña actual es requerida para cambiar la contraseña

## 🎯 Próximas Mejoras Sugeridas

1. **Foto de Perfil**: Permitir subir y cambiar la foto del usuario
2. **Verificación de Email**: Proceso para cambiar el correo electrónico
3. **Historial de Cambios**: Registro de modificaciones al perfil
4. **2FA**: Autenticación de dos factores
5. **Preferencias**: Configuraciones adicionales del usuario (notificaciones, idioma, etc.)

---

**Implementado por**: Sistema de Ventas Multiempresa  
**Fecha**: 2025  
**Estado**: ✅ Completado y Funcional

