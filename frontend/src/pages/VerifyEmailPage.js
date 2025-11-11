import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const token = searchParams.get('token');
    useEffect(() => {
        if (token) {
            verifyEmail();
        }
        else {
            setStatus('error');
            setMessage('Token de verificación no encontrado');
        }
    }, [token]);
    const verifyEmail = async () => {
        try {
            setIsVerifying(true);
            const response = await fetch(`http://localhost:3001/api/auth/verify-email?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
            }
            else {
                setStatus('error');
                setMessage(data.message || 'Error al verificar la cuenta');
            }
        }
        catch (error) {
            setStatus('error');
            setMessage('Error de conexión. Intenta de nuevo.');
        }
        finally {
            setIsVerifying(false);
        }
    };
    const handleVerifyClick = () => {
        if (token) {
            verifyEmail();
        }
    };
    const handleGoToLogin = () => {
        navigate('/login');
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full", children: [_jsxs("div", { className: "px-8 py-6 bg-gradient-to-r from-green-600 to-blue-600", children: [_jsx("h2", { className: "text-2xl font-bold text-white text-center", children: "Verificaci\u00F3n de Cuenta" }), _jsx("p", { className: "text-green-100 text-center mt-2", children: "Activa tu cuenta para comenzar a usar el sistema" })] }), _jsxs("div", { className: "px-8 py-6", children: [status === 'loading' && (_jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Verificando tu cuenta..." })] })), status === 'success' && (_jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "\u00A1Verificaci\u00F3n Exitosa!" }), _jsx("p", { className: "text-gray-600 mb-6", children: message }), _jsx("button", { onClick: handleGoToLogin, className: "w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl", children: "Ir al Login" })] })), status === 'error' && (_jsxs("div", { className: "text-center", children: [_jsx(XCircle, { className: "h-12 w-12 text-red-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Error de Verificaci\u00F3n" }), _jsx("p", { className: "text-gray-600 mb-6", children: message }), token && (_jsxs("div", { className: "space-y-4", children: [_jsx("button", { onClick: handleVerifyClick, disabled: isVerifying, className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl", children: isVerifying ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx(Loader2, { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white" }), "Verificando..."] })) : ('Intentar Verificar de Nuevo') }), _jsx("button", { onClick: handleGoToLogin, className: "w-full bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200", children: "Ir al Login" })] }))] })), !token && status === 'error' && (_jsx("div", { className: "text-center", children: _jsx("button", { onClick: handleGoToLogin, className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl", children: "Ir al Login" }) }))] })] }) }));
};
