import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, CheckCircle, AlertTriangle, Edit3, Shield } from 'lucide-react';
export const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // Datos del perfil
    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        genero: ''
    });
    // Datos de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    // Cargar datos del usuario al montar (solo la primera vez)
    useEffect(() => {
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                genero: user.genero || ''
            });
        }
    }, [user]);
    // Limpiar mensajes automáticamente
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        console.log('💾 handleUpdateProfile llamado - Enviando al servidor');
        setErrorMessage('');
        setSuccessMessage('');
        setLoadingProfile(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            console.log('📥 Respuesta del servidor:', data);
            if (data.success) {
                console.log('✅ Éxito - Actualizando usuario y mostrando mensaje');
                setIsEditingProfile(false);
                await refreshUser();
                // Establecer el mensaje después de actualizar el usuario
                setSuccessMessage('Perfil actualizado exitosamente');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            else {
                console.log('❌ Error del servidor:', data.message);
                setErrorMessage(data.message || 'Error al actualizar el perfil');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        catch (error) {
            console.error('❌ Error de conexión:', error);
            setErrorMessage('Error al conectar con el servidor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        finally {
            setLoadingProfile(false);
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        // Validaciones
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setErrorMessage('Todos los campos son obligatorios');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setLoadingPassword(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMessage('Contraseña actualizada exitosamente');
                setIsEditingPassword(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            else {
                setErrorMessage(data.message || 'Error al cambiar la contraseña');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        catch (error) {
            console.error('Error:', error);
            setErrorMessage('Error al conectar con el servidor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        finally {
            setLoadingPassword(false);
        }
    };
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Cargando perfil..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg", children: _jsxs("span", { className: "text-2xl font-bold text-white", children: [user.nombre.charAt(0), user.apellido.charAt(0)] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Mi Perfil" }), _jsx("p", { className: "text-gray-600", children: "Gestiona tu informaci\u00F3n personal y configuraci\u00F3n" })] })] }) }), successMessage && (_jsx("div", { className: "mb-6 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-green-400 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]", children: _jsx(CheckCircle, { className: "w-6 h-6 text-white" }) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: "text-lg font-bold text-green-800 mb-1", children: "\u00A1\u00C9xito!" }), _jsx("p", { className: "text-sm text-green-700 leading-relaxed", children: successMessage })] })] }) })), errorMessage && (_jsx("div", { className: "mb-6 relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]" }), _jsx("div", { className: "relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-white" }) })] }) }), _jsxs("div", { className: "flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]", children: [_jsx("h3", { className: "text-lg font-bold text-red-800 mb-1", children: "\u00A1Oops! Algo sali\u00F3 mal" }), _jsx("p", { className: "text-sm text-red-700 leading-relaxed", children: errorMessage })] })] }) })), _jsxs(Card, { className: "mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4", children: _jsxs("h2", { className: "text-xl font-bold text-white flex items-center space-x-2", children: [_jsx(User, { className: "h-5 w-5" }), _jsx("span", { children: "Informaci\u00F3n Personal" })] }) }), _jsx("div", { className: "p-6", children: _jsxs("form", { onSubmit: handleUpdateProfile, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "C\u00E9dula" }), _jsx(Input, { type: "text", value: user.cedula, disabled: true, className: "bg-gray-100 cursor-not-allowed" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 mr-1" }), "Correo Electr\u00F3nico"] }), _jsx(Input, { type: "email", value: user.correo, disabled: true, className: "bg-gray-100 cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nombre" }), _jsx(Input, { type: "text", name: "nombre", value: profileData.nombre, onChange: handleProfileChange, disabled: !isEditingProfile, className: !isEditingProfile ? 'bg-gray-50' : '' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Apellido" }), _jsx(Input, { type: "text", name: "apellido", value: profileData.apellido, onChange: handleProfileChange, disabled: !isEditingProfile, className: !isEditingProfile ? 'bg-gray-50' : '' })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-1" }), "Tel\u00E9fono"] }), _jsx(Input, { type: "tel", name: "telefono", value: profileData.telefono, onChange: handleProfileChange, disabled: !isEditingProfile, className: !isEditingProfile ? 'bg-gray-50' : '' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "G\u00E9nero" }), _jsxs("select", { name: "genero", value: profileData.genero, onChange: handleProfileChange, disabled: !isEditingProfile, className: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${!isEditingProfile ? 'bg-gray-50' : ''}`, children: [_jsx("option", { value: "M", children: "Masculino" }), _jsx("option", { value: "F", children: "Femenino" }), _jsx("option", { value: "Otro", children: "Otro" })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1" }), "Direcci\u00F3n"] }), _jsx(Input, { type: "text", name: "direccion", value: profileData.direccion, onChange: handleProfileChange, disabled: !isEditingProfile, className: !isEditingProfile ? 'bg-gray-50' : '' })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(Shield, { className: "h-4 w-4 mr-1" }), "Tipo de Usuario"] }), _jsx(Input, { type: "text", value: user.tipo_usuario ? user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1) : 'Usuario', disabled: true, className: "bg-gray-100 cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Estado de Cuenta" }), _jsx("div", { className: `inline-flex px-3 py-1 rounded-full text-sm font-semibold ${user.estado === 'activo'
                                                            ? 'bg-green-100 text-green-800'
                                                            : user.estado === 'suspendido'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'}`, children: user.estado.replace('_', ' ') })] })] }), _jsx("div", { className: "mt-6 flex gap-3", children: !isEditingProfile ? (_jsxs(Button, { type: "button", onClick: (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('🖊️ Botón "Editar Perfil" clickeado - Solo habilitando campos');
                                                setIsEditingProfile(true);
                                                setSuccessMessage('');
                                                setErrorMessage('');
                                            }, className: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white", children: [_jsx(Edit3, { className: "h-4 w-4 mr-2" }), "Editar Perfil"] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { type: "submit", disabled: loadingProfile, className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white", children: loadingProfile ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Guardando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Guardar Cambios"] })) }), _jsx(Button, { type: "button", variant: "outline", onClick: (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsEditingProfile(false);
                                                        setSuccessMessage('');
                                                        setErrorMessage('');
                                                        setProfileData({
                                                            nombre: user.nombre || '',
                                                            apellido: user.apellido || '',
                                                            telefono: user.telefono || '',
                                                            direccion: user.direccion || '',
                                                            genero: user.genero || ''
                                                        });
                                                    }, disabled: loadingProfile, className: "bg-gray-100 hover:bg-gray-200 text-gray-800", children: "Cancelar" })] })) })] }) })] }), _jsxs(Card, { className: "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4", children: _jsxs("h2", { className: "text-xl font-bold text-white flex items-center space-x-2", children: [_jsx(Lock, { className: "h-5 w-5" }), _jsx("span", { children: "Seguridad" })] }) }), _jsx("div", { className: "p-6", children: !isEditingPassword ? (_jsxs("div", { className: "text-center py-4", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "Mant\u00E9n tu cuenta segura actualizando tu contrase\u00F1a regularmente" }), _jsxs(Button, { onClick: () => setIsEditingPassword(true), className: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white", children: [_jsx(Lock, { className: "h-4 w-4 mr-2" }), "Cambiar Contrase\u00F1a"] })] })) : (_jsxs("form", { onSubmit: handleChangePassword, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contrase\u00F1a Actual" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showCurrentPassword ? 'text' : 'password', name: "currentPassword", value: passwordData.currentPassword, onChange: handlePasswordChange, placeholder: "Ingresa tu contrase\u00F1a actual" }), _jsx("button", { type: "button", onClick: () => setShowCurrentPassword(!showCurrentPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700", children: showCurrentPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nueva Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showNewPassword ? 'text' : 'password', name: "newPassword", value: passwordData.newPassword, onChange: handlePasswordChange, placeholder: "Ingresa tu nueva contrase\u00F1a" }), _jsx("button", { type: "button", onClick: () => setShowNewPassword(!showNewPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700", children: showNewPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "M\u00EDnimo 6 caracteres" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirmar Nueva Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showConfirmPassword ? 'text' : 'password', name: "confirmPassword", value: passwordData.confirmPassword, onChange: handlePasswordChange, placeholder: "Confirma tu nueva contrase\u00F1a" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] })] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx(Button, { type: "submit", disabled: loadingPassword, className: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white", children: loadingPassword ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Actualizando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "h-4 w-4 mr-2" }), "Actualizar Contrase\u00F1a"] })) }), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                    setIsEditingPassword(false);
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }, disabled: loadingPassword, className: "bg-gray-100 hover:bg-gray-200 text-gray-800", children: "Cancelar" })] })] })) })] })] }) }));
};
