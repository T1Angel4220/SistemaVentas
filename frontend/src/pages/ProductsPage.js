import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, Plus, Package, MapPin, Calendar, Heart, Eye, ShoppingCart, DollarSign, Shield, Camera, Flag, X } from 'lucide-react';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import HierarchicalLocationSearch from '../components/ui/HierarchicalLocationSearch';
import { ReportProductDialog } from '../components/ui/ReportProductDialog';
export const ProductsPage = () => {
    const { user } = useAuth();
    const { canModerateProduct, getRoleDisplayName, getRoleColor } = usePermissions();
    const { showSuccess, showError } = useAlert();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 12,
        has_next: false,
        has_prev: false
    });
    // Filtros optimizados para muchos datos
    const [filters, setFilters] = useState({
        search: '',
        categoria_id: '',
        tipo: '',
        precio_min: '',
        precio_max: '',
        estado: 'activo', // Por defecto solo activos
        disponibilidad: 'true', // Por defecto solo disponibles
        provincia: '',
        canton: '',
        distrito: '',
        direccion: '',
        page: 1,
        limit: 12
    });
    // Filtros de proximidad
    const [proximityFilters, setProximityFilters] = useState({
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
    // Estado para modal de reportes
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedProductForReport, setSelectedProductForReport] = useState(null);
    // Estado para mostrar/ocultar filtros de ubicación
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            // Agregar filtros normales
            Object.entries(filters).forEach(([key, value]) => {
                if (value)
                    queryParams.append(key, value.toString());
            });
            // Agregar filtros de proximidad si están habilitados
            if (proximityEnabled && proximityFilters.user_lat && proximityFilters.user_lng) {
                queryParams.append('user_lat', proximityFilters.user_lat);
                queryParams.append('user_lng', proximityFilters.user_lng);
                queryParams.append('radio_km', proximityFilters.radio_km);
                console.log('🌍 Cargando productos con filtro de proximidad:');
                console.log('   → Latitud usuario:', proximityFilters.user_lat);
                console.log('   → Longitud usuario:', proximityFilters.user_lng);
                console.log('   → Radio de búsqueda:', proximityFilters.radio_km, 'km');
            }
            else {
                console.log('📦 Cargando productos sin filtro de proximidad');
            }
            const response = await fetch(`http://localhost:3001/api/products?${queryParams}`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
                setPagination(data.pagination);
                // Log cuando se usa filtro de proximidad
                if (proximityEnabled) {
                    const productosConDistancia = data.data.filter(p => p.distancia !== undefined && p.distancia !== null);
                    console.log('✅ Productos recibidos con filtro de proximidad:');
                    console.log('   → Total de productos:', data.data.length);
                    console.log('   → Productos con distancia calculada:', productosConDistancia.length);
                    if (productosConDistancia.length > 0) {
                        console.log('   → Producto más cercano:', {
                            nombre: productosConDistancia[0].nombre,
                            distancia: productosConDistancia[0].distancia?.toFixed(2) + ' km'
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error al cargar productos:', error);
        }
        finally {
            setLoading(false);
        }
    }, [filters, proximityEnabled, proximityFilters]);
    const loadCategories = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        }
        catch (error) {
            console.error('Error al cargar categorías:', error);
            // No mostrar error al usuario, solo log
        }
    };
    const loadLocations = async () => {
        try {
            // Pedir todas las ubicaciones (sin paginación)
            const response = await fetch('http://localhost:3001/api/locations?limit=1000');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setLocations(data.data);
            }
        }
        catch (error) {
            console.error('Error al cargar ubicaciones:', error);
            // No mostrar error al usuario, solo log
        }
    };
    const loadSavedProducts = useCallback(async () => {
        if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor'))
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
    // Cargar datos iniciales
    useEffect(() => {
        loadProducts();
        // Solo cargar categorías si no están cargadas
        if (categories.length === 0) {
            loadCategories();
        }
        // Solo cargar ubicaciones si no están cargadas
        if (locations.length === 0) {
            loadLocations();
        }
    }, [loadProducts, categories.length, locations.length]);
    useEffect(() => {
        if (user) {
            loadSavedProducts();
        }
    }, [user, loadSavedProducts]);
    const handleSaveProduct = async (productId) => {
        if (!user) {
            showError('Error', 'Debes iniciar sesión para guardar productos');
            return;
        }
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
    const handleReportProduct = (product) => {
        setSelectedProductForReport({
            id: product.id,
            nombre: product.nombre
        });
        setReportModalOpen(true);
    };
    const handleReportSuccess = () => {
        showSuccess('¡Reporte enviado!', user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador'
            ? 'Tu reporte será revisado por otro moderador o administrador.'
            : 'Tu reporte será revisado por un moderador.');
        setReportModalOpen(false);
        setSelectedProductForReport(null);
        loadProducts(); // Recargar productos
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
    };
    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };
    const handleEnableProximity = () => {
        if ('geolocation' in navigator) {
            setGettingLocation(true);
            console.log('📍 Solicitando ubicación del usuario...');
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                const accuracy = position.coords.accuracy;
                console.log('✅ Ubicación obtenida exitosamente:');
                console.log('   → Latitud:', lat);
                console.log('   → Longitud:', lng);
                console.log('   → Precisión:', accuracy, 'metros');
                console.log('   → Radio de búsqueda: 50 km (por defecto)');
                console.log('   → Coordenadas completas:', position.coords);
                setProximityFilters({
                    user_lat: lat,
                    user_lng: lng,
                    radio_km: '50'
                });
                setProximityEnabled(true);
                setGettingLocation(false);
                showSuccess('📍 Ubicación obtenida', 'Mostrando productos cerca de ti');
            }, (error) => {
                console.error('❌ Error obteniendo ubicación:', error);
                console.error('   → Código de error:', error.code);
                console.error('   → Mensaje:', error.message);
                setGettingLocation(false);
                showError('Error', 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
            });
        }
        else {
            console.error('❌ Tu navegador no soporta geolocalización');
            showError('Error', 'Tu navegador no soporta geolocalización');
        }
    };
    const handleDisableProximity = () => {
        setProximityFilters({
            user_lat: '',
            user_lng: '',
            radio_km: '50'
        });
        setProximityEnabled(false);
        showSuccess('Filtro desactivado', 'Mostrando todos los productos');
    };
    const handleRadiusChange = (newRadius) => {
        console.log('📏 Radio de búsqueda actualizado:', newRadius, 'km');
        console.log('   → Ubicación actual:', {
            lat: proximityFilters.user_lat,
            lng: proximityFilters.user_lng,
            nuevo_radio: newRadius
        });
        setProximityFilters(prev => ({
            ...prev,
            radio_km: newRadius
        }));
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price) + ' USD';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4", children: _jsx(Package, { className: "w-10 h-10 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold", children: "Productos y Servicios" }), _jsx("p", { className: "text-blue-100 text-lg mt-2", children: "Descubre una amplia variedad de productos y servicios de calidad" })] })] }), _jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-4", children: [user?.tipo_usuario === 'vendedor' && (_jsx(Link, { to: "/products/create", children: _jsxs(Button, { size: "lg", className: "bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300", children: [_jsx(Plus, { className: "h-5 w-5 mr-2" }), "Crear Producto"] }) })), user?.tipo_usuario === 'vendedor' && (_jsx(Link, { to: "/my-products", children: _jsxs(Button, { size: "lg", variant: "outline", className: "bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300", children: [_jsx(Package, { className: "h-5 w-5 mr-2" }), "Mis Productos"] }) })), (user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsx(Link, { to: "/products/saved", children: _jsxs(Button, { size: "lg", variant: "outline", className: "bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300", children: [_jsx(Heart, { className: "h-5 w-5 mr-2" }), "Mis Favoritos"] }) })), canModerateProduct() && (_jsx(Link, { to: "/products/moderation", children: _jsxs(Button, { size: "lg", variant: "outline", className: "bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Moderaci\u00F3n"] }) }))] }), user && (_jsx("div", { className: "mt-6 flex justify-center", children: _jsx(Badge, { className: `${getRoleColor()} px-4 py-2 text-sm font-medium`, children: getRoleDisplayName() }) }))] }) }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10", children: [_jsxs(Card, { className: "mb-12 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: [_jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-6", children: _jsxs(CardTitle, { className: "flex items-center space-x-3 text-gray-800", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center", children: _jsx(Filter, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xl font-bold", children: "Filtros de B\u00FAsqueda" }), _jsx("p", { className: "text-sm text-gray-600 font-normal", children: "Encuentra exactamente lo que buscas" })] })] }) }), _jsxs(CardContent, { className: "p-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "relative md:col-span-2", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }), _jsx(Input, { placeholder: "Buscar productos, servicios, c\u00F3digos...", value: filters.search, onChange: (e) => handleFilterChange('search', e.target.value), className: "pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm" })] }), _jsxs("select", { value: filters.tipo, onChange: (e) => handleFilterChange('tipo', e.target.value), className: "h-12 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md", children: [_jsx("option", { value: "", children: "Todos los tipos" }), _jsx("option", { value: "producto", children: "Solo Productos" }), _jsx("option", { value: "servicio", children: "Solo Servicios" })] })] }), _jsxs("div", { className: "border-t border-gray-100 pt-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [_jsx(Search, { className: "h-4 w-4 mr-2 text-blue-500" }), "Categor\u00EDa"] }), _jsx(HierarchicalCategorySearch, { categories: categories, selectedCategoryId: filters.categoria_id, onCategorySelect: (categoryId) => {
                                                                            handleFilterChange('categoria_id', categoryId);
                                                                        }, loading: false, placeholder: "Buscar categor\u00EDa..." })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2 text-green-500" }), "Precio m\u00EDnimo (USD)"] }), _jsx(Input, { type: "number", placeholder: "Precio m\u00EDnimo", value: filters.precio_min, onChange: (e) => handleFilterChange('precio_min', e.target.value), className: "h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2 text-green-500" }), "Precio m\u00E1ximo (USD)"] }), _jsx(Input, { type: "number", placeholder: "Precio m\u00E1ximo", value: filters.precio_max, onChange: (e) => handleFilterChange('precio_max', e.target.value), className: "h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [_jsxs(Button, { onClick: () => setShowLocationFilter(!showLocationFilter), variant: "outline", className: "w-full md:w-auto border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl flex items-center justify-center space-x-2 h-12", children: [_jsx(MapPin, { className: "h-5 w-5" }), _jsx("span", { children: showLocationFilter ? 'Ocultar filtros de ubicación' : 'Filtrar por ubicación' })] }), _jsx(Button, { onClick: proximityEnabled ? handleDisableProximity : handleEnableProximity, disabled: gettingLocation, variant: "outline", className: `w-full md:w-auto rounded-xl flex items-center justify-center space-x-2 h-12 ${proximityEnabled
                                                                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                                                                            : 'border-green-300 text-green-700 hover:bg-green-50'}`, children: gettingLocation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-green-700 border-t-transparent rounded-full" }), _jsx("span", { children: "Obteniendo ubicaci\u00F3n..." })] })) : proximityEnabled ? (_jsxs(_Fragment, { children: [_jsx(X, { className: "h-5 w-5" }), _jsxs("span", { children: ["Desactivar proximidad (", proximityFilters.radio_km, " km)"] })] })) : (_jsxs(_Fragment, { children: [_jsx(MapPin, { className: "h-5 w-5" }), _jsx("span", { children: "Filtrar por mi ubicaci\u00F3n actual" })] })) })] }), proximityEnabled && (_jsx("div", { className: "bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-green-100 rounded-full p-2", children: _jsx(MapPin, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-green-900", children: "Filtro de proximidad activo" }), _jsxs("p", { className: "text-xs text-green-700", children: ["Mostrando productos dentro de ", proximityFilters.radio_km, " km"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("label", { className: "text-sm font-medium text-green-900 whitespace-nowrap", children: "Radio:" }), _jsxs("select", { value: proximityFilters.radio_km, onChange: (e) => handleRadiusChange(e.target.value), className: "h-9 rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white", children: [_jsx("option", { value: "5", children: "5 km" }), _jsx("option", { value: "10", children: "10 km" }), _jsx("option", { value: "25", children: "25 km" }), _jsx("option", { value: "50", children: "50 km" }), _jsx("option", { value: "100", children: "100 km" }), _jsx("option", { value: "200", children: "200 km" })] })] })] }) })), showLocationFilter && (_jsxs("div", { className: "bg-purple-50/50 border-2 border-purple-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx(MapPin, { className: "h-5 w-5 text-purple-600" }), _jsx("h3", { className: "font-semibold text-purple-900", children: "Filtrar por Provincia/Cant\u00F3n" })] }), _jsx(HierarchicalLocationSearch, { locations: locations, onLocationSelect: (locationData) => {
                                                                            setFilters(prev => ({
                                                                                ...prev,
                                                                                provincia: locationData.provincia,
                                                                                canton: locationData.canton,
                                                                                distrito: locationData.distrito,
                                                                                direccion: locationData.direccion,
                                                                                page: 1
                                                                            }));
                                                                        }, loading: locations.length === 0, initialProvincia: filters.provincia, initialCanton: filters.canton, initialDistrito: filters.distrito, initialDireccion: filters.direccion })] }))] })] })] }), _jsxs("div", { className: "flex items-center justify-between mt-6 pt-6 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { onClick: () => {
                                                            setFilters({
                                                                search: '',
                                                                categoria_id: '',
                                                                tipo: '',
                                                                precio_min: '',
                                                                precio_max: '',
                                                                estado: 'activo',
                                                                disponibilidad: 'true',
                                                                provincia: '',
                                                                canton: '',
                                                                distrito: '',
                                                                direccion: '',
                                                                page: 1,
                                                                limit: 12
                                                            });
                                                            // Limpiar filtros de proximidad
                                                            setProximityFilters({
                                                                user_lat: '',
                                                                user_lng: '',
                                                                radio_km: '50'
                                                            });
                                                            setProximityEnabled(false);
                                                        }, variant: "outline", className: "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md", children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "\uD83E\uDDF9 Limpiar todos los filtros"] }), _jsxs("span", { className: "text-sm text-gray-500", children: [pagination.total_items, " producto", pagination.total_items !== 1 ? 's' : '', " encontrado", pagination.total_items !== 1 ? 's' : ''] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Mostrar:" }), _jsxs("select", { value: filters.limit, onChange: (e) => handleFilterChange('limit', e.target.value), className: "h-8 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "12", children: "12 por p\u00E1gina" }), _jsx("option", { value: "24", children: "24 por p\u00E1gina" }), _jsx("option", { value: "48", children: "48 por p\u00E1gina" })] })] })] })] })] }), _jsx("div", { className: "mb-10", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "h-4 w-4 text-blue-600" }) }), _jsx("span", { className: "text-lg font-semibold text-gray-900", children: "Resultados de b\u00FAsqueda" })] }) }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10", children: [...Array(6)].map((_, i) => (_jsxs(Card, { className: "animate-pulse shadow-xl rounded-2xl overflow-hidden", children: [_jsx("div", { className: "h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" }), _jsxs(CardContent, { className: "p-7 space-y-5", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-6 bg-gray-200 rounded-xl" }), _jsx("div", { className: "h-4 bg-gray-200 rounded-lg" }), _jsx("div", { className: "h-4 bg-gray-200 rounded-lg w-3/4" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-10 bg-gray-200 rounded-xl w-2/3" }), _jsx("div", { className: "h-6 bg-gray-200 rounded-full w-1/2" })] }), _jsx("div", { className: "h-12 bg-gray-200 rounded-xl" })] })] }, i))) })) : products.length === 0 ? (_jsx(Card, { className: "shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "text-center py-20", children: [_jsx("div", { className: "w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg", children: _jsx(Package, { className: "h-16 w-16 text-blue-500" }) }), _jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-4", children: "No se encontraron productos" }), _jsx("p", { className: "text-gray-600 text-lg mb-8 max-w-md mx-auto", children: "Intenta ajustar los filtros de b\u00FAsqueda o explorar otras categor\u00EDas para encontrar lo que buscas" }), _jsxs(Button, { onClick: () => {
                                        setFilters({
                                            search: '',
                                            categoria_id: '',
                                            tipo: '',
                                            precio_min: '',
                                            precio_max: '',
                                            estado: 'activo',
                                            disponibilidad: 'true',
                                            provincia: '',
                                            canton: '',
                                            distrito: '',
                                            direccion: '',
                                            page: 1,
                                            limit: 12
                                        });
                                        // Limpiar filtros de proximidad
                                        setProximityFilters({
                                            user_lat: '',
                                            user_lng: '',
                                            radio_km: '50'
                                        });
                                        setProximityEnabled(false);
                                    }, className: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3 font-semibold", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), "\uD83E\uDDF9 Limpiar todos los filtros"] })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10", children: products.map((product) => (_jsxs(Card, { className: `group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden flex flex-col ${product.tipo === 'servicio'
                                ? 'bg-gradient-to-br from-purple-50/90 to-blue-50/90 border-2 border-purple-200'
                                : 'bg-white/90 border-0'}`, children: [_jsxs("div", { className: "relative overflow-hidden", children: [_jsx("div", { className: "h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300", children: product.total_imagenes > 0 && product.primera_imagen ? (_jsxs(_Fragment, { children: [_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-full object-cover" }), product.total_imagenes > 1 && (_jsx("div", { className: "absolute bottom-3 right-3", children: _jsxs("div", { className: "bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium", children: ["+", product.total_imagenes - 1, " m\u00E1s"] }) }))] })) : (_jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg", children: _jsx(Camera, { className: "h-10 w-10 text-gray-400" }) }), _jsx("p", { className: "text-sm font-semibold text-gray-600 mb-1", children: "Sin Foto" }), _jsx("p", { className: "text-xs text-gray-400", children: product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'No disponible' })] })) }), user && (user.tipo_usuario === 'moderador' ||
                                            user.tipo_usuario === 'administrador' ||
                                            product.vendedor_id === user.id) && (_jsx("div", { className: "absolute top-4 right-4", children: getStatusBadge(product) })), _jsx("div", { className: "absolute top-4 left-4", children: _jsxs(Badge, { className: `backdrop-blur-sm shadow-lg px-3 py-1.5 rounded-full font-semibold ${product.tipo === 'servicio'
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
                                                    : 'bg-white/95 text-gray-700 border-0'}`, children: [getTypeIcon(product.tipo), _jsx("span", { className: "ml-2 capitalize text-sm", children: product.tipo })] }) })] }), _jsxs(CardContent, { className: "p-7 flex flex-col flex-grow", children: [_jsxs("div", { className: "space-y-5 flex-grow", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-bold text-gray-900 line-clamp-2 text-lg leading-snug group-hover:text-blue-600 transition-colors min-h-[3.5rem]", children: product.nombre }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]", children: product.descripcion })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex items-baseline space-x-2", children: _jsx("span", { className: "text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent", children: formatPrice(product.precio) }) }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx("span", { className: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold", children: product.categoria_nombre }) })] }), _jsxs("div", { className: "space-y-2.5 pt-3 border-t border-gray-100", children: [(product.ubicacion_provincia || product.ubicacion_canton) && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx("div", { className: "w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { className: "h-3 w-3 text-blue-500" }) }), _jsx("span", { className: "truncate", children: product.ubicacion_provincia && product.ubicacion_canton
                                                                        ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                                                        : product.ubicacion_provincia || product.ubicacion_canton })] })), proximityEnabled && product.distancia !== undefined && product.distancia !== null && (_jsxs("div", { className: "flex items-center space-x-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-1.5", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsxs("span", { children: ["A ", product.distancia.toFixed(1), " km de ti"] })] })), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { className: "font-medium truncate flex-1 mr-2", children: ["Por: ", product.vendedor_nombre] }), _jsx("span", { className: "flex-shrink-0", children: formatDate(product.fecha_publicacion) })] })] })] }), _jsxs("div", { className: "flex space-x-3 mt-7 pt-6 border-t border-gray-100", children: [_jsx(Link, { to: `/products/${product.id}`, className: "flex-1", children: _jsxs(Button, { className: "w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-sm font-semibold", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Ver detalles"] }) }), (user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => savedProducts.includes(product.id)
                                                                ? handleUnsaveProduct(product.id)
                                                                : handleSaveProduct(product.id), disabled: savingProduct === product.id, className: `w-11 h-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl ${savedProducts.includes(product.id)
                                                                ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                                                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'} text-white`, children: savingProduct === product.id ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Heart, { className: `h-4 w-4 ${savedProducts.includes(product.id) ? 'fill-current' : ''}` })) }), _jsx(Link, { to: `/products/contact/${product.id}`, children: _jsx(Button, { className: "w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl", children: _jsx(ShoppingCart, { className: "h-4 w-4" }) }) })] })), (user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador') && (_jsx(Button, { onClick: () => handleReportProduct(product), className: "w-11 h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl", title: "Reportar producto", children: _jsx(Flag, { className: "h-4 w-4" }) }))] })] })] }, product.id))) })), pagination.total_pages > 1 && (_jsxs("div", { className: "flex justify-center items-center space-x-3 mt-16", children: [_jsx(Button, { onClick: () => handlePageChange(pagination.current_page - 1), disabled: !pagination.has_prev, className: "bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3", children: "Anterior" }), _jsx("div", { className: "flex space-x-2", children: [...Array(pagination.total_pages)].map((_, i) => {
                                    const page = i + 1;
                                    const isCurrentPage = page === pagination.current_page;
                                    return (_jsx(Button, { onClick: () => handlePageChange(page), className: `w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${isCurrentPage
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'}`, children: page }, page));
                                }) }), _jsx(Button, { onClick: () => handlePageChange(pagination.current_page + 1), disabled: !pagination.has_next, className: "bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3", children: "Siguiente" })] }))] }), selectedProductForReport && (_jsx(ReportProductDialog, { isOpen: reportModalOpen, onClose: () => {
                    setReportModalOpen(false);
                    setSelectedProductForReport(null);
                }, productId: selectedProductForReport.id, productName: selectedProductForReport.nombre, onSuccess: handleReportSuccess }))] }));
};
