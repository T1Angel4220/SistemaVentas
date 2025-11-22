import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Globe, 
  Clock, 
  Shield, 
  X, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Session {
  id: number;
  fecha_inicio: string;
  fecha_expiracion: string;
  ip_address: string;
  user_agent: string;
  activa: boolean;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export const SessionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [closeAllModal, setCloseAllModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados para animaciones de salida
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
  const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);
  
  // Ref para scroll automático a las alertas
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      loadUserSessions();
    }
  }, [userId]);

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

  const loadUserSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSessions(parseInt(userId!));
      if (response.success && response.data) {
        setUser(response.data.user);
        setSessions(response.data.sessions);
      } else {
        setError('Error cargando sesiones del usuario');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;
    
    try {
      setActionLoading(true);
      const response = await apiService.closeUserSession(selectedSession.id, motivo);
      if (response.success) {
        setSuccess('Sesión cerrada exitosamente');
        setShowCloseModal(false);
        setSelectedSession(null);
        setMotivo('');
        await loadUserSessions();
      } else {
        setError(response.message || 'Error cerrando sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseAllSessions = async () => {
    if (!userId) return;
    
    try {
      setActionLoading(true);
      const response = await apiService.closeAllUserSessions(parseInt(userId), motivo);
      if (response.success) {
        setSuccess(response.message || 'Todas las sesiones cerradas exitosamente');
        setCloseAllModal(false);
        setMotivo('');
        await loadUserSessions();
      } else {
        setError(response.message || 'Error cerrando sesiones');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes('android') || userAgent.toLowerCase().includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent || userAgent === 'User-Agent desconocido') {
      return 'Navegador desconocido';
    }
    
    // Orden importante: verificar primero los navegadores más específicos
    // porque muchos incluyen "Chrome" en su user-agent
    
    // Edgium (nuevo Edge basado en Chromium)
    if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
      return 'Microsoft Edge';
    }
    
    // Opera
    if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
      return 'Opera';
    }
    
    // Brave
    if (userAgent.includes('Brave')) {
      return 'Brave';
    }
    
    // Chrome (debe ir después de Edge, Opera, Brave)
    if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
      return 'Google Chrome';
    }
    
    // Safari (debe ir después de Chrome porque Chrome incluye "Safari")
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
      return 'Safari';
    }
    
    // Firefox
    if (userAgent.includes('Firefox/')) {
      return 'Firefox';
    }
    
    // Internet Explorer
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      return 'Internet Explorer';
    }
    
    return 'Otro navegador';
  };

  const formatIpAddress = (ip: string) => {
    if (!ip || ip === 'IP desconocida') {
      return 'IP desconocida';
    }
    
    // Localhost IPv6
    if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
      return 'localhost (::1)';
    }
    
    // Localhost IPv4
    if (ip === '127.0.0.1') {
      return 'localhost (127.0.0.1)';
    }
    
    // IP privadas (red local)
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return `${ip} (Red local)`;
    }
    
    // IP pública
    return ip;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeSessions = sessions.filter(session => session.activa);
  const inactiveSessions = sessions.filter(session => !session.activa);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando sesiones del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-10">
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
                    <Monitor className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Gestión de Sesiones
                  </h1>
                </div>
                <p className="text-blue-50 text-lg ml-16">
                  {user ? `${user.nombre} ${user.apellido}` : 'Cargando usuario...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Solo Moderadores/Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas mejoradas con scroll automático */}
        <div ref={alertRef}>
          {error && (
            <div className={`mb-6 ${isErrorFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white shadow-2xl border-2 border-red-400">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl">
                        <XCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Error
                      </h3>
                      <p className="text-red-50 font-medium leading-relaxed">{error}</p>
                    </div>
                    <button
                      onClick={() => {
                        setError('');
                        setIsErrorFadingOut(false);
                      }}
                      className="flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className={`mb-6 ${isSuccessFadingOut ? 'animate-out fade-out-up' : 'animate-in fade-in slide-in-from-top-5'}`}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white shadow-2xl border-2 border-emerald-400">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Éxito
                      </h3>
                      <p className="text-emerald-50 font-medium leading-relaxed">{success}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSuccess('');
                        setIsSuccessFadingOut(false);
                      }}
                      className="flex-shrink-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del Usuario mejorada */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card de perfil del usuario */}
              <Card className="overflow-hidden shadow-2xl border-0">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                      <span className="text-3xl font-bold text-white">
                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{user.nombre} {user.apellido}</h3>
                      <p className="text-blue-100 text-sm mt-1">{user.correo}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Sesiones activas card */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Wifi className="h-5 w-5 text-green-100" />
                            <span className="font-semibold text-green-100 text-sm">Sesiones Activas</span>
                          </div>
                          <span className="text-4xl font-extrabold text-white">{activeSessions.length}</span>
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sesiones cerradas card */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <WifiOff className="h-5 w-5 text-gray-100" />
                            <span className="font-semibold text-gray-100 text-sm">Sesiones Cerradas</span>
                          </div>
                          <span className="text-4xl font-extrabold text-white">{inactiveSessions.length}</span>
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <XCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeSessions.length > 0 && (
                    <Button
                      onClick={() => setCloseAllModal(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cerrar Todas las Sesiones
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Lista de Sesiones mejorada */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-2xl border-0">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Monitor className="h-6 w-6 mr-2 text-blue-600" />
                        Sesiones del Usuario
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {sessions.length} {sessions.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
                      </p>
                    </div>
                    <Button
                      onClick={loadUserSessions}
                      variant="outline"
                      className="shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>

                <div className="p-8">
                  {sessions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-6 bg-gray-100 rounded-full mb-6">
                          <WifiOff className="h-16 w-16 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">No hay sesiones registradas</p>
                        <p className="text-gray-500 text-sm mt-2">El usuario no ha iniciado sesión en el sistema</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`relative overflow-hidden rounded-2xl border-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ${
                            session.activa 
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300' 
                              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
                          }`}
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className={`p-4 rounded-2xl shadow-lg ${
                                  session.activa 
                                    ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                }`}>
                                  {getDeviceIcon(session.user_agent)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <h4 className="font-bold text-lg text-gray-900">
                                      {getBrowserInfo(session.user_agent)}
                                    </h4>
                                    {session.activa ? (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm">
                                        <CheckCircle className="h-4 w-4 mr-1.5" />
                                        Activa
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-700 shadow-sm">
                                        <XCircle className="h-4 w-4 mr-1.5" />
                                        Cerrada
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                                      <Globe className="h-5 w-5 text-blue-600" />
                                      <span className="font-medium">{formatIpAddress(session.ip_address)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                                      <Clock className="h-5 w-5 text-indigo-600" />
                                      <span><span className="font-semibold">Iniciada:</span> {formatDate(session.fecha_inicio)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                                      <Clock className="h-5 w-5 text-purple-600" />
                                      <span><span className="font-semibold">Expira:</span> {formatDate(session.fecha_expiracion)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {session.activa && (
                                <Button
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setShowCloseModal(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modal para cerrar sesión específica */}
      {showCloseModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold">Cerrar Sesión</h3>
                  <p className="text-red-100">Esta acción cerrará la sesión seleccionada</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe el motivo para cerrar esta sesión..."
                />
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedSession(null);
                  setMotivo('');
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseSession}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cerrando...
                  </span>
                ) : (
                  'Cerrar Sesión'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cerrar todas las sesiones */}
      {closeAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold">Cerrar Todas las Sesiones</h3>
                  <p className="text-red-100">Esta acción cerrará todas las sesiones activas del usuario</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    Se cerrarán {activeSessions.length} sesiones activas
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe el motivo para cerrar todas las sesiones..."
                />
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => {
                  setCloseAllModal(false);
                  setMotivo('');
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseAllSessions}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cerrando...
                  </span>
                ) : (
                  'Cerrar Todas'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

