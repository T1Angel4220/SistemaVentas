import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const VerifyCodePage: React.FC = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        setError(response.message || 'Error verificando el código');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Error verificando código:', error);
      setError(error.response?.data?.message || 'Error verificando el código');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error reenviando código:', error);
      setError('Error al reenviar el código. Intenta nuevamente.');
    } finally {
      setResendingCode(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Email Verificado!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir al Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificar Email
          </h1>
          <p className="text-gray-600">
            Ingresa el código de 6 dígitos que enviamos a tu correo
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1" />
              {email}
            </p>
          )}
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de Error Animado y Profesional */}
            {error && (
              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]">
                {/* Icono de error con animación */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Círculo animado de fondo */}
                      <div className="absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]"></div>
                      <div className="relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2.5} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
                    <h3 className="text-lg font-bold text-red-800 mb-1">
                      ¡Oops! Algo salió mal
                    </h3>
                    <p className="text-sm text-red-700 leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
                {/* Efecto decorativo */}
                <div className="absolute top-2 right-2 text-2xl opacity-20 animate-[wiggle_1s_ease-in-out_infinite]">
                  ⚠️
                </div>
              </div>
            )}

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{resendMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificación
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al Login
              </button>
            </div>
          </form>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              ¿No recibiste el código?
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              • Revisa tu carpeta de spam<br/>
              • El código expira en 10 minutos
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendingCode || !email}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendingCode ? 'Enviando...' : 'Reenviar código de verificación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
