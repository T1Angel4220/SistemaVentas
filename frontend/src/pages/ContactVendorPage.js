import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Package, ArrowLeft, User, MapPin, Phone, Mail, MessageCircle, CheckCircle, Calendar } from 'lucide-react';
export const ContactVendorPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const [product, setProduct] = useState(null);
    const [vendorInfo, setVendorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        mensaje: '',
        tipoContacto: 'whatsapp'
    });
    const loadProduct = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/products/${id}`);
            const data = await response.json();
            if (data.success) {
                const productData = data.data;
                setProduct(productData);
                // Extraer información del vendedor
                setVendorInfo({
                    nombre: productData.vendedor_nombre || '',
                    apellido: '', // Este campo no existe en ProductDetail
                    correo: productData.vendedor_email || '',
                    telefono: '', // Este campo no existe en ProductDetail
                    direccion: '' // Este campo no existe en ProductDetail
                });
                // Pre-llenar datos del usuario si está logueado
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        nombre: `${user.nombre} ${user.apellido}`,
                        email: user.correo || '',
                        telefono: user.telefono || ''
                    }));
                }
            }
            else {
                showError('Error', data.message || 'Producto no encontrado');
                navigate('/products');
            }
        }
        catch (error) {
            console.error('Error al cargar producto:', error);
            showError('Error', 'Error al cargar el producto');
            navigate('/products');
        }
        finally {
            setLoading(false);
        }
    }, [id, showError, navigate, user]);
    useEffect(() => {
        // Forzar scroll al inicio
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (id) {
            loadProduct();
        }
    }, [id, loadProduct]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleWhatsAppContact = () => {
        if (!vendorInfo?.telefono) {
            showError('Error', 'El vendedor no tiene número de teléfono disponible');
            return;
        }
        const message = `¡Hola! Me interesa tu producto "${product?.nombre}" por ${formatPrice(product?.precio || 0)}. ¿Está disponible?`;
        const whatsappUrl = `https://wa.me/506${vendorInfo.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    const handleEmailContact = () => {
        if (!vendorInfo?.correo) {
            showError('Error', 'El vendedor no tiene email disponible');
            return;
        }
        const subject = `Interés en tu producto: ${product?.nombre}`;
        const body = `Hola ${vendorInfo.nombre},\n\nMe interesa tu producto "${product?.nombre}" por ${formatPrice(product?.precio || 0)}.\n\n¿Está disponible? ¿Podríamos coordinar para verlo?\n\nGracias!`;
        const mailtoUrl = `mailto:${vendorInfo.correo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };
    const handlePhoneContact = () => {
        if (!vendorInfo?.telefono) {
            showError('Error', 'El vendedor no tiene número de teléfono disponible');
            return;
        }
        const phoneUrl = `tel:${vendorInfo.telefono}`;
        window.location.href = phoneUrl;
    };
    const handleSendMessage = () => {
        if (!formData.nombre.trim()) {
            showError('Error', 'El nombre es requerido');
            return;
        }
        if (!formData.telefono.trim()) {
            showError('Error', 'El teléfono es requerido');
            return;
        }
        if (!formData.mensaje.trim()) {
            showError('Error', 'El mensaje es requerido');
            return;
        }
        showWarning('¿Enviar mensaje?', `¿Estás seguro de que quieres enviar este mensaje al vendedor ${vendorInfo?.nombre}?`, async () => {
            setSendingMessage(true);
            try {
                // Simular envío de mensaje
                await new Promise(resolve => setTimeout(resolve, 1500));
                showSuccess('¡Mensaje enviado!', 'Tu mensaje ha sido enviado al vendedor. Te responderá pronto.');
                // Limpiar formulario
                setFormData(prev => ({
                    ...prev,
                    mensaje: ''
                }));
            }
            catch {
                showError('Error', 'Hubo un problema al enviar tu mensaje');
            }
            finally {
                setSendingMessage(false);
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
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg animate-pulse", children: _jsx(User, { className: "h-8 w-8 sm:h-10 sm:w-10 text-blue-600" }) }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4", children: "Cargando informaci\u00F3n..." }), _jsx("p", { className: "text-gray-600 text-sm sm:text-lg", children: "Obteniendo datos del vendedor" })] }) }));
    }
    if (!product || !vendorInfo) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4", children: _jsx(Card, { className: "max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "text-center py-8 sm:py-12", children: [_jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg", children: _jsx(Package, { className: "h-10 w-10 sm:h-12 sm:w-12 text-red-500" }) }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4", children: "Producto no encontrado" }), _jsx("p", { className: "text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8", children: "El producto que buscas no est\u00E1 disponible" }), _jsx(Link, { to: "/products", children: _jsxs(Button, { className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 sm:px-8 py-3 w-full sm:w-auto", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Volver a productos"] }) })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0", children: [_jsx(Link, { to: user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador'
                                        ? "/products/moderation"
                                        : "/products", children: _jsxs(Button, { variant: "outline", size: "sm", className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto", children: [_jsx(ArrowLeft, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Regresar"] }) }), _jsxs("div", { className: "text-center sm:text-left", children: [_jsx("h1", { className: "text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2", children: "Contactar Vendedor" }), _jsxs("p", { className: "text-blue-100 text-sm sm:text-base sm:text-lg", children: ["Conecta directamente con ", vendorInfo.nombre, " ", vendorInfo.apellido] })] })] }) })] }), _jsx("main", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(Card, { className: "sticky top-4 lg:top-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-4 sm:p-6", children: [_jsxs("h3", { className: "text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center", children: [_jsx(Package, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" }), "Producto de inter\u00E9s"] }), _jsxs("div", { className: "space-y-3 sm:space-y-4", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [product.imagenes.length > 0 ? (_jsx("img", { src: product.imagenes[0].url_imagen, alt: product.nombre, className: "w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg" })) : (_jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "h-5 w-5 sm:h-6 sm:w-6 text-gray-400" }) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm line-clamp-2", children: product.nombre }), _jsx("p", { className: "text-xs text-gray-500", children: product.categoria_nombre }), _jsx("p", { className: "text-base sm:text-lg font-bold text-blue-600 mt-1", children: formatPrice(product.precio) })] })] }), _jsxs("div", { className: "border-t border-gray-100 pt-3 sm:pt-4 space-y-2", children: [(product.ubicacion_provincia || product.ubicacion_canton || product.ubicacion_distrito || product.ubicacion_direccion || product.coordenadas) ? (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1", children: [_jsx(MapPin, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" }), "\uD83D\uDCCD Ubicaci\u00F3n del producto"] }), product.ubicacion_provincia && (_jsxs("div", { className: "text-xs text-gray-600 ml-5 sm:ml-6", children: [_jsx("span", { className: "font-medium", children: "Provincia:" }), " ", product.ubicacion_provincia] })), product.ubicacion_canton && (_jsxs("div", { className: "text-xs text-gray-600 ml-5 sm:ml-6", children: [_jsx("span", { className: "font-medium", children: "Cant\u00F3n:" }), " ", product.ubicacion_canton] })), product.ubicacion_distrito && (_jsxs("div", { className: "text-xs text-gray-600 ml-5 sm:ml-6", children: [_jsx("span", { className: "font-medium", children: "Distrito:" }), " ", product.ubicacion_distrito] })), product.ubicacion_direccion && (_jsxs("div", { className: "text-xs text-gray-600 ml-5 sm:ml-6", children: [_jsx("span", { className: "font-medium", children: "Direcci\u00F3n:" }), " ", product.ubicacion_direccion] })), product.coordenadas && (_jsxs("div", { className: "text-xs ml-5 sm:ml-6 mt-2 pt-2 border-t border-gray-100", children: [_jsx("span", { className: "font-medium text-gray-700", children: "\uD83D\uDCCC GPS:" }), ' ', _jsx("a", { href: `https://www.google.com/maps?q=${product.coordenadas}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800 font-mono underline hover:no-underline break-all", title: "Ver en Google Maps", children: product.coordenadas })] }))] })) : (_jsxs("div", { className: "flex items-center text-xs sm:text-sm text-gray-500", children: [_jsx(MapPin, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-2" }), "Ubicaci\u00F3n no especificada"] })), _jsxs("div", { className: "flex items-center text-xs sm:text-sm text-gray-600 pt-2", children: [_jsx(Calendar, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-2" }), "Publicado: ", new Date(product.fecha_publicacion).toLocaleDateString()] })] })] })] }) }) }), _jsxs("div", { className: "lg:col-span-2 space-y-4 sm:space-y-6", children: [_jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-4 sm:p-6 lg:p-8", children: [_jsxs("h3", { className: "text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center", children: [_jsx(User, { className: "h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" }), "Informaci\u00F3n del Vendedor"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { className: "space-y-3 sm:space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 sm:h-6 sm:w-6 text-blue-600" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("h4", { className: "font-semibold text-gray-900 truncate", children: [vendorInfo.nombre, " ", vendorInfo.apellido] }), _jsx("p", { className: "text-sm text-gray-500", children: "Vendedor" })] })] }), vendorInfo.telefono && (_jsxs("div", { className: "flex items-center space-x-3 text-gray-600", children: [_jsx(Phone, { className: "h-4 w-4 text-green-600 flex-shrink-0" }), _jsx("span", { className: "text-sm break-all", children: vendorInfo.telefono })] })), vendorInfo.correo && (_jsxs("div", { className: "flex items-center space-x-3 text-gray-600", children: [_jsx(Mail, { className: "h-4 w-4 text-blue-600 flex-shrink-0" }), _jsx("span", { className: "text-sm break-all", children: vendorInfo.correo })] })), vendorInfo.direccion && (_jsxs("div", { className: "flex items-center space-x-3 text-gray-600", children: [_jsx(MapPin, { className: "h-4 w-4 text-red-600 flex-shrink-0" }), _jsx("span", { className: "text-sm break-all", children: vendorInfo.direccion })] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "Opciones de contacto r\u00E1pido" }), vendorInfo.telefono && (_jsxs(Button, { onClick: handleWhatsAppContact, className: "w-full bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-sm sm:text-base", children: [_jsx(MessageCircle, { className: "h-4 w-4 mr-2" }), "WhatsApp"] })), vendorInfo.telefono && (_jsxs(Button, { onClick: handlePhoneContact, variant: "outline", className: "w-full border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl text-sm sm:text-base", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), "Llamar"] })), vendorInfo.correo && (_jsxs(Button, { onClick: handleEmailContact, variant: "outline", className: "w-full border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-xl text-sm sm:text-base", children: [_jsx(Mail, { className: "h-4 w-4 mr-2" }), "Email"] }))] })] })] }) }), _jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-4 sm:p-6 lg:p-8", children: [_jsxs("h3", { className: "text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center", children: [_jsx(MessageCircle, { className: "h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" }), "Enviar mensaje"] }), _jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(User, { className: "h-4 w-4 inline mr-1" }), "Tu nombre *"] }), _jsx(Input, { type: "text", name: "nombre", placeholder: "Tu nombre completo", value: formData.nombre, onChange: handleInputChange, required: true, className: "text-sm sm:text-base" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Phone, { className: "h-4 w-4 inline mr-1" }), "Tu tel\u00E9fono *"] }), _jsx(Input, { type: "tel", name: "telefono", placeholder: "Ej: 8888-8888", value: formData.telefono, onChange: handleInputChange, required: true, className: "text-sm sm:text-base" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Mail, { className: "h-4 w-4 inline mr-1" }), "Tu email"] }), _jsx(Input, { type: "email", name: "email", placeholder: "tu@email.com", value: formData.email, onChange: handleInputChange, className: "text-sm sm:text-base" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MessageCircle, { className: "h-4 w-4 inline mr-1" }), "Mensaje *"] }), _jsx(Textarea, { name: "mensaje", placeholder: "Hola, me interesa tu producto...", value: formData.mensaje, onChange: handleInputChange, rows: 4, required: true, className: "text-sm sm:text-base" })] }), _jsxs(Alert, { className: "border-blue-200 bg-blue-50 rounded-lg", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-600 flex-shrink-0" }), _jsxs(AlertDescription, { className: "text-blue-800 text-sm", children: [_jsx("strong", { children: "Importante:" }), " Tu mensaje ser\u00E1 enviado al vendedor junto con tus datos de contacto. El vendedor podr\u00E1 responderte directamente por los medios que proporciones."] })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { onClick: handleSendMessage, disabled: sendingMessage, className: "w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-medium rounded-xl", children: sendingMessage ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3" }), "Enviando mensaje..."] })) : (_jsxs(_Fragment, { children: [_jsx(MessageCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" }), "Enviar mensaje"] })) }) })] })] }) })] })] }) }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
