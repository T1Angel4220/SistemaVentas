import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    // Limpiar mensajes cuando se monta el componente
    React.useEffect(() => {
        setError('');
        setSuccess('');
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Por favor ingresa un correo electrónico válido');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiService.requestPasswordReset(email);
            if (response.success) {
                setSuccess(response.message);
                setEmailSent(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            else {
                setError(response.message || 'Error al solicitar recuperación de contraseña');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        catch (err) {
            setError(err.message || 'Error de conexión al servidor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/login", className: "inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Volver al Login"] }), _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Recuperar Contrase\u00F1a" }), _jsx("p", { className: "text-gray-600", children: "Ingresa tu correo electr\u00F3nico y te enviaremos un c\u00F3digo para restablecer tu contrase\u00F1a" })] }), _jsx(Card, { className: "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden", children: !emailSent ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center", children: [_jsx(Mail, { className: "h-12 w-12 mx-auto mb-3" }), _jsx("h2", { className: "text-xl font-bold", children: "\u00BFOlvidaste tu contrase\u00F1a?" }), _jsx("p", { className: "text-blue-100 mt-2", children: "No te preocupes, te ayudamos a recuperarla con un c\u00F3digo" })] }), _jsxs("div", { className: "p-8", children: [error && (_jsxs("div", { className: `relative overflow-hidden ${error.includes('suspendida')
                                            ? 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 border-2 border-red-400'
                                            : 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300'} rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out] mb-6`, children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: `absolute inset-0 ${error.includes('suspendida') ? 'bg-red-500' : 'bg-red-400'} rounded-full animate-[ping_1s_ease-out]` }), _jsx("div", { className: `relative ${error.includes('suspendida')
                                                                        ? 'bg-gradient-to-br from-red-600 to-red-800'
                                                                        : 'bg-gradient-to-br from-red-500 to-rose-600'} rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]`, children: error.includes('suspendida') ? (_jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" }) })) : (_jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) })) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: `text-lg font-bold mb-1 ${error.includes('suspendida') ? 'text-red-900' : 'text-red-800'}`, children: error.includes('suspendida') ? '🚫 Cuenta Suspendida' : '¡Oops! Algo salió mal' }), _jsx("p", { className: `text-sm leading-relaxed mb-3 ${error.includes('suspendida') ? 'text-red-800' : 'text-red-700'}`, children: error }), error.includes('suspendida') && (_jsx("div", { className: "mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-md", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-blue-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-bold text-gray-900 mb-2", children: "\u00BFQu\u00E9 debes hacer?" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-700", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: [_jsx("strong", { children: "Contacta al administrador" }), " del sistema para conocer los motivos de la suspensi\u00F3n"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: ["Revisa las ", _jsx("strong", { children: "pol\u00EDticas de uso" }), " de la plataforma"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 font-bold mt-0.5", children: "\u2022" }), _jsxs("span", { children: ["Si crees que es un error, ", _jsx("strong", { children: "solicita una apelaci\u00F3n" }), " explicando tu situaci\u00F3n"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-orange-600 font-bold mt-0.5", children: "\u26A0" }), _jsxs("span", { className: "text-orange-800", children: [_jsx("strong", { children: "No podr\u00E1s recuperar tu contrase\u00F1a" }), " mientras tu cuenta est\u00E9 suspendida"] })] })] })] })] }) }))] })] }), _jsx("div", { className: "absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]", children: error.includes('suspendida') ? '🚫' : '⚠️' })] })), success && _jsx(Alert, { variant: "success", className: "mb-4", children: success }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Correo Electr\u00F3nico" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "email", type: "email", placeholder: "tu@email.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading, className: "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed" })] })] }), _jsx(Button, { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200", disabled: isLoading, children: isLoading ? 'Enviando...' : 'Enviar Código de Recuperación' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["\u00BFRecordaste tu contrase\u00F1a?", ' ', _jsx(Link, { to: "/login", className: "text-blue-600 hover:text-blue-800 font-medium", children: "Inicia sesi\u00F3n aqu\u00ED" })] }) })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-3" }), _jsx("h2", { className: "text-xl font-bold", children: "\u00A1Email Enviado!" }), _jsx("p", { className: "text-green-100 mt-2", children: "Revisa tu bandeja de entrada" })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 mb-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) }), _jsx("h3", { className: "text-xl font-bold text-green-800 mb-3", children: "\u00A1Email Enviado Exitosamente!" }), _jsxs("p", { className: "text-green-700 text-base mb-6", children: ["Si el correo existe en nuestro sistema, recibir\u00E1s un email con un ", _jsx("strong", { children: "c\u00F3digo de 6 d\u00EDgitos" }), " para restablecer tu contrase\u00F1a."] }), _jsx("div", { className: "text-center", children: _jsxs(Button, { onClick: () => navigate('/reset-password-code'), className: "w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Ir a ingresar c\u00F3digo de verificaci\u00F3n"] }) })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-6", children: [_jsx("h4", { className: "text-lg font-semibold text-blue-800 mb-3", children: "\u00BFNo recibiste el email?" }), _jsxs("ul", { className: "text-sm text-blue-700 space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-500 mr-2", children: "\u2022" }), "Revisa tu carpeta de spam o correo no deseado"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-500 mr-2", children: "\u2022" }), "Verifica que el correo est\u00E9 escrito correctamente"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-500 mr-2", children: "\u2022" }), "Espera unos minutos, puede tardar en llegar"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-500 mr-2", children: "\u2022" }), "El c\u00F3digo expira en 10 minutos por seguridad"] })] })] }), _jsxs("div", { className: "mt-6 space-y-3", children: [_jsx(Button, { onClick: () => {
                                                    setEmailSent(false);
                                                    setEmail('');
                                                    setSuccess('');
                                                }, variant: "outline", className: "w-full", children: "Intentar con otro correo" }), _jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", className: "w-full", children: "Volver al Login" }) })] })] })] })) })] }) }));
};
