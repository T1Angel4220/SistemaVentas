import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';
export const ResetPasswordCodePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    // Limpiar mensajes cuando se monta el componente
    React.useEffect(() => {
        setError('');
        setSuccess('');
    }, []);
    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setFormData(prev => ({ ...prev, code: value }));
            if (validationErrors.code) {
                setValidationErrors(prev => ({ ...prev, code: '' }));
            }
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error de validación cuando el usuario empiece a escribir
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.code) {
            errors.code = 'El código de recuperación es requerido';
        }
        else if (formData.code.length !== 6) {
            errors.code = 'El código debe tener 6 dígitos';
        }
        if (!formData.newPassword) {
            errors.newPassword = 'La nueva contraseña es requerida';
        }
        else if (formData.newPassword.length < 6) {
            errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirma tu nueva contraseña';
        }
        else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiService.resetPassword(formData.code, formData.newPassword);
            if (response.success) {
                setSuccess(response.message || 'Contraseña restablecida exitosamente');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
            else {
                setError(response.message || 'Error al restablecer la contraseña');
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
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/login", className: "inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Volver al Login"] }), _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Restablecer Contrase\u00F1a" }), _jsx("p", { className: "text-gray-600", children: "Ingresa el c\u00F3digo de 6 d\u00EDgitos y tu nueva contrase\u00F1a" })] }), _jsxs(Card, { className: "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center", children: [_jsx(Shield, { className: "h-12 w-12 mx-auto mb-3" }), _jsx("h2", { className: "text-xl font-bold", children: "C\u00F3digo de Recuperaci\u00F3n" }), _jsx("p", { className: "text-blue-100 mt-2", children: "Ingresa el c\u00F3digo enviado a tu email" })] }), _jsxs("div", { className: "p-8", children: [error && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out] mb-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: "text-lg font-bold text-red-800 mb-1", children: "\u00A1Oops! Algo sali\u00F3 mal" }), _jsx("p", { className: "text-sm text-red-700 leading-relaxed", children: error })] })] }), _jsx("div", { className: "absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]", children: "\u26A0\uFE0F" })] })), success && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-2xl animate-[slideInDown_0.5s_ease-out] mb-6", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-[confetti_3s_ease-out]" }), _jsx("div", { className: "absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-[confetti_3s_ease-out_0.2s]" }), _jsx("div", { className: "absolute top-0 left-3/4 w-2 h-2 bg-purple-400 rounded-full animate-[confetti_3s_ease-out_0.4s]" }), _jsx("div", { className: "absolute top-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-[confetti_3s_ease-out_0.6s]" }), _jsx("div", { className: "absolute top-0 left-2/3 w-2 h-2 bg-pink-400 rounded-full animate-[confetti_3s_ease-out_0.8s]" })] }), _jsx("div", { className: "flex justify-center mb-4", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-green-500 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg animate-[bounceIn_0.6s_ease-out]", children: _jsx("svg", { className: "w-12 h-12 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7", className: "animate-[drawCheck_0.5s_ease-out_0.3s_forwards]", style: {
                                                                    strokeDasharray: 20,
                                                                    strokeDashoffset: 20
                                                                } }) }) })] }) }), _jsxs("div", { className: "text-center space-y-3 animate-[fadeIn_0.8s_ease-out_0.5s_both]", children: [_jsx("h3", { className: "text-2xl font-bold text-green-800 mb-2", children: "\u00A1Contrase\u00F1a Restablecida! \uD83C\uDF89" }), _jsx("p", { className: "text-base text-green-700 leading-relaxed max-w-md mx-auto", children: success }), _jsxs("div", { className: "pt-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("p", { className: "text-sm text-green-600 mt-2 font-medium", children: "Redirigiendo al login..." })] })] }), _jsx("div", { className: "absolute top-4 right-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite]", children: "\u2728" }), _jsx("div", { className: "absolute bottom-4 left-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite_reverse]", children: "\uD83C\uDF8A" })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-700 mb-2", children: "C\u00F3digo de Recuperaci\u00F3n" }), _jsx(Input, { id: "code", type: "text", placeholder: "------", value: formData.code, onChange: handleCodeChange, maxLength: 6, className: `text-center text-xl font-mono tracking-widest ${validationErrors.code ? 'border-red-500' : ''}`, disabled: isLoading }), validationErrors.code && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: validationErrors.code }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "newPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nueva Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "newPassword", name: "newPassword", type: showPassword ? 'text' : 'password', placeholder: "M\u00EDnimo 6 caracteres", value: formData.newPassword, onChange: handleInputChange, disabled: isLoading, className: `w-full pr-10 ${validationErrors.newPassword ? 'border-red-500' : ''}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), validationErrors.newPassword && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: validationErrors.newPassword }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirmar Nueva Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', placeholder: "Repite tu nueva contrase\u00F1a", value: formData.confirmPassword, onChange: handleInputChange, disabled: isLoading, className: `w-full pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}` }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), validationErrors.confirmPassword && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: validationErrors.confirmPassword }))] }), _jsx(Button, { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200", disabled: isLoading, children: isLoading ? 'Restableciendo...' : 'Restablecer Contraseña' })] }), _jsxs("div", { className: "mt-6 text-center space-y-3", children: [_jsx("div", { children: _jsx(Link, { to: "/forgot-password", className: "text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors", children: "\u00BFNo recibiste el c\u00F3digo? Solicita uno nuevo" }) }), _jsx("div", { children: _jsxs("p", { className: "text-sm text-gray-600", children: ["\u00BFRecordaste tu contrase\u00F1a?", ' ', _jsx(Link, { to: "/login", className: "text-blue-600 hover:text-blue-800 font-medium", children: "Inicia sesi\u00F3n aqu\u00ED" })] }) })] })] })] })] }) }));
};
