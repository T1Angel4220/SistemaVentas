import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Package, 
  Edit, 
  Trash2,
  User
} from 'lucide-react';

export const PermissionsTest: React.FC = () => {
  const { user } = useAuth();
  const { 
    permissions, 
    canModerateProduct, 
    getRoleDisplayName, 
    getRoleColor,
    canModifyProduct,
    canDeleteProduct
  } = usePermissions();

  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>No hay usuario autenticado</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información del Usuario</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-600">Nombre:</p>
              <p className="font-semibold">{user.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-semibold">{user.correo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol:</p>
              <Badge className={`${getRoleColor()} px-3 py-1`}>
                {getRoleDisplayName()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permisos de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Permisos de Productos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Ver productos</span>
                {permissions.canView ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Crear productos</span>
                {permissions.canCreate ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Actualizar productos</span>
                {permissions.canUpdate ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Eliminar productos</span>
                {permissions.canDelete ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Moderar productos</span>
                {permissions.canModerate ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Actualizar propios</span>
                {permissions.canUpdateOwn ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Acciones Disponibles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.canCreate && (
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Package className="h-4 w-4 mr-2" />
                Crear Producto
              </Button>
            )}
            
            {permissions.canCreate && (
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                <Package className="h-4 w-4 mr-2" />
                Mis Productos
              </Button>
            )}
            
            {permissions.canModerate && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Moderación
              </Button>
            )}
            
            {permissions.canUpdateOwn && (
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <Edit className="h-4 w-4 mr-2" />
                Editar Propios
              </Button>
            )}
            
            {permissions.canDeleteOwn && (
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Propios
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pruebas de funciones */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Funciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Prueba de Moderación:</h4>
              <p className="text-sm text-gray-600">
                Puede moderar productos: {canModerateProduct() ? 'Sí' : 'No'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Prueba de Modificación:</h4>
              <p className="text-sm text-gray-600">
                Puede modificar producto propio: {canModifyProduct(user.id) ? 'Sí' : 'No'}
              </p>
              <p className="text-sm text-gray-600">
                Puede modificar producto ajeno: {canModifyProduct(999) ? 'Sí' : 'No'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Prueba de Eliminación:</h4>
              <p className="text-sm text-gray-600">
                Puede eliminar producto propio: {canDeleteProduct(user.id) ? 'Sí' : 'No'}
              </p>
              <p className="text-sm text-gray-600">
                Puede eliminar producto ajeno: {canDeleteProduct(999) ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
