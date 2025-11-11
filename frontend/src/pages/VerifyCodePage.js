import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
export const VerifyCodePage = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendingCode, setResendingCode] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    // Limpiar mensajes cuando se monta el componente
    React.useEffect(() => {
        setError('');
        setResendMessage('');
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code || code.length !== 6) {
            setError('Por favor ingresa un código de 6 dígitos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await apiService.verifyEmail(code);
            if (response.success) {
                setSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
            else {
                setError(response.message || 'Error verificando el código');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        catch (error) {
            console.error('Error verificando código:', error);
            setError(error.response?.data?.message || 'Error verificando el código');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo números
        if (value.length <= 6) {
            setCode(value);
            setError('');
        }
    };
    const handleResendCode = async () => {
        if (!email) {
            setError('No se encontró el correo electrónico');
            return;
        }
        setResendingCode(true);
        setResendMessage('');
        setError('');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/resend-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email }),
            });
            const data = await response.json();
            if (data.success) {
                setResendMessage(data.message);
            }
            else {
                setError(data.message);
            }
        }
        catch (error) {
            console.error('Error reenviando código:', error);
            setError('Error al reenviar el código. Intenta nuevamente.');
        }
        finally {
            setResendingCode(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs(Card, { className: "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-3" }), _jsx("h2", { className: "text-xl font-bold", children: "\u00A1Email Verificado!" }), _jsx("p", { className: "text-green-100 mt-2", children: "Tu cuenta est\u00E1 lista para usarse" })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-2xl animate-[slideInDown_0.5s_ease-out] mb-6", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-[confetti_3s_ease-out]" }), _jsx("div", { className: "absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-[confetti_3s_ease-out_0.2s]" }), _jsx("div", { className: "absolute top-0 left-3/4 w-2 h-2 bg-purple-400 rounded-full animate-[confetti_3s_ease-out_0.4s]" }), _jsx("div", { className: "absolute top-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-[confetti_3s_ease-out_0.6s]" }), _jsx("div", { className: "absolute top-0 left-2/3 w-2 h-2 bg-pink-400 rounded-full animate-[confetti_3s_ease-out_0.8s]" })] }), _jsx("div", { className: "flex justify-center mb-4", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-green-500 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg animate-[bounceIn_0.6s_ease-out]", children: _jsx("svg", { className: "w-12 h-12 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7", className: "animate-[drawCheck_0.5s_ease-out_0.3s_forwards]", style: {
                                                                    strokeDasharray: 20,
                                                                    strokeDashoffset: 20
                                                                } }) }) })] }) }), _jsxs("div", { className: "text-center space-y-3 animate-[fadeIn_0.8s_ease-out_0.5s_both]", children: [_jsx("h3", { className: "text-2xl font-bold text-green-800 mb-2", children: "\u00A1Verificaci\u00F3n Exitosa! \uD83C\uDF89" }), _jsx("p", { className: "text-base text-green-700 leading-relaxed max-w-md mx-auto", children: "Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesi\u00F3n y disfrutar de todas las funcionalidades." }), _jsxs("div", { className: "pt-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("p", { className: "text-sm text-green-600 mt-2 font-medium", children: "Redirigiendo al login..." })] })] }), _jsx("div", { className: "absolute top-4 right-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite]", children: "\u2728" }), _jsx("div", { className: "absolute bottom-4 left-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite_reverse]", children: "\uD83C\uDF8A" })] }), _jsxs(Button, { onClick: () => navigate('/login'), className: "w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Ir al Login"] })] })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 py-8", children: _jsxs("div", { className: "w-full max-w-5xl mx-auto", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg", children: _jsx(Shield, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Verificar Email" }), _jsx("p", { className: "text-gray-600", children: "Ingresa el c\u00F3digo de 6 d\u00EDgitos que enviamos a tu correo" }), email && (_jsxs("div", { className: "mt-2 inline-flex items-center bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm", children: [_jsx(Mail, { className: "h-3.5 w-3.5 mr-1.5 text-blue-600" }), _jsx("span", { className: "text-xs font-medium text-gray-700", children: email })] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5 items-start", children: [_jsx("div", { className: "lg:col-span-3", children: _jsxs(Card, { className: "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center", children: [_jsx(Shield, { className: "h-12 w-12 mx-auto mb-3" }), _jsx("h2", { className: "text-xl font-bold", children: "C\u00F3digo de Verificaci\u00F3n" }), _jsx("p", { className: "text-blue-100 mt-2", children: "Ingresa el c\u00F3digo de 6 d\u00EDgitos" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-6", children: [error && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: "text-lg font-bold text-red-800 mb-1", children: "\u00A1Oops! Algo sali\u00F3 mal" }), _jsx("p", { className: "text-sm text-red-700 leading-relaxed", children: error })] })] }), _jsx("div", { className: "absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]", children: "\u26A0\uFE0F" })] })), resendMessage && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-green-800", children: resendMessage }) })] }) })), _jsxs("div", { children: [_jsx("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-700 mb-2", children: "C\u00F3digo de Verificaci\u00F3n" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "code", type: "text", value: code, onChange: handleCodeChange, placeholder: "\u2022 \u2022 \u2022 \u2022 \u2022 \u2022", maxLength: 6, className: "text-center text-3xl font-mono tracking-[0.5em] py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 focus:border-blue-500 rounded-xl shadow-inner", autoComplete: "off", autoFocus: true }), code && (_jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2", children: _jsx("div", { className: `w-3 h-3 rounded-full ${code.length === 6 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}` }) }))] }), _jsxs("p", { className: "text-xs text-gray-500 mt-2 text-center", children: [code.length, "/6 d\u00EDgitos ingresados"] })] }), _jsx(Button, { type: "submit", disabled: isLoading || code.length !== 6, className: "w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block" }), "Verificando..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2 inline-block" }), "Verificar C\u00F3digo"] })) }), _jsx("div", { className: "text-center pt-2", children: _jsxs("button", { type: "button", onClick: () => navigate('/login'), className: "text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center mx-auto transition-colors group", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" }), "Volver al Login"] }) })] })] }) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { className: "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full", children: [_jsxs("div", { className: "px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx("div", { className: "w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center", children: _jsx(Mail, { className: "h-5 w-5 text-white" }) }) }), _jsx("h3", { className: "text-lg font-bold text-center", children: "\u00BFNo recibiste el c\u00F3digo?" })] }), _jsxs("div", { className: "p-6 space-y-4", children: [resendMessage && (_jsx("div", { className: "bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg animate-[fadeIn_0.3s_ease-out]", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }), _jsx("p", { className: "text-sm text-green-800 font-medium", children: resendMessage })] }) })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-3 p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: _jsx("div", { className: "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: "1" }) }) }), _jsxs("p", { className: "text-sm text-gray-700 leading-relaxed", children: ["Revisa tu carpeta de ", _jsx("span", { className: "font-semibold text-gray-900", children: "spam" }), " o correo no deseado"] })] }), _jsxs("div", { className: "flex items-start space-x-3 p-3 bg-orange-50 rounded-lg", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: _jsx("div", { className: "w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: "2" }) }) }), _jsxs("p", { className: "text-sm text-gray-700 leading-relaxed", children: ["El c\u00F3digo expira en ", _jsx("span", { className: "font-semibold text-gray-900", children: "10 minutos" }), " por seguridad"] })] }), _jsxs("div", { className: "flex items-start space-x-3 p-3 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: _jsx("div", { className: "w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: "3" }) }) }), _jsxs("p", { className: "text-sm text-gray-700 leading-relaxed", children: ["Verifica que el ", _jsx("span", { className: "font-semibold text-gray-900", children: "email sea correcto" })] })] })] }), _jsx("div", { className: "pt-2", children: _jsx("button", { type: "button", onClick: handleResendCode, disabled: resendingCode || !email, className: "w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl", children: resendingCode ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Enviando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Mail, { className: "h-4 w-4 mr-2" }), "Reenviar c\u00F3digo"] })) }) }), _jsx("p", { className: "text-xs text-center text-gray-500 pt-2", children: "Si sigues teniendo problemas, contacta con soporte" })] })] }) })] })] }) }));
};
