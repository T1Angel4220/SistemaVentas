import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { FileText, Package, Eye, CheckCircle, XCircle, Clock, User, Shield, MessageSquare, Camera } from 'lucide-react';
export const AppealsManagementPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { canModerateProduct, getRoleDisplayName } = usePermissions();
    const { alert, showSuccess, showError, hideAlert } = useAlert();
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [resolveAction, setResolveAction] = useState('aprobar');
    const [decisionApelacion, setDecisionApelacion] = useState('');
    const loadAppeals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/appeals/pending`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAppeals(data.data);
            }
            else {
                showError('Error', 'No se pudieron cargar las apelaciones');
            }
        }
        catch (error) {
            console.error('Error al cargar apelaciones:', error);
            showError('Error', 'Error de conexión al cargar apelaciones');
        }
        finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (user && canModerateProduct()) {
            loadAppeals();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleResolveAppeal = async () => {
        if (!selectedAppeal)
            return;
        if (decisionApelacion.trim().length < 10) {
            showError('Error', 'La explicación debe tener al menos 10 caracteres');
            return;
        }
        try {
            setActionLoading(selectedAppeal.id);
            const response = await fetch(`http://localhost:3001/api/appeals/${selectedAppeal.id}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiService.getToken()}`
                },
                body: JSON.stringify({
                    decision: resolveAction,
                    decision_apelacion: decisionApelacion
                })
            });
            const data = await response.json();
            if (data.success) {
                const actionText = resolveAction === 'aprobar'
                    ? 'Apelación aceptada - Producto reactivado'
                    : 'Apelación rechazada - Producto mantiene su estado';
                showSuccess('✅ Apelación procesada', actionText, () => {
                    setShowResolveDialog(false);
                    setSelectedAppeal(null);
                    setDecisionApelacion('');
                    loadAppeals();
                });
            }
            else {
                showError('Error', data.message || 'Error al procesar la apelación');
            }
        }
        catch (error) {
            console.error('Error al resolver apelación:', error);
            showError('Error', 'Error de conexión al procesar la apelación');
        }
        finally {
            setActionLoading(null);
        }
    };
    const openResolveDialog = (appeal, action) => {
        setSelectedAppeal(appeal);
        setResolveAction(action);
        setShowResolveDialog(true);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getEstadoBadge = (estado) => {
        const colors = {
            'en_apelacion': 'bg-purple-100 text-purple-800 border-purple-300',
            'aprobado': 'bg-green-100 text-green-800 border-green-300',
            'rechazado': 'bg-red-100 text-red-800 border-red-300'
        };
        return (_jsx(Badge, { className: `${colors[estado] || 'bg-gray-100 text-gray-800'} border`, children: estado.replace('_', ' ').toUpperCase() }));
    };
    if (!user || !canModerateProduct()) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-16 w-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600", children: "No tienes permisos para acceder a esta p\u00E1gina" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center space-x-4 sm:space-x-6", children: [_jsx("div", { className: "w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20", children: _jsx(FileText, { className: "w-6 h-6 sm:w-10 sm:h-10 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent", children: "Gesti\u00F3n de Apelaciones" }), _jsx("p", { className: "text-purple-100 text-sm sm:text-base mt-1", children: "Apelaciones de productos rechazados" })] })] }), _jsxs("div", { className: "flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs sm:text-sm text-purple-200", children: "Moderador activo" }), _jsx("div", { className: "font-semibold text-sm sm:text-base", children: getRoleDisplayName() })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20", children: _jsx("div", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" }) })] })] }) }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 -mt-6 sm:-mt-8 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-purple-700", children: "Pendientes" }), _jsx("p", { className: "text-3xl font-bold text-purple-900 mt-1", children: appeals.filter(a => a.estado === 'en_apelacion').length })] }), _jsx("div", { className: "w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Clock, { className: "h-6 w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-700", children: "Aprobadas" }), _jsx("p", { className: "text-3xl font-bold text-green-900 mt-1", children: appeals.filter(a => a.estado === 'aprobado').length })] }), _jsx("div", { className: "w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(CheckCircle, { className: "h-6 w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-700", children: "Rechazadas" }), _jsx("p", { className: "text-3xl font-bold text-red-900 mt-1", children: appeals.filter(a => a.estado === 'rechazado').length })] }), _jsx("div", { className: "w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(XCircle, { className: "h-6 w-6 text-white" }) })] }) }) })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Cargando apelaciones..." })] })) : appeals.length === 0 ? (_jsx(Card, { className: "bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl", children: _jsxs(CardContent, { className: "text-center py-16", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(FileText, { className: "h-12 w-12 text-purple-600" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: "No hay apelaciones pendientes" }), _jsx("p", { className: "text-gray-600 text-lg max-w-md mx-auto", children: "No se encontraron apelaciones que requieran revisi\u00F3n" })] }) })) : (_jsx("div", { className: "space-y-6", children: appeals.map((appeal) => (_jsx(Card, { className: "bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md", children: appeal.primera_imagen ? (_jsxs("div", { className: "relative w-full h-full", children: [_jsx("img", { src: appeal.primera_imagen, alt: appeal.producto_nombre, className: "w-full h-full object-cover" }), appeal.total_imagenes && appeal.total_imagenes > 1 && (_jsxs("div", { className: "absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium", children: ["+", appeal.total_imagenes - 1, " m\u00E1s"] }))] })) : (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center text-gray-400", children: [_jsx(Camera, { className: "h-12 w-12 mb-2" }), _jsx("span", { className: "text-sm font-medium", children: "Sin imagen" })] })) }), _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-gray-900 mb-1", children: appeal.producto_nombre }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3digo: ", appeal.producto_codigo] })] }), getEstadoBadge(appeal.estado)] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Package, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Tipo: ", _jsx("span", { className: "font-medium text-gray-900 capitalize", children: appeal.producto_tipo })] })] }), _jsx("div", { className: "flex items-center space-x-2 text-sm", children: _jsxs("span", { className: "text-gray-600", children: ["Estado: ", _jsx("span", { className: "font-medium text-red-600 capitalize", children: appeal.producto_estado.replace('_', ' ') })] }) }), _jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Vendedor: ", _jsxs("span", { className: "font-medium text-gray-900", children: [appeal.vendedor_nombre, " ", appeal.vendedor_apellido] })] })] }), _jsx("div", { className: "flex items-center space-x-2 text-sm", children: _jsx("span", { className: "text-gray-600 text-xs", children: appeal.vendedor_correo }) })] }), appeal.motivo_rechazo_original && (_jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-lg p-3", children: [_jsx("div", { className: "text-xs font-semibold text-red-700 mb-1", children: "MOTIVO DEL RECHAZO ORIGINAL:" }), _jsx("p", { className: "text-sm text-red-800", children: appeal.motivo_rechazo_original })] })), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate(`/products/${appeal.item_id}`), className: "w-full h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Ver Producto"] })] }), _jsxs("div", { className: "space-y-4 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-sm font-semibold text-gray-700 mb-2 flex items-center", children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-2 text-purple-600" }), "Motivo de Apelaci\u00F3n"] }), _jsx("p", { className: "text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-200", children: appeal.motivo_apelacion })] }), appeal.informacion_adicional && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Informaci\u00F3n Adicional" }), _jsx("p", { className: "text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200", children: appeal.informacion_adicional })] })), _jsx("div", { className: "space-y-2 text-sm", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Apelado: ", formatDate(appeal.fecha_apelacion)] })] }) }), _jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-amber-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Recuerda:" }), " Revisa cuidadosamente la apelaci\u00F3n del vendedor antes de tomar una decisi\u00F3n."] }) })] }), _jsxs("div", { className: "space-y-3 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0", children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Acciones de Moderaci\u00F3n" }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(appeal, 'aprobar'), disabled: actionLoading === appeal.id, className: "w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Aceptar Apelaci\u00F3n"] }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(appeal, 'rechazar'), disabled: actionLoading === appeal.id, className: "w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(XCircle, { className: "h-4 w-4 mr-2" }), "Rechazar Apelaci\u00F3n"] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4", children: _jsxs("p", { className: "text-xs text-blue-800", children: [_jsx("strong", { children: "Aceptar:" }), " El producto ser\u00E1 reactivado", _jsx("br", {}), _jsx("strong", { children: "Rechazar:" }), " El producto mantiene su estado actual"] }) })] })] }) }) }, appeal.id))) }))] }), showResolveDialog && selectedAppeal && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-4", children: [_jsxs("div", { className: "sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Resolver Apelaci\u00F3n" }), _jsxs("p", { className: "text-purple-100 text-sm mt-1", children: ["Producto: ", selectedAppeal.producto_nombre] })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-semibold text-gray-900 mb-2", children: "Acci\u00F3n seleccionada" }), _jsx("div", { className: "bg-gray-50 border-2 border-gray-200 rounded-xl p-4", children: _jsxs("p", { className: "font-semibold text-gray-900", children: [resolveAction === 'aprobar' && '✅ Aceptar Apelación - Reactivar Producto', resolveAction === 'rechazar' && '❌ Rechazar Apelación - Mantener Estado'] }) })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "decision", className: "text-base font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2 text-purple-600" }), "Explicaci\u00F3n de la Decisi\u00F3n *"] }), _jsx(Textarea, { id: "decision", value: decisionApelacion, onChange: (e) => setDecisionApelacion(e.target.value), placeholder: "Explica detalladamente por qu\u00E9 aceptas o rechazas esta apelaci\u00F3n (m\u00EDnimo 10 caracteres)...", rows: 5, className: "w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl", required: true }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "M\u00EDnimo 10 caracteres" }), _jsxs("p", { className: `text-sm font-medium ${decisionApelacion.length >= 10 ? 'text-green-600' : 'text-gray-400'}`, children: [decisionApelacion.length, " / 10"] })] })] }), _jsxs("div", { className: "flex space-x-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", onClick: () => {
                                                setShowResolveDialog(false);
                                                setSelectedAppeal(null);
                                                setDecisionApelacion('');
                                            }, variant: "outline", className: "flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50", disabled: actionLoading !== null, children: "Cancelar" }), _jsx(Button, { type: "button", onClick: handleResolveAppeal, className: "flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300", disabled: actionLoading !== null || decisionApelacion.trim().length < 10, children: actionLoading !== null ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "Procesando..." })] })) : ('✅ Confirmar Decisión') })] })] })] }) })), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
