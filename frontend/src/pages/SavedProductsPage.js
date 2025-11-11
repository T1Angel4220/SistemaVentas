import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Package, Heart, HeartOff, Eye, AlertCircle, MapPin, ArrowLeft, ShoppingCart, Calendar } from 'lucide-react';
export const SavedProductsPage = () => {
    const { user } = useAuth();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const location = useLocation();
    const [savedProducts, setSavedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingProduct, setRemovingProduct] = useState(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const loadSavedProducts = useCallback(async () => {
        if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor'))
            return;
        // Evitar múltiples peticiones simultáneas
        if (isLoadingProducts) {
            console.log('⏳ Ya hay una petición en curso, saltando...');
            return;
        }
        // Verificar que el token existe antes de hacer la petición
        const token = apiService.getToken();
        if (!token) {
            console.error('No hay token disponible');
            setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            setLoading(false);
            return;
        }
        try {
            setIsLoadingProducts(true);
            setLoading(true);
            setError(null);
            console.log('🔍 Haciendo petición a /products/saved con token:', token.substring(0, 20) + '...');
            const response = await fetch('http://localhost:3001/api/products/saved', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('📊 Respuesta recibida:', response.status, response.statusText);
            const data = await response.json();
            if (data.success) {
                console.log('✅ Productos guardados cargados:', data.data.length);
                setSavedProducts(data.data);
            }
            else {
                console.error('❌ Error del servidor:', data.message);
                setError(data.message || 'Error al cargar productos guardados');
            }
        }
        catch (error) {
            console.error('❌ Error de conexión:', error);
            setError('Error al cargar productos guardados');
        }
        finally {
            setLoading(false);
            setIsLoadingProducts(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // isLoadingProducts se omite intencionalmente para evitar bucles infinitos
    useEffect(() => {
        if (location.pathname === '/products/saved') {
            if (user && (user.tipo_usuario === 'comprador' || user.tipo_usuario === 'vendedor')) {
                loadSavedProducts();
            }
            else {
                setLoading(false);
                setError('Debes iniciar sesión como comprador o vendedor para ver tus productos guardados');
            }
        }
    }, [user, loadSavedProducts, location.pathname]);
    const handleRemoveProduct = async (product) => {
        showWarning('💔 ¿Eliminar de favoritos?', `¿Estás seguro de que quieres eliminar "${product.nombre}" de tu lista de favoritos?`, async () => {
            setRemovingProduct(product.id);
            try {
                const response = await fetch(`http://localhost:3001/api/products/${product.id}/unsave`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${apiService.getToken()}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    showSuccess('💔 ¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
                    setSavedProducts(prev => prev.filter(p => p.id !== product.id));
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
                setRemovingProduct(null);
            }
        }, undefined);
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
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
        if (product.es_peligroso) {
            return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), "Peligroso"] }));
        }
        if (!product.disponibilidad) {
            return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700", children: [_jsx(Package, { className: "h-3 w-3 mr-1" }), "Sin Stock"] }));
        }
        return (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(Package, { className: "h-3 w-3 mr-1" }), "Disponible"] }));
    };
    if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsx(Card, { className: "max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "text-center py-12", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(Heart, { className: "h-12 w-12 text-blue-500" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: !user ? 'Inicia sesión' : 'Acceso restringido' }), _jsx("p", { className: "text-gray-600 text-lg mb-8", children: !user
                                ? 'Debes iniciar sesión como comprador o vendedor para ver tus productos guardados'
                                : 'Solo los compradores y vendedores pueden acceder a esta sección' }), _jsx(Link, { to: !user ? "/login" : "/products", children: _jsx(Button, { className: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3", children: !user ? 'Iniciar sesión' : 'Volver a productos' }) })] }) }) }));
    }
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse", children: _jsx(Heart, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Cargando favoritos..." }), _jsx("p", { className: "text-gray-600 text-lg", children: "Obteniendo tus productos guardados" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("header", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8", children: _jsxs("div", { className: "flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6", children: [_jsx(Link, { to: "/products", className: "w-full sm:w-auto", children: _jsxs(Button, { variant: "outline", className: "bg-white/20 border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2", children: [_jsx(ArrowLeft, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Regresar" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight", children: "Mis Favoritos" }), _jsx("p", { className: "text-blue-100 text-sm sm:text-base md:text-lg", children: "Productos y servicios que te interesan" })] })] }), _jsx("div", { className: "flex items-center justify-center sm:justify-end", children: _jsxs("div", { className: "bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 text-center border border-white/30 shadow-lg", children: [_jsx("div", { className: "text-xl sm:text-2xl md:text-3xl font-bold", children: savedProducts.length }), _jsx("div", { className: "text-blue-100 text-xs sm:text-sm", children: "productos guardados" })] }) })] }) })] }), _jsx("main", { className: "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8", children: error ? (_jsxs(Alert, { className: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl mb-6 shadow-lg", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-600" }), _jsx(AlertDescription, { className: "text-red-800 text-sm sm:text-base", children: error })] })) : savedProducts.length === 0 ? (_jsx(Card, { className: "bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl", children: _jsxs(CardContent, { className: "text-center py-12 sm:py-16", children: [_jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(Heart, { className: "h-10 w-10 sm:h-12 sm:w-12 text-red-500" }) }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4", children: "No tienes productos guardados" }), _jsx("p", { className: "text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto", children: "Explora el cat\u00E1logo de productos y guarda los que te interesen con el bot\u00F3n \u2764\uFE0F" }), _jsx(Link, { to: "/products", children: _jsxs(Button, { className: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 sm:px-8 py-3 text-sm sm:text-base", children: [_jsx(ShoppingCart, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Explorar productos"] }) })] }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8", children: savedProducts.map((product) => (_jsxs(Card, { className: "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: `h-48 sm:h-56 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 ${product.primera_imagen
                                                    ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                                                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300'}`, children: product.primera_imagen ? (_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-full object-cover" })) : (_jsxs("div", { className: "text-center text-gray-400", children: [_jsx(Package, { className: "h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-40" }), _jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-400", children: "Sin imagen" })] })) }), product.total_imagenes > 1 && (_jsx("div", { className: "absolute bottom-3 right-3", children: _jsxs("div", { className: "bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium", children: ["+", product.total_imagenes - 1, " m\u00E1s"] }) })), _jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200", children: getStatusBadge(product) }) }), _jsx("div", { className: "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: _jsx(Button, { className: "w-10 h-10 sm:w-11 sm:h-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white", onClick: () => handleRemoveProduct(product), disabled: removingProduct === product.id, title: "Eliminar de favoritos", children: removingProduct === product.id ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(HeartOff, { className: "h-4 w-4 sm:h-5 sm:w-5 hover:scale-110 transition-transform duration-200" })) }) })] }), _jsx(CardContent, { className: "p-4 sm:p-5 md:p-6", children: _jsxs("div", { className: "space-y-3 sm:space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900 text-base sm:text-lg line-clamp-2 mb-1", children: product.nombre }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full inline-block", children: product.categoria_nombre })] }), _jsxs("div", { className: "space-y-2", children: [(product.ubicacion_provincia || product.ubicacion_canton) && (_jsxs("div", { className: "flex items-center text-xs sm:text-sm text-gray-600", children: [_jsx("div", { className: "w-4 h-4 sm:w-5 sm:h-5 mr-2 flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { className: "h-3 w-3 sm:h-4 sm:w-4 text-blue-500" }) }), _jsx("span", { className: "truncate font-medium", children: product.ubicacion_provincia && product.ubicacion_canton
                                                                        ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                                                        : product.ubicacion_provincia || product.ubicacion_canton || 'Sin ubicación' })] })), _jsxs("div", { className: "flex items-center text-xs sm:text-sm text-gray-600", children: [_jsx("div", { className: "w-4 h-4 sm:w-5 sm:h-5 mr-2 flex items-center justify-center flex-shrink-0", children: _jsx(Calendar, { className: "h-3 w-3 sm:h-4 sm:w-4 text-purple-500" }) }), _jsx("span", { className: "font-medium", children: formatDate(product.fecha_publicacion) })] })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-t border-gray-100", children: [_jsx("span", { className: "text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent", children: formatPrice(product.precio) }), _jsx("span", { className: "text-xs sm:text-sm text-gray-500 capitalize bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium", children: product.tipo === 'servicio' ? '🔧 Servicio' : '📦 Producto' })] }), _jsxs("div", { className: "flex space-x-2 sm:space-x-3 pt-2", children: [_jsx(Link, { to: `/products/${product.id}`, className: "flex-1", children: _jsxs(Button, { className: "w-full h-10 sm:h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold", children: [_jsx(Eye, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" }), _jsx("span", { children: "Ver detalles" })] }) }), _jsx(Button, { onClick: () => handleRemoveProduct(product), disabled: removingProduct === product.id, className: "h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0", title: "Eliminar de favoritos", children: removingProduct === product.id ? (_jsx("div", { className: "animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white" })) : (_jsx(HeartOff, { className: "h-3 w-3 sm:h-4 sm:w-4" })) })] })] }) })] }, product.id))) }), _jsx("div", { className: "mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg", children: _jsxs("div", { className: "flex items-start space-x-3 sm:space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md", children: _jsx(Heart, { className: "h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-current" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-blue-900 mb-2 text-sm sm:text-base flex items-center", children: "\u2139\uFE0F \u00BFC\u00F3mo funciona?" }), _jsxs("p", { className: "text-blue-800 text-xs sm:text-sm leading-relaxed", children: ["Los productos que guardes con el bot\u00F3n ", _jsx("span", { className: "inline-flex items-center mx-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold", children: "\u2764\uFE0F" }), " aparecer\u00E1n aqu\u00ED. Puedes verlos en cualquier momento y contactar al vendedor cuando est\u00E9s listo para comprar."] }), _jsx("div", { className: "mt-3 pt-3 border-t border-blue-200", children: _jsxs("p", { className: "text-blue-700 text-xs sm:text-sm font-medium", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Para eliminar un producto de favoritos, haz clic en el coraz\u00F3n tachado \uD83D\uDC94"] }) })] })] }) })] })) }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
