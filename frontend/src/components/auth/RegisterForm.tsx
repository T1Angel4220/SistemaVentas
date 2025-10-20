import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Hash } from 'lucide-react';

// Icono de candado simple
const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
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
    tipo_usuario: 'comprador' as 'comprador' | 'vendedor',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Limpiar error del contexto cuando se monta el componente
  React.useEffect(() => {
    clearError();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Validaciones en tiempo real según el campo
    switch (name) {
      case 'nombre':
      case 'apellido':
        // Solo letras, espacios y tildes
        sanitizedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
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
    const errors: Record<string, string> = {};

    if (!formData.cedula) {
      errors.cedula = 'La cédula es requerida';
    } else if (!/^[0-9]+$/.test(formData.cedula)) {
      errors.cedula = 'La cédula solo puede contener números';
    } else if (formData.cedula.length !== 10) {
      errors.cedula = 'La cédula debe tener exactamente 10 dígitos';
    }

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      errors.nombre = 'El nombre solo puede contener letras';
    }

    if (!formData.apellido) {
      errors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
      errors.apellido = 'El apellido solo puede contener letras';
    }

    if (!formData.correo) {
      errors.correo = 'El correo es requerido';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.correo)) {
      errors.correo = 'El correo debe ser válido (ejemplo: usuario@dominio.com)';
    }

    if (formData.telefono && formData.telefono.length < 8) {
      errors.telefono = 'El teléfono debe tener al menos 8 caracteres';
    } else if (formData.telefono && !/^[0-9-]+$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono solo puede contener números';
    }

    if (!formData.direccion) {
      errors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.length < 3) {
      errors.direccion = 'La dirección debe tener al menos 3 caracteres';
    }

    if (!formData.genero) {
      errors.genero = 'El género es requerido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll hacia arriba para mostrar los errores
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      setSuccessMessage('¡Registro exitoso! Revisa tu email para obtener el código de verificación.');
      setShowSuccessAnimation(true);
      // Scroll hacia arriba para mostrar el mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Redirigir a la página de verificación de código después de 3 segundos
      setTimeout(() => {
        window.location.href = `/verify-code?email=${encodeURIComponent(formData.correo)}`;
      }, 3000);
    } catch (error) {
      console.error('Error en registro:', error);
      // Scroll hacia arriba para mostrar el error del servidor
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="text-2xl font-bold text-white text-center">Crear Cuenta</h2>
        <p className="text-indigo-100 text-center mt-2">
          Regístrate para comenzar a usar el sistema
        </p>
      </div>
      
      <div className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <h3 className="text-lg font-bold text-red-800 mb-1 flex items-center gap-2">
                    <span>¡Oops! Algo salió mal</span>
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

          {showSuccessAnimation && (
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-2xl animate-[slideInDown_0.5s_ease-out]">
              {/* Confetti animation background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-[confetti_3s_ease-out]"></div>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-[confetti_3s_ease-out_0.2s]"></div>
                <div className="absolute top-0 left-3/4 w-2 h-2 bg-purple-400 rounded-full animate-[confetti_3s_ease-out_0.4s]"></div>
                <div className="absolute top-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-[confetti_3s_ease-out_0.6s]"></div>
                <div className="absolute top-0 left-2/3 w-2 h-2 bg-pink-400 rounded-full animate-[confetti_3s_ease-out_0.8s]"></div>
              </div>

              {/* Success Icon with animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {/* Círculo animado de fondo */}
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-[ping_1s_ease-out]"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg animate-[bounceIn_0.6s_ease-out]">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7"
                        className="animate-[drawCheck_0.5s_ease-out_0.3s_forwards]"
                        style={{
                          strokeDasharray: 20,
                          strokeDashoffset: 20
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center space-y-3 animate-[fadeIn_0.8s_ease-out_0.5s_both]">
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  ¡Registro Exitoso! 🎉
                </h3>
                <p className="text-base text-green-700 leading-relaxed max-w-md mx-auto">
                  Tu cuenta ha sido creada exitosamente. Hemos enviado un <strong>código de verificación de 6 dígitos</strong> a tu correo electrónico.
                </p>
                
                {/* Email Badge */}
                <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 mx-auto w-fit">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-800">{formData.correo}</span>
                </div>

                {/* Loading indicator */}
                <div className="pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    Redirigiendo a verificación...
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite]">
                ✨
              </div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-[spin_3s_linear_infinite_reverse]">
                🎊
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={50}
                  autoComplete="given-name"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    validationErrors.nombre 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              {validationErrors.nombre && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.nombre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Apellido
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={50}
                  autoComplete="family-name"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    validationErrors.apellido 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              {validationErrors.apellido && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.apellido}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Cédula
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="cedula"
                placeholder="1234567890"
                value={formData.cedula}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={10}
                inputMode="numeric"
                autoComplete="off"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  validationErrors.cedula 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            {validationErrors.cedula && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.cedula}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.cedula.length}/10 dígitos
            </p>
          </div>

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
                placeholder="usuario@ejemplo.com"
                value={formData.correo}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
                autoComplete="email"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="8888-8888"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={15}
                  inputMode="numeric"
                  autoComplete="tel"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    validationErrors.telefono 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              {validationErrors.telefono && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.telefono}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`block w-full py-3 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  validationErrors.genero 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="">Seleccionar género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
              {validationErrors.genero && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.genero}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Dirección
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="direccion"
                placeholder="Ambato, Ecuador"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={200}
                autoComplete="street-address"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  validationErrors.direccion 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            {validationErrors.direccion && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.direccion}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Tipo de cuenta
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="comprador"
                  checked={formData.tipo_usuario === 'comprador'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Comprador</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="vendedor"
                  checked={formData.tipo_usuario === 'vendedor'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Vendedor</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
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
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

