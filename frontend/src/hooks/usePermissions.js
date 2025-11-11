import { useAuth } from '../contexts/AuthContext';
export const usePermissions = () => {
    const { user } = useAuth();
    const getProductPermissions = () => {
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
                    canUpdate: true,
                    canDelete: true,
                    canModerate: true,
                    canUpdateOwn: true,
                    canDeleteOwn: true,
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
    const canAccessRoute = (route) => {
        if (!user)
            return false;
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
    const canModifyProduct = (productOwnerId) => {
        if (!user)
            return false;
        const permissions = getProductPermissions();
        // Moderadores y administradores pueden modificar cualquier producto
        if (permissions.canUpdate)
            return true;
        // Vendedores solo pueden modificar sus propios productos
        if (permissions.canUpdateOwn && productOwnerId === user.id)
            return true;
        return false;
    };
    const canDeleteProduct = (productOwnerId) => {
        if (!user)
            return false;
        const permissions = getProductPermissions();
        // Moderadores y administradores pueden eliminar cualquier producto
        if (permissions.canDelete)
            return true;
        // Vendedores solo pueden eliminar sus propios productos
        if (permissions.canDeleteOwn && productOwnerId === user.id)
            return true;
        return false;
    };
    const canModerateProduct = () => {
        if (!user)
            return false;
        return getProductPermissions().canModerate;
    };
    const isOwner = (productOwnerId) => {
        if (!user || !productOwnerId)
            return false;
        return user.id === productOwnerId;
    };
    const getRoleDisplayName = () => {
        if (!user)
            return 'Invitado';
        const roleNames = {
            comprador: 'Comprador',
            vendedor: 'Vendedor',
            moderador: 'Moderador',
            administrador: 'Administrador'
        };
        return roleNames[user.tipo_usuario] || user.tipo_usuario;
    };
    const getRoleColor = () => {
        if (!user)
            return 'bg-gray-100 text-gray-800';
        const roleColors = {
            comprador: 'bg-blue-100 text-blue-800',
            vendedor: 'bg-green-100 text-green-800',
            moderador: 'bg-yellow-100 text-yellow-800',
            administrador: 'bg-red-100 text-red-800'
        };
        return roleColors[user.tipo_usuario] || 'bg-gray-100 text-gray-800';
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
