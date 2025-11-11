import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiData } from '../hooks/useApiData';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert, AlertDescription } from '../components/ui/Alert';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import { Package, Search, Filter, MapPin, Heart, Eye, AlertCircle } from 'lucide-react';
export const ProductsCatalogPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useAlert();
    const { data: categories } = useApiData('categories');
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    });
    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        precioMin: '',
        precioMax: '',
        ubicacion: '',
        page: 1,
        limit: 12,
        // Filtros de proximidad
        user_lat: '',
        user_lng: '',
        radio_km: '50' // Default 50km
    });
    // Estado para filtro de proximidad
    const [proximityEnabled, setProximityEnabled] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    // Estado para productos guardados
    const [savedProducts, setSavedProducts] = useState([]);
    const [savingProduct, setSavingProduct] = useState(null);
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    queryParams.append(key, value.toString());
                }
            });
            // Solo productos activos para compradores
            queryParams.append('estado', 'activo');
            queryParams.append('disponibilidad', 'true');
            const response = await fetch(`http://localhost:3001/api/products?${queryParams}`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
                setPagination(data.pagination);
            }
            else {
                setError(data.message || 'Error al cargar productos');
            }
        }
        catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error al cargar productos');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const loadSavedProducts = useCallback(async () => {
        if (!user)
            return;
        try {
            const response = await fetch('http://localhost:3001/api/products/saved', {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSavedProducts(data.data.map((p) => p.id));
            }
        }
        catch (error) {
            console.error('Error al cargar productos guardados:', error);
        }
    }, [user]);
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
    useEffect(() => {
        // Solo cargar productos guardados si NO estamos en /products/saved
        if (user && location.pathname !== '/products/saved') {
            loadSavedProducts();
        }
    }, [user, loadSavedProducts, location.pathname]);
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset page when filters change
        }));
    };
    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };
    const handleEnableProximity = () => {
        if ('geolocation' in navigator) {
            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                setFilters(prev => ({
                    ...prev,
                    user_lat: lat,
                    user_lng: lng,
                    page: 1
                }));
                setProximityEnabled(true);
                setGettingLocation(false);
                showSuccess('📍 Ubicación obtenida', 'Mostrando productos cerca de ti');
            }, (error) => {
                console.error('Error obteniendo ubicación:', error);
                setGettingLocation(false);
                showError('Error', 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
            });
        }
        else {
            showError('Error', 'Tu navegador no soporta geolocalización');
        }
    };
    const handleDisableProximity = () => {
        setFilters(prev => ({
            ...prev,
            user_lat: '',
            user_lng: '',
            page: 1
        }));
        setProximityEnabled(false);
        showSuccess('Filtro desactivado', 'Mostrando todos los productos');
    };
    const handleRadiusChange = (newRadius) => {
        setFilters(prev => ({
            ...prev,
            radio_km: newRadius,
            page: 1
        }));
    };
    const handleSaveProduct = async (productId) => {
        if (!user) {
            showError('Error', 'Debes iniciar sesión para guardar productos');
            return;
        }
        // Solo compradores y vendedores pueden guardar productos
        if (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor') {
            showError('Error', 'Solo los compradores y vendedores pueden guardar productos');
            return;
        }
        setSavingProduct(productId);
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('¡Producto guardado!', 'El producto se ha añadido a tu lista de favoritos.');
                setSavedProducts(prev => [...prev, productId]);
            }
            else {
                showError('Error', data.message || 'Error al guardar el producto');
            }
        }
        catch (error) {
            console.error('Error al guardar producto:', error);
            showError('Error', 'Error al guardar el producto');
        }
        finally {
            setSavingProduct(null);
        }
    };
    const handleUnsaveProduct = async (productId) => {
        if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor'))
            return;
        setSavingProduct(productId);
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/unsave`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
                setSavedProducts(prev => prev.filter(id => id !== productId));
            }
            else {
                showError('Error', data.message || 'Error al eliminar el producto');
            }
        }
        catch (error) {
            console.error('Error al eliminar producto:', error);
            showError('Error', 'Error al eliminar el producto');
        }
        finally {
            setSavingProduct(null);
        }
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    };
    const getStatusBadge = (product) => {
        if (product.es_peligroso) {
            return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), "Peligroso"] }));
        }
        if (!product.disponibilidad) {
            return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: [_jsx(Package, { className: "h-3 w-3 mr-1" }), "Sin Stock"] }));
        }
        return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(Package, { className: "h-3 w-3 mr-1" }), "Disponible"] }));
    };
    if (loading && products.length === 0) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse", children: _jsx(Package, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Cargando productos..." }), _jsx("p", { className: "text-gray-600 text-lg", children: "Obteniendo cat\u00E1logo de productos" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-6 py-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: "Cat\u00E1logo de Productos" }), _jsx("p", { className: "text-blue-100 text-lg", children: "Descubre productos y servicios disponibles en la plataforma" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsx(Link, { to: "/products/saved", children: _jsxs(Button, { variant: "outline", size: "sm", className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl", children: [_jsx(Heart, { className: "h-5 w-5 mr-2" }), "Mis Favoritos"] }) })), !user && (_jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", size: "sm", className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl", children: "Iniciar Sesi\u00F3n" }) }))] })] }) })] }), _jsxs("main", { className: "max-w-7xl mx-auto px-6 py-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Filter, { className: "h-5 w-5 text-gray-600 mr-2" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Filtros de b\u00FAsqueda" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Buscar" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { type: "text", placeholder: "Nombre, descripci\u00F3n...", value: filters.search, onChange: (e) => handleFilterChange('search', e.target.value), className: "pl-10" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Categor\u00EDa" }), _jsx(HierarchicalCategorySearch, { categories: categories || [], selectedCategoryId: filters.categoria, onCategorySelect: (categoryId) => handleFilterChange('categoria', categoryId), placeholder: "Seleccionar categor\u00EDa..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Precio m\u00EDnimo ($)" }), _jsx(Input, { type: "number", placeholder: "0.00", value: filters.precioMin, onChange: (e) => handleFilterChange('precioMin', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Precio m\u00E1ximo ($)" }), _jsx(Input, { type: "number", placeholder: "1000.00", value: filters.precioMax, onChange: (e) => handleFilterChange('precioMax', e.target.value) })] })] }), _jsxs("div", { className: "mt-6 border-t border-gray-200 pt-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(MapPin, { className: "h-5 w-5 text-green-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Productos cercanos a mi ubicaci\u00F3n" })] }), !proximityEnabled ? (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Button, { onClick: handleEnableProximity, disabled: gettingLocation, className: "bg-green-600 hover:bg-green-700 text-white", children: gettingLocation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" }), "Obteniendo ubicaci\u00F3n..."] })) : (_jsxs(_Fragment, { children: [_jsx(MapPin, { className: "h-4 w-4 mr-2" }), "Mostrar productos cercanos"] })) }), _jsx("p", { className: "text-sm text-gray-600", children: "Usa tu ubicaci\u00F3n actual para ver productos cerca de ti" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-green-100 rounded-full p-2", children: _jsx(MapPin, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-900", children: "Filtro de proximidad activo" }), _jsxs("p", { className: "text-xs text-green-700", children: ["Mostrando productos dentro de ", filters.radio_km, " km"] })] })] }), _jsx(Button, { onClick: handleDisableProximity, variant: "outline", size: "sm", className: "border-green-300 text-green-700 hover:bg-green-100", children: "Desactivar" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 whitespace-nowrap", children: "Radio de b\u00FAsqueda:" }), _jsxs("select", { value: filters.radio_km, onChange: (e) => handleRadiusChange(e.target.value), className: "flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500", children: [_jsx("option", { value: "5", children: "5 km" }), _jsx("option", { value: "10", children: "10 km" }), _jsx("option", { value: "25", children: "25 km" }), _jsx("option", { value: "50", children: "50 km" }), _jsx("option", { value: "100", children: "100 km" }), _jsx("option", { value: "200", children: "200 km" })] })] })] }))] }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx(Button, { onClick: () => {
                                        setFilters({
                                            search: '',
                                            categoria: '',
                                            precioMin: '',
                                            precioMax: '',
                                            ubicacion: '',
                                            page: 1,
                                            limit: 12,
                                            user_lat: '',
                                            user_lng: '',
                                            radio_km: '50'
                                        });
                                        setProximityEnabled(false);
                                    }, variant: "outline", className: "mr-3", children: "Limpiar filtros" }) })] }), _jsx("div", { className: "mb-6", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("h2", { className: "text-xl font-semibold text-gray-900", children: [pagination.total, " productos encontrados"] }) }) }), error ? (_jsxs(Alert, { className: "border-red-200 bg-red-50 rounded-lg", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertDescription, { className: "text-red-800", children: error })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: products.map((product) => (_jsx(Card, { className: "group hover:shadow-xl transition-all duration-300 border-0 shadow-lg", children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "relative overflow-hidden rounded-t-xl", children: [product.primera_imagen ? (_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" })) : (_jsx("div", { className: "w-full h-48 bg-gray-100 flex items-center justify-center", children: _jsx(Package, { className: "h-12 w-12 text-gray-400" }) })), product.total_imagenes > 1 && (_jsx("div", { className: "absolute top-2 right-2", children: _jsxs("span", { className: "bg-black/70 text-white text-xs px-2 py-1 rounded-full", children: ["+", product.total_imagenes - 1] }) })), (user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsx("div", { className: "absolute top-2 left-2", children: _jsx(Button, { size: "sm", variant: "outline", className: `h-8 w-8 p-0 rounded-full ${savedProducts.includes(product.id)
                                                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                                        : 'bg-white/90 text-gray-600 border-white/90 hover:bg-white'}`, onClick: () => savedProducts.includes(product.id)
                                                        ? handleUnsaveProduct(product.id)
                                                        : handleSaveProduct(product.id), disabled: savingProduct === product.id, children: _jsx(Heart, { className: `h-4 w-4 ${savedProducts.includes(product.id) ? 'fill-current' : ''}` }) }) })), _jsx("div", { className: "absolute bottom-2 left-2", children: getStatusBadge(product) })] }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-900 text-sm mb-1 line-clamp-2", children: product.nombre }), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: product.categoria_nombre }), (product.ubicacion_provincia || product.ubicacion_canton) && (_jsxs("div", { className: "flex items-center text-xs text-gray-500 mb-2", children: [_jsx(MapPin, { className: "h-3 w-3 mr-1" }), _jsx("span", { className: "truncate", children: product.ubicacion_provincia && product.ubicacion_canton
                                                                    ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                                                    : product.ubicacion_provincia || product.ubicacion_canton })] })), proximityEnabled && product.distancia !== undefined && product.distancia !== null && (_jsxs("div", { className: "flex items-center text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-1 mb-2", children: [_jsx(MapPin, { className: "h-3 w-3 mr-1" }), _jsxs("span", { children: ["A ", product.distancia.toFixed(1), " km de ti"] })] }))] }), _jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "text-lg font-bold text-gray-900", children: formatPrice(product.precio) }), _jsx("span", { className: "text-xs text-gray-500", children: product.tipo === 'servicio' ? 'Servicio' : 'Producto' })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Link, { to: `/products/view/${product.id}`, className: "flex-1", children: _jsxs(Button, { size: "sm", className: "w-full h-8 text-xs bg-blue-600 hover:bg-blue-700", children: [_jsx(Eye, { className: "h-3 w-3 mr-1" }), "Ver detalles"] }) }), (user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsx(Button, { size: "sm", variant: "outline", className: "h-8 w-8 p-0", onClick: () => savedProducts.includes(product.id)
                                                            ? handleUnsaveProduct(product.id)
                                                            : handleSaveProduct(product.id), disabled: savingProduct === product.id, children: savingProduct === product.id ? (_jsx("div", { className: "animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" })) : (_jsx(Heart, { className: `h-3 w-3 ${savedProducts.includes(product.id) ? 'fill-current text-red-500' : ''}` })) }))] })] })] }) }, product.id))) })), pagination.totalPages > 1 && (_jsx("div", { className: "mt-8 flex justify-center", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(pagination.page - 1), disabled: pagination.page === 1, children: "Anterior" }), Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (_jsx(Button, { variant: pagination.page === page ? "default" : "outline", size: "sm", onClick: () => handlePageChange(page), children: page }, page));
                                }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(pagination.page + 1), disabled: pagination.page === pagination.totalPages, children: "Siguiente" })] }) }))] })] }));
};
