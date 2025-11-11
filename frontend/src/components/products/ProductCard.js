import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import { Package, Calendar, MapPin, Heart, ShoppingCart, Eye, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react';
export const ProductCard = ({ product, showActions = true, onSave, onAddToCart, onEdit, onDelete, onModerate, isSaved = false }) => {
    const { canModifyProduct, canDeleteProduct, canModerateProduct, isOwner } = usePermissions();
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC'
        }).format(price);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const getStatusBadge = (estado, disponibilidad) => {
        if (!disponibilidad) {
            return _jsx(Badge, { variant: "secondary", children: "No disponible" });
        }
        const statusColors = {
            activo: 'bg-green-100 text-green-800',
            pendiente_revision: 'bg-yellow-100 text-yellow-800',
            rechazado: 'bg-red-100 text-red-800',
            suspendido: 'bg-gray-100 text-gray-800'
        };
        return (_jsx(Badge, { className: statusColors[estado] || 'bg-gray-100 text-gray-800', children: estado.replace('_', ' ').toUpperCase() }));
    };
    const getTypeIcon = (tipo) => {
        return tipo === 'servicio' ? _jsx(Calendar, { className: "h-4 w-4" }) : _jsx(Package, { className: "h-4 w-4" });
    };
    return (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "h-48 bg-gray-200 rounded-t-lg flex items-center justify-center", children: product.total_imagenes > 0 ? (_jsxs("div", { className: "text-gray-500", children: [_jsx(Package, { className: "h-12 w-12 mx-auto mb-2" }), _jsxs("p", { className: "text-sm", children: [product.total_imagenes, " imagen", product.total_imagenes !== 1 ? 'es' : ''] })] })) : (_jsx(Package, { className: "h-12 w-12 text-gray-400" })) }), _jsxs("div", { className: "absolute top-2 right-2 flex flex-col gap-1", children: [getStatusBadge(product.estado, product.disponibilidad), product.es_peligroso && (_jsxs(Badge, { className: "bg-red-100 text-red-800", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), "Peligroso"] }))] }), _jsxs("div", { className: "absolute top-2 left-2 flex flex-col gap-1", children: [_jsxs(Badge, { variant: "outline", className: "bg-white", children: [getTypeIcon(product.tipo), _jsx("span", { className: "ml-1 capitalize", children: product.tipo })] }), isOwner(product.vendedor_id) && (_jsx(Badge, { className: "bg-blue-100 text-blue-800 text-xs", children: "Propietario" }))] })] }), _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-semibold text-gray-900 line-clamp-2", children: product.nombre }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: product.descripcion }), _jsx("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: _jsx("span", { className: "font-medium text-green-600", children: formatPrice(product.precio) }) }), _jsx("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: _jsx("span", { children: product.categoria_nombre }) }), (product.ubicacion_provincia || product.ubicacion_canton) && (_jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-500", children: [_jsx(MapPin, { className: "h-3 w-3" }), _jsx("span", { children: product.ubicacion_provincia && product.ubicacion_canton
                                            ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                            : product.ubicacion_provincia || product.ubicacion_canton })] })), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Por: ", product.vendedor_nombre] }), _jsx("span", { children: formatDate(product.fecha_publicacion) })] })] }), showActions && (_jsxs("div", { className: "space-y-2 mt-4", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Link, { to: `/products/${product.id}`, className: "flex-1", children: _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Ver detalles"] }) }), onSave && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => onSave(product.id), children: _jsx(Heart, { className: `h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}` }) })), onAddToCart && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => onAddToCart(product.id), disabled: !product.disponibilidad, children: _jsx(ShoppingCart, { className: "h-4 w-4" }) }))] }), (canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id) || canModerateProduct()) && (_jsxs("div", { className: "flex space-x-2 pt-2 border-t border-gray-100", children: [canModifyProduct(product.vendedor_id) && onEdit && !product.es_peligroso && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => onEdit(product.id), className: "flex-1", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Editar"] })), canDeleteProduct(product.vendedor_id) && onDelete && !product.es_peligroso && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => onDelete(product.id), className: "flex-1 text-red-600 hover:text-red-700 hover:border-red-300", children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Eliminar"] })), canModerateProduct() && onModerate && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => onModerate(product.id), className: "flex-1 text-purple-600 hover:text-purple-700 hover:border-purple-300", children: [_jsx(Shield, { className: "h-4 w-4 mr-1" }), "Moderar"] }))] })), product.es_peligroso && (_jsxs("div", { className: "text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200", children: [_jsx(AlertTriangle, { className: "h-3 w-3 inline mr-1" }), "Este producto est\u00E1 marcado como peligroso y no puede ser modificado"] }))] }))] })] }));
};
