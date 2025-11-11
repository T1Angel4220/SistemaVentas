import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Flag, Package, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Filter, User, FileText, Shield, Camera, DollarSign } from 'lucide-react';
export const ReportsManagementPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { canModerateProduct, getRoleDisplayName } = usePermissions();
    const { alert, showSuccess, showError, hideAlert } = useAlert();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [resolveAction, setResolveAction] = useState('aprobar');
    const [decisionFinal, setDecisionFinal] = useState('');
    const [marcarPeligroso, setMarcarPeligroso] = useState(false);
    const [filters, setFilters] = useState({
        tipo_reporte: '',
        estado: ''
    });
    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.tipo_reporte)
                queryParams.append('tipo_reporte', filters.tipo_reporte);
            if (filters.estado)
                queryParams.append('estado', filters.estado);
            const response = await fetch(`http://localhost:3001/api/reports/pending?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setReports(data.data);
            }
            else {
                showError('Error', 'No se pudieron cargar los reportes');
            }
        }
        catch (error) {
            console.error('Error al cargar reportes:', error);
            showError('Error', 'Error de conexión al cargar reportes');
        }
        finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);
    useEffect(() => {
        if (user && canModerateProduct()) {
            loadReports();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);
    const handleResolveReport = async () => {
        if (!selectedReport)
            return;
        if (decisionFinal.trim().length < 10) {
            showError('Error', 'La explicación debe tener al menos 10 caracteres');
            return;
        }
        try {
            setActionLoading(selectedReport.id);
            const response = await fetch(`http://localhost:3001/api/reports/${selectedReport.id}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiService.getToken()}`
                },
                body: JSON.stringify({
                    accion: resolveAction,
                    decision_final: decisionFinal,
                    marcar_peligroso: marcarPeligroso
                })
            });
            const data = await response.json();
            if (data.success) {
                const actionText = {
                    'aprobar': 'Reporte rechazado (producto válido)',
                    'rechazar': 'Producto rechazado',
                    'suspender': 'Producto suspendido',
                    'eliminar': 'Producto marcado como peligroso'
                };
                showSuccess('✅ Reporte procesado', actionText[resolveAction], () => {
                    setShowResolveDialog(false);
                    setSelectedReport(null);
                    setDecisionFinal('');
                    setMarcarPeligroso(false);
                    loadReports();
                });
            }
            else {
                showError('Error', data.message || 'Error al procesar el reporte');
            }
        }
        catch (error) {
            console.error('Error al resolver reporte:', error);
            showError('Error', 'Error de conexión al procesar el reporte');
        }
        finally {
            setActionLoading(null);
        }
    };
    const openResolveDialog = (report, action) => {
        setSelectedReport(report);
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
    const getTipoReporteLabel = (tipo) => {
        const labels = {
            'contenido_inapropiado': '⚠️ Contenido Inapropiado',
            'producto_prohibido': '🚫 Producto Prohibido',
            'informacion_falsa': '❌ Información Falsa',
            'spam': '📧 Spam',
            'otro': '🔖 Otro'
        };
        return labels[tipo] || tipo;
    };
    const getEstadoBadge = (estado) => {
        const colors = {
            'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'en_revision': 'bg-blue-100 text-blue-800 border-blue-300',
            'resuelto': 'bg-green-100 text-green-800 border-green-300',
            'rechazado': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return (_jsx(Badge, { className: `${colors[estado] || 'bg-gray-100 text-gray-800'} border`, children: estado.replace('_', ' ').toUpperCase() }));
    };
    if (!user || !canModerateProduct()) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-16 w-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600", children: "No tienes permisos para acceder a esta p\u00E1gina" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50", children: [_jsx("div", { className: "bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center space-x-4 sm:space-x-6", children: [_jsx("div", { className: "w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20", children: _jsx(Flag, { className: "w-6 h-6 sm:w-10 sm:h-10 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent", children: "Gesti\u00F3n de Reportes" }), _jsx("p", { className: "text-red-100 text-sm sm:text-base mt-1", children: "Reportes de compradores y moderadores" })] })] }), _jsxs("div", { className: "flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs sm:text-sm text-red-200", children: "Moderador activo" }), _jsx("div", { className: "font-semibold text-sm sm:text-base", children: getRoleDisplayName() })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20", children: _jsx("div", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" }) })] })] }) }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 -mt-6 sm:-mt-8 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-yellow-700", children: "Pendientes" }), _jsx("p", { className: "text-3xl font-bold text-yellow-900 mt-1", children: reports.filter(r => r.estado === 'pendiente').length })] }), _jsx("div", { className: "w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Clock, { className: "h-6 w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-700", children: "En Revisi\u00F3n" }), _jsx("p", { className: "text-3xl font-bold text-blue-900 mt-1", children: reports.filter(r => r.estado === 'en_revision').length })] }), _jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(FileText, { className: "h-6 w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-700", children: "Resueltos" }), _jsx("p", { className: "text-3xl font-bold text-green-900 mt-1", children: reports.filter(r => r.estado === 'resuelto').length })] }), _jsx("div", { className: "w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(CheckCircle, { className: "h-6 w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-700", children: "Total" }), _jsx("p", { className: "text-3xl font-bold text-red-900 mt-1", children: reports.length })] }), _jsx("div", { className: "w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Flag, { className: "h-6 w-6 text-white" }) })] }) }) })] }), _jsxs(Card, { className: "mb-6 sm:mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-slate-50 to-red-50 p-4 sm:p-6 border-b border-gray-100", children: _jsxs(CardTitle, { className: "flex items-center space-x-3 text-gray-800", children: [_jsx("div", { className: "w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center", children: _jsx(Filter, { className: "h-4 w-4 sm:h-5 sm:w-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-lg sm:text-xl font-bold", children: "Filtros de Reportes" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-600 font-normal", children: "Filtra reportes por tipo y estado" })] })] }) }), _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Tipo de Reporte" }), _jsxs("select", { value: filters.tipo_reporte, onChange: (e) => setFilters(prev => ({ ...prev, tipo_reporte: e.target.value })), className: "w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "contenido_inapropiado", children: "\u26A0\uFE0F Contenido Inapropiado" }), _jsx("option", { value: "producto_prohibido", children: "\uD83D\uDEAB Producto Prohibido" }), _jsx("option", { value: "informacion_falsa", children: "\u274C Informaci\u00F3n Falsa" }), _jsx("option", { value: "spam", children: "\uD83D\uDCE7 Spam" }), _jsx("option", { value: "otro", children: "\uD83D\uDD16 Otro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Estado" }), _jsxs("select", { value: filters.estado, onChange: (e) => setFilters(prev => ({ ...prev, estado: e.target.value })), className: "w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "pendiente", children: "Pendiente" }), _jsx("option", { value: "en_revision", children: "En Revisi\u00F3n" }), _jsx("option", { value: "resuelto", children: "Resuelto" })] })] })] }) })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Cargando reportes..." })] })) : reports.length === 0 ? (_jsx(Card, { className: "bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl", children: _jsxs(CardContent, { className: "text-center py-16", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(Flag, { className: "h-12 w-12 text-red-600" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: "No hay reportes" }), _jsx("p", { className: "text-gray-600 text-lg max-w-md mx-auto", children: "No se encontraron reportes con los filtros seleccionados" })] }) })) : (_jsx("div", { className: "space-y-6", children: reports.map((report) => (_jsx(Card, { className: "bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-lg text-gray-900 mb-1", children: report.producto_nombre }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3digo: ", report.producto_codigo] })] }), getEstadoBadge(report.estado)] }), _jsx("div", { className: "relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-sm", children: report.primera_imagen ? (_jsxs(_Fragment, { children: [_jsx("img", { src: report.primera_imagen, alt: report.producto_nombre, className: "w-full h-full object-cover" }), report.total_imagenes && report.total_imagenes > 1 && (_jsxs("div", { className: "absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1", children: [_jsx(Camera, { className: "h-3 w-3" }), _jsx("span", { children: report.total_imagenes })] }))] })) : (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center", children: [_jsx(Camera, { className: `h-12 w-12 mb-2 ${report.producto_tipo === 'servicio' ? 'text-purple-300' : 'text-gray-300'}` }), _jsx("p", { className: "text-sm font-medium text-gray-400", children: "Sin Foto" })] })) }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Package, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Tipo: ", _jsx("span", { className: "font-medium text-gray-900", children: report.producto_tipo })] })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(DollarSign, { className: "h-4 w-4 text-green-500" }), _jsxs("span", { className: "text-gray-600", children: ["Precio: ", _jsxs("span", { className: "font-bold text-lg text-green-600", children: ["$", typeof report.producto_precio === 'string' ? parseFloat(report.producto_precio).toFixed(2) : report.producto_precio.toFixed(2)] })] })] }), _jsx("div", { className: "flex items-center space-x-2 text-sm", children: _jsxs("span", { className: "text-gray-600", children: ["Categor\u00EDa: ", _jsx("span", { className: "font-medium text-gray-900", children: report.categoria_nombre })] }) }), _jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Vendedor: ", _jsxs("span", { className: "font-medium text-gray-900", children: [report.vendedor_nombre, " ", report.vendedor_apellido] })] })] })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate(`/products/${report.item_id}`), className: "w-full h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Ver Producto"] })] }), _jsxs("div", { className: "space-y-4 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Tipo de Reporte" }), _jsx(Badge, { className: "bg-red-100 text-red-800 border-red-300 border", children: getTipoReporteLabel(report.tipo_reporte) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Motivo" }), _jsx("p", { className: "text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200", children: report.descripcion })] }), report.comentario_opcional && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Informaci\u00F3n Adicional" }), _jsx("p", { className: "text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200", children: report.comentario_opcional })] })), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-gray-600", children: ["Reportado por: ", _jsxs("span", { className: "font-medium text-gray-900", children: [report.reportante_nombre, " ", report.reportante_apellido] })] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx(Badge, { className: `${report.reportante_tipo === 'moderador' || report.reportante_tipo === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} border`, children: report.reportante_tipo }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: formatDate(report.fecha_reporte) })] })] }), report.total_reportes_producto > 1 && (_jsx("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-orange-800", children: ["\u26A0\uFE0F Este producto tiene ", _jsx("strong", { children: report.total_reportes_producto }), " reportes"] }) }))] }), _jsxs("div", { className: "space-y-3 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0", children: [_jsx("div", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Acciones de Moderaci\u00F3n" }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(report, 'aprobar'), disabled: actionLoading === report.id, className: "w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Producto V\u00E1lido"] }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(report, 'rechazar'), disabled: actionLoading === report.id, className: "w-full h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(XCircle, { className: "h-4 w-4 mr-2" }), "Rechazar Producto"] }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(report, 'suspender'), disabled: actionLoading === report.id, className: "w-full h-10 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Suspender"] }), _jsxs(Button, { size: "sm", onClick: () => openResolveDialog(report, 'eliminar'), disabled: actionLoading === report.id, className: "w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Marcar Peligroso"] })] })] }) }) }, report.id))) }))] }), showResolveDialog && selectedReport && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-4", children: [_jsxs("div", { className: "sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Resolver Reporte" }), _jsxs("p", { className: "text-red-100 text-sm mt-1", children: ["Producto: ", selectedReport.producto_nombre] })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-semibold text-gray-900 mb-2", children: "Acci\u00F3n seleccionada" }), _jsx("div", { className: "bg-gray-50 border-2 border-gray-200 rounded-xl p-4", children: _jsxs("p", { className: "font-semibold text-gray-900", children: [resolveAction === 'aprobar' && '✅ Producto Válido - Reporte Rechazado', resolveAction === 'rechazar' && '❌ Rechazar Producto', resolveAction === 'suspender' && '⏸️ Suspender Producto', resolveAction === 'eliminar' && '🚨 Marcar como Peligroso'] }) })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "decision", className: "text-base font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2 text-red-600" }), "Explicaci\u00F3n de la Decisi\u00F3n *"] }), _jsx(Textarea, { id: "decision", value: decisionFinal, onChange: (e) => setDecisionFinal(e.target.value), placeholder: "Explica detalladamente por qu\u00E9 tomaste esta decisi\u00F3n (m\u00EDnimo 10 caracteres)...", rows: 5, className: "w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl", required: true }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "M\u00EDnimo 10 caracteres" }), _jsxs("p", { className: `text-sm font-medium ${decisionFinal.length >= 10 ? 'text-green-600' : 'text-gray-400'}`, children: [decisionFinal.length, " / 10"] })] })] }), (resolveAction === 'eliminar' || resolveAction === 'rechazar' || resolveAction === 'suspender') && (_jsx("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-4", children: _jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: marcarPeligroso, onChange: (e) => setMarcarPeligroso(e.target.checked), className: "h-5 w-5 text-red-600 focus:ring-red-500 rounded" }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold text-red-900", children: "Marcar como peligroso" }), _jsx("p", { className: "text-sm text-red-700", children: "El producto ser\u00E1 ocultado y no podr\u00E1 ser editado por el vendedor" })] })] }) })), _jsxs("div", { className: "flex space-x-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", onClick: () => {
                                                setShowResolveDialog(false);
                                                setSelectedReport(null);
                                                setDecisionFinal('');
                                                setMarcarPeligroso(false);
                                            }, variant: "outline", className: "flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50", disabled: actionLoading !== null, children: "Cancelar" }), _jsx(Button, { type: "button", onClick: handleResolveReport, className: "flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300", disabled: actionLoading !== null || decisionFinal.trim().length < 10, children: actionLoading !== null ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "Procesando..." })] })) : ('✅ Confirmar Decisión') })] })] })] }) })), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
