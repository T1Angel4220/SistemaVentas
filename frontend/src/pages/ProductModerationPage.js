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
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Shield, Package, Calendar, MapPin, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Filter, FileText, Search } from 'lucide-react';
import { ModerationReasonModal } from '../components/ui/ModerationReasonModal';
export const ProductModerationPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { canModerateProduct, getRoleDisplayName } = usePermissions();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 12,
        has_next: false,
        has_prev: false
    });
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        pendientes: 0,
        aprobados: 0,
        rechazados: 0,
        suspendidos: 0,
        peligrosos: 0,
        en_apelacion: 0
    });
    const [filters, setFilters] = useState({
        estado: '',
        page: 1,
        limit: 12,
        search_product_name: '',
        search_vendedor_name: ''
    });
    // Estados locales para los campos de búsqueda (antes de hacer click en buscar)
    const [searchInputs, setSearchInputs] = useState({
        productName: '',
        sellerName: ''
    });
    // Estado para modal de motivo de moderación
    const [moderationModal, setModerationModal] = useState(null);
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value)
                    queryParams.append(key, value.toString());
            });
            const response = await fetch(`http://localhost:3001/api/products/moderation/pending?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
                setPagination(data.pagination);
                if (data.estadisticas) {
                    setEstadisticas(data.estadisticas);
                }
            }
            else {
                setError('Error al cargar productos');
            }
        }
        catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error de conexión: Verifica que el servidor esté corriendo');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    // Verificar permisos y cargar productos
    useEffect(() => {
        if (!user) {
            setError('Usuario no autenticado');
            setLoading(false);
            return;
        }
        if (!canModerateProduct()) {
            setError('No tienes permisos para acceder a esta página');
            setLoading(false);
            return;
        }
        // Solo cargar si tiene permisos
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filters]);
    const handleModerationAction = async (productId, action, productName, motivo) => {
        try {
            setActionLoading(productId);
            const response = await fetch(`http://localhost:3001/api/products/${productId}/moderate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiService.getToken()}`
                },
                body: JSON.stringify({
                    accion: action,
                    motivo: motivo || `Producto ${action === 'aprobar' ? 'aprobado' : action === 'rechazar' ? 'rechazado' : action} por ${getRoleDisplayName()}`,
                    decision_final: `Decisión: ${action === 'aprobar' ? 'Aprobado' : action === 'rechazar' ? 'Rechazado' : action}`
                })
            });
            const data = await response.json();
            if (data.success) {
                // Mensajes de éxito personalizados según la acción
                let titulo = 'Acción completada';
                let mensaje = '';
                switch (action) {
                    case 'aprobar':
                        titulo = '✅ Producto Aprobado';
                        mensaje = `"${productName}" ha sido APROBADO exitosamente.\n\n` +
                            `El producto ahora es visible para todos los compradores.`;
                        break;
                    case 'rechazar':
                        titulo = '🔴 Producto Rechazado';
                        mensaje = `"${productName}" ha sido RECHAZADO.\n\n` +
                            `El vendedor podrá verlo, editarlo, eliminarlo o apelar esta decisión.`;
                        break;
                    case 'suspender':
                        titulo = '🟡 Producto Suspendido';
                        mensaje = `"${productName}" ha sido SUSPENDIDO temporalmente.\n\n` +
                            `El vendedor podrá verlo y apelar, pero no editarlo ni eliminarlo hasta que se resuelva.`;
                        break;
                    case 'marcar_peligroso':
                        titulo = '🚫 Producto Marcado como Peligroso';
                        mensaje = `"${productName}" ha sido marcado como PELIGROSO.\n\n` +
                            `El producto está ahora OCULTO para vendedor y compradores.\n` +
                            `Solo moderadores y administradores pueden verlo.\n\n` +
                            `El vendedor podrá apelar esta decisión.`;
                        break;
                    default:
                        titulo = 'Acción completada';
                        mensaje = `El producto "${productName}" ha sido procesado exitosamente.`;
                }
                showSuccess(titulo, mensaje, () => loadProducts());
                // Limpiar errores
                setError(null);
            }
            else {
                showError('Error', data.message || 'Error al moderar producto');
            }
        }
        catch (error) {
            console.error('Error al moderar producto:', error);
            showError('Error', 'Error de conexión al moderar producto');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleApproveProduct = (productId, productName) => {
        showWarning('¿Aprobar producto?', `¿Estás seguro de que quieres aprobar "${productName}"?\n\nEste producto será APROBADO y visible para todos los compradores en la plataforma.`, () => handleModerationAction(productId, 'aprobar', productName), undefined // onCancel - no necesita hacer nada especial
        );
    };
    const handleRejectProduct = (productId, productName) => {
        setModerationModal({
            isOpen: true,
            action: 'rechazar',
            productId,
            productName
        });
    };
    const handleSuspendProduct = (productId, productName) => {
        setModerationModal({
            isOpen: true,
            action: 'suspender',
            productId,
            productName
        });
    };
    const handleMarkAsDangerous = (productId, productName) => {
        setModerationModal({
            isOpen: true,
            action: 'marcar_peligroso',
            productId,
            productName
        });
    };
    const handleModerationConfirm = (motivo) => {
        if (moderationModal) {
            handleModerationAction(moderationModal.productId, moderationModal.action, moderationModal.productName, motivo);
            setModerationModal(null);
        }
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };
    const handleSearchInputChange = (key, value) => {
        setSearchInputs(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            search_product_name: searchInputs.productName,
            search_vendedor_name: searchInputs.sellerName,
            page: 1
        }));
    };
    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
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
    const getStatusBadge = (estado) => {
        const statusColors = {
            pendiente_revision: 'bg-yellow-100 text-yellow-800',
            activo: 'bg-green-100 text-green-800',
            rechazado: 'bg-red-100 text-red-800',
            suspendido: 'bg-gray-100 text-gray-800',
            peligroso: 'bg-red-100 text-red-800'
        };
        return (_jsx(Badge, { className: statusColors[estado] || 'bg-gray-100 text-gray-800', children: estado.replace('_', ' ').toUpperCase() }));
    };
    const getTypeIcon = (tipo) => {
        return tipo === 'servicio' ? _jsx(Calendar, { className: "h-4 w-4" }) : _jsx(Package, { className: "h-4 w-4" });
    };
    if (!user || !canModerateProduct()) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-16 w-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600", children: "No tienes permisos para acceder a esta p\u00E1gina" })] }) }));
    }
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Cargando..." }), _jsx("p", { className: "text-gray-600", children: "Obteniendo productos para moderaci\u00F3n..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 py-12", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-6", children: [_jsx("div", { className: "w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20", children: _jsx(Shield, { className: "w-10 h-10 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent", children: "Centro de Moderaci\u00F3n" }), _jsx("p", { className: "text-blue-100 text-base mt-1", children: "Revisi\u00F3n y aprobaci\u00F3n de contenido" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-blue-200", children: "Moderador activo" }), _jsx("div", { className: "font-semibold", children: getRoleDisplayName() })] }), _jsx("div", { className: "w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20", children: _jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }) })] })] }) }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-6 py-8 -mt-8 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(Package, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-blue-700 mb-1", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: estadisticas.total })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(Clock, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-yellow-700 mb-1", children: "Pendientes" }), _jsx("p", { className: "text-2xl font-bold text-yellow-900", children: estadisticas.pendientes })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(CheckCircle, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-green-700 mb-1", children: "Aprobados" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: estadisticas.aprobados })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(XCircle, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-orange-700 mb-1", children: "Rechazados" }), _jsx("p", { className: "text-2xl font-bold text-orange-900", children: estadisticas.rechazados })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-gray-700 mb-1", children: "Suspendidos" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: estadisticas.suspendidos })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-red-700 mb-1", children: "Peligrosos" }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: estadisticas.peligrosos })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-2", children: _jsx(FileText, { className: "h-5 w-5 text-white" }) }), _jsx("p", { className: "text-xs font-medium text-purple-700 mb-1", children: "Apelaciones" }), _jsx("p", { className: "text-2xl font-bold text-purple-900", children: estadisticas.en_apelacion })] }) }) })] }), _jsxs(Card, { className: "mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100", children: _jsxs(CardTitle, { className: "flex items-center space-x-3 text-gray-800", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center", children: _jsx(Filter, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xl font-bold", children: "Filtros de Moderaci\u00F3n" }), _jsx("p", { className: "text-sm text-gray-600 font-normal", children: "Filtra productos por estado para revisi\u00F3n" })] })] }) }), _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Estado del Producto" }), _jsxs("select", { value: filters.estado, onChange: (e) => handleFilterChange('estado', e.target.value), className: "w-full sm:w-80 flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors font-medium", children: [_jsxs("option", { value: "", children: ["\uD83D\uDCE6 Todos (", estadisticas.total, ")"] }), _jsxs("option", { value: "pendiente_revision", children: ["\uD83D\uDD50 Pendientes de Revisi\u00F3n (", estadisticas.pendientes, ")"] }), _jsxs("option", { value: "activo", children: ["\u2705 Aprobados (", estadisticas.aprobados, ")"] }), _jsxs("option", { value: "rechazado", children: ["\u274C Rechazados (", estadisticas.rechazados, ")"] }), _jsxs("option", { value: "suspendido", children: ["\u26A0\uFE0F Suspendidos (", estadisticas.suspendidos, ")"] }), _jsxs("option", { value: "peligroso", children: ["\uD83D\uDEAB Peligrosos (", estadisticas.peligrosos, ")"] }), _jsxs("option", { value: "en_apelacion", children: ["\uD83D\uDCCB En Apelaci\u00F3n (", estadisticas.en_apelacion, ")"] })] })] }), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200", children: _jsxs("div", { className: "text-sm font-medium text-blue-700", children: ["Mostrando ", _jsx("span", { className: "font-bold text-blue-900", children: products.length }), " de ", _jsx("span", { className: "font-bold text-blue-900", children: pagination.total_items }), " productos"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Buscar por Nombre de Producto" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: searchInputs.productName, onChange: (e) => handleSearchInputChange('productName', e.target.value), placeholder: "Ej: Laptop, Mueble, Servicio...", className: "w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-colors font-medium", onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleSearch();
                                                                        }
                                                                    } }), _jsx(Search, { className: "absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Buscar por Nombre del Vendedor" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: searchInputs.sellerName, onChange: (e) => handleSearchInputChange('sellerName', e.target.value), placeholder: "Ej: Juan, P\u00E9rez, Mar\u00EDa...", className: "w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-colors font-medium", onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleSearch();
                                                                        }
                                                                    } }), _jsx(Search, { className: "absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSearch, className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2", children: [_jsx(Search, { className: "h-5 w-5" }), _jsx("span", { children: "Buscar" })] }) })] }) })] }), error && (_jsxs(Alert, { variant: "destructive", className: "mb-8", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: products.map((product) => (_jsxs(Card, { className: "bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300", children: product.total_imagenes > 0 && product.primera_imagen ? (_jsxs(_Fragment, { children: [_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-full object-cover" }), product.total_imagenes > 1 && (_jsx("div", { className: "absolute bottom-3 right-3", children: _jsxs("div", { className: "bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium", children: ["+", product.total_imagenes - 1, " m\u00E1s"] }) }))] })) : (_jsxs("div", { className: "text-center text-gray-600", children: [_jsx("div", { className: "w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg", children: _jsx(Package, { className: "h-8 w-8 text-gray-500" }) }), _jsx("p", { className: "text-sm font-medium", children: product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'Sin imágenes' })] })) }), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("div", { className: "bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200", children: getStatusBadge(product.estado) }) }), _jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200", children: _jsxs(Badge, { variant: "outline", className: "bg-transparent border-gray-300 text-gray-700", children: [getTypeIcon(product.tipo), _jsx("span", { className: "ml-1 capitalize text-xs", children: product.tipo })] }) }) })] }), _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900 text-lg line-clamp-2 mb-1", children: product.nombre }), _jsxs("p", { className: "text-sm text-gray-500 font-medium", children: ["C\u00F3digo: ", product.codigo] })] }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2 leading-relaxed", children: product.descripcion }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsx("span", { className: "text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent", children: formatPrice(product.precio) }), _jsx("span", { className: "text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium", children: product.categoria_nombre })] }), (product.ubicacion_provincia || product.ubicacion_canton) && (_jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-500", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: product.ubicacion_provincia && product.ubicacion_canton
                                                                ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                                                : product.ubicacion_provincia || product.ubicacion_canton })] })), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [_jsxs("span", { className: "font-medium", children: ["Por: ", product.vendedor_nombre] }), _jsx("span", { children: formatDate(product.fecha_publicacion) })] })] }), _jsxs("div", { className: "space-y-3 mt-6", children: [_jsx("div", { className: "flex space-x-2", children: _jsxs(Button, { variant: "outline", size: "sm", className: "flex-1 h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium", onClick: () => navigate(`/products/${product.id}`), children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Ver Detalles"] }) }), product.estado === 'pendiente_revision' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-3 gap-2 pt-3 border-t border-gray-100", children: [_jsxs(Button, { size: "sm", onClick: () => handleApproveProduct(product.id, product.nombre), disabled: actionLoading === product.id || !product.fecha_revision, className: `h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${!product.fecha_revision
                                                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white`, title: "Aprobar producto", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(CheckCircle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-1 hidden sm:inline", children: !product.fecha_revision ? 'Revisar' : 'Aprobar' }), _jsx("span", { className: "ml-1 sm:hidden", children: "\u2713" })] }), _jsxs(Button, { size: "sm", onClick: () => handleRejectProduct(product.id, product.nombre), disabled: actionLoading === product.id || !product.fecha_revision, className: `h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${!product.fecha_revision
                                                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'} text-white`, title: "Rechazar por errores corregibles (vendedor puede editar)", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(XCircle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-1 hidden sm:inline", children: !product.fecha_revision ? 'Revisar' : 'Rechazar' }), _jsx("span", { className: "ml-1 sm:hidden", children: "\u2717" })] }), _jsxs(Button, { size: "sm", onClick: () => handleSuspendProduct(product.id, product.nombre), disabled: actionLoading === product.id || !product.fecha_revision, className: `h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${!product.fecha_revision
                                                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                                        : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'} text-white`, title: "Suspender por violaci\u00F3n grave (vendedor NO puede editar)", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-1 hidden sm:inline", children: !product.fecha_revision ? 'Revisar' : 'Suspender' }), _jsx("span", { className: "ml-1 sm:hidden", children: "\u26A0" })] })] }), product.fecha_revision && (_jsx("div", { className: "pt-3 border-t border-gray-100", children: _jsxs(Button, { size: "sm", onClick: () => handleMarkAsDangerous(product.id, product.nombre), disabled: actionLoading === product.id, className: "w-full h-10 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200", title: "Contenido prohibido - Producto OCULTO completamente", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-2", children: "\uD83D\uDEAB Marcar como Peligroso" })] }) }))] })), product.estado === 'activo' && (_jsxs("div", { className: "grid grid-cols-2 gap-3 pt-3 border-t border-gray-100", children: [_jsxs(Button, { size: "sm", onClick: () => handleSuspendProduct(product.id, product.nombre), disabled: actionLoading === product.id, className: "h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-2", children: "Suspender" })] }), _jsxs(Button, { size: "sm", onClick: () => handleMarkAsDangerous(product.id, product.nombre), disabled: actionLoading === product.id, className: "h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200", children: [actionLoading === product.id ? (_jsx(Clock, { className: "h-4 w-4 animate-spin" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx("span", { className: "ml-2", children: "Peligroso" })] })] }))] })] })] }, product.id))) }), pagination.total_pages > 1 && (_jsx("div", { className: "flex justify-center mt-8", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(pagination.current_page - 1), disabled: !pagination.has_prev, className: `
                    px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${!pagination.has_prev
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'}
                  `, children: _jsxs("span", { className: "flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-1.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Anterior"] }) }), _jsx("div", { className: "flex items-center space-x-1.5", children: Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => {
                                                const isCurrentPage = page === pagination.current_page;
                                                const isNearCurrent = Math.abs(page - pagination.current_page) <= 1;
                                                const isFirstOrLast = page === 1 || page === pagination.total_pages;
                                                // Mostrar solo páginas cercanas, primera y última
                                                if (!isNearCurrent && !isFirstOrLast && pagination.total_pages > 5) {
                                                    // Mostrar puntos suspensivos
                                                    if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                                                        return (_jsx("span", { className: "px-2 text-gray-400 text-sm", children: "..." }, page));
                                                    }
                                                    return null;
                                                }
                                                return (_jsx("button", { onClick: () => handlePageChange(page), className: `
                          min-w-[2.75rem] h-11 rounded-xl font-semibold text-sm
                          transition-all duration-200 transform
                          ${isCurrentPage
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                                                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105'}
                        `, children: page }, page));
                                            }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(pagination.current_page + 1), disabled: !pagination.has_next, className: `
                    px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${!pagination.has_next
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'}
                  `, children: _jsxs("span", { className: "flex items-center", children: ["Siguiente", _jsx("svg", { className: "w-4 h-4 ml-1.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }) })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-gray-100", children: _jsxs("p", { className: "text-xs text-gray-500 text-center font-medium", children: ["P\u00E1gina ", _jsx("span", { className: "text-blue-600 font-bold", children: pagination.current_page }), " de", ' ', _jsx("span", { className: "text-gray-700 font-bold", children: pagination.total_pages }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("span", { className: "text-gray-700", children: pagination.total_items }), " productos en total"] }) })] }) })), _jsx(Card, { className: "mt-8 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Resumen de Moderaci\u00F3n" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-6 mt-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-yellow-600", children: estadisticas.pendientes }), _jsx("p", { className: "text-sm text-gray-600", children: "Pendientes" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: estadisticas.aprobados }), _jsx("p", { className: "text-sm text-gray-600", children: "Aprobados" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-orange-600", children: estadisticas.rechazados }), _jsx("p", { className: "text-sm text-gray-600", children: "Rechazados" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-gray-600", children: estadisticas.suspendidos }), _jsx("p", { className: "text-sm text-gray-600", children: "Suspendidos" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-red-600", children: estadisticas.peligrosos }), _jsx("p", { className: "text-sm text-gray-600", children: "Peligrosos" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-purple-600", children: estadisticas.en_apelacion }), _jsx("p", { className: "text-sm text-gray-600", children: "En Apelaci\u00F3n" })] })] }), _jsxs("p", { className: "text-sm text-gray-500 mt-4", children: ["P\u00E1gina ", pagination.current_page, " de ", pagination.total_pages, " \u2022 Total: ", pagination.total_items, " productos"] })] }) }) })] }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel }), moderationModal && (_jsx(ModerationReasonModal, { isOpen: moderationModal.isOpen, onClose: () => setModerationModal(null), onConfirm: handleModerationConfirm, action: moderationModal.action, productName: moderationModal.productName }))] }));
};
