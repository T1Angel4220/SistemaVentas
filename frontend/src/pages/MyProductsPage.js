import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Package, Plus, Edit, Trash2, Eye, Calendar, AlertCircle, ArrowLeft, Camera, AlertTriangle, Shield, MessageSquare, CheckCircle, ToggleRight, Search } from 'lucide-react';
import { AppealProductDialog } from '../components/ui/AppealProductDialog';
export const MyProductsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dangerousProductsCount, setDangerousProductsCount] = useState(0);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 12,
        has_next: false,
        has_prev: false
    });
    const [filters, setFilters] = useState({
        estado: '',
        disponibilidad: '',
        page: 1,
        limit: 12,
        search_product_name: ''
    });
    // Estado local para el campo de búsqueda (antes de hacer click en buscar)
    const [searchInput, setSearchInput] = useState('');
    // Estado para modal de apelación
    const [appealModalOpen, setAppealModalOpen] = useState(false);
    const [selectedProductForAppeal, setSelectedProductForAppeal] = useState(null);
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value)
                    queryParams.append(key, value.toString());
            });
            const response = await fetch(`http://localhost:3001/api/products/my/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
                setPagination(data.pagination);
            }
        }
        catch (error) {
            console.error('Error al cargar productos:', error);
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const loadDangerousProductsCount = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/products/my-dangerous`, {
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
            console.error('Error al cargar productos peligrosos:', error);
        }
    }, []);
    useEffect(() => {
        if (user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador')) {
            loadProducts();
            loadDangerousProductsCount();
        }
    }, [user, filters, loadProducts, loadDangerousProductsCount]);
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };
    const handleSearchInputChange = (value) => {
        setSearchInput(value);
    };
    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            search_product_name: searchInput,
            page: 1
        }));
    };
    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };
    const handleEditProduct = (productId) => {
        navigate(`/products/${productId}/edit`);
    };
    const handleDeleteProduct = async (productId, productName, productEstado) => {
        // Verificar si el producto está en revisión
        if (productEstado === 'pendiente_revision' && user?.tipo_usuario !== 'administrador') {
            showError('⏳ Producto en Revisión', 'No puedes eliminar este producto mientras esté pendiente de revisión. Espera a que los moderadores lo revisen.');
            return;
        }
        // Verificar si el producto está suspendido
        if (productEstado === 'suspendido' && user?.tipo_usuario !== 'administrador') {
            showError('🚫 Producto Suspendido', 'No puedes eliminar este producto porque ha sido suspendido por los moderadores. Contacta con ellos para más información.');
            return;
        }
        showWarning('¿Eliminar producto?', `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`, async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${apiService.getToken()}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    showSuccess('¡Producto eliminado!', `"${productName}" ha sido eliminado correctamente.`, () => loadProducts());
                }
                else {
                    showError('Error', data.message || 'Error al eliminar el producto');
                }
            }
            catch (error) {
                console.error('Error al eliminar producto:', error);
                showError('Error', 'Error al eliminar el producto');
            }
        }, undefined // onCancel - no necesita hacer nada especial
        );
    };
    const handleAppealProduct = (product) => {
        setSelectedProductForAppeal({
            id: product.id,
            nombre: product.nombre,
            motivo_rechazo: product.motivo_rechazo || undefined
        });
        setAppealModalOpen(true);
    };
    const handleAppealSuccess = () => {
        showSuccess('¡Apelación enviada!', 'Tu apelación ha sido enviada correctamente. Será revisada por un moderador.', () => loadProducts());
        setAppealModalOpen(false);
        setSelectedProductForAppeal(null);
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
            day: 'numeric'
        });
    };
    const getStatusBadge = (product) => {
        const { estado, disponibilidad, tipo, es_peligroso } = product;
        // Si es peligroso, mostrar badge rojo
        if (estado === 'peligroso' || es_peligroso) {
            return (_jsx(Badge, { className: "bg-red-100 text-red-800 border-red-200", children: tipo === 'servicio' ? 'Servicio Peligroso' : 'Producto Peligroso' }));
        }
        // Si está activo pero sin stock
        if (estado === 'activo' && !disponibilidad) {
            return (_jsx(Badge, { className: "bg-orange-100 text-orange-800 border-orange-200", children: tipo === 'servicio' ? 'Servicio sin Stock' : 'Producto sin Stock' }));
        }
        // Estados normales
        const statusConfig = {
            activo: {
                color: 'bg-green-100 text-green-800 border-green-200',
                text: tipo === 'servicio' ? 'Servicio Activo' : 'Producto Activo'
            },
            pendiente_revision: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                text: 'Pendiente de Revisión'
            },
            rechazado: {
                color: 'bg-red-100 text-red-800 border-red-200',
                text: 'Rechazado'
            },
            suspendido: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                text: 'Suspendido'
            },
            en_apelacion: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                text: 'En Apelación'
            }
        };
        const config = statusConfig[estado] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            text: 'Estado Desconocido'
        };
        return (_jsx(Badge, { className: config.color, children: config.text }));
    };
    const getTypeIcon = (tipo) => {
        return tipo === 'servicio' ? _jsx(Calendar, { className: "h-4 w-4" }) : _jsx(Package, { className: "h-4 w-4" });
    };
    const getStatusMessage = (estado) => {
        const messages = {
            activo: 'Tu producto está activo y visible para los compradores.',
            pendiente_revision: 'Tu producto está siendo revisado por los moderadores.',
            rechazado: 'Tu producto fue rechazado. Haz clic en "Corregir" para ver el motivo y hacer los cambios necesarios.',
            suspendido: 'Tu producto ha sido suspendido por una violación grave. Puedes apelar esta decisión para solicitar una revisión.',
            peligroso: 'Tu producto fue marcado como peligroso. No se puede editar ni apelar. Contacta al equipo de moderación si crees que es un error.',
            en_apelacion: 'Tu apelación está siendo revisada por los moderadores. Recibirás una respuesta pronto.'
        };
        return messages[estado] || 'Estado desconocido';
    };
    if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardContent, { className: "text-center py-12", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Acceso denegado" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Solo los vendedores pueden acceder a esta p\u00E1gina." }), _jsx(Link, { to: "/products", children: _jsx(Button, { children: "Volver a productos" }) })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("header", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8", children: _jsxs("div", { className: "flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6", children: [_jsx(Link, { to: "/products", className: "w-full sm:w-auto", children: _jsxs(Button, { variant: "outline", className: "bg-white/20 border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2", children: [_jsx(ArrowLeft, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Volver" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight", children: "Mis Productos" }), _jsx("p", { className: "text-blue-100 text-sm sm:text-base", children: "Gestiona tus productos y servicios publicados" })] })] }), _jsx(Link, { to: "/products/create", className: "w-full sm:w-auto", children: _jsxs(Button, { className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2", children: [_jsx(Plus, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "font-medium", children: "Crear Producto" })] }) })] }) })] }), _jsxs("main", { className: "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8", children: [dangerousProductsCount > 0 && (_jsx("div", { className: "mb-6", children: _jsxs(Alert, { className: "border-l-4 border-red-500 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), _jsx(AlertDescription, { className: "ml-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-red-900 mb-1", children: ["\u26A0\uFE0F Tienes ", dangerousProductsCount, " producto", dangerousProductsCount > 1 ? 's' : '', " marcado", dangerousProductsCount > 1 ? 's' : '', " como peligroso", dangerousProductsCount > 1 ? 's' : ''] }), _jsx("p", { className: "text-sm text-red-800", children: "Solo podras ver el informe por el cual fue marcado como peligroso, no podras ni apelar ni editar el producto y peor eliminar." })] }), _jsxs(Button, { onClick: () => navigate('/my-products/dangerous'), className: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all whitespace-nowrap", children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Ver Historial"] })] }) })] }) })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-blue-700", children: "Total productos" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-blue-900 mt-1", children: pagination.total_items })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", children: _jsx(Package, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-green-700", children: "Activos" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-green-900 mt-1", children: products.filter(p => p.estado === 'activo' && p.disponibilidad).length })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", children: _jsx("div", { className: "h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-yellow-700", children: "Pendientes" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-yellow-900 mt-1", children: products.filter(p => p.estado === 'pendiente_revision').length })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", children: _jsx("div", { className: "h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-red-700", children: "Rechazados" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-red-900 mt-1", children: products.filter(p => p.estado === 'rechazado').length })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", children: _jsx("div", { className: "h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full" }) })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-700", children: "Suspendidos" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mt-1", children: products.filter(p => p.estado === 'suspendido').length })] }), _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0", children: _jsx(AlertTriangle, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" }) })] }) }) })] }), _jsx(Card, { className: "mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200", children: _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "flex flex-col space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-xs sm:text-sm font-semibold text-gray-700 flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2 text-orange-500" }), "Estado"] }), _jsxs("select", { value: filters.estado, onChange: (e) => handleFilterChange('estado', e.target.value), className: "w-full flex h-10 sm:h-12 items-center justify-between rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors", children: [_jsx("option", { value: "", children: "Todos los estados" }), _jsx("option", { value: "activo", children: "Solo Activos" }), _jsx("option", { value: "pendiente_revision", children: "Pendientes de revisi\u00F3n" }), _jsx("option", { value: "rechazado", children: "Rechazados" }), _jsx("option", { value: "suspendido", children: "Suspendidos" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-xs sm:text-sm font-semibold text-gray-700 flex items-center", children: [_jsx(ToggleRight, { className: "h-4 w-4 mr-2 text-green-500" }), "Disponibilidad"] }), _jsxs("select", { value: filters.disponibilidad, onChange: (e) => handleFilterChange('disponibilidad', e.target.value), className: "w-full flex h-10 sm:h-12 items-center justify-between rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors", children: [_jsx("option", { value: "", children: "Toda disponibilidad" }), _jsx("option", { value: "true", children: "Solo Disponibles" }), _jsx("option", { value: "false", children: "No Disponibles" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-xs sm:text-sm font-semibold text-gray-700 flex items-center", children: [_jsx(Search, { className: "h-4 w-4 mr-2 text-blue-500" }), "Buscar por Nombre de Producto"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("input", { type: "text", value: searchInput, onChange: (e) => handleSearchInputChange(e.target.value), placeholder: "Ej: Laptop, Mueble, Servicio...", className: "w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 pr-12 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-colors", onKeyPress: (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSearch();
                                                                    }
                                                                } }), _jsx(Search, { className: "absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" })] }), _jsxs(Button, { onClick: handleSearch, className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2", children: [_jsx(Search, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "hidden sm:inline", children: "Buscar" })] })] })] }), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-blue-200", children: _jsxs("div", { className: "text-xs sm:text-sm font-medium text-blue-700 text-center sm:text-left", children: ["Mostrando ", _jsx("span", { className: "font-bold text-blue-900", children: products.length }), " de ", _jsx("span", { className: "font-bold text-blue-900", children: pagination.total_items }), " productos"] }) })] }) }) }), loading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8", children: [...Array(6)].map((_, i) => (_jsxs(Card, { className: "animate-pulse", children: [_jsx("div", { className: "h-48 bg-gray-200 rounded-t-lg" }), _jsxs(CardContent, { className: "p-4", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-2/3" })] })] }, i))) })) : products.length === 0 ? (_jsx(Card, { className: "bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl", children: _jsxs(CardContent, { className: "text-center py-16", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(Package, { className: "h-12 w-12 text-blue-600" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: "No tienes productos publicados" }), _jsx("p", { className: "text-gray-600 mb-8 text-lg max-w-md mx-auto", children: "Comienza creando tu primer producto o servicio y expande tu negocio" }), _jsx(Link, { to: "/products/create", children: _jsxs(Button, { className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4", children: [_jsx(Plus, { className: "h-5 w-5 mr-2" }), _jsx("span", { className: "font-medium", children: "Crear mi primer producto" })] }) })] }) })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8", children: products.map((product) => (_jsxs(Card, { className: "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300", children: product.total_imagenes > 0 && product.primera_imagen ? (_jsxs(_Fragment, { children: [_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-full object-cover" }), product.total_imagenes > 1 && (_jsx("div", { className: "absolute bottom-3 right-3", children: _jsxs("div", { className: "bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium", children: ["+", product.total_imagenes - 1, " m\u00E1s"] }) }))] })) : (_jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: `w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${product.tipo === 'servicio'
                                                            ? 'bg-gradient-to-br from-purple-200 to-blue-300'
                                                            : 'bg-gradient-to-br from-gray-200 to-gray-300'}`, children: _jsx(Camera, { className: `h-10 w-10 ${product.tipo === 'servicio' ? 'text-purple-600' : 'text-gray-400'}` }) }), _jsx("p", { className: "text-sm font-semibold text-gray-600 mb-1", children: "Sin Foto" }), _jsx("p", { className: "text-xs text-gray-400", children: product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'No disponible' })] })) }), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("div", { className: "bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200", children: getStatusBadge(product) }) }), _jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200", children: _jsxs(Badge, { variant: "outline", className: "bg-transparent border-gray-300 text-gray-700", children: [getTypeIcon(product.tipo), _jsx("span", { className: "ml-1 capitalize text-xs", children: product.tipo })] }) }) })] }), _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900 text-lg line-clamp-2 mb-1", children: product.nombre }), _jsxs("p", { className: "text-sm text-gray-500 font-medium", children: ["C\u00F3digo: ", product.codigo] })] }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2 leading-relaxed", children: product.descripcion }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsx("span", { className: "text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent", children: formatPrice(product.precio) }), _jsx("span", { className: "text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium", children: product.categoria_nombre })] }), _jsxs("div", { className: "text-sm text-gray-500 flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-1" }), "Publicado: ", formatDate(product.fecha_publicacion)] }), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3", children: _jsx("div", { className: "text-xs text-blue-700 font-medium leading-relaxed", children: getStatusMessage(product.estado) }) })] }), _jsxs("div", { className: "flex flex-wrap gap-2 sm:gap-3 mt-6", children: [_jsx(Link, { to: `/products/${product.id}`, className: "flex-1 min-w-[120px]", children: _jsxs(Button, { className: "w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold", children: [_jsx(Eye, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" }), _jsx("span", { children: "Ver detalles" })] }) }), product.estado === 'rechazado' && (_jsxs(Button, { onClick: () => handleEditProduct(product.id), className: "flex-1 min-w-[120px] h-10 sm:h-11 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold", children: [_jsx(Edit, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" }), _jsx("span", { children: "Corregir" })] })), product.estado === 'suspendido' && (_jsxs(Button, { onClick: () => handleAppealProduct(product), className: "flex-1 min-w-[120px] h-10 sm:h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold", children: [_jsx(MessageSquare, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" }), _jsx("span", { children: "Apelar" })] })), product.estado !== 'rechazado' && !product.es_peligroso && product.estado !== 'pendiente_revision' && product.estado !== 'suspendido' && (_jsx(Button, { onClick: () => handleEditProduct(product.id), className: "h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0", title: "Editar producto", children: _jsx(Edit, { className: "h-3 w-3 sm:h-4 sm:w-4" }) })), _jsx(Button, { onClick: () => handleDeleteProduct(product.id, product.nombre, product.estado), disabled: product.es_peligroso || product.estado === 'peligroso' || product.estado === 'pendiente_revision' || product.estado === 'suspendido', className: `h-10 w-10 sm:h-11 sm:w-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0 ${product.es_peligroso || product.estado === 'peligroso' || product.estado === 'pendiente_revision' || product.estado === 'suspendido'
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'}`, title: product.estado === 'pendiente_revision' ? 'No puedes eliminar un producto en revisión' :
                                                        product.estado === 'suspendido' ? 'No puedes eliminar un producto suspendido' :
                                                            'Eliminar producto', children: _jsx(Trash2, { className: "h-3 w-3 sm:h-4 sm:w-4" }) })] })] })] }, product.id))) })), pagination.total_pages > 1 && (_jsxs("div", { className: "flex justify-center items-center space-x-3 mt-12", children: [_jsx(Button, { variant: "outline", onClick: () => handlePageChange(pagination.current_page - 1), disabled: !pagination.has_prev, className: "h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Anterior" }), _jsx("div", { className: "flex space-x-2", children: [...Array(pagination.total_pages)].map((_, i) => {
                                    const page = i + 1;
                                    const isCurrentPage = page === pagination.current_page;
                                    return (_jsx(Button, { variant: isCurrentPage ? "default" : "outline", size: "sm", onClick: () => handlePageChange(page), className: `w-12 h-11 rounded-xl font-medium ${isCurrentPage
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg'
                                            : 'border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`, children: page }, page));
                                }) }), _jsx(Button, { variant: "outline", onClick: () => handlePageChange(pagination.current_page + 1), disabled: !pagination.has_next, className: "h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Siguiente" })] }))] }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel }), selectedProductForAppeal && (_jsx(AppealProductDialog, { isOpen: appealModalOpen, onClose: () => {
                    setAppealModalOpen(false);
                    setSelectedProductForAppeal(null);
                }, productId: selectedProductForAppeal.id, productName: selectedProductForAppeal.nombre, motivoRechazo: selectedProductForAppeal.motivo_rechazo, onSuccess: handleAppealSuccess }))] }));
};
