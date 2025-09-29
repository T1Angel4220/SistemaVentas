import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';

// Icono de candado simple
const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.correo) {
      errors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo debe ser válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-2xl font-bold text-white text-center">Iniciar Sesión</h2>
        <p className="text-blue-100 text-center mt-2">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>
      
      <div className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="correo"
                placeholder="tu@email.com"
                value={formData.correo}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.correo 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            {validationErrors.correo && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.correo}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

