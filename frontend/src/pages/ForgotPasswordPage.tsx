import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        setError(response.message || 'Error al solicitar recuperación de contraseña');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al servidor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña
          </p>
        </div>

        <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {!emailSent ? (
            <>
              <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
                <Mail className="h-12 w-12 mx-auto mb-3" />
                <h2 className="text-xl font-bold">¿Olvidaste tu contraseña?</h2>
                <p className="text-blue-100 mt-2">No te preocupes, te ayudamos a recuperarla con un código</p>
              </div>
              
              <div className="p-8">
                {/* Mensaje de Error Animado y Profesional */}
                {error && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out] mb-6">
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

                {/* Mensaje de Éxito (mantener el Alert original ya que funciona bien) */}
                {success && <Alert variant="success" className="mb-4">{success}</Alert>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      icon={<Mail className="h-4 w-4 text-gray-400" />}
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Código de Recuperación'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Recordaste tu contraseña?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                <h2 className="text-xl font-bold">¡Email Enviado!</h2>
                <p className="text-green-100 mt-2">Revisa tu bandeja de entrada</p>
              </div>
              
              <div className="p-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 mb-6 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    ¡Email Enviado Exitosamente!
                  </h3>
                  <p className="text-green-700 text-base mb-6">
                    Si el correo existe en nuestro sistema, recibirás un email con un <strong>código de 6 dígitos</strong> para restablecer tu contraseña.
                  </p>
                  
                  <div className="text-center">
                    <Button
                      onClick={() => navigate('/reset-password-code')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Ir a ingresar código de verificación
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">
                    ¿No recibiste el email?
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Revisa tu carpeta de spam o correo no deseado
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Verifica que el correo esté escrito correctamente
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Espera unos minutos, puede tardar en llegar
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      El código expira en 10 minutos por seguridad
                    </li>
                  </ul>
                </div>

                <div className="mt-6 space-y-3">
                  
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      setSuccess('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Intentar con otro correo
                  </Button>
                  
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Volver al Login
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
