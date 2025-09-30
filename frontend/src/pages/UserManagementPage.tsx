import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';

interface User {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipo_usuario: 'comprador' | 'vendedor' | 'moderador' | 'administrador';
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente_verificacion';
  email_verificado: boolean;
  fecha_registro: string;
  fecha_ultimo_acceso?: string;
}

export const UserManagementPage: React.FC = () => {
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
  const [modalType, setModalType] = useState<'activate' | 'deactivate' | 'suspend' | 'view'>('view');
  const [actionReason, setActionReason] = useState('');

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
        case 'deactivate':
          await apiService.deactivateUser(userId, reason);
          setSuccess('Usuario desactivado exitosamente');
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
  const openModal = (user: User, type: 'activate' | 'deactivate' | 'suspend' | 'view') => {
    setSelectedUser(user);
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
            {currentUser?.tipo_usuario === 'administrador' && (
              <Button
                onClick={() => {/* Implementar registro de moderador */}}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar Moderador
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nombre, email, cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="moderador">Moderador</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="pendiente_verificacion">Pendiente</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => loadUsers()}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Cargando...' : 'Aplicar Filtros'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Alertas */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {/* Tabla de usuarios */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.correo}
                            </div>
                            <div className="text-xs text-gray-400">
                              Cédula: {user.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.tipo_usuario)}`}>
                          {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`}>
                          {getStatusIcon(user.estado)}
                          <span className="ml-1">
                            {user.estado.replace('_', ' ').toUpperCase()}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.fecha_ultimo_acceso 
                          ? new Date(user.fecha_ultimo_acceso).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(user, 'view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {user.id !== currentUser?.id && (
                            <>
                              {user.estado === 'inactivo' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModal(user, 'activate')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {user.estado === 'activo' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModal(user, 'deactivate')}
                                  className="text-yellow-600 hover:text-yellow-700"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openModal(user, 'suspend')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'view' && 'Detalles del Usuario'}
                  {modalType === 'activate' && 'Activar Usuario'}
                  {modalType === 'deactivate' && 'Desactivar Usuario'}
                  {modalType === 'suspend' && 'Suspender Usuario'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                    <p className="text-sm text-gray-900">{selectedUser.nombre} {selectedUser.apellido}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.correo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rol</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedUser.tipo_usuario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedUser.estado.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de registro</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.fecha_registro).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {modalType === 'activate' && `¿Estás seguro de que quieres activar a ${selectedUser.nombre} ${selectedUser.apellido}?`}
                    {modalType === 'deactivate' && `¿Estás seguro de que quieres desactivar a ${selectedUser.nombre} ${selectedUser.apellido}?`}
                    {modalType === 'suspend' && `¿Estás seguro de que quieres suspender a ${selectedUser.nombre} ${selectedUser.apellido}?`}
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo (opcional)
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe el motivo de esta acción..."
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                {modalType !== 'view' && (
                  <Button
                    onClick={() => handleAction(modalType, selectedUser.id, actionReason)}
                    disabled={loading}
                    className={
                      modalType === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                      modalType === 'deactivate' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-red-600 hover:bg-red-700'
                    }
                  >
                    {loading ? 'Procesando...' : 
                     modalType === 'activate' ? 'Activar' :
                     modalType === 'deactivate' ? 'Desactivar' : 'Suspender'
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
