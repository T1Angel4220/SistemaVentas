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
  DollarSign,
  X
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
  origen_deteccion?: string; // 'sistema' o 'comprador'
  moderador_nombre?: string;
  moderador_apellido?: string;
  fecha_deteccion_peligroso?: string;
  es_peligroso?: boolean;
  moderador_resolutor_nombre?: string;
  moderador_resolutor_apellido?: string;
  moderador_producto_nombre?: string;
  moderador_producto_apellido?: string;
  decision_final?: string;
  fecha_resolucion?: string;
  motivo_rechazo?: string;
  fecha_revision?: string;
}

export const ReportsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName } = usePermissions();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [systemDetected, setSystemDetected] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<'aprobar' | 'rechazar' | 'suspender' | 'eliminar'>('aprobar');
  const [decisionFinal, setDecisionFinal] = useState('');
  const [marcarPeligroso, setMarcarPeligroso] = useState(false);
  const [activeTab, setActiveTab] = useState<'buyer-reports' | 'system-detected'>('buyer-reports');

  const [filters, setFilters] = useState({
    tipo_reporte: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.tipo_reporte) queryParams.append('tipo_reporte', filters.tipo_reporte);
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.fecha_desde) queryParams.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) queryParams.append('fecha_hasta', filters.fecha_hasta);

      const response = await fetch(`http://localhost:3001/api/reports/pending?${queryParams}`, {
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

  const loadSystemDetected = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.fecha_desde) queryParams.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) queryParams.append('fecha_hasta', filters.fecha_hasta);

      const response = await fetch(`http://localhost:3001/api/reports/system-detected?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSystemDetected(data.data);
      } else {
        showError('Error', 'No se pudieron cargar los productos detectados');
      }
    } catch (error) {
      console.error('Error al cargar productos detectados:', error);
      showError('Error', 'Error de conexión al cargar productos detectados');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (user && canModerateProduct()) {
      if (activeTab === 'buyer-reports') {
        loadReports();
      } else {
        loadSystemDetected();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    
    if (decisionFinal.trim().length < 10) {
      showError('Error', 'La explicación debe tener al menos 10 caracteres');
      return;
    }

    try {
      const loadingId = activeTab === 'system-detected' ? selectedReport.item_id : selectedReport.id;
      setActionLoading(loadingId);
      
      // Si es un producto detectado por el sistema, usar el endpoint de moderación
      if (activeTab === 'system-detected') {
        // Solo permitir 'aprobar' (activar) o 'eliminar' (marcar peligroso)
        const accionMap: Record<string, string> = {
          'aprobar': 'aprobar',
          'eliminar': 'marcar_peligroso'
        };

        // Si la acción no es válida para system-detected, mostrar error
        if (!accionMap[resolveAction]) {
          showError('Error', 'Acción no válida para productos detectados por el sistema');
          setActionLoading(null);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/products/${selectedReport.item_id}/moderate`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiService.getToken()}`
          },
          body: JSON.stringify({
            accion: accionMap[resolveAction],
            motivo: decisionFinal,
            decision_final: decisionFinal
          })
        });

        const data = await response.json();
        
        if (data.success) {
          const actionText = {
            'aprobar': 'Producto activado (no es peligroso)',
            'eliminar': 'Producto marcado como peligroso'
          };
          
          showSuccess(
            '✅ Estado actualizado',
            actionText[resolveAction] || 'Estado actualizado',
            () => {
              setShowResolveDialog(false);
              setSelectedReport(null);
              setDecisionFinal('');
              setMarcarPeligroso(false);
              loadSystemDetected();
            }
          );
        } else {
          showError('Error', data.message || 'Error al actualizar el estado del producto');
        }
      } else {
        // Si es un reporte de comprador, usar el endpoint de reportes
        const response = await fetch(`http://localhost:3001/api/reports/${selectedReport.id}/resolve`, {
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
      }
    } catch (error) {
      console.error('Error al procesar:', error);
      showError('Error', 'Error de conexión al procesar');
    } finally {
      setActionLoading(null);
    }
  };

  const openResolveDialog = (report: Report, action: 'aprobar' | 'rechazar' | 'suspender' | 'eliminar') => {
    setSelectedReport(report);
    setResolveAction(action);
    setShowResolveDialog(true);
    setDecisionFinal('');
    setMarcarPeligroso(false);
  };

  const clearFilters = () => {
    setFilters({
      tipo_reporte: '',
      estado: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    let dateStr = dateString.trim();
    
    // Si ya tiene información de zona horaria completa, usarla directamente
    if (dateStr.includes('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
      return new Date(dateStr).toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
    
    // PostgreSQL devuelve fechas sin zona horaria: '2025-11-29 19:56:58.84055'
    // IMPORTANTE: Estas fechas están almacenadas en hora de Ecuador (UTC-5)
    // El problema: JavaScript interpreta fechas sin zona horaria como hora local del navegador
    // Solución: Agregar explícitamente el offset de Ecuador (-05:00) al crear el Date
    
    // Normalizar: reemplazar espacio por 'T' para formato ISO
    if (!dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    // Eliminar microsegundos (mantener solo hasta segundos)
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      dateStr = parts[0];
    }
    
    // Extraer componentes de la fecha
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) {
      console.error('Formato de fecha no reconocido:', dateString);
      return 'Fecha inválida';
    }
    
    // Extraer componentes de la fecha (que ya están en hora de Ecuador)
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(match[3]);
    const hour = parseInt(match[4]);
    const minute = parseInt(match[5]);
    const second = parseInt(match[6]);
    
    // IMPORTANTE: Los valores ya están en hora de Ecuador
    // JavaScript necesita interpretarlos como hora local, no como UTC
    // Solución: Crear el Date directamente con los valores como hora local
    // Pero como estamos en el navegador del usuario, necesitamos ajustar
    
    // Crear string ISO con el offset de Ecuador explícitamente
    // Esto le dice a JavaScript que interprete la hora como UTC-5 (Ecuador)
    const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}-05:00`;
    
    const date = new Date(isoString);
    
    // Verificar que la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString, '->', isoString);
      return 'Fecha inválida';
    }
    
    // Formatear directamente mostrando los valores tal como están
    // Los valores hora, minuto, segundo ya están en hora de Ecuador
    // Solo necesitamos formatearlos correctamente
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mes = meses[month];
    
    // Determinar AM/PM
    let hora12 = hour;
    let periodo = 'a. m.';
    if (hour === 0) {
      hora12 = 12;
    } else if (hour === 12) {
      periodo = 'p. m.';
    } else if (hour > 12) {
      hora12 = hour - 12;
      periodo = 'p. m.';
    }
    
    // Formatear con los valores directos (ya están en hora de Ecuador)
    // Nota: Los valores hora, minuto, segundo vienen directamente de la BD en hora de Ecuador
    return `${day} ${mes} ${year}, ${String(hora12).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${periodo}`;
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

  const getEstadoBadge = (estado: string | undefined, productoEstado?: string, esPeligroso?: boolean) => {
    // Si es un producto detectado por el sistema, usar el estado del producto
    if (activeTab === 'system-detected') {
      if (esPeligroso || productoEstado === 'peligroso') {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 border">
            PELIGROSO
          </Badge>
        );
      }
      if (productoEstado) {
        const colors: Record<string, string> = {
          'activo': 'bg-green-100 text-green-800 border-green-300',
          'suspendido': 'bg-orange-100 text-orange-800 border-orange-300',
          'rechazado': 'bg-gray-100 text-gray-800 border-gray-300',
          'peligroso': 'bg-red-100 text-red-800 border-red-300',
          'pendiente_revision': 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
        return (
          <Badge className={`${colors[productoEstado] || 'bg-gray-100 text-gray-800'} border`}>
            {productoEstado.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      }
      return (
        <Badge className="bg-gray-100 text-gray-800 border">
          SIN ESTADO
        </Badge>
      );
    }
    
    // Para reportes de compradores, usar el estado del reporte
    if (!estado) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border">
          SIN ESTADO
        </Badge>
      );
    }
    
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
        {/* Pestañas - Reportes de Compradores y Detectados por Sistema */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('buyer-reports')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'buyer-reports'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flag className="h-4 w-4 inline mr-2" />
              Reportes de Compradores
            </button>
            <button
              onClick={() => setActiveTab('system-detected')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'system-detected'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Detectados por Sistema
            </button>
          </div>
        </div>

        {/* Estadísticas - Optimizado para móvil */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {activeTab === 'buyer-reports' 
                      ? reports.filter(r => r.estado === 'pendiente').length
                      : systemDetected.filter(r => r.producto_estado === 'peligroso' || r.es_peligroso).length}
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
                    {activeTab === 'buyer-reports' 
                      ? reports.filter(r => r.estado === 'en_revision').length
                      : 0}
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
                    {activeTab === 'buyer-reports' 
                      ? reports.filter(r => r.estado === 'resuelto').length
                      : 0}
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
                    {activeTab === 'buyer-reports' ? reports.length : systemDetected.length}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeTab === 'buyer-reports' && (
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
              )}

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
                  {activeTab === 'buyer-reports' ? (
                    <>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_revision">En Revisión</option>
                      <option value="resuelto">Resuelto</option>
                    </>
                  ) : (
                    <>
                      <option value="peligroso">Peligroso</option>
                      <option value="suspendido">Suspendido</option>
                      <option value="rechazado">Rechazado</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.fecha_desde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                  className="w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                  className="w-full flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                />
              </div>
            </div>
            {/* Botón para limpiar filtros */}
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="h-10 px-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                disabled={!filters.tipo_reporte && !filters.estado && !filters.fecha_desde && !filters.fecha_hasta}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de reportes o productos detectados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando {activeTab === 'buyer-reports' ? 'reportes' : 'productos detectados'}...</p>
          </div>
        ) : (activeTab === 'buyer-reports' ? reports.length === 0 : systemDetected.length === 0) ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Flag className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'buyer-reports' 
                  ? 'No hay reportes pendientes'
                  : 'No hay productos detectados por el sistema'}
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {activeTab === 'buyer-reports'
                  ? 'No se encontraron reportes con los filtros seleccionados'
                  : 'No se encontraron productos detectados automáticamente por el sistema'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {(activeTab === 'buyer-reports' ? reports : systemDetected).map((report) => (
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
                        {getEstadoBadge(report.estado, report.producto_estado, report.es_peligroso)}
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

                     {/* Columna 2: Info del Reporte o Producto Detectado - Optimizado para móvil */}
                     <div className="space-y-4 xl:border-l xl:border-gray-200 xl:pl-6 border-t border-gray-200 pt-4 xl:pt-0 xl:border-t-0">
                      {activeTab === 'buyer-reports' ? (
                        <>
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
                              <span className="text-gray-600">Reportado: {formatDate(report.fecha_reporte)}</span>
                            </div>
                            {report.estado === 'resuelto' && (
                              <>
                                {report.moderador_resolutor_nombre && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <User className="h-4 w-4 text-green-500" />
                                    <span className="text-gray-600">
                                      Reporte resuelto por: <span className="font-medium text-green-700">{report.moderador_resolutor_nombre} {report.moderador_resolutor_apellido}</span>
                                    </span>
                                  </div>
                                )}
                                {report.moderador_producto_nombre && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span className="text-gray-600">
                                      Estado cambiado por: <span className="font-medium text-blue-700">{report.moderador_producto_nombre} {report.moderador_producto_apellido}</span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        ({report.producto_estado === 'rechazado' ? 'Rechazó' : report.producto_estado === 'suspendido' ? 'Suspendió' : report.producto_estado === 'peligroso' ? 'Marcó como peligroso' : 'Aprobó'})
                                      </span>
                                    </span>
                                  </div>
                                )}
                                {report.fecha_resolucion && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Resuelto: {formatDate(report.fecha_resolucion)}</span>
                                  </div>
                                )}
                                {report.decision_final && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="text-sm font-semibold text-gray-700 mb-1">Decisión del Moderador:</div>
                                    <p className="text-sm text-gray-600">{report.decision_final}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              Detectado por el Sistema
                            </div>
                            <Badge className="bg-red-100 text-red-800 border-red-300 border">
                              🚨 Producto Peligroso
                            </Badge>
                          </div>

                          {report.motivo_rechazo && (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">Motivo de Detección</div>
                              <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                {report.motivo_rechazo}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2 text-sm">
                            {report.moderador_nombre && (
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Revisado por: <span className="font-medium text-gray-900">{report.moderador_nombre} {report.moderador_apellido}</span></span>
                              </div>
                            )}
                            {report.fecha_deteccion_peligroso && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Detectado: {formatDate(report.fecha_deteccion_peligroso)}</span>
                              </div>
                            )}
                            {report.fecha_revision && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Revisado: {formatDate(report.fecha_revision)}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

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
                      
                      {/* Botones para reportes de compradores */}
                      {activeTab === 'buyer-reports' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'aprobar')}
                            disabled={actionLoading === report.id || report.estado === 'resuelto'}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              report.estado === 'resuelto' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Producto Válido
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'rechazar')}
                            disabled={actionLoading === report.id || report.estado === 'resuelto'}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              report.estado === 'resuelto' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                            }`}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar Producto
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'suspender')}
                            disabled={actionLoading === report.id || report.estado === 'resuelto'}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              report.estado === 'resuelto' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Suspender
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'eliminar')}
                            disabled={actionLoading === report.id || report.estado === 'resuelto'}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              report.estado === 'resuelto' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Marcar Peligroso
                          </Button>
                        </>
                      )}

                      {/* Botones para productos detectados por el sistema - Solo 2 opciones válidas */}
                      {/* Solo mostrar botones si el producto fue detectado por el sistema (tiene fecha_deteccion_peligroso) */}
                      {activeTab === 'system-detected' && report.fecha_deteccion_peligroso && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'aprobar')}
                            disabled={actionLoading === report.item_id || (report.producto_estado === 'activo' && !report.es_peligroso)}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              ((report.producto_estado === 'activo' && !report.es_peligroso) || actionLoading === report.item_id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            No es Peligroso (Activar)
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => openResolveDialog(report, 'eliminar')}
                            disabled={actionLoading === report.item_id || (report.es_peligroso && report.producto_estado === 'peligroso')}
                            className={`w-full h-10 rounded-xl font-medium shadow-lg ${
                              (report.es_peligroso && report.producto_estado === 'peligroso') || actionLoading === report.item_id
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Marcar como Peligroso
                          </Button>
                        </>
                      )}
                      
                      {/* Mensaje si el producto no fue detectado por el sistema */}
                      {activeTab === 'system-detected' && !report.fecha_deteccion_peligroso && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>⚠️ Nota:</strong> Este producto no fue detectado automáticamente por el sistema. 
                            Para cambiar su estado, usa la sección de "Reportes de Compradores" o la página de moderación de productos.
                          </p>
                        </div>
                      )}
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
              <h2 className="text-2xl font-bold">
                {activeTab === 'buyer-reports' ? 'Resolver Reporte' : 'Cambiar Estado de Visualización'}
              </h2>
              <p className="text-red-100 text-sm mt-1">Producto: {selectedReport.producto_nombre}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-2">Acción seleccionada</Label>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {activeTab === 'buyer-reports' ? (
                      <>
                        {resolveAction === 'aprobar' && '✅ Producto Válido - Reporte Rechazado'}
                        {resolveAction === 'rechazar' && '❌ Rechazar Producto'}
                        {resolveAction === 'suspender' && '⏸️ Suspender Producto'}
                        {resolveAction === 'eliminar' && '🚨 Marcar como Peligroso'}
                      </>
                    ) : (
                      <>
                        {resolveAction === 'aprobar' && '✅ No es Peligroso - Activar Producto'}
                        {resolveAction === 'eliminar' && '🚨 Marcar como Peligroso'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="decision" className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  {activeTab === 'buyer-reports' ? 'Explicación de la Decisión *' : 'Motivo del Cambio de Estado *'}
                </Label>
                <Textarea
                  id="decision"
                  value={decisionFinal}
                  onChange={(e) => setDecisionFinal(e.target.value)}
                  placeholder={activeTab === 'buyer-reports' 
                    ? "Explica detalladamente por qué tomaste esta decisión (mínimo 10 caracteres)..."
                    : "Explica por qué cambias el estado de visualización de este producto (mínimo 10 caracteres)..."}
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

              {activeTab === 'buyer-reports' && (resolveAction === 'eliminar' || resolveAction === 'rechazar' || resolveAction === 'suspender') && (
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

