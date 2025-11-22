import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'comprador' | 'vendedor' | 'moderador' | 'administrador';
  allowedRoles?: Array<'comprador' | 'vendedor' | 'moderador' | 'administrador'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h2>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    // Asegurar que location.pathname existe y es válido
    const currentPath = location?.pathname && typeof location.pathname === 'string' 
      ? location.pathname 
      : '/';
    return <Navigate to="/login" state={{ from: { pathname: currentPath } }} replace />;
  }

  // Verificar rol específico si se requiere
  if (requiredRole && user.tipo_usuario !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Se requiere rol: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.tipo_usuario)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Roles permitidos: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Si el usuario no está activo, mostrar mensaje
  if (user.estado !== 'activo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cuenta Inactiva</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta está {user.estado.replace('_', ' ')}.
          </p>
          <p className="text-sm text-gray-500">
            Contacta al administrador para más información.
          </p>
        </div>
      </div>
    );
  }

  
  // Si el usuario no está cargado o está cargando, mostrar loading
  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // ELIMINAMOS LA VERIFICACIÓN DE EMAIL EN EL DASHBOARD
  // La verificación de email ya se hace al hacer login, no es necesaria aquí

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

