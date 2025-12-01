import { useAuth } from '../contexts/AuthContext';

export interface ProductPermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canModerate: boolean;
  canUpdateOwn: boolean;
  canDeleteOwn: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const getProductPermissions = (): ProductPermissions => {
    if (!user) {
      return {
        canView: true, // Los productos se pueden ver sin autenticación
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canModerate: false,
        canUpdateOwn: false,
        canDeleteOwn: false,
      };
    }

    const { tipo_usuario } = user;

    switch (tipo_usuario) {
      case 'comprador':
        return {
          canView: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canModerate: false,
          canUpdateOwn: false,
          canDeleteOwn: false,
        };

      case 'vendedor':
        return {
          canView: true,
          canCreate: true,
          canUpdate: false, // Solo puede actualizar sus propios productos
          canDelete: false, // Solo puede eliminar sus propios productos
          canModerate: false,
          canUpdateOwn: true,
          canDeleteOwn: true,
        };

      case 'moderador':
        return {
          canView: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
          canModerate: true,
          canUpdateOwn: true,
          canDeleteOwn: true,
        };

      case 'administrador':
        return {
          canView: true,
          canCreate: true,
          canUpdate: false, // Los administradores NO pueden editar productos de vendedores
          canDelete: false, // Los administradores NO pueden eliminar productos de vendedores
          canModerate: true, // Solo pueden moderar (aprobar/rechazar/suspender)
          canUpdateOwn: true, // Solo pueden editar sus propios productos
          canDeleteOwn: true, // Solo pueden eliminar sus propios productos
        };

      default:
        return {
          canView: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canModerate: false,
          canUpdateOwn: false,
          canDeleteOwn: false,
        };
    }
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    const permissions = getProductPermissions();

    switch (route) {
      case '/products/create':
        return permissions.canCreate;
      case '/my-products':
        return permissions.canCreate; // Solo vendedores, moderadores y administradores pueden tener productos
      case '/products/moderation':
        return permissions.canModerate;
      default:
        return true;
    }
  };

  const canModifyProduct = (productOwnerId?: number): boolean => {
    if (!user) return false;

    const permissions = getProductPermissions();

    // Solo moderadores pueden modificar cualquier producto
    if (permissions.canUpdate && user.tipo_usuario === 'moderador') return true;

    // Vendedores y administradores solo pueden modificar sus propios productos
    if (permissions.canUpdateOwn && productOwnerId === user.id) return true;

    return false;
  };

  const canDeleteProduct = (productOwnerId?: number): boolean => {
    if (!user) return false;

    const permissions = getProductPermissions();

    // Solo moderadores pueden eliminar cualquier producto
    if (permissions.canDelete && user.tipo_usuario === 'moderador') return true;

    // Vendedores y administradores solo pueden eliminar sus propios productos
    if (permissions.canDeleteOwn && productOwnerId === user.id) return true;

    return false;
  };

  const canModerateProduct = (): boolean => {
    if (!user) return false;
    return getProductPermissions().canModerate;
  };

  const isOwner = (productOwnerId?: number): boolean => {
    if (!user || !productOwnerId) return false;
    return user.id === productOwnerId;
  };

  const getRoleDisplayName = (): string => {
    if (!user) return 'Invitado';

    const roleNames = {
      comprador: 'Comprador',
      vendedor: 'Vendedor',
      moderador: 'Moderador',
      administrador: 'Administrador'
    };

    return roleNames[user.tipo_usuario as keyof typeof roleNames] || user.tipo_usuario;
  };

  const getRoleColor = (): string => {
    if (!user) return 'bg-gray-100 text-gray-800';

    const roleColors = {
      comprador: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800',
      moderador: 'bg-yellow-100 text-yellow-800',
      administrador: 'bg-red-100 text-red-800'
    };

    return roleColors[user.tipo_usuario as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  return {
    user,
    permissions: getProductPermissions(),
    canAccessRoute,
    canModifyProduct,
    canDeleteProduct,
    canModerateProduct,
    isOwner,
    getRoleDisplayName,
    getRoleColor,
  };
};
