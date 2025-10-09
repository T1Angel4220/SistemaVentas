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
  const [countdown, setCountdown] = useState(15);
  const [isPaused, setIsPaused] = useState(false);

  // Manejar countdown cuando el email se envía
  useEffect(() => {
    if (emailSent && countdown > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (emailSent && countdown === 0) {
      navigate('/reset-password-code');
    }
  }, [emailSent, countdown, isPaused, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.requestPasswordReset(email);
      if (response.success) {
        setSuccess(response.message);
        setEmailSent(true);
        setCountdown(15); // Iniciar countdown de 15 segundos
      } else {
        setError(response.message || 'Error al solicitar recuperación de contraseña');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al servidor');
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
                {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
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
                  <p className="text-green-700 text-base mb-4">
                    Si el correo existe en nuestro sistema, recibirás un email con un <strong>código de 6 dígitos</strong> para restablecer tu contraseña.
                  </p>
                  
                  {/* Countdown visual mejorado */}
                  <div className="bg-white rounded-lg p-6 border border-green-200 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600 font-medium">Redirigiendo automáticamente en:</p>
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="text-xs px-3 py-1 rounded-full transition-colors"
                        style={{ 
                          backgroundColor: isPaused ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
                      </button>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {countdown}
                      </div>
                      <p className="text-sm text-gray-500">
                        {countdown === 1 ? 'segundo' : 'segundos'}
                      </p>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(countdown / 15) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0s</span>
                      <span className="font-medium">{isPaused ? 'Pausado' : 'Redirigiendo...'}</span>
                      <span>15s</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium mb-4">
                      {isPaused ? '⏸ Redirección pausada' : '⏳ Te redirigiremos automáticamente'}
                    </p>
                    
                    {/* Botón estratégicamente posicionado dentro del countdown */}
                    <Button
                      onClick={() => navigate('/reset-password-code')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
                    >
                      🚀 Ir a ingresar código ahora
                    </Button>
                    
                    <p className="text-xs text-gray-500">
                      O espera la redirección automática
                    </p>
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
                      setCountdown(15);
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
