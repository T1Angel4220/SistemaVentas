import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Package, MapPin, ArrowLeft, Clock, Calendar, Timer, Tag, FileText, Heart, MessageCircle, Flag, User } from 'lucide-react';
export const ProductViewPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    // Estado para productos guardados
    const [isSaved, setIsSaved] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    };
    const handleMouseEnter = (e) => {
        setIsZoomed(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const popupX = rect.right + 20;
        const popupY = rect.top;
        setPopupPosition({ x: popupX, y: popupY });
    };
    const handleMouseLeave = () => {
        setIsZoomed(false);
    };
    const loadProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:3001/api/products/${id}`);
            const data = await response.json();
            if (data.success) {
                setProduct(data.data);
                // Verificar si el producto está guardado
                if (user) {
                    checkIfSaved(data.data.id);
                }
            }
            else {
                setError(data.message || 'Error al cargar el producto');
            }
        }
        catch (error) {
            console.error('Error al cargar producto:', error);
            setError('Error al cargar el producto');
        }
        finally {
            setLoading(false);
        }
    }, [id, user]);
    const checkIfSaved = async (productId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/saved-status`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setIsSaved(data.isSaved);
            }
        }
        catch (error) {
            console.error('Error al verificar si está guardado:', error);
        }
    };
    useEffect(() => {
        // Forzar scroll al inicio INMEDIATAMENTE cuando se monta el componente
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (id) {
            loadProduct();
        }
    }, [id, loadProduct]);
    // Asegurar que siempre esté arriba después de cargar
    useEffect(() => {
        if (!loading && product) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, [loading, product]);
    const handleSaveProduct = async () => {
        if (!user) {
            showError('Error', 'Debes iniciar sesión para guardar productos');
            return;
        }
        // Solo compradores y vendedores pueden guardar productos
        if (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor') {
            showError('Error', 'Solo los compradores y vendedores pueden guardar productos');
            return;
        }
        setSavingProduct(true);
        try {
            const response = await fetch(`http://localhost:3001/api/products/${product?.id}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('¡Producto guardado!', 'El producto se ha añadido a tu lista de favoritos.');
                setIsSaved(true);
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
            setSavingProduct(false);
        }
    };
    const handleUnsaveProduct = async () => {
        if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor'))
            return;
        setSavingProduct(true);
        try {
            const response = await fetch(`http://localhost:3001/api/products/${product?.id}/unsave`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
                setIsSaved(false);
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
            setSavingProduct(false);
        }
    };
    const handleReportProduct = () => {
        if (!user) {
            showError('Error', 'Debes iniciar sesión para reportar productos');
            return;
        }
        showWarning('¿Reportar producto?', `¿Estás seguro de que quieres reportar "${product?.nombre}"? Por favor, selecciona un motivo.`, () => {
            // Aquí se abriría un modal para seleccionar el motivo del reporte
            navigate(`/products/report/${product?.id}`);
        }, undefined);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse", children: _jsx(Package, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Cargando producto..." }), _jsx("p", { className: "text-gray-600 text-lg", children: "Obteniendo informaci\u00F3n detallada" })] }) }));
    }
    if (error || !product) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsx(Card, { className: "max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "text-center py-12", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg", children: _jsx(Package, { className: "h-12 w-12 text-red-500" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Error" }), _jsx("p", { className: "text-gray-600 text-lg mb-8", children: error || 'Producto no encontrado' }), _jsx(Link, { to: "/products", children: _jsxs(Button, { className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Volver a productos"] }) })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-6 py-8", children: _jsxs("div", { className: "flex items-center space-x-8", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate('/products'), className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl", children: [_jsx(ArrowLeft, { className: "h-5 w-5 mr-2" }), "Regresar"] }), _jsxs("div", { className: "flex items-center space-x-2 text-base text-blue-100", children: [_jsx(Link, { to: "/products", className: "hover:text-white transition-colors", children: "Productos" }), _jsx("span", { children: "/" }), _jsx("span", { className: "text-white", children: product.categoria_nombre }), _jsx("span", { children: "/" }), _jsx("span", { className: "text-white font-medium", children: product.nombre })] })] }) })] }), _jsxs("main", { className: "max-w-7xl mx-auto px-6 py-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden bg-white", children: product.imagenes.length > 0 ? (_jsxs("div", { className: "relative group", children: [_jsxs("div", { className: "relative overflow-hidden cursor-zoom-in", onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: [_jsx("img", { src: product.imagenes[currentImageIndex]?.url_imagen, alt: product.nombre, className: "w-full h-[500px] object-contain bg-white" }), isZoomed && (_jsx("div", { className: "absolute inset-0 bg-black/10 pointer-events-none", children: _jsx("div", { className: "absolute w-20 h-20 border-2 border-blue-500 bg-blue-500/20 rounded-full pointer-events-none", style: {
                                                                    left: `${mousePosition.x}%`,
                                                                    top: `${mousePosition.y}%`,
                                                                    transform: 'translate(-50%, -50%)'
                                                                } }) }))] }), product.imagenes.length > 1 && (_jsx("div", { className: "absolute top-4 right-4", children: _jsxs("div", { className: "bg-black/70 rounded px-2 py-1 text-white text-xs", children: [currentImageIndex + 1, " de ", product.imagenes.length] }) })), _jsx("div", { className: "absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200", children: _jsx("div", { className: "bg-white/90 rounded px-2 py-1 text-xs text-gray-600 shadow-sm", children: "Mover mouse para zoom" }) })] })) : (_jsx("div", { className: "h-[500px] bg-gray-100 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-600", children: "Sin im\u00E1genes disponibles" })] }) })) }), product.imagenes.length > 1 && (_jsx("div", { className: "flex space-x-2 overflow-x-auto pb-2", children: product.imagenes.map((imagen, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `flex-shrink-0 w-16 h-16 border-2 rounded transition-all duration-200 ${index === currentImageIndex
                                                ? 'border-orange-500'
                                                : 'border-gray-300 hover:border-gray-400'}`, children: _jsx("img", { src: imagen.url_imagen, alt: `${product.nombre} ${index + 1}`, className: "w-full h-full object-cover rounded" }) }, imagen.id))) })), product.tipo === 'servicio' && product.servicio && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50", children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2 text-purple-600" }), "Detalles del servicio"] }), _jsxs("div", { className: "space-y-3 text-sm", children: [product.servicio.horario_atencion && (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 block", children: "Horario de atenci\u00F3n:" }), _jsx("span", { className: "text-gray-900 font-medium", children: product.servicio.horario_atencion })] })] })), product.servicio.dias_disponibles && (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 block", children: "D\u00EDas disponibles:" }), _jsx("span", { className: "text-gray-900 font-medium", children: product.servicio.dias_disponibles })] })] })), product.servicio.duracion_estimada && (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Timer, { className: "h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 block", children: "Duraci\u00F3n estimada:" }), _jsx("span", { className: "text-gray-900 font-medium", children: product.servicio.duracion_estimada })] })] }))] })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-medium text-gray-900 leading-tight mb-2", children: product.nombre }), _jsxs("div", { className: "text-sm text-gray-500 mb-4", children: ["C\u00F3digo: ", product.codigo] }), _jsx("div", { className: "mb-4", children: _jsxs("span", { className: "text-3xl font-bold text-gray-900", children: ["$", product.precio ? Number(product.precio).toFixed(2) : '0.00'] }) }), _jsx("div", { className: "mb-4", children: _jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800", children: [_jsx(Package, { className: "h-4 w-4 mr-2" }), "Disponible"] }) })] }), (user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-gray-50", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Acciones disponibles" }), _jsxs("div", { className: "space-y-3", children: [_jsx(Button, { onClick: isSaved ? handleUnsaveProduct : handleSaveProduct, disabled: savingProduct, className: `w-full h-12 ${isSaved
                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'} border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-medium`, children: savingProduct ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), isSaved ? 'Eliminando...' : 'Guardando...'] })) : (_jsxs(_Fragment, { children: [_jsx(Heart, { className: `h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}` }), isSaved ? 'Eliminar de favoritos' : 'Me interesa'] })) }), _jsxs(Button, { variant: "outline", onClick: handleReportProduct, className: "w-full h-10 text-red-600 border-red-300 hover:bg-red-50", children: [_jsx(Flag, { className: "h-4 w-4 mr-2" }), "Reportar producto"] })] })] })), (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) && (_jsxs("div", { className: "border border-blue-200 rounded-lg p-4 bg-blue-50", children: [_jsx("h3", { className: "font-medium text-blue-900 mb-3", children: "\u00BFTe interesa este producto?" }), _jsx("p", { className: "text-blue-800 text-sm mb-3", children: !user
                                                    ? 'Inicia sesión para guardar productos en tus favoritos y contactar al vendedor.'
                                                    : 'Regístrate como comprador o vendedor para guardar productos en tus favoritos y contactar al vendedor.' }), _jsx(Link, { to: !user ? "/login" : "/register", children: _jsx(Button, { className: "w-full bg-blue-600 hover:bg-blue-700 text-white", children: !user ? 'Iniciar Sesión' : 'Registrarse' }) })] })), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(User, { className: "h-4 w-4 mr-2 text-blue-600" }), "Informaci\u00F3n del vendedor"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-blue-600 font-medium", children: product.vendedor_nombre?.charAt(0) || 'U' }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: product.vendedor_nombre }), _jsx("div", { className: "text-sm text-gray-600", children: product.vendedor_email })] })] }), _jsxs(Button, { onClick: () => navigate(`/products/contact/${product.id}`), className: "w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md text-sm font-medium", children: [_jsx(MessageCircle, { className: "h-4 w-4 mr-2" }), "Contactar vendedor"] })] })] }), (product.ubicacion_provincia || product.ubicacion_canton || product.ubicacion_distrito || product.ubicacion_direccion || product.coordenadas) && (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50", children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2 text-blue-600" }), "\uD83D\uDCCD Ubicaci\u00F3n del producto"] }), _jsxs("div", { className: "space-y-2", children: [product.ubicacion_provincia && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600 w-20 font-medium", children: "Provincia:" }), _jsx("span", { className: "text-gray-900 font-semibold", children: product.ubicacion_provincia })] })), product.ubicacion_canton && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600 w-20 font-medium", children: "Cant\u00F3n:" }), _jsx("span", { className: "text-gray-900 font-semibold", children: product.ubicacion_canton })] })), product.ubicacion_distrito && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600 w-20 font-medium", children: "Distrito:" }), _jsx("span", { className: "text-gray-900", children: product.ubicacion_distrito })] })), product.ubicacion_direccion && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600 w-20 font-medium", children: "Direcci\u00F3n:" }), _jsx("span", { className: "text-gray-900", children: product.ubicacion_direccion })] })), product.coordenadas && (_jsxs("div", { className: "mt-3 pt-3 border-t border-blue-200", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600 w-20 font-medium", children: "\uD83D\uDCCC GPS:" }), _jsx("a", { href: `https://www.google.com/maps?q=${product.coordenadas}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800 font-mono text-xs underline hover:no-underline transition-colors", title: "Ver en Google Maps", children: product.coordenadas })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1 ml-20", children: "Haz clic para ver en el mapa" })] }))] })] })), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(Tag, { className: "h-4 w-4 mr-2 text-green-600" }), "Informaci\u00F3n del ", product.tipo === 'servicio' ? 'servicio' : 'producto'] }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Categor\u00EDa:" }), _jsx("span", { className: "text-gray-900 font-medium", children: product.categoria_nombre })] }), product.categoria_descripcion && (_jsx("div", { className: "mt-2 p-2 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(FileText, { className: "h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 block mb-1", children: "Descripci\u00F3n de la categor\u00EDa:" }), _jsx("span", { className: "text-gray-700 text-xs", children: product.categoria_descripcion })] })] }) })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Publicado:" }), _jsx("span", { className: "text-gray-900", children: formatDate(product.fecha_publicacion) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Tipo:" }), _jsx("span", { className: "text-gray-900 font-medium", children: product.tipo === 'servicio' ? 'Servicio' : 'Producto' })] })] })] })] })] }), isZoomed && product.imagenes.length > 0 && (_jsx("div", { className: "fixed z-50 pointer-events-none", style: {
                            left: `${popupPosition.x}px`,
                            top: `${Math.max(10, popupPosition.y)}px`,
                        }, children: _jsx("div", { className: "border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xl", children: _jsx("div", { className: "w-[700px] h-[600px] overflow-hidden relative", children: _jsx("img", { src: product.imagenes[currentImageIndex]?.url_imagen, alt: `${product.nombre} - Vista ampliada`, className: "absolute object-contain bg-white", style: {
                                        width: '200%',
                                        height: '200%',
                                        left: `${25 - mousePosition.x}%`,
                                        top: `${25 - mousePosition.y}%`,
                                        transition: 'none'
                                    } }) }) }) })), _jsx("div", { className: "mt-12", children: _jsxs("div", { className: "border-t border-gray-200 pt-8", children: [_jsx("h2", { className: "text-xl font-medium text-gray-900 mb-4", children: "Descripci\u00F3n del producto" }), _jsx("div", { className: "prose max-w-none", children: _jsx("p", { className: "text-gray-700 leading-relaxed whitespace-pre-wrap", children: product.descripcion }) })] }) })] }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
