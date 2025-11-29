import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import {
  User,
  ShoppingCart,
  Package,
  MessageSquare,
  Users,
  UserPlus,
  Shield,
  Flag,
  FileText,
  AlertTriangle,
  Menu,
  X,
  Home,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshUser } = useAuth();
  const { canModerateProduct } = usePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refrescar datos del usuario solo al montar el componente (una sola vez)
  React.useEffect(() => {
    // Solo refrescamos si es la primera vez que se monta el componente
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = solo se ejecuta al montar

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h2>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Verificar que todos los datos esenciales estén cargados
  if (!user.nombre || !user.apellido || !user.correo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando datos del usuario...</h2>
          <p className="text-gray-600">Obteniendo información completa...</p>
        </div>
      </div>
    );
  }


  const getStatusColor = (estado: string) => {
    const colors = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      suspendido: 'bg-red-100 text-red-800',
      pendiente_verificacion: 'bg-yellow-100 text-yellow-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Menú de navegación para administradores y moderadores
  const adminMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        setIsMenuOpen(false);
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      description: 'Administra usuarios, roles y permisos',
      onClick: () => {
        navigate('/admin/users');
        setIsMenuOpen(false);
      },
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gestión de Reportes',
      icon: Flag,
      description: 'Revisa reportes de productos y usuarios',
      onClick: () => {
        navigate('/moderation/reports');
        setIsMenuOpen(false);
      },
      color: 'from-red-500 to-orange-600'
    },
    {
      title: 'Gestión de Apelaciones',
      icon: FileText,
      description: 'Revisa apelaciones de vendedores',
      onClick: () => {
        navigate('/moderation/appeals');
        setIsMenuOpen(false);
      },
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Moderación de Productos',
      icon: Shield,
      description: 'Revisa y aprueba productos',
      onClick: () => {
        navigate('/products/moderation');
        setIsMenuOpen(false);
      },
      color: 'from-purple-500 to-purple-600'
    },

  ];

  // Agregar opción de registrar moderador solo para administradores
  if (user?.tipo_usuario === 'administrador') {
    adminMenuItems.push({
      title: 'Registrar Moderador',
      icon: UserPlus,
      description: 'Crear nuevas cuentas de moderador',
      onClick: () => {
        navigate('/admin/register-moderator');
        setIsMenuOpen(false);
      },
      color: 'from-indigo-500 to-purple-600'
    });
  }

  // Menú de navegación para vendedores
  const sellerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        setIsMenuOpen(false);
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Mis Productos',
      icon: Package,
      description: 'Gestiona tus productos publicados',
      onClick: () => {
        navigate('/products/my');
        setIsMenuOpen(false);
      },
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Crear Producto',
      icon: ShoppingCart,
      description: 'Publica un nuevo producto',
      onClick: () => {
        navigate('/products/create');
        setIsMenuOpen(false);
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        setIsMenuOpen(false);
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        setIsMenuOpen(false);
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  // Menú de navegación para compradores
  const buyerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        setIsMenuOpen(false);
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Explorar Productos',
      icon: ShoppingCart,
      description: 'Descubre productos disponibles',
      onClick: () => {
        navigate('/products');
        setIsMenuOpen(false);
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        setIsMenuOpen(false);
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        setIsMenuOpen(false);
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header mejorado con menú hamburguesa */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-sm sm:text-lg font-bold text-white">
                  {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">¡Hola, {user.nombre}!</h1>
                <p className="text-xs sm:text-sm text-gray-600">Sistema de Ventas Multiempresa</p>
              </div>
            </div>
            
            {/* Menú hamburguesa para todos los usuarios */}
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="outline"
              size="sm"
              className="lg:hidden bg-white/80 border-gray-300 hover:bg-gray-50 p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú lateral deslizante para móvil - Todos los usuarios */}
      <>
        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Menú lateral */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Header del menú */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{user.nombre} {user.apellido}</h3>
                  <p className="text-blue-100 text-sm capitalize">{user.tipo_usuario}</p>
                </div>
              </div>
              <Button
                onClick={() => setIsMenuOpen(false)}
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
          
          {/* Opciones del menú */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* Mostrar menú según tipo de usuario */}
              {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') 
                ? adminMenuItems.map((item, index) => (
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
                  ))
                : user.tipo_usuario === 'vendedor'
                  ? sellerMenuItems.map((item, index) => (
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
                    ))
                  : buyerMenuItems.map((item, index) => (
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
                    ))
              }
            </div>
            
            {/* Separador */}
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* Opciones adicionales - Solo para admin/moderador */}
            {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/products');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">Ver Productos</h4>
                      <p className="text-xs text-gray-500 mt-1">Explora productos disponibles</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                  </div>
                </button>
              </div>
            )}
          </div>
          
          {/* Footer del menú */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => {
                // Implementar logout
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </>

      {/* Main Content - Optimizado para móvil */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User Profile Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Mi Perfil</span>
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                    <p className="text-sm font-semibold text-gray-900">{user.nombre} {user.apellido}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Correo electrónico</label>
                    <p className="text-sm text-gray-900">{user.correo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cédula</label>
                    <p className="text-sm text-gray-900">{user.cedula}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-sm text-gray-900">
                      {user.telefono ? user.telefono : <span className="text-gray-400 italic">No proporcionado</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <p className="text-sm text-gray-900">
                      {user.direccion ? user.direccion : <span className="text-gray-400 italic">No proporcionada</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Género</label>
                    <p className="text-sm text-gray-900 capitalize">
                      {user.genero ? user.genero : <span className="text-gray-400 italic">No especificado</span>}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rol</label>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.tipo_usuario}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`}>
                      {user.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email verificado</label>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ SÍ
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                    <p className="text-sm text-gray-900">
                      {user.fecha_registro ? 
                        new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        <span className="text-gray-400 italic">No disponible</span>
                      }
                    </p>
                  </div>
                  {user.fecha_ultimo_acceso && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Último acceso</label>
                      <p className="text-sm text-gray-900">
                        {new Date(user.fecha_ultimo_acceso).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Optimizado para móvil */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Solo mostrar "Comprar" si NO es admin o moderador */}
            {user.tipo_usuario !== 'administrador' && user.tipo_usuario !== 'moderador' && (
              <div 
                onClick={() => navigate('/products')}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprar</h3>
                  <p className="text-sm text-gray-600">Explora productos y servicios disponibles</p>
                </div>
              </div>
            )}

            {/* Solo mostrar "Vender" si es vendedor (NO admin o moderador) */}
            {user.tipo_usuario === 'vendedor' && (
              <div 
                onClick={() => navigate('/products/create')}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vender</h3>
                  <p className="text-sm text-gray-600">Publica tus productos y servicios</p>
                </div>
              </div>
            )}

            {/* Solo mostrar "Productos Peligrosos" si es vendedor o admin */}
            {(user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador') && (
              <div 
                onClick={() => navigate('/my-products/dangerous')}
                className="bg-white rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos Peligrosos</h3>
                  <p className="text-sm text-gray-600">Ver historial de productos marcados</p>
                </div>
              </div>
            )}




            {canModerateProduct() && (
              <div 
                onClick={() => navigate('/products/moderation')}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Moderación</h3>
                  <p className="text-sm text-gray-600">Revisa y aprueba productos</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin/Moderator Actions - Solo visible en desktop */}
        {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (
          <div className="hidden lg:block mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Administración</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Usuarios</h3>
                  <p className="text-sm text-gray-600 mb-4">Administra usuarios, roles y permisos</p>
                  <Button
                    onClick={() => navigate('/admin/users')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Gestionar Usuarios
                  </Button>
                </div>
              </div>

              {/* NUEVO: Gestión de Reportes */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Flag className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Reportes</h3>
                  <p className="text-sm text-gray-600 mb-4">Revisa reportes de productos y usuarios</p>
                  <Button
                    onClick={() => navigate('/moderation/reports')}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    Ver Reportes
                  </Button>
                </div>
              </div>

              {/* NUEVO: Gestión de Apelaciones */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Apelaciones</h3>
                  <p className="text-sm text-gray-600 mb-4">Revisa apelaciones de vendedores</p>
                  <Button
                    onClick={() => navigate('/moderation/appeals')}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Ver Apelaciones
                  </Button>
                </div>
              </div>



              {user.tipo_usuario === 'administrador' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrar Moderador</h3>
                    <p className="text-sm text-gray-600 mb-4">Crear nuevas cuentas de moderador</p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/admin/register-moderator')}
                      >
                        Registrar Moderador
                      </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicador para móvil - Todos los usuarios */}
        <div className="lg:hidden mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador' 
                    ? '🎛️ Panel de Administración' 
                    : user.tipo_usuario === 'vendedor' 
                      ? '🛍️ Panel de Vendedor'
                      : '🛒 Panel de Comprador'
                  }
                </h3>
                <p className="text-xs text-gray-600">
                  {user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador' 
                    ? 'Accede a todas las herramientas de administración'
                    : user.tipo_usuario === 'vendedor' 
                      ? 'Gestiona tus productos y ventas'
                      : 'Explora productos y gestiona tu cuenta'
                  }
                </p>
              </div>
              <Button
                onClick={() => setIsMenuOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs"
              >
                <Menu className="h-3 w-3 mr-1" />
                Menú
              </Button>
            </div>
          </div>
        </div>

        {/* Status Alerts - Email verification removed as it's handled at login */}

        {user.estado !== 'activo' && (
          <div className="mt-8">
            <Alert variant="destructive">
              <AlertDescription>
                Tu cuenta está {user.estado.replace('_', ' ')}. Contacta al administrador para más información.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  );
};

