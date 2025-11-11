import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, AlertCircle, FileText, Info } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Label } from './Label';
export const AppealProductDialog = ({ isOpen, onClose, productId, productName, motivoRechazo, onSuccess }) => {
    const [motivo_apelacion, setMotivoApelacion] = useState('');
    const [informacion_adicional, setInformacionAdicional] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (motivo_apelacion.trim().length < 20) {
            setError('El motivo de la apelación debe tener al menos 20 caracteres');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:3001/api/products/${productId}/appeal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    motivo_apelacion,
                    informacion_adicional: informacion_adicional || undefined
                })
            });
            const data = await response.json();
            if (data.success) {
                onSuccess();
                onClose();
            }
            else {
                setError(data.message || 'Error al crear la apelación');
            }
        }
        catch (err) {
            console.error('Error al apelar:', err);
            setError('Error de conexión. Intenta nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center", children: _jsx(FileText, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Apelar Decisi\u00F3n" }), _jsx("p", { className: "text-purple-100 text-sm", children: "Solicita una revisi\u00F3n de tu producto" })] })] }), _jsx("button", { onClick: onClose, className: "text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors", children: _jsx(X, { className: "h-6 w-6" }) })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsx("div", { className: "bg-purple-50 border border-purple-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "font-semibold text-purple-900 mb-1", children: ["Producto: ", productName] }), motivoRechazo && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-sm text-purple-700 font-medium mb-1", children: "Motivo del rechazo:" }), _jsx("p", { className: "text-sm text-purple-800 bg-white/60 p-2 rounded", children: motivoRechazo })] }))] })] }) }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "motivo", className: "text-base font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2 text-purple-600" }), "Motivo de la Apelaci\u00F3n *"] }), _jsx(Textarea, { id: "motivo", value: motivo_apelacion, onChange: (e) => setMotivoApelacion(e.target.value), placeholder: "Explica detalladamente por qu\u00E9 consideras que tu producto debe ser revisado nuevamente (m\u00EDnimo 20 caracteres)...", rows: 5, className: "w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl", required: true }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "M\u00EDnimo 20 caracteres" }), _jsxs("p", { className: `text-sm font-medium ${motivo_apelacion.length >= 20 ? 'text-green-600' : 'text-gray-400'}`, children: [motivo_apelacion.length, " / 20"] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "info", className: "text-base font-semibold text-gray-900 mb-2", children: "Informaci\u00F3n Adicional (Opcional)" }), _jsx(Textarea, { id: "info", value: informacion_adicional, onChange: (e) => setInformacionAdicional(e.target.value), placeholder: "Proporciona cualquier informaci\u00F3n adicional que pueda ayudar en la revisi\u00F3n...", rows: 4, className: "w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-red-800", children: error })] }) })), _jsx("div", { className: "bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "text-sm text-orange-900 font-semibold", children: ["\u26A0\uFE0F Solo se pueden apelar productos ", _jsx("strong", { children: "rechazados" }), " o ", _jsx("strong", { children: "suspendidos" })] }), _jsxs("p", { className: "text-xs text-orange-800 mt-1", children: ["Los productos marcados como ", _jsx("strong", { children: "peligrosos" }), " no pueden ser apelados debido a la gravedad de la violaci\u00F3n."] })] })] }) }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-blue-900 mb-2", children: "\uD83D\uDCCB Informaci\u00F3n Importante" }), _jsxs("ul", { className: "space-y-1 text-sm text-blue-800", children: [_jsx("li", { children: "\u2022 Tu apelaci\u00F3n ser\u00E1 revisada por un moderador" }), _jsx("li", { children: "\u2022 El proceso puede tomar entre 24-48 horas" }), _jsx("li", { children: "\u2022 Recibir\u00E1s una notificaci\u00F3n con la decisi\u00F3n final" }), _jsx("li", { children: "\u2022 Aseg\u00FArate de proporcionar informaci\u00F3n clara y detallada" })] })] })] }) }), _jsxs("div", { className: "flex space-x-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", onClick: onClose, variant: "outline", className: "flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsx(Button, { type: "submit", className: "flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300", disabled: loading || motivo_apelacion.trim().length < 20, children: loading ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "Enviando..." })] })) : ('📝 Enviar Apelación') })] })] })] }) }));
};
