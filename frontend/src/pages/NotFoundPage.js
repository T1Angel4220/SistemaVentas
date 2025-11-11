import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
export const NotFoundPage = () => {
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-9xl font-bold text-gray-300", children: "404" }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "P\u00E1gina no encontrada" }), _jsx("p", { className: "text-lg text-gray-600 mb-8", children: "La p\u00E1gina que buscas no existe o ha sido movida." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Link, { to: "/", children: _jsxs(Button, { className: "flex items-center", children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), "Ir al Inicio"] }) }), _jsxs(Button, { variant: "outline", onClick: () => window.history.back(), className: "flex items-center", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Volver Atr\u00E1s"] })] })] }) }));
};
