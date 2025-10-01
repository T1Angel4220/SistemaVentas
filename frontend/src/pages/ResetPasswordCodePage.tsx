import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { ArrowLeft, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

export const ResetPasswordCodePage: React.FC = () => {
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setFormData(prev => ({ ...prev, code: value }));
      if (validationErrors.code) {
        setValidationErrors(prev => ({ ...prev, code: '' }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.code) {
      errors.code = 'El código de recuperación es requerido';
    } else if (formData.code.length !== 6) {
      errors.code = 'El código debe tener 6 dígitos';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(formData.code, formData.newPassword);
      if (response.success) {
        setSuccess(response.message || 'Contraseña restablecida exitosamente');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restablecer Contraseña</h1>
          <p className="text-gray-600">
            Ingresa el código de 6 dígitos y tu nueva contraseña
          </p>
        </div>

        <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
            <Shield className="h-12 w-12 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Código de Recuperación</h2>
            <p className="text-blue-100 mt-2">Ingresa el código enviado a tu email</p>
          </div>
          
          <div className="p-8">
            {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Recuperación
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="------"
                  value={formData.code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  className={`text-center text-xl font-mono tracking-widest ${validationErrors.code ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {validationErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.code}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full pr-10 ${validationErrors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  ¿No recibiste el código? Solicita uno nuevo
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  ¿Recordaste tu contraseña?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
