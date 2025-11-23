import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCheck, 
  UserX, 
  UserMinus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Monitor,
  TrendingUp,
  Activity,
  UserCog,
  X
} from 'lucide-react';

interface User {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  tipo_usuario: 'comprador' | 'vendedor' | 'moderador' | 'administrador';
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente_verificacion';
  email_verificado: boolean;
  fecha_registro: string;
  fecha_ultimo_acceso?: string;
}

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'activate' | 'suspend' | 'view'>('view');
  const [actionReason, setActionReason] = useState('');
  
  // Estados para animaciones de salida
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
  const [isSuccessFadingOut, setIsSuccessFadingOut] = useState(false);

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({
        search: searchTerm,
        role: filterRole,
        status: filterStatus
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        setError('Error cargando usuarios: ' + response.message);
      }
    } catch (error: any) {
      setError('Error cargando usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Recargar usuarios cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

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

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm);

    const matchesRole = filterRole === 'all' || user.tipo_usuario === filterRole;
    const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Obtener color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'suspendido':
        return 'bg-red-100 text-red-800';
      case 'pendiente_verificacion':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color del rol
  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'bg-purple-100 text-purple-800';
      case 'moderador':
        return 'bg-blue-100 text-blue-800';
      case 'vendedor':
        return 'bg-green-100 text-green-800';
      case 'comprador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactivo':
        return <XCircle className="h-4 w-4" />;
      case 'suspendido':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pendiente_verificacion':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Manejar acciones
  const handleAction = async (action: string, userId: number, reason?: string) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'activate':
          await apiService.activateUser(userId, reason);
          setSuccess('Usuario activado exitosamente');
          break;
        case 'suspend':
          await apiService.suspendUser(userId, reason);
          setSuccess('Usuario suspendido exitosamente');
          break;
      }
      
      await loadUsers();
      setShowModal(false);
      setSelectedUser(null);
      setActionReason('');
    } catch (error: any) {
      setError('Error ejecutando acción: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal
  const openModal = (user: User, type: 'activate' | 'suspend' | 'view') => {
    setSelectedUser(user);
    setModalType(type);
    setShowModal(true);
  };

  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.estado === 'activo').length;
  const suspendedUsers = users.filter(u => u.estado === 'suspendido').length;
  const pendingUsers = users.filter(u => u.estado === 'pendiente_verificacion').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header mejorado con gradiente y sombra */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Gestión de Usuarios
                </h1>
              </div>
              <p className="text-blue-50 text-lg ml-16">
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
            {currentUser?.tipo_usuario === 'administrador' && (
              <Button
                onClick={() => navigate('/admin/register-moderator')}
                className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-3 h-auto"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Registrar Moderador
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estadísticas mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de usuarios */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Usuarios</p>
                  <p className="text-4xl font-bold text-white">{totalUsers}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Sistema completo</span>
              </div>
            </div>
          </Card>

          {/* Usuarios activos */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-green-600">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Activos</p>
                  <p className="text-4xl font-bold text-white">{activeUsers}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-green-100 text-xs">
                <Activity className="h-4 w-4 mr-1" />
                <span>{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% del total</span>
              </div>
            </div>
          </Card>

          {/* Usuarios suspendidos */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-500 to-rose-600">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Suspendidos</p>
                  <p className="text-4xl font-bold text-white">{suspendedUsers}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-red-100 text-xs">
                <XCircle className="h-4 w-4 mr-1" />
                <span>Requieren atención</span>
              </div>
            </div>
          </Card>

          {/* Usuarios pendientes */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-500 to-orange-600">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">Pendientes</p>
                  <p className="text-4xl font-bold text-white">{pendingUsers}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-amber-100 text-xs">
                <UserCog className="h-4 w-4 mr-1" />
                <span>Verificación pendiente</span>
              </div>
            </div>
          </Card>
        </div>
        {/* Filtros y búsqueda mejorados */}
        <Card className="p-8 mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Filtros de Búsqueda
            </h3>
            <p className="text-sm text-gray-600 mt-1">Encuentra usuarios de forma rápida y precisa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Buscar Usuario
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nombre, email, cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Shield className="inline h-4 w-4 mr-1" />
                Rol
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium shadow-sm"
              >
                <option value="all">Todos los roles</option>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="moderador">Moderador</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Activity className="inline h-4 w-4 mr-1" />
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium shadow-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="pendiente_verificacion">Pendiente</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Alertas mejoradas con animación */}
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

        {/* Tabla de usuarios mejorada */}
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lista de Usuarios</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No se encontraron usuarios</p>
                        <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-200 group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-110">
                              <span className="text-base font-bold text-white">
                                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-5">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-gray-600 mt-0.5">
                              {user.correo}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              Cédula: {user.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-xl shadow-sm ${getRoleColor(user.tipo_usuario)}`}>
                          {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl shadow-sm ${getStatusColor(user.estado)}`}>
                          {getStatusIcon(user.estado)}
                          <span className="ml-2">
                            {user.estado.replace('_', ' ').toUpperCase()}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                        {user.fecha_ultimo_acceso 
                          ? new Date(user.fecha_ultimo_acceso).toLocaleDateString('es-ES')
                          : <span className="text-gray-400 italic">Nunca</span>
                        }
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Ver detalles - Todos pueden ver */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(user, 'view')}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Gestionar sesiones */}
                          {user.tipo_usuario !== 'administrador' && (
                            <>
                              {/* Admin puede gestionar sesiones de cualquiera (excepto admins) */}
                              {currentUser?.tipo_usuario === 'administrador' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/admin/sessions/${user.id}`)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                  title="Gestionar sesiones"
                                >
                                  <Monitor className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Moderador solo puede gestionar sesiones de vendedores y compradores */}
                              {currentUser?.tipo_usuario === 'moderador' && 
                               (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/admin/sessions/${user.id}`)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                  title="Gestionar sesiones"
                                >
                                  <Monitor className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Acciones de suspensión/reactivación */}
                          {user.id !== currentUser?.id && (
                            <>
                              {/* Reactivar usuario */}
                              {(user.estado === 'inactivo' || user.estado === 'suspendido') && (
                                <>
                                  {/* Admin puede reactivar a cualquiera */}
                                  {currentUser?.tipo_usuario === 'administrador' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openModal(user, 'activate')}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200"
                                      title="Reactivar usuario"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Moderador solo puede reactivar vendedores y compradores */}
                                  {currentUser?.tipo_usuario === 'moderador' && 
                                   (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openModal(user, 'activate')}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200"
                                      title="Reactivar usuario"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              {/* Suspender usuario */}
                              {user.estado === 'activo' && (
                                <>
                                  {/* Admin puede suspender a cualquiera excepto otros admins */}
                                  {currentUser?.tipo_usuario === 'administrador' && 
                                   user.tipo_usuario !== 'administrador' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openModal(user, 'suspend')}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200"
                                      title="Suspender usuario"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Moderador SOLO puede suspender vendedores y compradores */}
                                  {currentUser?.tipo_usuario === 'moderador' && 
                                   (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'comprador') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openModal(user, 'suspend')}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200"
                                      title="Suspender usuario"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de acciones */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {modalType === 'view' && <Eye className="h-6 w-6" />}
                    {modalType === 'activate' && <CheckCircle className="h-6 w-6" />}
                    {modalType === 'suspend' && <UserMinus className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {modalType === 'view' && 'Detalles del Usuario'}
                      {modalType === 'activate' && 'Reactivar Usuario'}
                      {modalType === 'suspend' && 'Suspender Usuario'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {modalType === 'view' && 'Información completa del usuario'}
                      {modalType === 'activate' && 'Reactivar acceso al sistema'}
                      {modalType === 'suspend' && 'Suspender cuenta por violación de políticas'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modalType === 'view' ? (
                <div className="space-y-6">
                  {/* Información del usuario */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {selectedUser.nombre.charAt(0)}{selectedUser.apellido.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedUser.nombre} {selectedUser.apellido}</h4>
                        <p className="text-gray-600">{selectedUser.correo}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedUser.tipo_usuario === 'administrador' ? 'bg-red-100 text-red-800' :
                            selectedUser.tipo_usuario === 'moderador' ? 'bg-purple-100 text-purple-800' :
                            selectedUser.tipo_usuario === 'vendedor' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedUser.tipo_usuario.charAt(0).toUpperCase() + selectedUser.tipo_usuario.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedUser.estado === 'activo' ? 'bg-green-100 text-green-800' :
                            selectedUser.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                            selectedUser.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {selectedUser.estado.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Cédula</label>
                          <p className="text-sm text-gray-900 font-mono">{selectedUser.cedula}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Teléfono</label>
                          <p className="text-sm text-gray-900">{selectedUser.telefono || 'No proporcionado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Dirección</label>
                          <p className="text-sm text-gray-900">{selectedUser.direccion || 'No proporcionada'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Género</label>
                          <p className="text-sm text-gray-900 capitalize">{selectedUser.genero || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Fecha de registro</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedUser.fecha_registro).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Último acceso</label>
                          <p className="text-sm text-gray-900">
                            {selectedUser.fecha_ultimo_acceso ? 
                              new Date(selectedUser.fecha_ultimo_acceso).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Nunca'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`border rounded-xl p-4 ${
                    modalType === 'activate' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {modalType === 'activate' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        modalType === 'activate' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {modalType === 'activate' && `¿Estás seguro de que quieres reactivar a ${selectedUser.nombre} ${selectedUser.apellido}?`}
                        {modalType === 'suspend' && `¿Estás seguro de que quieres suspender a ${selectedUser.nombre} ${selectedUser.apellido}?`}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo {modalType === 'suspend' ? '(recomendado)' : '(opcional)'}
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder={modalType === 'suspend' 
                        ? "Especifica el motivo de la suspensión (violación de políticas, reportes, etc.)"
                        : "Describe el motivo de esta acción..."}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer del modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              {modalType !== 'view' && (
                <Button
                  onClick={() => handleAction(modalType, selectedUser.id, actionReason)}
                  disabled={loading}
                  className={`px-6 ${
                    modalType === 'activate' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Procesando...' : 
                   modalType === 'activate' ? 'Reactivar Usuario' : 'Suspender Usuario'
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
