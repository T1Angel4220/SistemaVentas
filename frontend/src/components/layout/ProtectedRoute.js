import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
export const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();
    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Verificando..." }), _jsx("p", { className: "text-gray-600", children: "Verificando autenticaci\u00F3n..." })] }) }));
    }
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // Verificar rol específico si se requiere
    if (requiredRole && user.tipo_usuario !== requiredRole) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600 mb-4", children: "No tienes permisos para acceder a esta p\u00E1gina." }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Se requiere rol: ", requiredRole] })] }) }));
    }
    // Verificar roles permitidos
    if (allowedRoles && !allowedRoles.includes(user.tipo_usuario)) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600 mb-4", children: "No tienes permisos para acceder a esta p\u00E1gina." }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Roles permitidos: ", allowedRoles.join(', ')] })] }) }));
    }
    // Si el usuario no está activo, mostrar mensaje
    if (user.estado !== 'activo') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Cuenta Inactiva" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["Tu cuenta est\u00E1 ", user.estado.replace('_', ' '), "."] }), _jsx("p", { className: "text-sm text-gray-500", children: "Contacta al administrador para m\u00E1s informaci\u00F3n." })] }) }));
    }
    // Si el usuario no está cargado o está cargando, mostrar loading
    if (!user || isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Cargando..." })] }) }));
    }
    // ELIMINAMOS LA VERIFICACIÓN DE EMAIL EN EL DASHBOARD
    // La verificación de email ya se hace al hacer login, no es necesaria aquí
    // Si todo está bien, mostrar el contenido
    return _jsx(_Fragment, { children: children });
};
