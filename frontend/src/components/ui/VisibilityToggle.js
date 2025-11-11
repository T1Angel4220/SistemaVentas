import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Eye, EyeOff } from 'lucide-react';
export const VisibilityToggle = ({ isVisible, onChange, label = "Visibilidad", className = "" }) => {
    return (_jsxs("div", { className: `space-y-2 ${className}`, children: [label && (_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [_jsx(Eye, { className: "h-4 w-4 mr-2 text-gray-600" }), label] })), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { type: "button", onClick: () => onChange(!isVisible), className: `
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isVisible
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 hover:bg-gray-400'}
          `, children: _jsx("span", { className: `
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg
              ${isVisible ? 'translate-x-6' : 'translate-x-1'}
            ` }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `flex items-center space-x-1 ${isVisible ? 'text-green-600' : 'text-gray-500'}`, children: isVisible ? (_jsxs(_Fragment, { children: [_jsx(Eye, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-medium", children: "En Stock" })] })) : (_jsxs(_Fragment, { children: [_jsx(EyeOff, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-medium", children: "Sin Stock" })] })) }), _jsx("div", { className: "text-xs text-gray-500", children: isVisible ? 'Producto disponible para compra' : 'Producto temporalmente sin stock' })] })] })] }));
};
