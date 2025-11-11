import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Users, UserPlus, Shield, UserCheck, UserMinus, Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertTriangle, Monitor, TrendingUp, Activity, UserCog, X } from 'lucide-react';
export const UserManagementPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view');
    const [actionReason, setActionReason] = useState('');
    // Estados para animaciones de salida
    const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
    const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);
    // Cargar usuarios
    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUsers({
                search: searchTerm,
                role: filterRole,
                status: filterStatus
            });
            if (response.success && response.data) {
                setUsers(response.data.users);
            }
            else {
                setError('Error cargando usuarios: ' + response.message);
            }
        }
        catch (error) {
            setError('Error cargando usuarios: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);
    // Recargar usuarios cuando cambien los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadUsers();
        }, 500); // Debounce de 500ms
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterRole, filterStatus]);
    // Auto-ocultar alertas después de 5 segundos con animación
    useEffect(() => {
        if (error && !isErrorFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsErrorFadingOut(true);
            }, 4400); // Empezar fade-out 600ms antes
            const removeTimer = setTimeout(() => {
                setError('');
                setIsErrorFadingOut(false);
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [error, isErrorFadingOut]);
    useEffect(() => {
        if (success && !isSuccessFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsSuccessFadingOut(true);
            }, 4400); // Empezar fade-out 600ms antes
            const removeTimer = setTimeout(() => {
                setSuccess('');
                setIsSuccessFadingOut(false);
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [success, isSuccessFadingOut]);
    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.cedula.includes(searchTerm);
        const matchesRole = filterRole === 'all' || user.tipo_usuario === filterRole;
        const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });
    // Obtener color del estado
    const getStatusColor = (estado) => {
        switch (estado) {
            case 'activo':
                return 'bg-green-100 text-green-800';
            case 'inactivo':
                return 'bg-gray-100 text-gray-800';
            case 'suspendido':
                return 'bg-red-100 text-red-800';
            case 'pendiente_verificacion':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Obtener color del rol
    const getRoleColor = (rol) => {
        switch (rol) {
            case 'administrador':
                return 'bg-purple-100 text-purple-800';
            case 'moderador':
                return 'bg-blue-100 text-blue-800';
            case 'vendedor':
                return 'bg-green-100 text-green-800';
            case 'comprador':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Obtener icono del estado
    const getStatusIcon = (estado) => {
        switch (estado) {
            case 'activo':
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case 'inactivo':
                return _jsx(XCircle, { className: "h-4 w-4" });
            case 'suspendido':
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
            case 'pendiente_verificacion':
                return _jsx(Clock, { className: "h-4 w-4" });
            default:
                return _jsx(Clock, { className: "h-4 w-4" });
        }
    };
    // Manejar acciones
    const handleAction = async (action, userId, reason) => {
        try {
            setLoading(true);
            switch (action) {
                case 'activate':
                    await apiService.activateUser(userId, reason);
                    setSuccess('Usuario activado exitosamente');
                    break;
                case 'suspend':
                    await apiService.suspendUser(userId, reason);
                    setSuccess('Usuario suspendido exitosamente');
                    break;
            }
            await loadUsers();
            setShowModal(false);
            setSelectedUser(null);
            setActionReason('');
        }
        catch (error) {
            setError('Error ejecutando acción: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Abrir modal
    const openModal = (user, type) => {
        setSelectedUser(user);
        setModalType(type);
        setShowModal(true);
    };
    // Calcular estadísticas
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.estado === 'activo').length;
    const suspendedUsers = users.filter(u => u.estado === 'suspendido').length;
    const pendingUsers = users.filter(u => u.estado === 'pendiente_verificacion').length;
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center py-10", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-3 bg-white/20 rounded-xl backdrop-blur-sm", children: _jsx(Users, { className: "h-7 w-7 text-white" }) }), _jsx("h1", { className: "text-4xl font-extrabold text-white tracking-tight", children: "Gesti\u00F3n de Usuarios" })] }), _jsx("p", { className: "text-blue-50 text-lg ml-16", children: "Administra usuarios, roles y permisos del sistema" })] }), currentUser?.tipo_usuario === 'administrador' && (_jsxs(Button, { onClick: () => navigate('/admin/register-moderator'), className: "bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-3 h-auto", children: [_jsx(UserPlus, { className: "h-5 w-5 mr-2" }), "Registrar Moderador"] }))] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(Card, { className: "overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-blue-100 text-sm font-medium mb-1", children: "Total Usuarios" }), _jsx("p", { className: "text-4xl font-bold text-white", children: totalUsers })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(Users, { className: "h-8 w-8 text-white" }) })] }), _jsxs("div", { className: "mt-4 flex items-center text-blue-100 text-xs", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: "Sistema completo" })] })] }) }), _jsx(Card, { className: "overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-green-600", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-green-100 text-sm font-medium mb-1", children: "Activos" }), _jsx("p", { className: "text-4xl font-bold text-white", children: activeUsers })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) })] }), _jsxs("div", { className: "mt-4 flex items-center text-green-100 text-xs", children: [_jsx(Activity, { className: "h-4 w-4 mr-1" }), _jsxs("span", { children: [totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0, "% del total"] })] })] }) }), _jsx(Card, { className: "overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-500 to-rose-600", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-red-100 text-sm font-medium mb-1", children: "Suspendidos" }), _jsx("p", { className: "text-4xl font-bold text-white", children: suspendedUsers })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(AlertTriangle, { className: "h-8 w-8 text-white" }) })] }), _jsxs("div", { className: "mt-4 flex items-center text-red-100 text-xs", children: [_jsx(XCircle, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: "Requieren atenci\u00F3n" })] })] }) }), _jsx(Card, { className: "overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-500 to-orange-600", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-amber-100 text-sm font-medium mb-1", children: "Pendientes" }), _jsx("p", { className: "text-4xl font-bold text-white", children: pendingUsers })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(Clock, { className: "h-8 w-8 text-white" }) })] }), _jsxs("div", { className: "mt-4 flex items-center text-amber-100 text-xs", children: [_jsx(UserCog, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: "Verificaci\u00F3n pendiente" })] })] }) })] }), _jsxs(Card, { className: "p-8 mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(Filter, { className: "h-5 w-5 mr-2 text-blue-600" }), "Filtros de B\u00FAsqueda"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Encuentra usuarios de forma r\u00E1pida y precisa" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: [_jsx(Search, { className: "inline h-4 w-4 mr-1" }), "Buscar Usuario"] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }), _jsx(Input, { type: "text", placeholder: "Nombre, email, c\u00E9dula...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: [_jsx(Shield, { className: "inline h-4 w-4 mr-1" }), "Rol"] }), _jsxs("select", { value: filterRole, onChange: (e) => setFilterRole(e.target.value), className: "w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium shadow-sm", children: [_jsx("option", { value: "all", children: "Todos los roles" }), _jsx("option", { value: "comprador", children: "Comprador" }), _jsx("option", { value: "vendedor", children: "Vendedor" }), _jsx("option", { value: "moderador", children: "Moderador" }), _jsx("option", { value: "administrador", children: "Administrador" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: [_jsx(Activity, { className: "inline h-4 w-4 mr-1" }), "Estado"] }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium shadow-sm", children: [_jsx("option", { value: "all", children: "Todos los estados" }), _jsx("option", { value: "activo", children: "Activo" }), _jsx("option", { value: "inactivo", children: "Inactivo" }), _jsx("option", { value: "suspendido", children: "Suspendido" }), _jsx("option", { value: "pendiente_verificacion", children: "Pendiente" })] })] })] })] }), error && (_jsx("div", { className: `mb-6 ${isErrorFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white shadow-2xl border-2 border-red-400", children: [_jsx("div", { className: "absolute inset-0 bg-black/10" }), _jsx("div", { className: "relative p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl", children: _jsx(XCircle, { className: "h-8 w-8 text-white" }) }) }), _jsxs("div", { className: "flex-1 pt-1", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-1 flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Error"] }), _jsx("p", { className: "text-red-50 font-medium leading-relaxed", children: error })] }), _jsx("button", { onClick: () => {
                                                    setError('');
                                                    setIsErrorFadingOut(false);
                                                }, className: "flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50", children: _jsx(X, { className: "h-5 w-5 text-white" }) })] }) })] }) })), success && (_jsx("div", { className: `mb-6 ${isSuccessFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white shadow-2xl border-2 border-emerald-400", children: [_jsx("div", { className: "absolute inset-0 bg-black/10" }), _jsx("div", { className: "relative p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) }) }), _jsxs("div", { className: "flex-1 pt-1", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-1 flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "\u00C9xito"] }), _jsx("p", { className: "text-emerald-50 font-medium leading-relaxed", children: success })] }), _jsx("button", { onClick: () => {
                                                    setSuccess('');
                                                    setIsSuccessFadingOut(false);
                                                }, className: "flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50", children: _jsx(X, { className: "h-5 w-5 text-white" }) })] }) })] }) })), _jsxs(Card, { className: "overflow-hidden shadow-2xl border-0", children: [_jsx("div", { className: "bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Lista de Usuarios" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [filteredUsers.length, " ", filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'] })] }) }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gradient-to-r from-blue-500 to-indigo-600", children: _jsxs("tr", { children: [_jsx("th", { className: "px-8 py-5 text-left text-xs font-bold text-white uppercase tracking-wider", children: "Usuario" }), _jsx("th", { className: "px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider", children: "Rol" }), _jsx("th", { className: "px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider", children: "Estado" }), _jsx("th", { className: "px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider", children: "\u00DAltimo Acceso" }), _jsx("th", { className: "px-6 py-5 text-center text-xs font-bold text-white uppercase tracking-wider", children: "Acciones" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-4 text-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }) }) })) : filteredUsers.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-16 text-center", children: _jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx(Users, { className: "h-16 w-16 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium text-lg", children: "No se encontraron usuarios" }), _jsx("p", { className: "text-gray-400 text-sm mt-2", children: "Intenta ajustar los filtros de b\u00FAsqueda" })] }) }) })) : (filteredUsers.map((user) => (_jsxs("tr", { className: "hover:bg-blue-50/50 transition-colors duration-200 group", children: [_jsx("td", { className: "px-8 py-5 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 h-12 w-12", children: _jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-110", children: _jsxs("span", { className: "text-base font-bold text-white", children: [user.nombre.charAt(0), user.apellido.charAt(0)] }) }) }), _jsxs("div", { className: "ml-5", children: [_jsxs("div", { className: "text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors", children: [user.nombre, " ", user.apellido] }), _jsx("div", { className: "text-sm text-gray-600 mt-0.5", children: user.correo }), _jsxs("div", { className: "text-xs text-gray-500 mt-1 font-mono", children: ["C\u00E9dula: ", user.cedula] })] })] }) }), _jsx("td", { className: "px-6 py-5 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-4 py-2 text-xs font-bold rounded-xl shadow-sm ${getRoleColor(user.tipo_usuario)}`, children: user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1) }) }), _jsx("td", { className: "px-6 py-5 whitespace-nowrap", children: _jsxs("span", { className: `inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl shadow-sm ${getStatusColor(user.estado)}`, children: [getStatusIcon(user.estado), _jsx("span", { className: "ml-2", children: user.estado.replace('_', ' ').toUpperCase() })] }) }), _jsx("td", { className: "px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700", children: user.fecha_ultimo_acceso
                                                            ? new Date(user.fecha_ultimo_acceso).toLocaleDateString('es-ES')
                                                            : _jsx("span", { className: "text-gray-400 italic", children: "Nunca" }) }), _jsx("td", { className: "px-6 py-5 whitespace-nowrap text-center", children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => openModal(user, 'view'), className: "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200", title: "Ver detalles", children: _jsx(Eye, { className: "h-4 w-4" }) }), user.tipo_usuario !== 'administrador' && (_jsxs(_Fragment, { children: [currentUser?.tipo_usuario === 'administrador' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => navigate(`/admin/sessions/${user.id}`), className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200", title: "Gestionar sesiones", children: _jsx(Monitor, { className: "h-4 w-4" }) })), currentUser?.tipo_usuario === 'moderador' &&
                                                                            (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => navigate(`/admin/sessions/${user.id}`), className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200", title: "Gestionar sesiones", children: _jsx(Monitor, { className: "h-4 w-4" }) }))] })), user.id !== currentUser?.id && (_jsxs(_Fragment, { children: [(user.estado === 'inactivo' || user.estado === 'suspendido') && (_jsxs(_Fragment, { children: [currentUser?.tipo_usuario === 'administrador' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => openModal(user, 'activate'), className: "text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200", title: "Reactivar usuario", children: _jsx(UserCheck, { className: "h-4 w-4" }) })), currentUser?.tipo_usuario === 'moderador' &&
                                                                                    (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => openModal(user, 'activate'), className: "text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200", title: "Reactivar usuario", children: _jsx(UserCheck, { className: "h-4 w-4" }) }))] })), user.estado === 'activo' && (_jsxs(_Fragment, { children: [currentUser?.tipo_usuario === 'administrador' &&
                                                                                    user.tipo_usuario !== 'administrador' && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => openModal(user, 'suspend'), className: "text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200", title: "Suspender usuario", children: _jsx(UserMinus, { className: "h-4 w-4" }) })), currentUser?.tipo_usuario === 'moderador' &&
                                                                                    (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => openModal(user, 'suspend'), className: "text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200", title: "Suspender usuario", children: _jsx(UserMinus, { className: "h-4 w-4" }) }))] }))] }))] }) })] }, user.id)))) })] }) })] })] }), showModal && selectedUser && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "w-12 h-12 bg-white/20 rounded-full flex items-center justify-center", children: [modalType === 'view' && _jsx(Eye, { className: "h-6 w-6" }), modalType === 'activate' && _jsx(CheckCircle, { className: "h-6 w-6" }), modalType === 'suspend' && _jsx(UserMinus, { className: "h-6 w-6" })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-bold", children: [modalType === 'view' && 'Detalles del Usuario', modalType === 'activate' && 'Reactivar Usuario', modalType === 'suspend' && 'Suspender Usuario'] }), _jsxs("p", { className: "text-blue-100 text-sm", children: [modalType === 'view' && 'Información completa del usuario', modalType === 'activate' && 'Reactivar acceso al sistema', modalType === 'suspend' && 'Suspender cuenta por violación de políticas'] })] })] }), _jsx("button", { onClick: () => setShowModal(false), className: "text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors", children: _jsx(XCircle, { className: "h-6 w-6" }) })] }) }), _jsx("div", { className: "p-6 max-h-[60vh] overflow-y-auto", children: modalType === 'view' ? (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-gray-50 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsxs("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold", children: [selectedUser.nombre.charAt(0), selectedUser.apellido.charAt(0)] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-xl font-bold text-gray-900", children: [selectedUser.nombre, " ", selectedUser.apellido] }), _jsx("p", { className: "text-gray-600", children: selectedUser.correo }), _jsxs("div", { className: "flex items-center space-x-2 mt-2", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.tipo_usuario === 'administrador' ? 'bg-red-100 text-red-800' :
                                                                        selectedUser.tipo_usuario === 'moderador' ? 'bg-purple-100 text-purple-800' :
                                                                            selectedUser.tipo_usuario === 'vendedor' ? 'bg-green-100 text-green-800' :
                                                                                'bg-blue-100 text-blue-800'}`, children: selectedUser.tipo_usuario.charAt(0).toUpperCase() + selectedUser.tipo_usuario.slice(1) }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                                                        selectedUser.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                                                                            selectedUser.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-orange-100 text-orange-800'}`, children: selectedUser.estado.replace('_', ' ').toUpperCase() })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "C\u00E9dula" }), _jsx("p", { className: "text-sm text-gray-900 font-mono", children: selectedUser.cedula })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Tel\u00E9fono" }), _jsx("p", { className: "text-sm text-gray-900", children: selectedUser.telefono || 'No proporcionado' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Direcci\u00F3n" }), _jsx("p", { className: "text-sm text-gray-900", children: selectedUser.direccion || 'No proporcionada' })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "G\u00E9nero" }), _jsx("p", { className: "text-sm text-gray-900 capitalize", children: selectedUser.genero || 'No especificado' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "Fecha de registro" }), _jsx("p", { className: "text-sm text-gray-900", children: new Date(selectedUser.fecha_registro).toLocaleDateString('es-ES', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500", children: "\u00DAltimo acceso" }), _jsx("p", { className: "text-sm text-gray-900", children: selectedUser.fecha_ultimo_acceso ?
                                                                        new Date(selectedUser.fecha_ultimo_acceso).toLocaleDateString('es-ES', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        }) : 'Nunca' })] })] })] })] }) })) : (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: `border rounded-xl p-4 ${modalType === 'activate' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`, children: _jsxs("div", { className: "flex items-center space-x-2", children: [modalType === 'activate' ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" })), _jsxs("p", { className: `text-sm font-medium ${modalType === 'activate' ? 'text-green-800' : 'text-red-800'}`, children: [modalType === 'activate' && `¿Estás seguro de que quieres reactivar a ${selectedUser.nombre} ${selectedUser.apellido}?`, modalType === 'suspend' && `¿Estás seguro de que quieres suspender a ${selectedUser.nombre} ${selectedUser.apellido}?`] })] }) }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Motivo ", modalType === 'suspend' ? '(recomendado)' : '(opcional)'] }), _jsx("textarea", { value: actionReason, onChange: (e) => setActionReason(e.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none", rows: 3, placeholder: modalType === 'suspend'
                                                    ? "Especifica el motivo de la suspensión (violación de políticas, reportes, etc.)"
                                                    : "Describe el motivo de esta acción..." })] })] })) }), _jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setShowModal(false), className: "px-6", children: "Cancelar" }), modalType !== 'view' && (_jsx(Button, { onClick: () => handleAction(modalType, selectedUser.id, actionReason), disabled: loading, className: `px-6 ${modalType === 'activate'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'}`, children: loading ? 'Procesando...' :
                                        modalType === 'activate' ? 'Reactivar Usuario' : 'Suspender Usuario' }))] })] }) }))] }));
};
