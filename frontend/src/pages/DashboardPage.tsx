import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { 
  User, 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  Settings, 
  LogOut,
  Shield,
  Users
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h2>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (tipo: string) => {
    const roles = {
      comprador: 'Comprador',
      vendedor: 'Vendedor',
      moderador: 'Moderador',
      administrador: 'Administrador'
    };
    return roles[tipo as keyof typeof roles] || tipo;
  };

  const getRoleColor = (tipo: string) => {
    const colors = {
      comprador: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800',
      moderador: 'bg-yellow-100 text-yellow-800',
      administrador: 'bg-red-100 text-red-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {user.nombre}
              </h1>
              <p className="text-gray-600">
                Sistema de Ventas Multiempresa
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-sm text-gray-500">{user.correo}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Usuario</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                  <p className="text-sm text-gray-900">{user.nombre} {user.apellido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cédula</label>
                  <p className="text-sm text-gray-900">{user.cedula}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Correo</label>
                  <p className="text-sm text-gray-900">{user.correo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm text-gray-900">{user.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-sm text-gray-900">{user.direccion || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Género</label>
                  <p className="text-sm text-gray-900 capitalize">{user.genero || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Estado de la Cuenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.tipo_usuario)}`}>
                  {getRoleDisplayName(user.tipo_usuario)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`}>
                  {user.estado.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email verificado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.email_verificado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.email_verificado ? 'SÍ' : 'NO'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                <p className="text-sm text-gray-900">
                  {new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span>Comprar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explora productos y servicios disponibles
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-green-600" />
                <span>Vender</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Publica tus productos y servicios
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comunícate con otros usuarios
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Configuración</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestiona tu cuenta y preferencias
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Admin/Moderator Actions */}
        {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Panel de Administración</span>
                </CardTitle>
                <CardDescription>
                  Herramientas de moderación y administración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Usuarios
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Moderar Contenido
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración del Sistema
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Alerts */}
        {!user.email_verificado && (
          <div className="mt-8">
            <Alert variant="warning">
              <AlertDescription>
                Tu email no ha sido verificado. Revisa tu correo y haz clic en el enlace de verificación.
              </AlertDescription>
            </Alert>
          </div>
        )}

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

