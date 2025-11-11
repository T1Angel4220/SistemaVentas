import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { UserPlus, ArrowLeft, Shield, Mail, User, Lock, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
export const RegisterModeratorPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        genero: 'masculino',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // Estados para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Estados para animaciones de salida
    const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
    const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);
    // Refs para el contenedor de alertas y campos del formulario
    const alertRef = useRef(null);
    const cedulaRef = useRef(null);
    const nombreRef = useRef(null);
    const apellidoRef = useRef(null);
    const correoRef = useRef(null);
    const telefonoRef = useRef(null);
    const direccionRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    // Scroll automático hacia las alertas cuando aparecen
    useEffect(() => {
        if ((error || success) && alertRef.current) {
            alertRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [error, success]);
    // Auto-ocultar alertas después de 5 segundos con animación
    useEffect(() => {
        if (error && !isErrorFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsErrorFadingOut(true);
            }, 4400); // Empezar fade-out 600ms antes
            const removeTimer = setTimeout(() => {
                setError('');
                setIsErrorFadingOut(false);
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [error, isErrorFadingOut]);
    useEffect(() => {
        if (success && !isSuccessFadingOut) {
            const fadeTimer = setTimeout(() => {
                setIsSuccessFadingOut(true);
            }, 4400); // Empezar fade-out 600ms antes
            const removeTimer = setTimeout(() => {
                setSuccess('');
                setIsSuccessFadingOut(false);
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [success, isSuccessFadingOut]);
    // Verificar que solo administradores puedan acceder
    if (currentUser?.tipo_usuario !== 'administrador') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsxs("div", { className: "p-6 sm:p-8 text-center", children: [_jsx(XCircle, { className: "h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 mb-4", children: "Acceso Denegado" }), _jsx("p", { className: "text-gray-600 mb-6 text-sm sm:text-base", children: "Solo los administradores pueden registrar moderadores." }), _jsx(Button, { onClick: () => navigate('/dashboard'), className: "w-full", children: "Volver al Dashboard" })] }) }) }));
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        // Validaciones específicas por campo
        switch (name) {
            case 'nombre':
            case 'apellido':
                // Solo letras y espacios
                processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                // Capitalizar primera letra de cada palabra
                processedValue = processedValue
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                break;
            case 'cedula':
                // Solo números, máximo 10 dígitos
                processedValue = value.replace(/\D/g, '').slice(0, 10);
                break;
            case 'telefono':
                // Solo números
                processedValue = value.replace(/\D/g, '');
                break;
            default:
                processedValue = value;
        }
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        // Limpiar error de validación cuando el usuario empiece a escribir
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };
    const validateForm = () => {
        const errors = {};
        let firstErrorField = null;
        if (!formData.cedula) {
            errors.cedula = 'La cédula es requerida';
            if (!firstErrorField)
                firstErrorField = 'cedula';
        }
        else if (formData.cedula.length !== 10) {
            errors.cedula = 'La cédula debe tener exactamente 10 dígitos';
            if (!firstErrorField)
                firstErrorField = 'cedula';
        }
        if (!formData.nombre) {
            errors.nombre = 'El nombre es requerido';
            if (!firstErrorField)
                firstErrorField = 'nombre';
        }
        else if (formData.nombre.length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
            if (!firstErrorField)
                firstErrorField = 'nombre';
        }
        if (!formData.apellido) {
            errors.apellido = 'El apellido es requerido';
            if (!firstErrorField)
                firstErrorField = 'apellido';
        }
        else if (formData.apellido.length < 2) {
            errors.apellido = 'El apellido debe tener al menos 2 caracteres';
            if (!firstErrorField)
                firstErrorField = 'apellido';
        }
        if (!formData.correo) {
            errors.correo = 'El correo es requerido';
            if (!firstErrorField)
                firstErrorField = 'correo';
        }
        else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            errors.correo = 'El correo debe ser válido';
            if (!firstErrorField)
                firstErrorField = 'correo';
        }
        if (formData.telefono && formData.telefono.length < 8) {
            errors.telefono = 'El teléfono debe tener al menos 8 caracteres';
            if (!firstErrorField)
                firstErrorField = 'telefono';
        }
        if (!formData.direccion) {
            errors.direccion = 'La dirección es requerida';
            if (!firstErrorField)
                firstErrorField = 'direccion';
        }
        else if (formData.direccion.length < 3) {
            errors.direccion = 'La dirección debe tener al menos 3 caracteres';
            if (!firstErrorField)
                firstErrorField = 'direccion';
        }
        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
            if (!firstErrorField)
                firstErrorField = 'password';
        }
        else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
            if (!firstErrorField)
                firstErrorField = 'password';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirma la contraseña';
            if (!firstErrorField)
                firstErrorField = 'confirmPassword';
        }
        else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
            if (!firstErrorField)
                firstErrorField = 'confirmPassword';
        }
        setValidationErrors(errors);
        // Si hay errores, hacer scroll al primer campo con error
        if (firstErrorField && Object.keys(errors).length > 0) {
            scrollToField(firstErrorField);
        }
        return Object.keys(errors).length === 0;
    };
    // Función para hacer scroll al campo con error
    const scrollToField = (fieldName) => {
        const refs = {
            cedula: cedulaRef,
            nombre: nombreRef,
            apellido: apellidoRef,
            correo: correoRef,
            telefono: telefonoRef,
            direccion: direccionRef,
            password: passwordRef,
            confirmPassword: confirmPasswordRef,
        };
        const fieldRef = refs[fieldName];
        if (fieldRef?.current) {
            // Hacer scroll al campo con error
            fieldRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            // Enfocar el campo después de un pequeño delay para que el scroll termine
            setTimeout(() => {
                fieldRef.current?.focus();
            }, 500);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...moderatorData } = formData;
            // Agregar tipo_usuario como moderador
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataToSend = {
                ...moderatorData,
                tipo_usuario: 'moderador'
            };
            const response = await apiService.registerModerator(dataToSend);
            setSuccess(response.message || 'Moderador registrado exitosamente. Puede iniciar sesión inmediatamente.');
            // Limpiar formulario
            setFormData({
                cedula: '',
                nombre: '',
                apellido: '',
                correo: '',
                telefono: '',
                direccion: '',
                genero: 'masculino',
                password: '',
                confirmPassword: ''
            });
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/admin/users');
            }, 3000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            console.error('Error registrando moderador:', error);
            // Manejar el error de autenticación específicamente
            if (error.message === 'Token de acceso requerido' || error.message === 'Sesión cerrada por administrador') {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
            else if (error.message) {
                setError(error.message);
            }
            else {
                setError('Error registrando moderador. Por favor, intenta nuevamente.');
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 sm:py-10 space-y-4 sm:space-y-0", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/admin/users'), className: "flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm px-4 py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto", children: [_jsx(ArrowLeft, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "text-sm sm:text-base", children: "Volver" })] }), _jsxs("div", { className: "space-y-2 text-center sm:text-left", children: [_jsxs("div", { className: "flex items-center justify-center sm:justify-start space-x-3", children: [_jsx("div", { className: "p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm", children: _jsx(UserPlus, { className: "h-5 w-5 sm:h-7 sm:w-7 text-white" }) }), _jsx("h1", { className: "text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight", children: "Registrar Moderador" })] }), _jsx("p", { className: "text-blue-50 text-sm sm:text-base sm:text-lg ml-0 sm:ml-16", children: "Crear nueva cuenta de moderador con acceso completo" })] })] }), _jsxs("div", { className: "flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm", children: [_jsx(Shield, { className: "h-4 w-4 sm:h-5 sm:w-5 text-white" }), _jsx("span", { className: "text-xs sm:text-sm font-semibold text-white", children: "Solo Administradores" })] })] }) }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10", children: [_jsxs("div", { className: "lg:col-span-1 space-y-4 sm:space-y-6", children: [_jsxs(Card, { className: "overflow-hidden shadow-2xl border-0", children: [_jsx("div", { className: "bg-gradient-to-br from-purple-600 to-indigo-600 p-4 sm:p-6 lg:p-8 text-white", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl mb-4 sm:mb-6 transform hover:scale-110 transition-all duration-300", children: _jsx(UserPlus, { className: "h-8 w-8 sm:h-10 sm:w-10 lg:h-14 lg:w-14 text-white" }) }), _jsx("h2", { className: "text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 sm:mb-3", children: "Nuevo Moderador" }), _jsx("p", { className: "text-purple-100 text-xs sm:text-sm lg:text-base", children: "Registra un nuevo moderador con permisos completos de administraci\u00F3n" })] }) }), _jsx("div", { className: "p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-white", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-xs sm:text-sm font-bold text-gray-700 mb-3 sm:mb-4 flex items-center", children: [_jsx(Shield, { className: "h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600" }), "PERMISOS Y FUNCIONES"] }), _jsxs("div", { className: "space-y-2 sm:space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-xs sm:text-sm text-gray-700 font-medium", children: "Acceso a gesti\u00F3n de usuarios" })] }), _jsxs("div", { className: "flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-xs sm:text-sm text-gray-700 font-medium", children: "Activaci\u00F3n/desactivaci\u00F3n de cuentas" })] }), _jsxs("div", { className: "flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-xs sm:text-sm text-gray-700 font-medium", children: "Suspensi\u00F3n de usuarios" })] }), _jsxs("div", { className: "flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-xs sm:text-sm text-gray-700 font-medium", children: "Moderaci\u00F3n de contenido" })] })] })] }) })] }), _jsxs(Card, { className: "overflow-hidden shadow-xl border-2 border-emerald-200", children: [_jsx("div", { className: "bg-gradient-to-r from-emerald-500 to-green-600 p-3 sm:p-4", children: _jsxs("h3", { className: "text-sm sm:text-lg font-bold text-white flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Informaci\u00F3n Importante"] }) }), _jsx("div", { className: "p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-50", children: _jsxs("ul", { className: "space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-800", children: [_jsxs("li", { className: "flex items-start space-x-2 sm:space-x-3", children: [_jsx("div", { className: "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx("span", { className: "text-white font-bold text-xs", children: "\u2713" }) }), _jsx("span", { className: "font-medium", children: "El moderador se activar\u00E1 autom\u00E1ticamente" })] }), _jsxs("li", { className: "flex items-start space-x-2 sm:space-x-3", children: [_jsx("div", { className: "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx("span", { className: "text-white font-bold text-xs", children: "\u2713" }) }), _jsx("span", { className: "font-medium", children: "No requiere verificaci\u00F3n por email" })] }), _jsxs("li", { className: "flex items-start space-x-2 sm:space-x-3", children: [_jsx("div", { className: "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx("span", { className: "text-white font-bold text-xs", children: "\u2713" }) }), _jsx("span", { className: "font-medium", children: "Puede iniciar sesi\u00F3n inmediatamente" })] }), _jsxs("li", { className: "flex items-start space-x-2 sm:space-x-3", children: [_jsx("div", { className: "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx("span", { className: "text-white font-bold text-xs", children: "\u2713" }) }), _jsx("span", { className: "font-medium", children: "Acceso completo a funciones de moderaci\u00F3n" })] })] }) })] })] }), _jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { className: "overflow-hidden shadow-2xl border-0", children: [_jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-200", children: [_jsxs("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(UserPlus, { className: "h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-purple-600" }), "Formulario de Registro"] }), _jsx("p", { className: "text-xs sm:text-sm text-gray-600 mt-1", children: "Completa todos los campos requeridos (*)" })] }), _jsx("div", { className: "p-4 sm:p-6 lg:p-10", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 sm:space-y-8", children: [_jsxs("div", { ref: alertRef, children: [error && (_jsx("div", { className: `bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl ${isErrorFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "flex items-start space-x-3 sm:space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg", children: _jsx(XCircle, { className: "h-5 w-5 sm:h-7 sm:w-7 text-white" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("h3", { className: "text-base sm:text-lg font-bold text-red-900 mb-2 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Error en el Registro"] }), _jsx("p", { className: "text-red-800 font-medium leading-relaxed text-sm sm:text-base", children: error }), _jsx("p", { className: "text-red-700 text-xs sm:text-sm mt-2 sm:mt-3", children: "Por favor, revisa los datos e intenta nuevamente." })] }), _jsx("button", { type: "button", onClick: () => {
                                                                            setError('');
                                                                            setIsErrorFadingOut(false);
                                                                        }, className: "flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200", children: _jsx(XCircle, { className: "h-5 w-5 sm:h-6 sm:w-6" }) })] }) })), success && (_jsx("div", { className: `bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl ${isSuccessFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`, children: _jsxs("div", { className: "flex items-start space-x-3 sm:space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg", children: _jsx(CheckCircle, { className: "h-5 w-5 sm:h-7 sm:w-7 text-white" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("h3", { className: "text-base sm:text-lg font-bold text-emerald-900 mb-2 flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "\u00A1Registro Exitoso!"] }), _jsx("p", { className: "text-emerald-800 font-medium leading-relaxed text-sm sm:text-base", children: success }), _jsx("div", { className: "mt-3 sm:mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200", children: _jsxs("p", { className: "text-emerald-900 text-xs sm:text-sm font-semibold flex items-center", children: [_jsx("span", { className: "inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" }), "Redirigiendo a la gesti\u00F3n de usuarios..."] }) })] }), _jsx("button", { type: "button", onClick: () => {
                                                                            setSuccess('');
                                                                            setIsSuccessFadingOut(false);
                                                                        }, className: "flex-shrink-0 text-emerald-400 hover:text-emerald-600 transition-colors duration-200", children: _jsx(XCircle, { className: "h-5 w-5 sm:h-6 sm:w-6" }) })] }) }))] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-100 shadow-inner", children: [_jsxs("h3", { className: "text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center", children: [_jsx("div", { className: "p-1.5 sm:p-2 bg-blue-600 rounded-xl mr-2 sm:mr-3", children: _jsx(User, { className: "h-4 w-4 sm:h-6 sm:w-6 text-white" }) }), "Informaci\u00F3n Personal"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between", children: [_jsx("span", { children: "C\u00E9dula *" }), _jsxs("span", { className: `text-xs font-bold transition-colors duration-200 ${formData.cedula.length === 10
                                                                                        ? 'text-emerald-600'
                                                                                        : formData.cedula.length > 0
                                                                                            ? 'text-blue-600'
                                                                                            : 'text-gray-400'}`, children: [formData.cedula.length, "/10 d\u00EDgitos"] })] }), _jsx("div", { className: "relative", children: _jsx(Input, { ref: cedulaRef, type: "text", name: "cedula", value: formData.cedula, onChange: handleInputChange, placeholder: "1234567890", maxLength: 10, className: `text-sm sm:text-base ${validationErrors.cedula ? 'border-red-500 border-2' : formData.cedula.length === 10 ? 'border-emerald-500 border-2' : 'border-gray-300'}` }) }), validationErrors.cedula && (_jsxs("p", { className: "text-red-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), validationErrors.cedula] })), formData.cedula.length > 0 && !validationErrors.cedula && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "flex items-center space-x-1", children: [...Array(10)].map((_, index) => (_jsx("div", { className: `h-1.5 flex-1 rounded-full transition-all duration-200 ${index < formData.cedula.length
                                                                                            ? formData.cedula.length === 10
                                                                                                ? 'bg-emerald-500'
                                                                                                : 'bg-blue-500'
                                                                                            : 'bg-gray-200'}` }, index))) }), formData.cedula.length === 10 && (_jsxs("p", { className: "text-emerald-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "C\u00E9dula completa"] }))] })), validationErrors.cedula && (_jsxs("p", { className: "text-red-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), validationErrors.cedula] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "G\u00E9nero" }), _jsxs("select", { name: "genero", value: formData.genero, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base", children: [_jsx("option", { value: "masculino", children: "Masculino" }), _jsx("option", { value: "femenino", children: "Femenino" }), _jsx("option", { value: "otro", children: "Otro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nombre *" }), _jsx(Input, { ref: nombreRef, type: "text", name: "nombre", value: formData.nombre, onChange: handleInputChange, placeholder: "Juan", className: `text-sm sm:text-base ${validationErrors.nombre ? 'border-red-500' : ''}` }), validationErrors.nombre && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.nombre }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Apellido *" }), _jsx(Input, { ref: apellidoRef, type: "text", name: "apellido", value: formData.apellido, onChange: handleInputChange, placeholder: "P\u00E9rez", className: `text-sm sm:text-base ${validationErrors.apellido ? 'border-red-500' : ''}` }), validationErrors.apellido && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.apellido }))] })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-purple-100 shadow-inner", children: [_jsxs("h3", { className: "text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center", children: [_jsx("div", { className: "p-1.5 sm:p-2 bg-purple-600 rounded-xl mr-2 sm:mr-3", children: _jsx(Mail, { className: "h-4 w-4 sm:h-6 sm:w-6 text-white" }) }), "Informaci\u00F3n de Contacto"] }), _jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Correo Electr\u00F3nico *" }), _jsx(Input, { ref: correoRef, type: "email", name: "correo", value: formData.correo, onChange: handleInputChange, placeholder: "moderador@empresa.com", className: `text-sm sm:text-base ${validationErrors.correo ? 'border-red-500' : ''}` }), validationErrors.correo && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.correo }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tel\u00E9fono" }), _jsx(Input, { ref: telefonoRef, type: "tel", name: "telefono", value: formData.telefono, onChange: handleInputChange, placeholder: "8888-8888", className: `text-sm sm:text-base ${validationErrors.telefono ? 'border-red-500' : ''}` }), validationErrors.telefono && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationErrors.telefono }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Direcci\u00F3n *" }), _jsx("textarea", { ref: direccionRef, name: "direccion", value: formData.direccion, onChange: handleInputChange, placeholder: "Direcci\u00F3n completa del moderador", rows: 3, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base ${validationErrors.direccion ? 'border-red-500 border-2' : 'border-gray-300'}` }), validationErrors.direccion && (_jsxs("p", { className: "text-red-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), validationErrors.direccion] }))] })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-emerald-100 shadow-inner", children: [_jsxs("h3", { className: "text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center", children: [_jsx("div", { className: "p-1.5 sm:p-2 bg-emerald-600 rounded-xl mr-2 sm:mr-3 shadow-lg", children: _jsx(Lock, { className: "h-4 w-4 sm:h-6 sm:w-6 text-white" }) }), "Contrase\u00F1a de Acceso"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center", children: [_jsx(Lock, { className: "h-4 w-4 mr-1 text-emerald-600" }), "Contrase\u00F1a *"] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { ref: passwordRef, type: showPassword ? "text" : "password", name: "password", value: formData.password, onChange: handleInputChange, placeholder: "M\u00EDnimo 6 caracteres", className: `pr-12 text-sm sm:text-base ${validationErrors.password ? 'border-red-500 border-2' : 'border-2 border-emerald-200 focus:border-emerald-500'}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:text-emerald-600", tabIndex: -1, children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) })] }), validationErrors.password && (_jsxs("p", { className: "text-red-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), validationErrors.password] })), formData.password && !validationErrors.password && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `h-2 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= 6
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
                                                                                                            : 'bg-red-500'}` }), "Fortaleza: ", formData.password.length >= 10 ? '🛡️ Fuerte' : formData.password.length >= 8 ? '⚡ Media' : '⚠️ Débil'] }), _jsxs("span", { className: "text-xs text-gray-600 font-medium", children: [formData.password.length, " caracteres"] })] })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2 flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1 text-emerald-600" }), "Confirmar Contrase\u00F1a *"] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { ref: confirmPasswordRef, type: showConfirmPassword ? "text" : "password", name: "confirmPassword", value: formData.confirmPassword, onChange: handleInputChange, placeholder: "Repite la contrase\u00F1a", className: `pr-12 text-sm sm:text-base ${validationErrors.confirmPassword ? 'border-red-500 border-2' : 'border-2 border-emerald-200 focus:border-emerald-500'}` }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:text-emerald-600", tabIndex: -1, children: showConfirmPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) })] }), validationErrors.confirmPassword && (_jsxs("p", { className: "text-red-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), validationErrors.confirmPassword] })), formData.confirmPassword && formData.password === formData.confirmPassword && !validationErrors.confirmPassword && (_jsxs("p", { className: "text-emerald-600 text-xs mt-2 font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Las contrase\u00F1as coinciden"] }))] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t-2 border-gray-200", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => navigate('/admin/users'), disabled: isLoading, className: "sm:w-auto w-full px-6 sm:px-8 py-3 h-auto font-semibold text-sm sm:text-base border-2 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300", children: [_jsx(XCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Cancelar"] }), _jsx(Button, { type: "submit", disabled: isLoading, className: "sm:w-auto w-full px-6 sm:px-8 py-3 h-auto font-semibold text-sm sm:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2" }), "Registrando..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Registrar Moderador"] })) })] })] }) })] }) })] }) })] }));
};
