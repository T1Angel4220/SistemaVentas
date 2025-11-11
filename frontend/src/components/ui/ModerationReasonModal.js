import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './Button';
import { AlertTriangle, XCircle, Shield, CheckCircle, X } from 'lucide-react';
export const ModerationReasonModal = ({ isOpen, onClose, onConfirm, action, productName }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    if (!isOpen)
        return null;
    const getActionConfig = () => {
        switch (action) {
            case 'rechazar':
                return {
                    icon: _jsx(XCircle, { className: "h-8 w-8 text-orange-500" }),
                    emoji: '🔴',
                    title: 'RECHAZAR PRODUCTO',
                    color: 'orange',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    textColor: 'text-orange-800',
                    message: 'El producto será marcado como RECHAZADO.',
                    canDo: [
                        'Ver el producto en su lista',
                        'Editarlo para corregir problemas',
                        'Eliminarlo si lo desea',
                        'Apelar esta decisión'
                    ],
                    cantDo: []
                };
            case 'suspender':
                return {
                    icon: _jsx(AlertTriangle, { className: "h-8 w-8 text-yellow-500" }),
                    emoji: '🟡',
                    title: 'SUSPENDER PRODUCTO',
                    color: 'yellow',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    message: 'El producto será SUSPENDIDO temporalmente.',
                    canDo: [
                        'Ver el producto en su lista',
                        'Apelar esta decisión'
                    ],
                    cantDo: [
                        'Editarlo hasta que se resuelva',
                        'Eliminarlo hasta que se resuelva'
                    ]
                };
            case 'marcar_peligroso':
                return {
                    icon: _jsx(Shield, { className: "h-8 w-8 text-red-600" }),
                    emoji: '🚫',
                    title: 'MARCAR COMO PELIGROSO',
                    color: 'red',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    message: '⚠️ ATENCIÓN: Esta es una acción crítica.',
                    canDo: [],
                    cantDo: [
                        'Verlo en su lista',
                        'Editarlo',
                        'Eliminarlo (solo admins)'
                    ],
                    hiddenMessage: 'Será OCULTO completamente para vendedor y compradores. Solo visible para moderadores/admins.'
                };
            default:
                return {
                    icon: _jsx(Shield, { className: "h-8 w-8" }),
                    emoji: '',
                    title: '',
                    color: 'gray',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    message: '',
                    canDo: [],
                    cantDo: []
                };
        }
    };
    const config = getActionConfig();
    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Debes proporcionar un motivo para continuar');
            return;
        }
        onConfirm(reason);
        setReason('');
        setError('');
    };
    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn", children: _jsxs("div", { className: "relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl animate-slideIn max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: `${config.bgColor} ${config.borderColor} border-b-2 rounded-t-2xl p-6 relative`, children: [_jsx("button", { onClick: handleClose, className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors", children: _jsx(X, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [config.icon, _jsxs("div", { children: [_jsxs("h2", { className: `text-2xl font-bold ${config.textColor}`, children: [config.emoji, " ", config.title] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1 font-medium", children: ["\"", productName, "\""] })] })] })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: `${config.bgColor} ${config.borderColor} border-l-4 rounded p-4`, children: [_jsx("p", { className: `${config.textColor} font-semibold text-base`, children: config.message }), config.hiddenMessage && (_jsx("p", { className: `${config.textColor} text-sm mt-2`, children: config.hiddenMessage }))] }), _jsxs("div", { className: "space-y-4", children: [config.canDo.length > 0 && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), _jsx("h3", { className: "font-bold text-green-800", children: "El vendedor PODR\u00C1:" })] }), _jsx("ul", { className: "space-y-2 ml-7", children: config.canDo.map((item, index) => (_jsxs("li", { className: "text-sm text-green-700 flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2022" }), _jsx("span", { children: item })] }, index))) })] })), config.cantDo.length > 0 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx(XCircle, { className: "h-5 w-5 text-red-600" }), _jsx("h3", { className: "font-bold text-red-800", children: "El vendedor NO PODR\u00C1:" })] }), _jsx("ul", { className: "space-y-2 ml-7", children: config.cantDo.map((item, index) => (_jsxs("li", { className: "text-sm text-red-700 flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2022" }), _jsx("span", { children: item })] }, index))) })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: ["Motivo (obligatorio) ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: reason, onChange: (e) => {
                                        setReason(e.target.value);
                                        setError('');
                                    }, placeholder: "Explica el motivo de esta acci\u00F3n...", className: `w-full h-32 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${error
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`, autoFocus: true }), error && (_jsxs("p", { className: "text-red-600 text-sm mt-2 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), error] }))] })] }), _jsxs("div", { className: "bg-gray-50 rounded-b-2xl p-6 flex justify-end space-x-3 border-t border-gray-200", children: [_jsx(Button, { onClick: handleClose, variant: "outline", className: "px-6 py-2.5 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-all", children: "Cancelar" }), _jsx(Button, { onClick: handleConfirm, className: `px-6 py-2.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all ${action === 'rechazar'
                                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                                : action === 'suspender'
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                                    : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'}`, children: "Confirmar" })] })] }) }));
};
