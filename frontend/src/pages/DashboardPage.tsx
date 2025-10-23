import React from 'react';
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
  Settings,
  Users,
  BarChart3,
  UserPlus,
  Shield,
  Flag,
  FileText
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshUser } = useAuth();
  const { canModerateProduct } = usePermissions();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header mejorado */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">¡Hola, {user.nombre}!</h1>
                <p className="text-sm text-gray-600">Sistema de Ventas Multiempresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Mi Perfil</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div 
              onClick={() => navigate('/chat')}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat</h3>
                <p className="text-sm text-gray-600">Comunícate con otros usuarios</p>
              </div>
            </div>

            <div 
              onClick={() => navigate('/settings')}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración</h3>
                <p className="text-sm text-gray-600">Gestiona tu cuenta y preferencias</p>
              </div>
            </div>

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

        {/* Admin/Moderator Actions */}
        {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas</h3>
                  <p className="text-sm text-gray-600 mb-4">Visualiza métricas y reportes</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {/* Implementar estadísticas */}}
                  >
                    Ver Estadísticas
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

