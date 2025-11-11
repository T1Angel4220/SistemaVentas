import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
// Icono de candado simple
const LockIcon = ({ className }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }));
export const LoginForm = ({ onSuccess }) => {
    const { login, isLoading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        correo: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [resendingCode, setResendingCode] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    // Limpiar error del contexto cuando se monta el componente
    React.useEffect(() => {
        clearError();
    }, []);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar error de validación cuando el usuario empiece a escribir
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
        // Limpiar error general
        if (error) {
            clearError();
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.correo) {
            errors.correo = 'El correo es requerido';
        }
        else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            errors.correo = 'El correo debe ser válido';
        }
        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        }
        else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleResendCode = async () => {
        if (!formData.correo) {
            setValidationErrors({ correo: 'Ingresa tu correo electrónico' });
            return;
        }
        setResendingCode(true);
        setResendMessage('');
        clearError();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/resend-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: formData.correo }),
            });
            const data = await response.json();
            if (data.success) {
                setResendMessage(data.message);
                setTimeout(() => {
                    window.location.href = `/verify-code?email=${encodeURIComponent(formData.correo)}`;
                }, 2000);
            }
            else {
                setResendMessage(data.message);
            }
        }
        catch (error) {
            console.error('Error reenviando código:', error);
            setResendMessage('Error al reenviar el código. Intenta nuevamente.');
        }
        finally {
            setResendingCode(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            // Scroll hacia arriba para mostrar los errores
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        try {
            await login(formData);
            onSuccess?.();
        }
        catch (error) {
            console.error('Error en login:', error);
            // Scroll hacia arriba para mostrar el error
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600", children: [_jsx("h2", { className: "text-2xl font-bold text-white text-center", children: "Iniciar Sesi\u00F3n" }), _jsx("p", { className: "text-blue-100 text-center mt-2", children: "Ingresa tus credenciales para acceder a tu cuenta" })] }), _jsx("div", { className: "px-8 py-6", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsxs("div", { className: `relative overflow-hidden ${error.includes('suspendida')
                                ? 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 border-2 border-red-400'
                                : 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300'} rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]`, children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: `absolute inset-0 ${error.includes('suspendida') ? 'bg-red-500' : 'bg-red-400'} rounded-full animate-[ping_1s_ease-out]` }), _jsx("div", { className: `relative ${error.includes('suspendida')
                                                            ? 'bg-gradient-to-br from-red-600 to-red-800'
                                                            : 'bg-gradient-to-br from-red-500 to-rose-600'} rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]`, children: error.includes('suspendida') ? (_jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" }) })) : (_jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) })) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: `text-lg font-bold mb-1 ${error.includes('suspendida') ? 'text-red-900' : 'text-red-800'}`, children: error.includes('suspendida') ? '🚫 Cuenta Suspendida' : '¡Oops! Algo salió mal' }), _jsx("p", { className: `text-sm leading-relaxed mb-3 ${error.includes('suspendida') ? 'text-red-800' : 'text-red-700'}`, children: error }), error.includes('suspendida') && (_jsx("div", { className: "mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-md", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-blue-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-bold text-gray-900 mb-2", children: "\u00BFQu\u00E9 puedes hacer?" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-700", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: ["Contacta con el ", _jsx("strong", { children: "administrador del sistema" }), " para conocer los detalles de la suspensi\u00F3n"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: ["Revisa las ", _jsx("strong", { children: "pol\u00EDticas de uso" }), " de la plataforma"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: ["Si crees que es un error, ", _jsx("strong", { children: "solicita una apelaci\u00F3n" }), " explicando tu situaci\u00F3n"] })] })] })] })] }) })), error.includes('pendiente de verificación') && (_jsxs("button", { type: "button", onClick: handleResendCode, disabled: resendingCode, className: "mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }), resendingCode ? 'Enviando...' : 'Reenviar código de verificación'] }))] })] }), _jsx("div", { className: "absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]", children: error.includes('suspendida') ? '🚫' : '⚠️' })] })), resendMessage && (_jsx("div", { className: `border rounded-lg p-4 ${resendMessage.includes('Error') || resendMessage.includes('error') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`, children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: resendMessage.includes('Error') || resendMessage.includes('error') ? (_jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) })) : (_jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) })) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: `text-sm ${resendMessage.includes('Error') || resendMessage.includes('error') ? 'text-red-800' : 'text-green-800'}`, children: resendMessage }) })] }) })), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Correo electr\u00F3nico" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "email", name: "correo", placeholder: "tu@email.com", value: formData.correo, onChange: handleInputChange, disabled: isLoading, className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${validationErrors.correo
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.correo && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.correo }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(LockIcon, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: showPassword ? 'text' : 'password', name: "password", placeholder: "Tu contrase\u00F1a", value: formData.password, onChange: handleInputChange, disabled: isLoading, className: `block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${validationErrors.password
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors", disabled: isLoading, children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] }), validationErrors.password && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.password }))] }), _jsx("div", { className: "flex items-center justify-between", children: _jsx(Link, { to: "/forgot-password", className: "text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors", children: "\u00BFOlvidaste tu contrase\u00F1a?" }) }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl", children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Iniciando sesi\u00F3n..."] })) : ('Iniciar Sesión') }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["\u00BFNo tienes cuenta?", ' ', _jsx(Link, { to: "/register", className: "text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors", children: "Reg\u00EDstrate aqu\u00ED" })] }) })] }) })] }));
};
