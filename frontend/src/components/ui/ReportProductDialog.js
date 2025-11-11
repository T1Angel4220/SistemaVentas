import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, AlertTriangle, Flag, Info } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Label } from './Label';
const TIPOS_REPORTE = [
    { value: 'contenido_inapropiado', label: '⚠️ Contenido Inapropiado', desc: 'Contenido ofensivo o no apto' },
    { value: 'producto_prohibido', label: '🚫 Producto Prohibido', desc: 'Artículo ilegal o no permitido' },
    { value: 'informacion_falsa', label: '❌ Información Falsa', desc: 'Descripción engañosa o fraudulenta' },
    { value: 'spam', label: '📧 Spam', desc: 'Publicación repetitiva o no deseada' },
    { value: 'otro', label: '🔖 Otro', desc: 'Otro motivo no listado' },
];
export const ReportProductDialog = ({ isOpen, onClose, productId, productName, onSuccess }) => {
    const [tipo_reporte, setTipoReporte] = useState('');
    const [motivo_reporte, setMotivoReporte] = useState('');
    const [informacion_adicional, setInformacionAdicional] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!tipo_reporte) {
            setError('Debes seleccionar un tipo de reporte');
            return;
        }
        if (motivo_reporte.trim().length < 20) {
            setError('El motivo debe tener al menos 20 caracteres');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:3001/api/products/${productId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tipo_reporte,
                    motivo_reporte,
                    informacion_adicional: informacion_adicional || undefined
                })
            });
            const data = await response.json();
            if (data.success) {
                onSuccess();
                onClose();
            }
            else {
                setError(data.message || 'Error al crear el reporte');
            }
        }
        catch (err) {
            console.error('Error al reportar:', err);
            setError('Error de conexión. Intenta nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center", children: _jsx(Flag, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Reportar Producto" }), _jsx("p", { className: "text-red-100 text-sm", children: "Ay\u00FAdanos a mantener la plataforma segura" })] })] }), _jsx("button", { onClick: onClose, className: "text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors", children: _jsx(X, { className: "h-6 w-6" }) })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsx("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "font-semibold text-red-900 mb-1", children: ["Reportando: ", productName] }), _jsxs("p", { className: "text-sm text-red-700", children: ["ID del producto: #", productId] })] })] }) }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "tipo", className: "text-base font-semibold text-gray-900 mb-3 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2 text-red-600" }), "Tipo de Reporte *"] }), _jsx("div", { className: "grid grid-cols-1 gap-3", children: TIPOS_REPORTE.map((tipo) => (_jsxs("label", { className: `flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${tipo_reporte === tipo.value
                                            ? 'border-red-500 bg-red-50 shadow-md'
                                            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`, children: [_jsx("input", { type: "radio", name: "tipo_reporte", value: tipo.value, checked: tipo_reporte === tipo.value, onChange: (e) => setTipoReporte(e.target.value), className: "mt-1 h-4 w-4 text-red-600 focus:ring-red-500", required: true }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-gray-900", children: tipo.label }), _jsx("div", { className: "text-sm text-gray-600 mt-0.5", children: tipo.desc })] })] }, tipo.value))) })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "motivo", className: "text-base font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2 text-red-600" }), "Motivo del Reporte *"] }), _jsx(Textarea, { id: "motivo", value: motivo_reporte, onChange: (e) => setMotivoReporte(e.target.value), placeholder: "Describe detalladamente el problema que encontraste con este producto (m\u00EDnimo 20 caracteres)...", rows: 5, className: "w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl", required: true }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "M\u00EDnimo 20 caracteres" }), _jsxs("p", { className: `text-sm font-medium ${motivo_reporte.length >= 20 ? 'text-green-600' : 'text-gray-400'}`, children: [motivo_reporte.length, " / 20"] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "informacion_adicional", className: "text-base font-semibold text-gray-900 mb-2", children: "Informaci\u00F3n Adicional (Opcional)" }), _jsx(Textarea, { id: "informacion_adicional", value: informacion_adicional, onChange: (e) => setInformacionAdicional(e.target.value), placeholder: "URLs, capturas de pantalla, enlaces o cualquier evidencia que respalde tu reporte...", rows: 3, className: "w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Si tienes capturas de pantalla, puedes proporcionar los enlaces aqu\u00ED" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-red-800", children: error })] }) })), _jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-amber-900 mb-2", children: "\u2696\uFE0F Pol\u00EDtica de Reportes" }), _jsxs("ul", { className: "space-y-1 text-sm text-amber-800", children: [_jsx("li", { children: "\u2022 Los reportes falsos o malintencionados pueden resultar en sanciones" }), _jsx("li", { children: "\u2022 Un moderador revisar\u00E1 tu reporte en las pr\u00F3ximas 24 horas" }), _jsx("li", { children: "\u2022 El vendedor no ser\u00E1 notificado hasta que se tome una decisi\u00F3n" }), _jsx("li", { children: "\u2022 Tu identidad se mantendr\u00E1 confidencial durante la revisi\u00F3n" })] })] })] }) }), _jsxs("div", { className: "flex space-x-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", onClick: onClose, variant: "outline", className: "flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsx(Button, { type: "submit", className: "flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300", disabled: loading || !tipo_reporte || motivo_reporte.trim().length < 20, children: loading ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "Enviando..." })] })) : ('🚩 Enviar Reporte') })] })] })] }) }));
};
