import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Shield, AlertTriangle, Calendar, FileText, User, ArrowLeft, Package, Camera } from 'lucide-react';
export const DangerousProductsHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { alert, showError, hideAlert } = useAlert();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadDangerousProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/products/my-dangerous`, {
                headers: {
                    'Authorization': `Bearer ${apiService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
            else {
                showError('Error', 'No se pudieron cargar los productos peligrosos');
            }
        }
        catch (error) {
            console.error('Error al cargar productos peligrosos:', error);
            showError('Error', 'Error de conexión al cargar productos');
        }
        finally {
            setLoading(false);
        }
    }, [showError]);
    useEffect(() => {
        if (user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador')) {
            loadDangerousProducts();
        }
    }, [user, loadDangerousProducts]);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx(Card, { className: "max-w-md w-full", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600", children: "No tienes permisos para ver esta p\u00E1gina." })] }) }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { onClick: () => navigate('/my-products'), variant: "outline", className: "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Regresar"] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold flex items-center", children: [_jsx(AlertTriangle, { className: "h-8 w-8 mr-3" }), "Productos Peligrosos"] }), _jsx("p", { className: "text-red-100 mt-1", children: "Historial de productos marcados como peligrosos" })] })] }) }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsx(Card, { className: "mb-6 border-l-4 border-red-500", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-6 w-6 text-red-500 mt-1 flex-shrink-0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900 mb-2", children: "\u2139\uFE0F Informaci\u00F3n Importante" }), _jsxs("ul", { className: "text-sm text-gray-700 space-y-1", children: [_jsxs("li", { children: ["\u2022 Los productos marcados como ", _jsx("strong", { children: "peligrosos" }), " no son visibles para ti ni para los compradores."] }), _jsx("li", { children: "\u2022 Solo los moderadores y administradores pueden visualizar estos productos." }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "No puedes editar ni eliminar" }), " estos productos (solo administradores pueden hacerlo)."] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { className: "text-red-600", children: "No es posible apelar productos peligrosos" }), " debido a la gravedad de la violaci\u00F3n."] }), _jsx("li", { children: "\u2022 Si consideras que esto es un error grave, contacta directamente con el equipo de moderaci\u00F3n." })] })] })] }) }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" }), _jsx("p", { className: "text-gray-600 mt-4", children: "Cargando historial..." })] })) : products.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No hay productos peligrosos" }), _jsx("p", { className: "text-gray-600", children: "Ninguno de tus productos ha sido marcado como peligroso." })] }) }) })) : (_jsx("div", { className: "space-y-6", children: products.map((product) => (_jsxs(Card, { className: "overflow-hidden border-l-4 border-red-500 hover:shadow-xl transition-shadow", children: [_jsx(CardHeader, { className: "bg-red-50 border-b border-red-100", children: _jsxs("div", { className: "flex flex-col md:flex-row items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 w-full md:w-32 h-32", children: product.primera_imagen ? (_jsx("img", { src: product.primera_imagen, alt: product.nombre, className: "w-full h-full object-cover rounded-lg border-2 border-red-200" })) : (_jsx("div", { className: `w-full h-full flex items-center justify-center rounded-lg border-2 ${product.tipo === 'servicio'
                                                        ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200'
                                                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'}`, children: _jsx(Camera, { className: `h-12 w-12 ${product.tipo === 'servicio' ? 'text-purple-400' : 'text-gray-400'}` }) })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx(Badge, { className: "bg-red-100 text-red-800 border-red-200", children: product.tipo === 'servicio' ? 'Servicio Peligroso' : 'Producto Peligroso' }), product.categoria_nombre && (_jsx(Badge, { variant: "outline", className: "text-gray-600", children: product.categoria_nombre }))] }), _jsx(CardTitle, { className: "text-2xl text-gray-900 mb-1", children: product.nombre }), _jsxs("p", { className: "text-sm text-gray-600", children: ["C\u00F3digo: ", _jsx("span", { className: "font-mono", children: product.codigo })] })] })] }) }), _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2 text-gray-600" }), "Descripci\u00F3n del Producto"] }), _jsx("p", { className: "text-sm text-gray-700 line-clamp-2", children: product.descripcion })] }), product.motivo_rechazo && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-bold text-red-900 mb-2 flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Motivo por el cual fue marcado como peligroso"] }), _jsx("p", { className: "text-sm text-red-800 whitespace-pre-wrap", children: product.motivo_rechazo })] })), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2 text-gray-500" }), _jsxs("span", { children: ["Detectado: ", formatDate(product.fecha_deteccion_peligroso)] })] }), product.moderador_nombre && (_jsxs("div", { className: "flex items-center", children: [_jsx(User, { className: "h-4 w-4 mr-2 text-gray-500" }), _jsxs("span", { children: ["Por: ", product.moderador_nombre, " ", product.moderador_apellido] })] }))] }), _jsxs("div", { className: "bg-red-100 border-l-4 border-red-500 p-3 rounded flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600 flex-shrink-0" }), _jsx("p", { className: "text-sm text-red-800 font-semibold", children: "No se puede apelar" })] })] })] }) })] }, product.id))) }))] }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
