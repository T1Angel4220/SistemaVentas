import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Hash } from 'lucide-react';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    // Limpiar mensaje de éxito
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.cedula) {
      errors.cedula = 'La cédula es requerida';
    } else if (formData.cedula.length < 9) {
      errors.cedula = 'La cédula debe tener al menos 9 caracteres';
    }

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellido) {
      errors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.correo) {
      errors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo debe ser válido';
    }

    if (formData.telefono && formData.telefono.length < 8) {
      errors.telefono = 'El teléfono debe tener al menos 8 caracteres';
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
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      setSuccessMessage('¡Registro exitoso! Revisa tu email para verificar tu cuenta.');
      onSuccess?.();
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>
          Regístrate para comenzar a usar el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                type="text"
                name="nombre"
                label="Nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                error={validationErrors.nombre}
                disabled={isLoading}
                className="pl-10"
              />
              <User className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                name="apellido"
                label="Apellido"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                error={validationErrors.apellido}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              name="cedula"
              label="Cédula"
              placeholder="123456789"
              value={formData.cedula}
              onChange={handleInputChange}
              error={validationErrors.cedula}
              disabled={isLoading}
              className="pl-10"
            />
            <Hash className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              name="correo"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleInputChange}
              error={validationErrors.correo}
              disabled={isLoading}
              className="pl-10"
            />
            <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Input
              type="tel"
              name="telefono"
              label="Teléfono (opcional)"
              placeholder="8888-8888"
              value={formData.telefono}
              onChange={handleInputChange}
              error={validationErrors.telefono}
              disabled={isLoading}
              className="pl-10"
            />
            <Phone className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              name="direccion"
              label="Dirección (opcional)"
              placeholder="San José, Costa Rica"
              value={formData.direccion}
              onChange={handleInputChange}
              disabled={isLoading}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Género (opcional)
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de cuenta
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="comprador"
                  checked={formData.tipo_usuario === 'comprador'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mr-2"
                />
                Comprador
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="vendedor"
                  checked={formData.tipo_usuario === 'vendedor'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mr-2"
                />
                Vendedor
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                error={validationErrors.password}
                disabled={isLoading}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 h-4 w-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmar contraseña"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={validationErrors.confirmPassword}
                disabled={isLoading}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 h-4 w-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

