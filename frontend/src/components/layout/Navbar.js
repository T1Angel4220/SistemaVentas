import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { LogOut, User, Shield, AlertTriangle, Flag, FileText } from 'lucide-react';
import { apiService } from '../../services/api';
export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [dangerousProductsCount, setDangerousProductsCount] = useState(0);
    // Cargar conteo de productos peligrosos si es vendedor
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
                }
                catch (error) {
                    console.error('Error al cargar conteo de productos peligrosos:', error);
                }
            }
        };
        loadDangerousCount();
    }, [user]);
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };
    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        try {
            await logout();
            // Usar window.location para forzar recarga completa y evitar problemas de estado
            window.location.href = '/login';
        }
        catch (error) {
            console.error('Error en logout:', error);
            // Si hay error, forzar redirección de todas formas
            window.location.href = '/login';
        }
    };
    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };
    if (!isAuthenticated || !user) {
        return (_jsx("nav", { className: "sticky top-0 z-50 bg-white shadow-md border-b backdrop-blur-sm bg-white/95", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx(Link, { to: "/", className: "text-xl font-bold text-gray-900", children: "Sistema de Ventas" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", children: "Iniciar Sesi\u00F3n" }) }), _jsx(Link, { to: "/register", children: _jsx(Button, { children: "Registrarse" }) })] })] }) }) }));
    }
    return (_jsxs("nav", { className: "sticky top-0 z-50 bg-white shadow-md border-b backdrop-blur-sm bg-white/95", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center h-16 gap-8", children: [_jsxs("div", { className: "flex items-center space-x-8 flex-1", children: [_jsx(Link, { to: "/dashboard", className: "text-xl font-bold text-gray-900 whitespace-nowrap", children: "Sistema de Ventas" }), _jsxs("div", { className: "hidden md:flex items-center space-x-6 flex-1", children: [_jsx(Link, { to: "/dashboard", className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm", children: "Dashboard" }), (user.tipo_usuario === 'comprador' || user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'moderador') && (_jsx(Link, { to: "/products", className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm", children: "Productos" })), user.tipo_usuario === 'vendedor' && (_jsx(Link, { to: "/my-products", className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm", children: "Mis Productos" })), user.tipo_usuario === 'vendedor' && dangerousProductsCount > 0 && (_jsxs(Link, { to: "/my-products/dangerous", className: "text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium flex items-center relative transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-red-200/50 group", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1 transition-transform duration-300 group-hover:rotate-12" }), "Peligrosos", _jsx("span", { className: "ml-1.5 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse", children: dangerousProductsCount })] })), _jsx(Link, { to: "/chat", className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm", children: "Chat" }), user.tipo_usuario === 'moderador' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-6 w-px bg-gray-300 mx-2" }), _jsxs(Link, { to: "/products/moderation", className: "text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 group", children: [_jsx(Shield, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" }), "Moderaci\u00F3n"] }), _jsxs(Link, { to: "/moderation/reports", className: "text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-orange-200/50 group", children: [_jsx(Flag, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" }), "Reportes"] }), _jsxs(Link, { to: "/moderation/appeals", className: "text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-200/50 group", children: [_jsx(FileText, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" }), "Apelaciones"] })] })), user.tipo_usuario === 'administrador' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-6 w-px bg-gray-300 mx-2" }), _jsxs(Link, { to: "/products/moderation", className: "text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 group", children: [_jsx(Shield, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" }), "Administraci\u00F3n"] }), _jsxs(Link, { to: "/moderation/reports", className: "text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-orange-200/50 group", children: [_jsx(Flag, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" }), "Reportes"] }), _jsxs(Link, { to: "/moderation/appeals", className: "text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-200/50 group", children: [_jsx(FileText, { className: "h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" }), "Apelaciones"] })] }))] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "hidden md:block text-right", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [user.nombre || '', " ", user.apellido || ''] }), _jsx("p", { className: "text-xs text-gray-500", children: user.tipo_usuario ? user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1) : 'Usuario' })] }), _jsxs(Link, { to: "/profile", className: "group relative", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-200/50", children: _jsx(User, { className: "h-5 w-5 transition-transform duration-300 group-hover:rotate-12" }) }), _jsx("span", { className: "absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50", children: "Mi Perfil" })] }), _jsxs(Button, { variant: "ghost", onClick: handleLogoutClick, className: "text-gray-600 hover:text-red-600 hover:bg-red-50 hover:scale-105 hover:shadow-md hover:shadow-red-200/50 transition-all duration-300 flex items-center gap-2 group", children: [_jsx(LogOut, { className: "h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" }), _jsx("span", { className: "text-sm font-medium", children: "Salir" })] })] })] }) }), _jsx(LogoutConfirmModal, { isOpen: showLogoutModal, onConfirm: handleLogoutConfirm, onCancel: handleLogoutCancel, userName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario' })] }));
};
