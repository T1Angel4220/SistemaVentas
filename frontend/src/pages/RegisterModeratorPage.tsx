import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { 
  UserPlus, 
  ArrowLeft, 
  Shield, 
  Mail, 
  User, 
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff
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
  
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para animaciones de salida
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
  const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);
  
  // Refs para el contenedor de alertas y campos del formulario
  const alertRef = useRef<HTMLDivElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidoRef = useRef<HTMLInputElement>(null);
  const correoRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const direccionRef = useRef<HTMLTextAreaElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Scroll automático hacia las alertas cuando aparecen
  useEffect(() => {
    if ((error || success) && alertRef.current) {
      alertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [error, success]);

  // Auto-ocultar alertas después de 5 segundos con animación
  useEffect(() => {
    if (error && !isErrorFadingOut) {
      const fadeTimer = setTimeout(() => {
        setIsErrorFadingOut(true);
      }, 4400); // Empezar fade-out 600ms antes
      
      const removeTimer = setTimeout(() => {
        setError('');
        setIsErrorFadingOut(false);
      }, 5000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [error, isErrorFadingOut]);

  useEffect(() => {
    if (success && !isSuccessFadingOut) {
      const fadeTimer = setTimeout(() => {
        setIsSuccessFadingOut(true);
      }, 4400); // Empezar fade-out 600ms antes
      
      const removeTimer = setTimeout(() => {
        setSuccess('');
        setIsSuccessFadingOut(false);
      }, 5000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [success, isSuccessFadingOut]);

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
    let processedValue = value;

    // Validaciones específicas por campo
    switch (name) {
      case 'nombre':
      case 'apellido':
        // Solo letras y espacios
        processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        // Capitalizar primera letra de cada palabra
        processedValue = processedValue
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      
      case 'cedula':
        // Solo números, máximo 10 dígitos
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      
      case 'telefono':
        // Solo números
        processedValue = value.replace(/\D/g, '');
        break;
      
      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
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
    let firstErrorField: string | null = null;

    if (!formData.cedula) {
      errors.cedula = 'La cédula es requerida';
      if (!firstErrorField) firstErrorField = 'cedula';
    } else if (formData.cedula.length !== 10) {
      errors.cedula = 'La cédula debe tener exactamente 10 dígitos';
      if (!firstErrorField) firstErrorField = 'cedula';
    }

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
      if (!firstErrorField) firstErrorField = 'nombre';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
      if (!firstErrorField) firstErrorField = 'nombre';
    }

    if (!formData.apellido) {
      errors.apellido = 'El apellido es requerido';
      if (!firstErrorField) firstErrorField = 'apellido';
    } else if (formData.apellido.length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
      if (!firstErrorField) firstErrorField = 'apellido';
    }

    if (!formData.correo) {
      errors.correo = 'El correo es requerido';
      if (!firstErrorField) firstErrorField = 'correo';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo debe ser válido';
      if (!firstErrorField) firstErrorField = 'correo';
    }

    if (formData.telefono && formData.telefono.length < 8) {
      errors.telefono = 'El teléfono debe tener al menos 8 caracteres';
      if (!firstErrorField) firstErrorField = 'telefono';
    }

    if (!formData.direccion) {
      errors.direccion = 'La dirección es requerida';
      if (!firstErrorField) firstErrorField = 'direccion';
    } else if (formData.direccion.length < 3) {
      errors.direccion = 'La dirección debe tener al menos 3 caracteres';
      if (!firstErrorField) firstErrorField = 'direccion';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      if (!firstErrorField) firstErrorField = 'password';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma la contraseña';
      if (!firstErrorField) firstErrorField = 'confirmPassword';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      if (!firstErrorField) firstErrorField = 'confirmPassword';
    }

    setValidationErrors(errors);
    
    // Si hay errores, hacer scroll al primer campo con error
    if (firstErrorField && Object.keys(errors).length > 0) {
      scrollToField(firstErrorField);
    }
    
    return Object.keys(errors).length === 0;
  };

  // Función para hacer scroll al campo con error
  const scrollToField = (fieldName: string) => {
    const refs: { [key: string]: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null> } = {
      cedula: cedulaRef,
      nombre: nombreRef,
      apellido: apellidoRef,
      correo: correoRef,
      telefono: telefonoRef,
      direccion: direccionRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
    };

    const fieldRef = refs[fieldName];
    if (fieldRef?.current) {
      // Hacer scroll al campo con error
      fieldRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Enfocar el campo después de un pequeño delay para que el scroll termine
      setTimeout(() => {
        fieldRef.current?.focus();
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...moderatorData } = formData;
      
      // Agregar tipo_usuario como moderador
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataToSend: any = {
        ...moderatorData,
        tipo_usuario: 'moderador'
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error registrando moderador:', error);
      
      // Manejar el error de autenticación específicamente
      if (error.message === 'Token de acceso requerido' || error.message === 'Sesión cerrada por administrador') {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error registrando moderador. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-10">
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm px-4 py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </Button>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <UserPlus className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Registrar Moderador
                  </h1>
                </div>
                <p className="text-blue-50 text-lg ml-16">
                  Crear nueva cuenta de moderador con acceso completo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Solo Administradores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar informativo mejorado */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card principal de información */}
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
                    <UserPlus className="h-14 w-14 text-white" />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-3">
                    Nuevo Moderador
                  </h2>
                  <p className="text-purple-100 text-base">
                    Registra un nuevo moderador con permisos completos de administración
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    PERMISOS Y FUNCIONES
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">Acceso a gestión de usuarios</span>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">Activación/desactivación de cuentas</span>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">Suspensión de usuarios</span>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 font-medium">Moderación de contenido</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card de información importante */}
            <Card className="overflow-hidden shadow-xl border-2 border-emerald-200">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Información Importante
                </h3>
              </div>
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                <ul className="space-y-3 text-sm text-gray-800">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="font-medium">El moderador se activará automáticamente</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="font-medium">No requiere verificación por email</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="font-medium">Puede iniciar sesión inmediatamente</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <span className="font-medium">Acceso completo a funciones de moderación</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Formulario mejorado */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <UserPlus className="h-6 w-6 mr-3 text-purple-600" />
                  Formulario de Registro
                </h2>
                <p className="text-sm text-gray-600 mt-1">Completa todos los campos requeridos (*)</p>
              </div>

              <div className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contenedor de alertas mejorado con scroll automático */}
                  <div ref={alertRef}>
                    {error && (
                      <div className={`bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-6 shadow-2xl ${isErrorFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                              <XCircle className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center">
                              <AlertTriangle className="h-5 w-5 mr-2" />
                              Error en el Registro
                            </h3>
                            <p className="text-red-800 font-medium leading-relaxed">
                              {error}
                            </p>
                            <p className="text-red-700 text-sm mt-3">
                              Por favor, revisa los datos e intenta nuevamente.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setError('');
                              setIsErrorFadingOut(false);
                            }}
                            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <XCircle className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className={`bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-2xl ${isSuccessFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                              <CheckCircle className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              ¡Registro Exitoso!
                            </h3>
                            <p className="text-emerald-800 font-medium leading-relaxed">
                              {success}
                            </p>
                            <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                              <p className="text-emerald-900 text-sm font-semibold flex items-center">
                                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                Redirigiendo a la gestión de usuarios...
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSuccess('');
                              setIsSuccessFadingOut(false);
                            }}
                            className="flex-shrink-0 text-emerald-400 hover:text-emerald-600 transition-colors duration-200"
                          >
                            <XCircle className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información Personal */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100 shadow-inner">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="p-2 bg-blue-600 rounded-xl mr-3">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      Información Personal
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                        <span>Cédula *</span>
                        <span className={`text-xs font-bold transition-colors duration-200 ${
                          formData.cedula.length === 10 
                            ? 'text-emerald-600' 
                            : formData.cedula.length > 0 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                        }`}>
                          {formData.cedula.length}/10 dígitos
                        </span>
                      </label>
                      <div className="relative">
                        <Input
                          ref={cedulaRef}
                          type="text"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleInputChange}
                          placeholder="1234567890"
                          maxLength={10}
                          className={`${validationErrors.cedula ? 'border-red-500 border-2' : formData.cedula.length === 10 ? 'border-emerald-500 border-2' : 'border-gray-300'}`}
                        />
                      </div>
                      {validationErrors.cedula && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.cedula}
                        </p>
                      )}
                      {formData.cedula.length > 0 && !validationErrors.cedula && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(10)].map((_, index) => (
                              <div
                                key={index}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                                  index < formData.cedula.length
                                    ? formData.cedula.length === 10
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                              ></div>
                            ))}
                          </div>
                          {formData.cedula.length === 10 && (
                            <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Cédula completa
                            </p>
                          )}
                        </div>
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
                        ref={nombreRef}
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
                        ref={apellidoRef}
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
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100 shadow-inner">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-purple-600 rounded-xl mr-3">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    Información de Contacto
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <Input
                        ref={correoRef}
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
                        ref={telefonoRef}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <textarea
                        ref={direccionRef}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Dirección completa del moderador"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          validationErrors.direccion ? 'border-red-500 border-2' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.direccion && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.direccion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contraseña mejorada con ojito */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border-2 border-emerald-100 shadow-inner">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-emerald-600 rounded-xl mr-3 shadow-lg">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    Contraseña de Acceso
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo de contraseña con ojito */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Lock className="h-4 w-4 mr-1 text-emerald-600" />
                        Contraseña *
                      </label>
                      <div className="relative">
                        <Input
                          ref={passwordRef}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Mínimo 6 caracteres"
                          className={`pr-12 ${validationErrors.password ? 'border-red-500 border-2' : 'border-2 border-emerald-200 focus:border-emerald-500'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:text-emerald-600"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                      {formData.password && !validationErrors.password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              formData.password.length >= 6 
                                ? formData.password.length >= 10 
                                  ? 'bg-emerald-500' 
                                  : formData.password.length >= 8 
                                    ? 'bg-amber-500' 
                                    : 'bg-red-500' 
                                : 'bg-gray-200'
                            }`}></div>
                            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              formData.password.length >= 8 
                                ? formData.password.length >= 10 
                                  ? 'bg-emerald-500' 
                                  : 'bg-amber-500' 
                                : 'bg-gray-200'
                            }`}></div>
                            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              formData.password.length >= 10 ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}></div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs font-bold flex items-center transition-colors duration-300 ${
                              formData.password.length >= 10 
                                ? 'text-emerald-700' 
                                : formData.password.length >= 8 
                                  ? 'text-amber-700' 
                                  : 'text-red-700'
                            }`}>
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                formData.password.length >= 10 
                                  ? 'bg-emerald-500' 
                                  : formData.password.length >= 8 
                                    ? 'bg-amber-500' 
                                    : 'bg-red-500'
                              }`}></span>
                              Fortaleza: {formData.password.length >= 10 ? '🛡️ Fuerte' : formData.password.length >= 8 ? '⚡ Media' : '⚠️ Débil'}
                            </p>
                            <span className="text-xs text-gray-600 font-medium">
                              {formData.password.length} caracteres
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo de confirmar contraseña con ojito */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-emerald-600" />
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <Input
                          ref={confirmPasswordRef}
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Repite la contraseña"
                          className={`pr-12 ${validationErrors.confirmPassword ? 'border-red-500 border-2' : 'border-2 border-emerald-200 focus:border-emerald-500'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 focus:outline-none focus:text-emerald-600"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.confirmPassword}
                        </p>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && !validationErrors.confirmPassword && (
                        <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Las contraseñas coinciden
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones mejorados */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t-2 border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                    disabled={isLoading}
                    className="sm:w-auto w-full px-8 py-3 h-auto font-semibold text-base border-2 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="sm:w-auto w-full px-8 py-3 h-auto font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Registrar Moderador
                      </>
                    )}
                  </Button>
                </div>
              </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
