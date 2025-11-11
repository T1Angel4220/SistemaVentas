import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
export const AlertDialog = ({ isOpen, onClose, title, message, type = 'info', confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel }) => {
    if (!isOpen)
        return null;
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };
    const handleClose = () => {
        // Para alertas de éxito o info, ejecutar onConfirm al cerrar (para navegación)
        if ((type === 'success' || type === 'info' || type === 'error') && onConfirm) {
            onConfirm();
        }
        onClose();
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircle2, { className: "h-6 w-6 text-green-600" });
            case 'warning':
                return _jsx(AlertTriangle, { className: "h-6 w-6 text-yellow-600" });
            case 'error':
                return _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" });
            default:
                return _jsx(Info, { className: "h-6 w-6 text-blue-600" });
        }
    };
    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    title: 'text-green-900',
                    message: 'text-green-700',
                    confirm: 'bg-green-600 hover:bg-green-700 text-white',
                    cancel: 'bg-white hover:bg-green-50 text-green-700 border-green-300'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    title: 'text-yellow-900',
                    message: 'text-yellow-700',
                    confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    cancel: 'bg-white hover:bg-yellow-50 text-yellow-700 border-yellow-300'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    title: 'text-red-900',
                    message: 'text-red-700',
                    confirm: 'bg-red-600 hover:bg-red-700 text-white',
                    cancel: 'bg-white hover:bg-red-50 text-red-700 border-red-300'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    title: 'text-blue-900',
                    message: 'text-blue-700',
                    confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
                    cancel: 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300'
                };
        }
    };
    const colors = getColors();
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: handleClose }), _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200", children: [_jsx("div", { className: `${colors.bg} ${colors.border} border-b px-6 py-4`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getIcon(), _jsx("h3", { className: `text-lg font-semibold ${colors.title}`, children: title })] }), _jsx("button", { onClick: handleClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(X, { className: "h-5 w-5" }) })] }) }), _jsx("div", { className: "px-6 py-4", children: _jsx("p", { className: `text-sm ${colors.message} leading-relaxed`, children: message }) }), _jsxs("div", { className: "px-6 py-4 bg-gray-50 flex justify-end space-x-3", children: [(onCancel || type === 'warning') && (_jsx("button", { onClick: handleCancel, className: `px-4 py-2 rounded-lg font-medium transition-colors border ${colors.cancel}`, children: cancelText })), (onConfirm || type === 'success' || type === 'info' || type === 'error') && (_jsx("button", { onClick: handleConfirm, className: `px-4 py-2 rounded-lg font-medium transition-colors ${colors.confirm}`, children: confirmText }))] })] })] }));
};
