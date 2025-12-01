# 📱 Guía de Implementación - Menú Móvil (Pop Menu)

## 📋 Descripción

Esta guía detalla cómo implementar un menú móvil deslizante desde la izquierda con diseño moderno, animaciones suaves y funcionalidad completa basada en roles de usuario.

## ✨ Características Principales

- ✅ Menú deslizante desde la izquierda
- ✅ Fondo sólido blanco para mejor legibilidad
- ✅ Animaciones suaves de entrada/salida
- ✅ Overlay oscuro al abrir
- ✅ Menú dinámico según tipo de usuario
- ✅ Contador de notificaciones (ej: productos peligrosos)
- ✅ Header con información del usuario
- ✅ Footer con botón de logout
- ✅ Responsive (solo visible en móvil)
- ✅ Cierre automático al navegar

---

## 🚀 Paso 1: Crear el Componente MobileMenu

### 1.1 Estructura de Archivos

Crea el archivo en: `frontend/src/components/layout/MobileMenu.tsx`

### 1.2 Imports Necesarios

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { apiService } from '../../services/api';
import {
  Home,
  Users,
  Flag,
  FileText,
  Shield,
  UserPlus,
  Package,
  ShoppingCart,
  MessageSquare,
  User,
  ChevronRight,
  LogOut,
  X,
  Menu,
  AlertTriangle
} from 'lucide-react';
```

### 1.3 Interface del Componente

```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}
```

---

## 🎨 Paso 2: Estructura del Componente

### 2.1 Estado y Hooks

```typescript
export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dangerousProductsCount, setDangerousProductsCount] = useState(0);

  // Cargar datos adicionales si es necesario
  useEffect(() => {
    const loadDangerousCount = async () => {
      if (user?.tipo_usuario === 'vendedor') {
        try {
          const response = await fetch('http://localhost:3001/api/products/my-dangerous', {
            headers: {
              'Authorization': `Bearer ${apiService.getToken()}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setDangerousProductsCount(data.data.length);
          }
        } catch (error) {
          console.error('Error al cargar conteo:', error);
        }
      }
    };
    
    if (isOpen) {
      loadDangerousCount();
    }
  }, [user, isOpen]);

  if (!user) return null;
```

### 2.2 Handlers de Logout

```typescript
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      window.location.href = '/login';
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };
```

---

## 📝 Paso 3: Definir Items del Menú por Rol

### 3.1 Menú para Administradores y Moderadores

```typescript
  const adminMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      description: 'Administra usuarios, roles y permisos',
      onClick: () => {
        navigate('/admin/users');
        onClose();
      },
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gestión de Reportes',
      icon: Flag,
      description: 'Revisa reportes de productos y usuarios',
      onClick: () => {
        navigate('/moderation/reports');
        onClose();
      },
      color: 'from-red-500 to-orange-600'
    },
    {
      title: 'Gestión de Apelaciones',
      icon: FileText,
      description: 'Revisa apelaciones de vendedores',
      onClick: () => {
        navigate('/moderation/appeals');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Moderación de Productos',
      icon: Shield,
      description: 'Revisa y aprueba productos',
      onClick: () => {
        navigate('/products/moderation');
        onClose();
      },
      color: 'from-purple-500 to-purple-600'
    },
  ];

  // Agregar opción adicional solo para administradores
  if (user?.tipo_usuario === 'administrador') {
    adminMenuItems.push({
      title: 'Registrar Moderador',
      icon: UserPlus,
      description: 'Crear nuevas cuentas de moderador',
      onClick: () => {
        navigate('/admin/register-moderator');
        onClose();
      },
      color: 'from-indigo-500 to-purple-600'
    });
  }
```

### 3.2 Menú para Vendedores

```typescript
  const sellerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Mis Productos',
      icon: Package,
      description: 'Gestiona tus productos publicados',
      onClick: () => {
        navigate('/my-products');
        onClose();
      },
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Crear Producto',
      icon: ShoppingCart,
      description: 'Publica un nuevo producto',
      onClick: () => {
        navigate('/products/create');
        onClose();
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        onClose();
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];
```

### 3.3 Menú para Compradores

```typescript
  const buyerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Explorar Productos',
      icon: ShoppingCart,
      description: 'Descubre productos disponibles',
      onClick: () => {
        navigate('/products');
        onClose();
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        onClose();
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];
```

### 3.4 Selección del Menú Según Rol

```typescript
  const menuItems = 
    (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador')
      ? adminMenuItems
      : user.tipo_usuario === 'vendedor'
        ? sellerMenuItems
        : buyerMenuItems;
```

---

## 🎨 Paso 4: Estructura JSX del Menú

### 4.1 Botón Hamburguesa

```typescript
  return (
    <>
      {/* Botón hamburguesa para abrir menú */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="lg:hidden bg-white/80 border-gray-300 hover:bg-gray-50 p-2"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </Button>
```

### 4.2 Overlay Oscuro

```typescript
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
```

### 4.3 Menú Lateral

```typescript
      {/* Menú lateral */}
      <div className={`
        fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ backgroundColor: '#ffffff', height: '100vh' }}
      >
```

**Explicación de clases:**
- `fixed top-0 left-0`: Posición fija en la esquina superior izquierda
- `h-screen`: Altura completa de la pantalla
- `w-80 max-w-[85vw]`: Ancho de 320px máximo, pero 85% del viewport en pantallas pequeñas
- `bg-white`: Fondo blanco sólido
- `shadow-2xl`: Sombra grande
- `z-50`: Z-index alto para estar sobre otros elementos
- `transform transition-transform duration-300 ease-in-out`: Animación suave
- `${isOpen ? 'translate-x-0' : '-translate-x-full'}`: Desliza desde la izquierda cuando está abierto

---

## 🎯 Paso 5: Header del Menú

```typescript
        {/* Header del menú */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">
                  {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user.nombre} {user.apellido}</h3>
                <p className="text-blue-100 text-sm capitalize">{user.tipo_usuario}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-100 text-sm">
            {user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador' 
              ? 'Panel de Administración' 
              : user.tipo_usuario === 'vendedor' 
                ? 'Panel de Vendedor'
                : 'Panel de Comprador'
            }
          </p>
        </div>
```

---

## 📋 Paso 6: Lista de Items del Menú

```typescript
        {/* Opciones del menú */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </button>
            ))}
          </div>
```

---

## 🔔 Paso 7: Items Adicionales con Notificaciones

### 7.1 Para Vendedores - Productos Peligrosos

```typescript
          {/* Opciones adicionales para vendedores */}
          {user.tipo_usuario === 'vendedor' && (
            <div className="space-y-2">
              {/* ... otros items ... */}

              {/* Productos Peligrosos con contador */}
              {dangerousProductsCount > 0 && (
                <button
                  onClick={() => {
                    navigate('/my-products/dangerous');
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-xl hover:bg-red-50 transition-all duration-200 group border border-red-100 hover:border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 text-sm">Productos Peligrosos</h4>
                        <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {dangerousProductsCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Ver productos marcados como peligrosos</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                  </div>
                </button>
              )}
            </div>
          )}
```

---

## 🚪 Paso 8: Footer con Botón de Logout

```typescript
        {/* Footer del menú */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={`${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario'}
      />
    </>
  );
};
```

---

## 🔗 Paso 9: Integración en Navbar

### 9.1 Imports en Navbar

```typescript
import { MobileMenu } from './MobileMenu';
```

### 9.2 Estado del Menú

```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

### 9.3 Integración en JSX

```typescript
<div className="flex items-center space-x-8 flex-1">
  {/* Menú móvil - Botón hamburguesa a la izquierda */}
  <MobileMenu 
    isOpen={isMobileMenuOpen}
    onClose={() => setIsMobileMenuOpen(false)}
    onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  />
  
  {/* Resto del navbar */}
  <Link to="/dashboard" className="text-xl font-bold text-gray-900">
    Sistema de Ventas
  </Link>
  
  {/* ... resto del contenido del navbar ... */}
</div>
```

**Importante:** El menú móvil debe estar **antes** del logo/título para que aparezca a la izquierda.

---

## 🎨 Paso 10: Personalización de Estilos

### 10.1 Colores de Gradientes

Los items del menú usan clases de Tailwind con gradientes. Puedes personalizar los colores:

```typescript
color: 'from-blue-500 to-indigo-600'  // Azul
color: 'from-green-500 to-emerald-600' // Verde
color: 'from-red-500 to-orange-600'    // Rojo/Naranja
color: 'from-purple-500 to-indigo-600' // Morado
color: 'from-pink-500 to-rose-600'     // Rosa
```

### 10.2 Ancho del Menú

Ajusta el ancho modificando:
- `w-80`: Ancho fijo de 320px
- `max-w-[85vw]`: Máximo 85% del viewport

### 10.3 Velocidad de Animación

Modifica `duration-300` para cambiar la velocidad:
- `duration-200`: Más rápido
- `duration-300`: Normal (recomendado)
- `duration-500`: Más lento

---

## ✅ Paso 11: Verificaciones Importantes

### 11.1 Rutas Correctas

Asegúrate de que todas las rutas en `menuItems` coincidan con las definidas en tu `App.tsx`:

```typescript
// Ejemplo de verificación
navigate('/dashboard');        // ✅ Debe existir en App.tsx
navigate('/my-products');      // ✅ Debe existir en App.tsx
navigate('/products/create');  // ✅ Debe existir en App.tsx
```

### 11.2 Contexto de Autenticación

El componente requiere `useAuth()` que debe proporcionar:
- `user`: Objeto con información del usuario
- `logout`: Función para cerrar sesión
- `user.tipo_usuario`: Rol del usuario ('administrador', 'moderador', 'vendedor', 'comprador')

### 11.3 Componentes UI Necesarios

Asegúrate de tener estos componentes:
- `Button`: Componente de botón reutilizable
- `LogoutConfirmModal`: Modal de confirmación de logout

---

## 🐛 Solución de Problemas

### Problema 1: El menú no se desliza
**Solución:** Verifica que las clases de Tailwind estén correctas:
```typescript
${isOpen ? 'translate-x-0' : '-translate-x-full'}
```

### Problema 2: El menú aparece en desktop
**Solución:** Asegúrate de tener `lg:hidden` en el menú y el overlay:
```typescript
className="... lg:hidden"
```

### Problema 3: El overlay no cierra el menú
**Solución:** Verifica que el overlay tenga `onClick={onClose}`:
```typescript
<div 
  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
  onClick={onClose}
/>
```

### Problema 4: Los items no navegan
**Solución:** Verifica que `navigate` esté importado y que las rutas existan:
```typescript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
```

---

## 📱 Responsive Design

### Breakpoints
- **Móvil (< 1024px)**: Menú visible
- **Desktop (≥ 1024px)**: Menú oculto (`lg:hidden`)

### Ancho Adaptativo
- Pantallas grandes: `w-80` (320px)
- Pantallas pequeñas: `max-w-[85vw]` (85% del viewport)

---

## 🎯 Mejoras Opcionales

### 1. Agregar Búsqueda en el Menú
```typescript
<div className="p-4 border-b border-gray-200">
  <input 
    type="text" 
    placeholder="Buscar..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  />
</div>
```

### 2. Agregar Badge de Notificaciones
```typescript
{notificationCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
    {notificationCount}
  </span>
)}
```

### 3. Agregar Tema Oscuro
```typescript
const isDark = useTheme(); // Tu hook de tema
className={`... ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
```

---

## 📝 Resumen de Pasos

1. ✅ Crear componente `MobileMenu.tsx`
2. ✅ Definir interface `MobileMenuProps`
3. ✅ Implementar estado y hooks
4. ✅ Crear items del menú por rol
5. ✅ Implementar estructura JSX
6. ✅ Agregar header con información del usuario
7. ✅ Renderizar lista de items
8. ✅ Agregar items adicionales con notificaciones
9. ✅ Implementar footer con logout
10. ✅ Integrar en Navbar
11. ✅ Verificar rutas y dependencias
12. ✅ Probar en diferentes dispositivos

---

## 🎉 Resultado Final

Al completar estos pasos, tendrás:
- ✅ Menú móvil funcional y moderno
- ✅ Diseño responsive
- ✅ Animaciones suaves
- ✅ Navegación por roles
- ✅ Notificaciones dinámicas
- ✅ Integración completa con el sistema de autenticación

---

## 📚 Recursos Adicionales

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons/
- **React Router**: https://reactrouter.com/

---

*Última actualización: Diciembre 2024*

