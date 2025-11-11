import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Monitor, Smartphone, Globe, Clock, Shield, X, AlertTriangle, CheckCircle, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
export const SessionManagementPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [closeAllModal, setCloseAllModal] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    // Estados para animaciones de salida
    const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
    const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);
    // Ref para scroll automático a las alertas
    const alertRef = useRef(null);
    useEffect(() => {
        if (userId) {
            loadUserSessions();
        }
    }, [userId]);
    // Scroll automático hacia las alertas cuando aparecen
    useEffect(() => {
        if ((error || success) && alertRef.current) {
            alertRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [error, success]);
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
    const loadUserSessions = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserSessions(parseInt(userId));
            if (response.success) {
                setUser(response.data.user);
                setSessions(response.data.sessions);
            }
            else {
                setError('Error cargando sesiones del usuario');
            }
        }
        catch (err) {
            setError(err.message || 'Error de conexión al servidor');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCloseSession = async () => {
        if (!selectedSession)
            return;
        try {
            setActionLoading(true);
            const response = await apiService.closeUserSession(selectedSession.id, motivo);
            if (response.success) {
                setSuccess('Sesión cerrada exitosamente');
                setShowCloseModal(false);
                setSelectedSession(null);
                setMotivo('');
                await loadUserSessions();
            }
            else {
                setError(response.message || 'Error cerrando sesión');
            }
        }
        catch (err) {
            setError(err.message || 'Error de conexión al servidor');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseAllSessions = async () => {
        if (!userId)
            return;
        try {
            setActionLoading(true);
            const response = await apiService.closeAllUserSessions(parseInt(userId), motivo);
            if (response.success) {
                setSuccess(response.message || 'Todas las sesiones cerradas exitosamente');
                setCloseAllModal(false);
                setMotivo('');
                await loadUserSessions();
            }
            else {
                setError(response.message || 'Error cerrando sesiones');
            }
        }
        catch (err) {
            setError(err.message || 'Error de conexión al servidor');
        }
        finally {
            setActionLoading(false);
        }
    };
    const getDeviceIcon = (userAgent) => {
        if (userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes('android') || userAgent.toLowerCase().includes('iphone')) {
            return _jsx(Smartphone, { className: "h-5 w-5" });
        }
        return _jsx(Monitor, { className: "h-5 w-5" });
    };
    const getBrowserInfo = (userAgent) => {
        if (!userAgent || userAgent === 'User-Agent desconocido') {
            return 'Navegador desconocido';
        }
        // Orden importante: verificar primero los navegadores más específicos
        // porque muchos incluyen "Chrome" en su user-agent
        // Edgium (nuevo Edge basado en Chromium)
        if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
            return 'Microsoft Edge';
        }
        // Opera
        if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
            return 'Opera';
        }
        // Brave
        if (userAgent.includes('Brave')) {
            return 'Brave';
        }
        // Chrome (debe ir después de Edge, Opera, Brave)
        if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
            return 'Google Chrome';
        }
        // Safari (debe ir después de Chrome porque Chrome incluye "Safari")
        if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
            return 'Safari';
        }
        // Firefox
        if (userAgent.includes('Firefox/')) {
            return 'Firefox';
        }
        // Internet Explorer
        if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
            return 'Internet Explorer';
        }
        return 'Otro navegador';
    };
    const formatIpAddress = (ip) => {
        if (!ip || ip === 'IP desconocida') {
            return 'IP desconocida';
        }
        // Localhost IPv6
        if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
            return 'localhost (::1)';
        }
        // Localhost IPv4
        if (ip === '127.0.0.1') {
            return 'localhost (127.0.0.1)';
        }
        // IP privadas (red local)
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            return `${ip} (Red local)`;
        }
        // IP pública
        return ip;
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const activeSessions = sessions.filter(session => session.activa);
    const inactiveSessions = sessions.filter(session => !session.activa);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" }), _jsx("p", { className: "text-gray-600", children: "Cargando sesiones del usuario..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center py-10", children: [_jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/admin/users'), className: "flex items-center space-x-2 bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm px-4 py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300", children: [_jsx(ArrowLeft, { className: "h-5 w-5" }), _jsx("span", { children: "Volver" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-3 bg-white/20 rounded-xl backdrop-blur-sm", children: _jsx(Monitor, { className: "h-7 w-7 text-white" }) }), _jsx("h1", { className: "text-4xl font-extrabold text-white tracking-tight", children: "Gesti\u00F3n de Sesiones" })] }), _jsx("p", { className: "text-blue-50 text-lg ml-16", children: user ? `${user.nombre} ${user.apellido}` : 'Cargando usuario...' })] })] }), _jsxs("div", { className: "flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm", children: [_jsx(Shield, { className: "h-5 w-5 text-white" }), _jsx("span", { className: "text-sm font-semibold text-white", children: "Solo Moderadores/Admin" })] })] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { ref: alertRef, children: [error && (_jsx("div", { className: `mb-6 ${isErrorFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white shadow-2xl border-2 border-red-400", children: [_jsx("div", { className: "absolute inset-0 bg-black/10" }), _jsx("div", { className: "relative p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl", children: _jsx(XCircle, { className: "h-8 w-8 text-white" }) }) }), _jsxs("div", { className: "flex-1 pt-1", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-1 flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Error"] }), _jsx("p", { className: "text-red-50 font-medium leading-relaxed", children: error })] }), _jsx("button", { onClick: () => {
                                                            setError('');
                                                            setIsErrorFadingOut(false);
                                                        }, className: "flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50", children: _jsx(X, { className: "h-5 w-5 text-white" }) })] }) })] }) })), success && (_jsx("div", { className: `mb-6 ${isSuccessFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white shadow-2xl border-2 border-emerald-400", children: [_jsx("div", { className: "absolute inset-0 bg-black/10" }), _jsx("div", { className: "relative p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) }) }), _jsxs("div", { className: "flex-1 pt-1", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-1 flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "\u00C9xito"] }), _jsx("p", { className: "text-emerald-50 font-medium leading-relaxed", children: success })] }), _jsx("button", { onClick: () => {
                                                            setSuccess('');
                                                            setIsSuccessFadingOut(false);
                                                        }, className: "flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50", children: _jsx(X, { className: "h-5 w-5 text-white" }) })] }) })] }) }))] }), user && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1 space-y-6", children: _jsxs(Card, { className: "overflow-hidden shadow-2xl border-0", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl", children: _jsxs("span", { className: "text-3xl font-bold text-white", children: [user.nombre.charAt(0), user.apellido.charAt(0)] }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-2xl font-bold", children: [user.nombre, " ", user.apellido] }), _jsx("p", { className: "text-blue-100 text-sm mt-1", children: user.correo })] })] }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("div", { className: "overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl transform hover:scale-105 transition-all duration-300", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Wifi, { className: "h-5 w-5 text-green-100" }), _jsx("span", { className: "font-semibold text-green-100 text-sm", children: "Sesiones Activas" })] }), _jsx("span", { className: "text-4xl font-extrabold text-white", children: activeSessions.length })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) })] }) }) }), _jsx("div", { className: "overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-xl transform hover:scale-105 transition-all duration-300", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(WifiOff, { className: "h-5 w-5 text-gray-100" }), _jsx("span", { className: "font-semibold text-gray-100 text-sm", children: "Sesiones Cerradas" })] }), _jsx("span", { className: "text-4xl font-extrabold text-white", children: inactiveSessions.length })] }), _jsx("div", { className: "p-4 bg-white/20 rounded-2xl backdrop-blur-sm", children: _jsx(XCircle, { className: "h-8 w-8 text-white" }) })] }) }) }), activeSessions.length > 0 && (_jsxs(Button, { onClick: () => setCloseAllModal(true), className: "w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), "Cerrar Todas las Sesiones"] }))] })] }) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { className: "overflow-hidden shadow-2xl border-0", children: [_jsx("div", { className: "bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Monitor, { className: "h-6 w-6 mr-2 text-blue-600" }), "Sesiones del Usuario"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [sessions.length, " ", sessions.length === 1 ? 'sesión registrada' : 'sesiones registradas'] })] }), _jsxs(Button, { onClick: loadUserSessions, variant: "outline", className: "shadow-md hover:shadow-lg transition-all duration-300", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Actualizar"] })] }) }), _jsx("div", { className: "p-8", children: sessions.length === 0 ? (_jsx("div", { className: "text-center py-16", children: _jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx("div", { className: "p-6 bg-gray-100 rounded-full mb-6", children: _jsx(WifiOff, { className: "h-16 w-16 text-gray-400" }) }), _jsx("p", { className: "text-gray-600 font-semibold text-lg", children: "No hay sesiones registradas" }), _jsx("p", { className: "text-gray-500 text-sm mt-2", children: "El usuario no ha iniciado sesi\u00F3n en el sistema" })] }) })) : (_jsx("div", { className: "space-y-6", children: sessions.map((session) => (_jsx("div", { className: `relative overflow-hidden rounded-2xl border-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ${session.activa
                                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300'
                                                        : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'}`, children: _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-4 flex-1", children: [_jsx("div", { className: `p-4 rounded-2xl shadow-lg ${session.activa
                                                                                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                                                                : 'bg-gradient-to-br from-gray-500 to-gray-600'}`, children: getDeviceIcon(session.user_agent) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("h4", { className: "font-bold text-lg text-gray-900", children: getBrowserInfo(session.user_agent) }), session.activa ? (_jsxs("span", { className: "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1.5" }), "Activa"] })) : (_jsxs("span", { className: "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-700 shadow-sm", children: [_jsx(XCircle, { className: "h-4 w-4 mr-1.5" }), "Cerrada"] }))] }), _jsxs("div", { className: "space-y-2.5", children: [_jsxs("div", { className: "flex items-center space-x-3 text-sm text-gray-700", children: [_jsx(Globe, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { className: "font-medium", children: formatIpAddress(session.ip_address) })] }), _jsxs("div", { className: "flex items-center space-x-3 text-sm text-gray-700", children: [_jsx(Clock, { className: "h-5 w-5 text-indigo-600" }), _jsxs("span", { children: [_jsx("span", { className: "font-semibold", children: "Iniciada:" }), " ", formatDate(session.fecha_inicio)] })] }), _jsxs("div", { className: "flex items-center space-x-3 text-sm text-gray-700", children: [_jsx(Clock, { className: "h-5 w-5 text-purple-600" }), _jsxs("span", { children: [_jsx("span", { className: "font-semibold", children: "Expira:" }), " ", formatDate(session.fecha_expiracion)] })] })] })] })] }), session.activa && (_jsx(Button, { onClick: () => {
                                                                        setSelectedSession(session);
                                                                        setShowCloseModal(true);
                                                                    }, variant: "outline", size: "sm", className: "text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300", children: _jsx(X, { className: "h-5 w-5" }) }))] }) }) }, session.id))) })) })] }) })] }))] }), showCloseModal && selectedSession && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl w-full max-w-md", children: [_jsx("div", { className: "bg-red-500 text-white p-6 rounded-t-2xl", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(AlertTriangle, { className: "h-6 w-6" }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold", children: "Cerrar Sesi\u00F3n" }), _jsx("p", { className: "text-red-100", children: "Esta acci\u00F3n cerrar\u00E1 la sesi\u00F3n seleccionada" })] })] }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Motivo (opcional)" }), _jsx("textarea", { value: motivo, onChange: (e) => setMotivo(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none", rows: 3, placeholder: "Describe el motivo para cerrar esta sesi\u00F3n..." })] }) }), _jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setShowCloseModal(false);
                                        setSelectedSession(null);
                                        setMotivo('');
                                    }, disabled: actionLoading, children: "Cancelar" }), _jsx(Button, { onClick: handleCloseSession, disabled: actionLoading, className: "bg-red-600 hover:bg-red-700 text-white", children: actionLoading ? (_jsxs("span", { className: "flex items-center", children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Cerrando..."] })) : ('Cerrar Sesión') })] })] }) })), closeAllModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl w-full max-w-md", children: [_jsx("div", { className: "bg-red-500 text-white p-6 rounded-t-2xl", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(AlertTriangle, { className: "h-6 w-6" }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold", children: "Cerrar Todas las Sesiones" }), _jsx("p", { className: "text-red-100", children: "Esta acci\u00F3n cerrar\u00E1 todas las sesiones activas del usuario" })] })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" }), _jsxs("p", { className: "text-sm font-medium text-yellow-800", children: ["Se cerrar\u00E1n ", activeSessions.length, " sesiones activas"] })] }) }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Motivo (opcional)" }), _jsx("textarea", { value: motivo, onChange: (e) => setMotivo(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none", rows: 3, placeholder: "Describe el motivo para cerrar todas las sesiones..." })] })] }), _jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setCloseAllModal(false);
                                        setMotivo('');
                                    }, disabled: actionLoading, children: "Cancelar" }), _jsx(Button, { onClick: handleCloseAllSessions, disabled: actionLoading, className: "bg-red-600 hover:bg-red-700 text-white", children: actionLoading ? (_jsxs("span", { className: "flex items-center", children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Cerrando..."] })) : ('Cerrar Todas') })] })] }) }))] }));
};
