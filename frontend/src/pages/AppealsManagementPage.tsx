import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { 
  FileText, 
  Package, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  MessageSquare
} from 'lucide-react';

interface Appeal {
  id: number;
  item_id: number;
  usuario_apelante_id: number;
  motivo_apelacion: string;
  informacion_adicional?: string;
  estado: string;
  fecha_apelacion: string;
  producto_nombre: string;
  producto_codigo: string;
  producto_tipo: string;
  producto_estado: string;
  vendedor_nombre: string;
  vendedor_apellido: string;
  vendedor_correo: string;
  motivo_rechazo_original?: string;
}

export const AppealsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName } = usePermissions();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [decisionApelacion, setDecisionApelacion] = useState('');

  const loadAppeals = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3001/api/appeals/pending`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppeals(data.data);
      } else {
        showError('Error', 'No se pudieron cargar las apelaciones');
      }
    } catch (error) {
      console.error('Error al cargar apelaciones:', error);
      showError('Error', 'Error de conexión al cargar apelaciones');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && canModerateProduct()) {
      loadAppeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolveAppeal = async () => {
    if (!selectedAppeal) return;
    
    if (decisionApelacion.trim().length < 10) {
      showError('Error', 'La explicación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setActionLoading(selectedAppeal.id);
      
      const response = await fetch(`http://localhost:3001/api/appeals/${selectedAppeal.id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          accion: resolveAction,
          decision_apelacion: decisionApelacion
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const actionText = resolveAction === 'aprobar' 
          ? 'Apelación aceptada - Producto reactivado'
          : 'Apelación rechazada - Producto mantiene su estado';
        
        showSuccess(
          '✅ Apelación procesada',
          actionText,
          () => {
            setShowResolveDialog(false);
            setSelectedAppeal(null);
            setDecisionApelacion('');
            loadAppeals();
          }
        );
      } else {
        showError('Error', data.message || 'Error al procesar la apelación');
      }
    } catch (error) {
      console.error('Error al resolver apelación:', error);
      showError('Error', 'Error de conexión al procesar la apelación');
    } finally {
      setActionLoading(null);
    }
  };

  const openResolveDialog = (appeal: Appeal, action: 'aprobar' | 'rechazar') => {
    setSelectedAppeal(appeal);
    setResolveAction(action);
    setShowResolveDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      'en_apelacion': 'bg-purple-100 text-purple-800 border-purple-300',
      'aprobado': 'bg-green-100 text-green-800 border-green-300',
      'rechazado': 'bg-red-100 text-red-800 border-red-300'
    };
    return (
      <Badge className={`${colors[estado] || 'bg-gray-100 text-gray-800'} border`}>
        {estado.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!user || !canModerateProduct()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Gestión de Apelaciones
                </h1>
                <p className="text-purple-100 text-base mt-1">
                  Apelaciones de productos rechazados
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-purple-200">Moderador activo</div>
                <div className="font-semibold">{getRoleDisplayName()}</div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 -mt-8 relative z-10">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Pendientes</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {appeals.filter(a => a.estado === 'en_apelacion').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Aprobadas</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {appeals.filter(a => a.estado === 'aprobado').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Rechazadas</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">
                    {appeals.filter(a => a.estado === 'rechazado').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de apelaciones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando apelaciones...</p>
          </div>
        ) : appeals.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay apelaciones pendientes
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                No se encontraron apelaciones que requieran revisión
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {appeals.map((appeal) => (
              <Card key={appeal.id} className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna 1: Info del Producto */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {appeal.producto_nombre}
                          </h3>
                          <p className="text-sm text-gray-500">Código: {appeal.producto_codigo}</p>
                        </div>
                        {getEstadoBadge(appeal.estado)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Tipo: <span className="font-medium text-gray-900 capitalize">{appeal.producto_tipo}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Estado: <span className="font-medium text-red-600 capitalize">{appeal.producto_estado.replace('_', ' ')}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Vendedor: <span className="font-medium text-gray-900">{appeal.vendedor_nombre} {appeal.vendedor_apellido}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600 text-xs">{appeal.vendedor_correo}</span>
                        </div>
                      </div>

                      {appeal.motivo_rechazo_original && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                          <div className="text-xs font-semibold text-red-700 mb-1">MOTIVO DEL RECHAZO ORIGINAL:</div>
                          <p className="text-sm text-red-800">{appeal.motivo_rechazo_original}</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/products/${appeal.item_id}`)}
                        className="w-full h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Producto
                      </Button>
                    </div>

                    {/* Columna 2: Info de la Apelación */}
                    <div className="space-y-4 border-l border-gray-200 pl-6">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                          Motivo de Apelación
                        </div>
                        <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
                          {appeal.motivo_apelacion}
                        </p>
                      </div>

                      {appeal.informacion_adicional && (
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">Información Adicional</div>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {appeal.informacion_adicional}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Apelado: {formatDate(appeal.fecha_apelacion)}</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          💡 <strong>Recuerda:</strong> Revisa cuidadosamente la apelación del vendedor antes de tomar una decisión.
                        </p>
                      </div>
                    </div>

                    {/* Columna 3: Acciones */}
                    <div className="space-y-3 border-l border-gray-200 pl-6">
                      <div className="text-sm font-semibold text-gray-700 mb-4">Acciones de Moderación</div>
                      
                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(appeal, 'aprobar')}
                        disabled={actionLoading === appeal.id}
                        className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar Apelación
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(appeal, 'rechazar')}
                        disabled={actionLoading === appeal.id}
                        className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar Apelación
                      </Button>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                        <p className="text-xs text-blue-800">
                          <strong>Aceptar:</strong> El producto será reactivado<br />
                          <strong>Rechazar:</strong> El producto mantiene su estado actual
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog de Resolución */}
      {showResolveDialog && selectedAppeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Resolver Apelación</h2>
              <p className="text-purple-100 text-sm mt-1">Producto: {selectedAppeal.producto_nombre}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-2">Acción seleccionada</Label>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {resolveAction === 'aprobar' && '✅ Aceptar Apelación - Reactivar Producto'}
                    {resolveAction === 'rechazar' && '❌ Rechazar Apelación - Mantener Estado'}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="decision" className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Explicación de la Decisión *
                </Label>
                <Textarea
                  id="decision"
                  value={decisionApelacion}
                  onChange={(e) => setDecisionApelacion(e.target.value)}
                  placeholder="Explica detalladamente por qué aceptas o rechazas esta apelación (mínimo 10 caracteres)..."
                  rows={5}
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                  <p className={`text-sm font-medium ${decisionApelacion.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    {decisionApelacion.length} / 10
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    setShowResolveDialog(false);
                    setSelectedAppeal(null);
                    setDecisionApelacion('');
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
                  disabled={actionLoading !== null}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleResolveAppeal}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={actionLoading !== null || decisionApelacion.trim().length < 10}
                >
                  {actionLoading !== null ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    '✅ Confirmar Decisión'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
    </div>
  );
};

