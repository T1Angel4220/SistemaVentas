import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { User, ShoppingCart, Package, MessageSquare, Users, UserPlus, Shield, Flag, FileText, AlertTriangle, Menu, X, Home, LogOut, ChevronRight } from 'lucide-react';
export const DashboardPage = () => {
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
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Cargando..." }), _jsx("p", { className: "text-gray-600", children: "Verificando autenticaci\u00F3n..." })] }) }));
    }
    // Verificar que todos los datos esenciales estén cargados
    if (!user.nombre || !user.apellido || !user.correo) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Cargando datos del usuario..." }), _jsx("p", { className: "text-gray-600", children: "Obteniendo informaci\u00F3n completa..." })] }) }));
    }
    const getStatusColor = (estado) => {
        const colors = {
            activo: 'bg-green-100 text-green-800',
            inactivo: 'bg-gray-100 text-gray-800',
            suspendido: 'bg-red-100 text-red-800',
            pendiente_verificacion: 'bg-yellow-100 text-yellow-800'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: [_jsx("div", { className: "bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center py-3 sm:py-4", children: [_jsxs("div", { className: "flex items-center space-x-3 sm:space-x-4", children: [_jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-sm sm:text-lg font-bold text-white", children: [user.nombre.charAt(0), user.apellido.charAt(0)] }) }), _jsxs("div", { children: [_jsxs("h1", { className: "text-lg sm:text-xl font-bold text-gray-900", children: ["\u00A1Hola, ", user.nombre, "!"] }), _jsx("p", { className: "text-xs sm:text-sm text-gray-600", children: "Sistema de Ventas Multiempresa" })] })] }), _jsx(Button, { onClick: () => setIsMenuOpen(!isMenuOpen), variant: "outline", size: "sm", className: "lg:hidden bg-white/80 border-gray-300 hover:bg-gray-50 p-2", children: isMenuOpen ? (_jsx(X, { className: "h-5 w-5 text-gray-600" })) : (_jsx(Menu, { className: "h-5 w-5 text-gray-600" })) })] }) }) }), _jsxs(_Fragment, { children: [isMenuOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 z-40 lg:hidden", onClick: () => setIsMenuOpen(false) })), _jsxs("div", { className: `
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `, children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-white/20 rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-lg font-bold", children: [user.nombre.charAt(0), user.apellido.charAt(0)] }) }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold", children: [user.nombre, " ", user.apellido] }), _jsx("p", { className: "text-blue-100 text-sm capitalize", children: user.tipo_usuario })] })] }), _jsx(Button, { onClick: () => setIsMenuOpen(false), variant: "ghost", size: "sm", className: "text-white hover:bg-white/20 p-2", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("p", { className: "text-blue-100 text-sm", children: user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador'
                                            ? 'Panel de Administración'
                                            : user.tipo_usuario === 'vendedor'
                                                ? 'Panel de Vendedor'
                                                : 'Panel de Comprador' })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [_jsx("div", { className: "space-y-2", children: (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador')
                                            ? adminMenuItems.map((item, index) => (_jsx("button", { onClick: item.onClick, className: "w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`, children: _jsx(item.icon, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm", children: item.title }), _jsx("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: item.description })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" })] }) }, index)))
                                            : user.tipo_usuario === 'vendedor'
                                                ? sellerMenuItems.map((item, index) => (_jsx("button", { onClick: item.onClick, className: "w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`, children: _jsx(item.icon, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm", children: item.title }), _jsx("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: item.description })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" })] }) }, index)))
                                                : buyerMenuItems.map((item, index) => (_jsx("button", { onClick: item.onClick, className: "w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`, children: _jsx(item.icon, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm", children: item.title }), _jsx("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: item.description })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" })] }) }, index))) }), _jsx("div", { className: "border-t border-gray-200 my-4" }), (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (_jsx("div", { className: "space-y-2", children: _jsx("button", { onClick: () => {
                                                navigate('/products');
                                                setIsMenuOpen(false);
                                            }, className: "w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200", children: _jsx(ShoppingCart, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm", children: "Ver Productos" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Explora productos disponibles" })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" })] }) }) }))] }), _jsx("div", { className: "border-t border-gray-200 p-4", children: _jsxs("button", { onClick: () => {
                                        // Implementar logout
                                        setIsMenuOpen(false);
                                    }, className: "w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-medium", children: "Cerrar Sesi\u00F3n" })] }) })] })] }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8", children: [_jsx("div", { className: "mb-6 sm:mb-8", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4", children: _jsxs("h2", { className: "text-lg sm:text-xl font-bold text-white flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Mi Perfil" })] }) }), _jsxs("div", { className: "p-4 sm:p-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Nombre completo" }), _jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [user.nombre, " ", user.apellido] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Correo electr\u00F3nico" }), _jsx("p", { className: "text-sm text-gray-900", children: user.correo })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "C\u00E9dula" }), _jsx("p", { className: "text-sm text-gray-900", children: user.cedula })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Tel\u00E9fono" }), _jsx("p", { className: "text-sm text-gray-900", children: user.telefono ? user.telefono : _jsx("span", { className: "text-gray-400 italic", children: "No proporcionado" }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Direcci\u00F3n" }), _jsx("p", { className: "text-sm text-gray-900", children: user.direccion ? user.direccion : _jsx("span", { className: "text-gray-400 italic", children: "No proporcionada" }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "G\u00E9nero" }), _jsx("p", { className: "text-sm text-gray-900 capitalize", children: user.genero ? user.genero : _jsx("span", { className: "text-gray-400 italic", children: "No especificado" }) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Rol" }), _jsx("span", { className: "inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800", children: user.tipo_usuario })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Estado" }), _jsx("span", { className: `inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`, children: user.estado.replace('_', ' ').toUpperCase() })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Email verificado" }), _jsx("span", { className: "inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800", children: "\u2713 S\u00CD" })] })] })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Miembro desde" }), _jsx("p", { className: "text-sm text-gray-900", children: user.fecha_registro ?
                                                                    new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    }) :
                                                                    _jsx("span", { className: "text-gray-400 italic", children: "No disponible" }) })] }), user.fecha_ultimo_acceso && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "\u00DAltimo acceso" }), _jsx("p", { className: "text-sm text-gray-900", children: new Date(user.fecha_ultimo_acceso).toLocaleDateString('es-ES', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) })] }))] }) })] })] }) }), _jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6", children: "Acciones R\u00E1pidas" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", children: [user.tipo_usuario !== 'administrador' && user.tipo_usuario !== 'moderador' && (_jsx("div", { onClick: () => navigate('/products'), className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(ShoppingCart, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Comprar" }), _jsx("p", { className: "text-sm text-gray-600", children: "Explora productos y servicios disponibles" })] }) })), user.tipo_usuario === 'vendedor' && (_jsx("div", { onClick: () => navigate('/products/create'), className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(Package, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Vender" }), _jsx("p", { className: "text-sm text-gray-600", children: "Publica tus productos y servicios" })] }) })), (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador') && (_jsx("div", { onClick: () => navigate('/my-products/dangerous'), className: "bg-white rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Productos Peligrosos" }), _jsx("p", { className: "text-sm text-gray-600", children: "Ver historial de productos marcados" })] }) })), _jsx("div", { onClick: () => navigate('/chat'), className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(MessageSquare, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Chat" }), _jsx("p", { className: "text-sm text-gray-600", children: "Comun\u00EDcate con otros usuarios" })] }) }), canModerateProduct() && (_jsx("div", { onClick: () => navigate('/products/moderation'), className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(Shield, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Moderaci\u00F3n" }), _jsx("p", { className: "text-sm text-gray-600", children: "Revisa y aprueba productos" })] }) }))] })] }), (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (_jsxs("div", { className: "hidden lg:block mt-6 sm:mt-8", children: [_jsx("div", { className: "flex items-center justify-between mb-4 sm:mb-6", children: _jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900", children: "Panel de Administraci\u00F3n" }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", children: [_jsx("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(Users, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Gesti\u00F3n de Usuarios" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Administra usuarios, roles y permisos" }), _jsx(Button, { onClick: () => navigate('/admin/users'), className: "w-full bg-blue-600 hover:bg-blue-700", children: "Gestionar Usuarios" })] }) }), _jsx("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(Flag, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Gesti\u00F3n de Reportes" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Revisa reportes de productos y usuarios" }), _jsx(Button, { onClick: () => navigate('/moderation/reports'), className: "w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700", children: "Ver Reportes" })] }) }), _jsx("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(FileText, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Gesti\u00F3n de Apelaciones" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Revisa apelaciones de vendedores" }), _jsx(Button, { onClick: () => navigate('/moderation/appeals'), className: "w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700", children: "Ver Apelaciones" })] }) }), user.tipo_usuario === 'administrador' && (_jsx("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx(UserPlus, { className: "h-6 w-6 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Registrar Moderador" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Crear nuevas cuentas de moderador" }), _jsx(Button, { variant: "outline", className: "w-full", onClick: () => navigate('/admin/register-moderator'), children: "Registrar Moderador" })] }) }))] })] })), _jsx("div", { className: "lg:hidden mt-6", children: _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 text-sm mb-1", children: user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador'
                                                    ? '🎛️ Panel de Administración'
                                                    : user.tipo_usuario === 'vendedor'
                                                        ? '🛍️ Panel de Vendedor'
                                                        : '🛒 Panel de Comprador' }), _jsx("p", { className: "text-xs text-gray-600", children: user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador'
                                                    ? 'Accede a todas las herramientas de administración'
                                                    : user.tipo_usuario === 'vendedor'
                                                        ? 'Gestiona tus productos y ventas'
                                                        : 'Explora productos y gestiona tu cuenta' })] }), _jsxs(Button, { onClick: () => setIsMenuOpen(true), size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs", children: [_jsx(Menu, { className: "h-3 w-3 mr-1" }), "Men\u00FA"] })] }) }) }), user.estado !== 'activo' && (_jsx("div", { className: "mt-8", children: _jsx(Alert, { variant: "destructive", children: _jsxs(AlertDescription, { children: ["Tu cuenta est\u00E1 ", user.estado.replace('_', ' '), ". Contacta al administrador para m\u00E1s informaci\u00F3n."] }) }) }))] })] }));
};
