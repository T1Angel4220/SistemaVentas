import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { API_BASE_URL } from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Shield
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    genero: ''
  });

  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar datos del usuario al montar (solo la primera vez)
  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        genero: user.genero || ''
      });
    }
  }, [user]);

  // Limpiar mensajes automáticamente
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💾 handleUpdateProfile llamado - Enviando al servidor');
    setErrorMessage('');
    setSuccessMessage('');
    setLoadingProfile(true);

    try {
      const token = localStorage.getItem('accessToken');
      // Usar API_BASE_URL que ya está configurado correctamente (igual que otras páginas)
      const url = `${API_BASE_URL}/auth/profile`;
      
      console.log('🌐 URL de la petición:', url);
      console.log('📤 Datos enviados:', profileData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        // Si la respuesta no es OK, intentar parsear el JSON del error
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Error ${response.status}: ${response.statusText}` };
        }
        console.log('❌ Error del servidor:', errorData);
        setErrorMessage(errorData.message || `Error ${response.status}: ${response.statusText}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (data.success) {
        console.log('✅ Éxito - Actualizando usuario y mostrando mensaje');
        setIsEditingProfile(false);
        await refreshUser();
        // Establecer el mensaje después de actualizar el usuario
        setSuccessMessage('Perfil actualizado exitosamente');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.log('❌ Error del servidor:', data.message);
        setErrorMessage(data.message || 'Error al actualizar el perfil');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al conectar con el servidor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage('Todos los campos son obligatorios');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoadingPassword(true);

    try {
      const token = localStorage.getItem('accessToken');
      // Usar API_BASE_URL que ya está configurado correctamente (igual que otras páginas)
      const url = `${API_BASE_URL}/auth/change-password`;
      
      console.log('🌐 URL de la petición:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        // Si la respuesta no es OK, intentar parsear el JSON del error
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Error ${response.status}: ${response.statusText}` };
        }
        console.log('❌ Error del servidor:', errorData);
        setErrorMessage(errorData.message || `Error ${response.status}: ${response.statusText}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Contraseña actualizada exitosamente');
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.message || 'Error al cambiar la contraseña');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Error al conectar con el servidor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información personal y configuración</p>
            </div>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-6 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-[ping_1s_ease-out]"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
                <h3 className="text-lg font-bold text-green-800 mb-1">¡Éxito!</h3>
                <p className="text-sm text-green-700 leading-relaxed">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-6 relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl animate-[slideInDown_0.4s_ease-out]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-[ping_1s_ease-out]"></div>
                  <div className="relative bg-gradient-to-br from-red-500 to-rose-600 rounded-full p-3 shadow-lg animate-[bounceIn_0.5s_ease-out]">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
                <h3 className="text-lg font-bold text-red-800 mb-1">¡Oops! Algo salió mal</h3>
                <p className="text-sm text-red-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información General */}
        <Card className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cédula (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula
                  </label>
                  <Input
                    type="text"
                    value={user.cedula}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Correo (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={user.correo}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    name="nombre"
                    value={profileData.nombre}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <Input
                    type="text"
                    name="apellido"
                    value={profileData.apellido}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={profileData.telefono}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={profileData.genero}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !isEditingProfile ? 'bg-gray-50' : ''
                    }`}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Dirección
                  </label>
                  <Input
                    type="text"
                    name="direccion"
                    value={profileData.direccion}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Tipo de Usuario (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Tipo de Usuario
                  </label>
                  <Input
                    type="text"
                    value={user.tipo_usuario ? user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1) : 'Usuario'}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Estado (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Cuenta
                  </label>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    user.estado === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : user.estado === 'suspendido'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.estado.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex gap-3">
                {!isEditingProfile ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖊️ Botón "Editar Perfil" clickeado - Solo habilitando campos');
                      setIsEditingProfile(true);
                      setSuccessMessage('');
                      setErrorMessage('');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={loadingProfile}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      {loadingProfile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditingProfile(false);
                        setSuccessMessage('');
                        setErrorMessage('');
                        setProfileData({
                          nombre: user.nombre || '',
                          apellido: user.apellido || '',
                          telefono: user.telefono || '',
                          direccion: user.direccion || '',
                          genero: user.genero || ''
                        });
                      }}
                      disabled={loadingProfile}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Seguridad</span>
            </h2>
          </div>

          <div className="p-6">
            {!isEditingPassword ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Mantén tu cuenta segura actualizando tu contraseña regularmente</p>
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  {/* Contraseña Actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex gap-3">
                  <Button
                    type="submit"
                    disabled={loadingPassword}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    {loadingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Actualizar Contraseña
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    disabled={loadingPassword}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

