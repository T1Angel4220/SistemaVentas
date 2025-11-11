import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Hash, CheckCircle } from 'lucide-react';
import { TermsOfServiceModal } from '../modals/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../modals/PrivacyPolicyModal';
// Icono de candado simple
const LockIcon = ({ className }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }));
export const RegisterForm = () => {
    const { register, isLoading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        genero: '',
        password: '',
        confirmPassword: '',
        tipo_usuario: 'comprador',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    // Limpiar error del contexto cuando se monta el componente
    React.useEffect(() => {
        clearError();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar
    // Función para capitalizar la primera letra de cada palabra
    const capitalizeFirstLetter = (text) => {
        return text
            .split(' ')
            .map(word => {
            if (word.length === 0)
                return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
            .join(' ');
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;
        // Validaciones en tiempo real según el campo
        switch (name) {
            case 'nombre':
            case 'apellido':
                // Solo letras, espacios y tildes
                sanitizedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                // Capitalizar la primera letra de cada palabra automáticamente
                sanitizedValue = capitalizeFirstLetter(sanitizedValue);
                break;
            case 'cedula':
                // Solo números (exactamente 10 dígitos)
                sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
                break;
            case 'telefono':
                // Solo números y guiones
                sanitizedValue = value.replace(/[^0-9-]/g, '');
                break;
            case 'correo':
                // Eliminar espacios
                sanitizedValue = value.trim();
                break;
            default:
                sanitizedValue = value;
        }
        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue,
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
        // Limpiar mensaje de éxito
        if (successMessage) {
            setSuccessMessage('');
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.cedula) {
            errors.cedula = 'La cédula es requerida';
        }
        else if (!/^[0-9]+$/.test(formData.cedula)) {
            errors.cedula = 'La cédula solo puede contener números';
        }
        else if (formData.cedula.length !== 10) {
            errors.cedula = 'La cédula debe tener exactamente 10 dígitos';
        }
        if (!formData.nombre) {
            errors.nombre = 'El nombre es requerido';
        }
        else if (formData.nombre.length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
            errors.nombre = 'El nombre solo puede contener letras';
        }
        if (!formData.apellido) {
            errors.apellido = 'El apellido es requerido';
        }
        else if (formData.apellido.length < 2) {
            errors.apellido = 'El apellido debe tener al menos 2 caracteres';
        }
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
            errors.apellido = 'El apellido solo puede contener letras';
        }
        if (!formData.correo) {
            errors.correo = 'El correo es requerido';
        }
        else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.correo)) {
            errors.correo = 'El correo debe ser válido (ejemplo: usuario@dominio.com)';
        }
        if (formData.telefono && formData.telefono.length < 8) {
            errors.telefono = 'El teléfono debe tener al menos 8 caracteres';
        }
        else if (formData.telefono && !/^[0-9-]+$/.test(formData.telefono)) {
            errors.telefono = 'El teléfono solo puede contener números';
        }
        if (!formData.direccion) {
            errors.direccion = 'La dirección es requerida';
        }
        else if (formData.direccion.length < 3) {
            errors.direccion = 'La dirección debe tener al menos 3 caracteres';
        }
        if (!formData.genero) {
            errors.genero = 'El género es requerido';
        }
        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        }
        else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirma tu contraseña';
        }
        else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            // Scroll hacia arriba para mostrar los errores
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...userData } = formData;
            // Asegurar que el género tenga el tipo correcto
            const dataToSend = {
                ...userData,
                genero: userData.genero
            };
            await register(dataToSend);
            setSuccessMessage('¡Registro exitoso! Revisa tu email para obtener el código de verificación.');
            setShowSuccessAnimation(true);
            // Scroll hacia arriba para mostrar el mensaje de éxito
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Redirigir a la página de verificación de código después de 3 segundos
            setTimeout(() => {
                window.location.href = `/verify-code?email=${encodeURIComponent(formData.correo)}`;
            }, 3000);
        }
        catch (error) {
            console.error('Error en registro:', error);
            // Scroll hacia arriba para mostrar el error del servidor
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600", children: [_jsx("h2", { className: "text-2xl font-bold text-white text-center", children: "Crear Cuenta" }), _jsx("p", { className: "text-indigo-100 text-center mt-2", children: "Reg\u00EDstrate para comenzar a usar el sistema" })] }), _jsx("div", { className: "px-8 py-6", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: "text-lg font-bold text-red-800 mb-1 flex items-center gap-2", children: _jsx("span", { children: "\u00A1Oops! Algo sali\u00F3 mal" }) }), _jsx("p", { className: "text-sm text-red-700 leading-relaxed", children: error })] })] }), _jsx("div", { className: "absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]", children: "\u26A0\uFE0F" })] })), showSuccessAnimation && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-2xl animate-[slideInDown_0.5s_ease-out]", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-[confetti_3s_ease-out]" }), _jsx("div", { className: "absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-[confetti_3s_ease-out_0.2s]" }), _jsx("div", { className: "absolute top-0 left-3/4 w-2 h-2 bg-purple-400 rounded-full animate-[confetti_3s_ease-out_0.4s]" }), _jsx("div", { className: "absolute top-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-[confetti_3s_ease-out_0.6s]" }), _jsx("div", { className: "absolute top-0 left-2/3 w-2 h-2 bg-pink-400 rounded-full animate-[confetti_3s_ease-out_0.8s]" })] }), _jsx("div", { className: "flex justify-center mb-4", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-green-500 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg animate-[bounceIn_0.6s_ease-out]", children: _jsx("svg", { className: "w-12 h-12 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7", className: "animate-[drawCheck_0.5s_ease-out_0.3s_forwards]", style: {
                                                            strokeDasharray: 20,
                                                            strokeDashoffset: 20
                                                        } }) }) })] }) }), _jsxs("div", { className: "text-center space-y-3 animate-[fadeIn_0.8s_ease-out_0.5s_both]", children: [_jsx("h3", { className: "text-2xl font-bold text-green-800 mb-2", children: "\u00A1Registro Exitoso! \uD83C\uDF89" }), _jsxs("p", { className: "text-base text-green-700 leading-relaxed max-w-md mx-auto", children: ["Tu cuenta ha sido creada exitosamente. Hemos enviado un ", _jsx("strong", { children: "c\u00F3digo de verificaci\u00F3n de 6 d\u00EDgitos" }), " a tu correo electr\u00F3nico."] }), _jsxs("div", { className: "flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 mx-auto w-fit", children: [_jsx("svg", { className: "w-5 h-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }), _jsx("span", { className: "text-sm font-semibold text-green-800", children: formData.correo })] }), _jsxs("div", { className: "pt-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("p", { className: "text-sm text-green-600 mt-2 font-medium", children: "Redirigiendo a verificaci\u00F3n..." })] })] }), _jsx("div", { className: "absolute top-4 right-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite]", children: "\u2728" }), _jsx("div", { className: "absolute bottom-4 left-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite_reverse]", children: "\uD83C\uDF8A" })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Nombre" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(User, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", name: "nombre", placeholder: "Tu nombre", value: formData.nombre, onChange: handleInputChange, disabled: isLoading, maxLength: 50, autoComplete: "given-name", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.nombre
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.nombre && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.nombre }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Apellido" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(User, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", name: "apellido", placeholder: "Tu apellido", value: formData.apellido, onChange: handleInputChange, disabled: isLoading, maxLength: 50, autoComplete: "family-name", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.apellido
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.apellido && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.apellido }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 flex items-center justify-between", children: [_jsx("span", { children: "C\u00E9dula" }), _jsxs("span", { className: `text-xs font-bold transition-colors duration-200 ${formData.cedula.length === 10
                                                ? 'text-emerald-600'
                                                : formData.cedula.length > 0
                                                    ? 'text-indigo-600'
                                                    : 'text-gray-400'}`, children: [formData.cedula.length, "/10 d\u00EDgitos"] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Hash, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", name: "cedula", placeholder: "1234567890", value: formData.cedula, onChange: handleInputChange, disabled: isLoading, maxLength: 10, inputMode: "numeric", autoComplete: "off", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.cedula
                                                ? 'border-red-300 bg-red-50 border-2'
                                                : formData.cedula.length === 10
                                                    ? 'border-emerald-500 border-2'
                                                    : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.cedula && (_jsxs("p", { className: "text-sm text-red-600 mt-1 flex items-center", children: [_jsx("span", { className: "inline-block w-1 h-1 bg-red-600 rounded-full mr-1.5" }), validationErrors.cedula] })), formData.cedula.length > 0 && !validationErrors.cedula && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "flex items-center space-x-1", children: [...Array(10)].map((_, index) => (_jsx("div", { className: `h-1.5 flex-1 rounded-full transition-all duration-200 ${index < formData.cedula.length
                                                    ? formData.cedula.length === 10
                                                        ? 'bg-emerald-500'
                                                        : 'bg-indigo-500'
                                                    : 'bg-gray-200'}` }, index))) }), formData.cedula.length === 10 && (_jsxs("p", { className: "text-emerald-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "C\u00E9dula completa"] }))] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Correo electr\u00F3nico" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "email", name: "correo", placeholder: "usuario@ejemplo.com", value: formData.correo, onChange: handleInputChange, disabled: isLoading, maxLength: 100, autoComplete: "email", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.correo
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.correo && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.correo }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Tel\u00E9fono (opcional)" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Phone, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "tel", name: "telefono", placeholder: "8888-8888", value: formData.telefono, onChange: handleInputChange, disabled: isLoading, maxLength: 15, inputMode: "numeric", autoComplete: "tel", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.telefono
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.telefono && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.telefono }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "G\u00E9nero" }), _jsxs("select", { name: "genero", value: formData.genero, onChange: handleInputChange, disabled: isLoading, className: `block w-full py-3 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.genero
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`, children: [_jsx("option", { value: "", children: "Seleccionar g\u00E9nero" }), _jsx("option", { value: "masculino", children: "Masculino" }), _jsx("option", { value: "femenino", children: "Femenino" }), _jsx("option", { value: "otro", children: "Otro" })] }), validationErrors.genero && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.genero }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Direcci\u00F3n" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(MapPin, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", name: "direccion", placeholder: "Ambato, Ecuador", value: formData.direccion, onChange: handleInputChange, disabled: isLoading, maxLength: 200, autoComplete: "street-address", className: `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.direccion
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` })] }), validationErrors.direccion && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.direccion }))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Tipo de cuenta" }), _jsxs("div", { className: "flex space-x-6", children: [_jsxs("label", { className: "flex items-center cursor-pointer", children: [_jsx("input", { type: "radio", name: "tipo_usuario", value: "comprador", checked: formData.tipo_usuario === 'comprador', onChange: handleInputChange, disabled: isLoading, className: "w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-700", children: "Comprador" })] }), _jsxs("label", { className: "flex items-center cursor-pointer", children: [_jsx("input", { type: "radio", name: "tipo_usuario", value: "vendedor", checked: formData.tipo_usuario === 'vendedor', onChange: handleInputChange, disabled: isLoading, className: "w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-700", children: "Vendedor" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(LockIcon, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: showPassword ? 'text' : 'password', name: "password", placeholder: "M\u00EDnimo 6 caracteres", value: formData.password, onChange: handleInputChange, disabled: isLoading, className: `block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.password
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors", disabled: isLoading, children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] }), validationErrors.password && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.password })), formData.password && !validationErrors.password && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `h-2 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= 6
                                                                ? formData.password.length >= 10
                                                                    ? 'bg-emerald-500'
                                                                    : formData.password.length >= 8
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                : 'bg-gray-200'}` }), _jsx("div", { className: `h-2 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= 8
                                                                ? formData.password.length >= 10
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-amber-500'
                                                                : 'bg-gray-200'}` }), _jsx("div", { className: `h-2 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= 10 ? 'bg-emerald-500' : 'bg-gray-200'}` })] }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("p", { className: `text-xs font-bold flex items-center transition-colors duration-300 ${formData.password.length >= 10
                                                                ? 'text-emerald-700'
                                                                : formData.password.length >= 8
                                                                    ? 'text-amber-700'
                                                                    : 'text-red-700'}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full mr-2 ${formData.password.length >= 10
                                                                        ? 'bg-emerald-500'
                                                                        : formData.password.length >= 8
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-red-500'}` }), "Fortaleza: ", formData.password.length >= 10 ? '🛡️ Fuerte' : formData.password.length >= 8 ? '⚡ Media' : '⚠️ Débil'] }), _jsxs("span", { className: "text-xs text-gray-600 font-medium", children: [formData.password.length, " caracteres"] })] })] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700", children: "Confirmar contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(LockIcon, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: showConfirmPassword ? 'text' : 'password', name: "confirmPassword", placeholder: "Confirma tu contrase\u00F1a", value: formData.confirmPassword, onChange: handleInputChange, disabled: isLoading, className: `block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationErrors.confirmPassword
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'} ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors", disabled: isLoading, children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] }), validationErrors.confirmPassword && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: validationErrors.confirmPassword })), formData.confirmPassword && formData.password === formData.confirmPassword && !validationErrors.confirmPassword && (_jsx("div", { className: "mt-2", children: _jsxs("p", { className: "text-emerald-600 text-xs font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Las contrase\u00F1as coinciden"] }) }))] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl", children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Creando cuenta..."] })) : ('Crear Cuenta') }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["\u00BFYa tienes cuenta?", ' ', _jsx(Link, { to: "/login", className: "text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors", children: "Inicia sesi\u00F3n aqu\u00ED" })] }) })] }) }), _jsx("div", { className: "text-center mt-6 px-4", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Al registrarte, aceptas nuestros", ' ', _jsx("button", { type: "button", onClick: () => setShowTermsModal(true), className: "text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded", children: "T\u00E9rminos de Servicio" }), ' ', "y", ' ', _jsx("button", { type: "button", onClick: () => setShowPrivacyModal(true), className: "text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded", children: "Pol\u00EDtica de Privacidad" })] }) }), _jsx(TermsOfServiceModal, { isOpen: showTermsModal, onClose: () => setShowTermsModal(false) }), _jsx(PrivacyPolicyModal, { isOpen: showPrivacyModal, onClose: () => setShowPrivacyModal(false) })] }));
};
