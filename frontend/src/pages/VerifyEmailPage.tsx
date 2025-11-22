import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setIsVerifying(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${apiUrl}/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al verificar la cuenta');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full">
        <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-blue-600">
          <h2 className="text-2xl font-bold text-white text-center">
            Verificación de Cuenta
          </h2>
          <p className="text-green-100 text-center mt-2">
            Activa tu cuenta para comenzar a usar el sistema
          </p>
        </div>
        
        <div className="px-8 py-6">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Verificando tu cuenta...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Verificación Exitosa!
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Ir al Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error de Verificación
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              
              {token && (
                <div className="space-y-4">
                  <button
                    onClick={handleVerifyClick}
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isVerifying ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Verificando...
                      </div>
                    ) : (
                      'Intentar Verificar de Nuevo'
                    )}
                  </button>
                  
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Ir al Login
                  </button>
                </div>
              )}
            </div>
          )}

          {!token && status === 'error' && (
            <div className="text-center">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Ir al Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
