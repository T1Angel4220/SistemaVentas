import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { 
  Flag, 
  Package, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  User,
  FileText,
  Shield,
  Camera,
  DollarSign
} from 'lucide-react';

interface Report {
  id: number;
  item_id: number;
  usuario_reportador_id: number;
  tipo_reporte: string;
  descripcion: string;
  comentario_opcional?: string;
  estado: string;
  fecha_reporte: string;
  producto_nombre: string;
  producto_codigo: string;
  producto_tipo: string;
  producto_estado: string;
  producto_precio: number;
  primera_imagen?: string;
  total_imagenes?: number;
  reportante_nombre: string;
  reportante_apellido: string;
  reportante_correo: string;
  reportante_tipo: string;
  vendedor_nombre: string;
  vendedor_apellido: string;
  vendedor_correo: string;
  categoria_nombre: string;
  total_reportes_producto: number;
}

export const ReportsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName } = usePermissions();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<'aprobar' | 'rechazar' | 'suspender' | 'eliminar'>('aprobar');
  const [decisionFinal, setDecisionFinal] = useState('');
  const [marcarPeligroso, setMarcarPeligroso] = useState(false);

  const [filters, setFilters] = useState({
    tipo_reporte: '',
    estado: ''
  });

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.tipo_reporte) queryParams.append('tipo_reporte', filters.tipo_reporte);
      if (filters.estado) queryParams.append('estado', filters.estado);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${apiUrl}/reports/pending?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data);
      } else {
        showError('Error', 'No se pudieron cargar los reportes');
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      showError('Error', 'Error de conexión al cargar reportes');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (user && canModerateProduct()) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    
    if (decisionFinal.trim().length < 10) {
      showError('Error', 'La explicación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setActionLoading(selectedReport.id);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${apiUrl}/reports/${selectedReport.id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          accion: resolveAction,
          decision_final: decisionFinal,
          marcar_peligroso: marcarPeligroso
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const actionText = {
          'aprobar': 'Reporte rechazado (producto válido)',
          'rechazar': 'Producto rechazado',
          'suspender': 'Producto suspendido',
          'eliminar': 'Producto marcado como peligroso'
        };
        
        showSuccess(
          '✅ Reporte procesado',
          actionText[resolveAction],
          () => {
            setShowResolveDialog(false);
            setSelectedReport(null);
            setDecisionFinal('');
            setMarcarPeligroso(false);
            loadReports();
          }
        );
      } else {
        showError('Error', data.message || 'Error al procesar el reporte');
      }
    } catch (error) {
      console.error('Error al resolver reporte:', error);
      showError('Error', 'Error de conexión al procesar el reporte');
    } finally {
      setActionLoading(null);
    }
  };

  const openResolveDialog = (report: Report, action: 'aprobar' | 'rechazar' | 'suspender' | 'eliminar') => {
    setSelectedReport(report);
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


  const getTipoReporteLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'contenido_inapropiado': '⚠️ Contenido Inapropiado',
      'producto_prohibido': '🚫 Producto Prohibido',
      'informacion_falsa': '❌ Información Falsa',
      'spam': '📧 Spam',
      'otro': '🔖 Otro'
    };
    return labels[tipo] || tipo;
  };

  const getEstadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'en_revision': 'bg-blue-100 text-blue-800 border-blue-300',
      'resuelto': 'bg-green-100 text-green-800 border-green-300',
      'rechazado': 'bg-gray-100 text-gray-800 border-gray-300'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Header - Optimizado para móvil */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Flag className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Gestión de Reportes
                </h1>
                <p className="text-red-100 text-sm sm:text-base mt-1">
                  Reportes de compradores y moderadores
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-red-200">Moderador activo</div>
                <div className="font-semibold text-sm sm:text-base">{getRoleDisplayName()}</div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 -mt-6 sm:-mt-8 relative z-10">
        {/* Estadísticas - Optimizado para móvil */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {reports.filter(r => r.estado === 'pendiente').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">En Revisión</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {reports.filter(r => r.estado === 'en_revision').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Resueltos</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {reports.filter(r => r.estado === 'resuelto').length}
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
                  <p className="text-sm font-medium text-red-700">Total</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">
                    {reports.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros - Optimizado para móvil */}
        <Card className="mb-6 sm:mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50 p-4 sm:p-6 border-b border-gray-100">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold">Filtros de Reportes</span>
                <p className="text-xs sm:text-sm text-gray-600 font-normal">Filtra reportes por tipo y estado</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={filters.tipo_reporte}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo_reporte: e.target.value }))}
                  className="w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                >
                  <option value="">Todos</option>
                  <option value="contenido_inapropiado">⚠️ Contenido Inapropiado</option>
                  <option value="producto_prohibido">🚫 Producto Prohibido</option>
                  <option value="informacion_falsa">❌ Información Falsa</option>
                  <option value="spam">📧 Spam</option>
                  <option value="otro">🔖 Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de reportes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Flag className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay reportes
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                No se encontraron reportes con los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
               <Card key={report.id} className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                 <CardContent className="p-4 sm:p-6">
                   <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Columna 1: Info del Producto */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {report.producto_nombre}
                          </h3>
                          <p className="text-sm text-gray-500">Código: {report.producto_codigo}</p>
                        </div>
                        {getEstadoBadge(report.estado)}
                      </div>

                      {/* Imagen del producto */}
                      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-sm">
                        {report.primera_imagen ? (
                          <>
                            <img
                              src={report.primera_imagen}
                              alt={report.producto_nombre}
                              className="w-full h-full object-cover"
                            />
                            {report.total_imagenes && report.total_imagenes > 1 && (
                              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                                <Camera className="h-3 w-3" />
                                <span>{report.total_imagenes}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera className={`h-12 w-12 mb-2 ${report.producto_tipo === 'servicio' ? 'text-purple-300' : 'text-gray-300'}`} />
                            <p className="text-sm font-medium text-gray-400">Sin Foto</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Tipo: <span className="font-medium text-gray-900">{report.producto_tipo}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Precio: <span className="font-bold text-lg text-green-600">${typeof report.producto_precio === 'string' ? parseFloat(report.producto_precio).toFixed(2) : report.producto_precio.toFixed(2)}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Categoría: <span className="font-medium text-gray-900">{report.categoria_nombre}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Vendedor: <span className="font-medium text-gray-900">{report.vendedor_nombre} {report.vendedor_apellido}</span></span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/products/${report.item_id}`)}
                        className="w-full h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Producto
                      </Button>
                    </div>

                     {/* Columna 2: Info del Reporte - Optimizado para móvil */}
                     <div className="space-y-4 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Tipo de Reporte</div>
                        <Badge className="bg-red-100 text-red-800 border-red-300 border">
                          {getTipoReporteLabel(report.tipo_reporte)}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Motivo</div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {report.descripcion}
                        </p>
                      </div>

                      {report.comentario_opcional && (
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">Información Adicional</div>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {report.comentario_opcional}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Reportado por: <span className="font-medium text-gray-900">{report.reportante_nombre} {report.reportante_apellido}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${report.reportante_tipo === 'moderador' || report.reportante_tipo === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} border`}>
                            {report.reportante_tipo}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(report.fecha_reporte)}</span>
                        </div>
                      </div>

                      {report.total_reportes_producto > 1 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-800">
                            ⚠️ Este producto tiene <strong>{report.total_reportes_producto}</strong> reportes
                          </p>
                        </div>
                      )}
                    </div>

                     {/* Columna 3: Acciones - Optimizado para móvil */}
                     <div className="space-y-3 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0">
                      <div className="text-sm font-semibold text-gray-700 mb-4">Acciones de Moderación</div>
                      
                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(report, 'aprobar')}
                        disabled={actionLoading === report.id}
                        className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Producto Válido
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(report, 'rechazar')}
                        disabled={actionLoading === report.id}
                        className="w-full h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar Producto
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(report, 'suspender')}
                        disabled={actionLoading === report.id}
                        className="w-full h-10 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Suspender
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openResolveDialog(report, 'eliminar')}
                        disabled={actionLoading === report.id}
                        className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Marcar Peligroso
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

       {/* Dialog de Resolución - Optimizado para móvil */}
       {showResolveDialog && selectedReport && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Resolver Reporte</h2>
              <p className="text-red-100 text-sm mt-1">Producto: {selectedReport.producto_nombre}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-2">Acción seleccionada</Label>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {resolveAction === 'aprobar' && '✅ Producto Válido - Reporte Rechazado'}
                    {resolveAction === 'rechazar' && '❌ Rechazar Producto'}
                    {resolveAction === 'suspender' && '⏸️ Suspender Producto'}
                    {resolveAction === 'eliminar' && '🚨 Marcar como Peligroso'}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="decision" className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  Explicación de la Decisión *
                </Label>
                <Textarea
                  id="decision"
                  value={decisionFinal}
                  onChange={(e) => setDecisionFinal(e.target.value)}
                  placeholder="Explica detalladamente por qué tomaste esta decisión (mínimo 10 caracteres)..."
                  rows={5}
                  className="w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                  <p className={`text-sm font-medium ${decisionFinal.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    {decisionFinal.length} / 10
                  </p>
                </div>
              </div>

              {(resolveAction === 'eliminar' || resolveAction === 'rechazar' || resolveAction === 'suspender') && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marcarPeligroso}
                      onChange={(e) => setMarcarPeligroso(e.target.checked)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 rounded"
                    />
                    <div>
                      <span className="font-semibold text-red-900">Marcar como peligroso</span>
                      <p className="text-sm text-red-700">El producto será ocultado y no podrá ser editado por el vendedor</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    setShowResolveDialog(false);
                    setSelectedReport(null);
                    setDecisionFinal('');
                    setMarcarPeligroso(false);
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
                  disabled={actionLoading !== null}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleResolveReport}
                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={actionLoading !== null || decisionFinal.trim().length < 10}
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

