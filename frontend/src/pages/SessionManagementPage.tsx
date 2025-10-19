import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
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
  const { user: currentUser } = useAuth();
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

  useEffect(() => {
    if (userId) {
      loadUserSessions();
    }
  }, [userId]);

  const loadUserSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSessions(parseInt(userId!));
      if (response.success) {
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
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Navegador desconocido';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
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
                <h1 className="text-2xl font-bold text-white">Gestión de Sesiones</h1>
                <p className="text-blue-100">
                  {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-100">
              <Shield className="h-4 w-4" />
              <span>Solo Moderadores/Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">{success}</Alert>}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del Usuario */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{user.nombre} {user.apellido}</h3>
                  <p className="text-gray-600">{user.correo}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Sesiones Activas</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{activeSessions.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <WifiOff className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Sesiones Cerradas</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">{inactiveSessions.length}</span>
                  </div>

                  {activeSessions.length > 0 && (
                    <Button
                      onClick={() => setCloseAllModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cerrar Todas las Sesiones
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Lista de Sesiones */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Sesiones del Usuario</h2>
                  <Button
                    onClick={loadUserSessions}
                    variant="outline"
                    size="sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay sesiones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border ${
                          session.activa 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              session.activa ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {getDeviceIcon(session.user_agent)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {getBrowserInfo(session.user_agent)}
                                </h4>
                                {session.activa ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Activa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cerrada
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Globe className="h-4 w-4" />
                                  <span>{session.ip_address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Iniciada: {formatDate(session.fecha_inicio)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Expira: {formatDate(session.fecha_expiracion)}</span>
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

