import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { 
  UserPlus, 
  ArrowLeft, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ModeratorFormData {
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  genero: 'masculino' | 'femenino' | 'otro';
  password: string;
  confirmPassword: string;
}

export const RegisterModeratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<ModeratorFormData>({
    cedula: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    genero: 'masculino',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<ModeratorFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar que solo administradores puedan acceder
  if (currentUser?.tipo_usuario !== 'administrador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              Solo los administradores pueden registrar moderadores.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name as keyof ModeratorFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ModeratorFormData> = {};

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
      errors.confirmPassword = 'Confirma la contraseña';
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

    setIsLoading(true);
    setError('');

    try {
      const { confirmPassword, ...moderatorData } = formData;
      
      // Agregar tipo_usuario como moderador
      const dataToSend = {
        ...moderatorData,
        tipo_usuario: 'moderador' as const
      };

      const response = await apiService.registerModerator(dataToSend);
      setSuccess(response.message || 'Moderador registrado exitosamente. Puede iniciar sesión inmediatamente.');
      
      // Limpiar formulario
      setFormData({
        cedula: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        genero: 'masculino',
        password: '',
        confirmPassword: ''
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/admin/users');
      }, 3000);

    } catch (error: any) {
      console.error('Error registrando moderador:', error);
      setError(error.response?.data?.message || 'Error registrando moderador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Registrar Moderador</h1>
                <p className="text-blue-100">Crear nueva cuenta de moderador</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-100">
              <Shield className="h-4 w-4" />
              <span>Solo Administradores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Nuevo Moderador
                </h2>
                <p className="text-gray-600">
                  Registra un nuevo moderador para el sistema
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Acceso a gestión de usuarios</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Activación/desactivación de cuentas</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suspensión de usuarios</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Moderación de contenido</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-900 mb-2">Importante:</h3>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• El moderador se activará automáticamente</li>
                  <li>• No requiere verificación por email</li>
                  <li>• Puede iniciar sesión inmediatamente</li>
                  <li>• Tendrá acceso a todas las funciones de moderación</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="error">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success">
                    {success}
                  </Alert>
                )}

                {/* Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cédula *
                      </label>
                      <Input
                        type="text"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleInputChange}
                        placeholder="123456789"
                        className={validationErrors.cedula ? 'border-red-500' : ''}
                      />
                      {validationErrors.cedula && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.cedula}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género
                      </label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <Input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        className={validationErrors.nombre ? 'border-red-500' : ''}
                      />
                      {validationErrors.nombre && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.nombre}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <Input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        placeholder="Pérez"
                        className={validationErrors.apellido ? 'border-red-500' : ''}
                      />
                      {validationErrors.apellido && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.apellido}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Información de Contacto
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <Input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="moderador@empresa.com"
                        className={validationErrors.correo ? 'border-red-500' : ''}
                      />
                      {validationErrors.correo && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.correo}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <Input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="8888-8888"
                        className={validationErrors.telefono ? 'border-red-500' : ''}
                      />
                      {validationErrors.telefono && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.telefono}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <textarea
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Dirección completa del moderador"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Contraseña de Acceso
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className={validationErrors.password ? 'border-red-500' : ''}
                      />
                      {validationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña *
                      </label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repite la contraseña"
                        className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? 'Registrando...' : 'Registrar Moderador'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
