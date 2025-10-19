import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Shield, 
  Package, 
  Calendar, 
  MapPin, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import type { Product, ProductsResponse } from '../types/product.types';

export const ProductModerationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName } = usePermissions();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_prev: false
  });

  const [filters, setFilters] = useState({
    estado: '',
    page: 1,
    limit: 12
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`http://localhost:3001/api/products/moderation/pending?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      } else {
        setError('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error de conexión: Verifica que el servidor esté corriendo');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Verificar permisos y cargar productos
  useEffect(() => {
    if (!user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    if (!canModerateProduct()) {
      setError('No tienes permisos para acceder a esta página');
      setLoading(false);
      return;
    }

    // Solo cargar si tiene permisos
    loadProducts();
  }, [user, filters, loadProducts]);

  const handleModerationAction = async (productId: number, action: string, productName: string, motivo?: string) => {
    try {
      setActionLoading(productId);
      
      const response = await fetch(`http://localhost:3001/api/products/${productId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          accion: action,
          motivo: motivo || `Producto ${action === 'aprobar' ? 'aprobado' : action === 'rechazar' ? 'rechazado' : action} por ${getRoleDisplayName()}`,
          decision_final: `Decisión: ${action === 'aprobar' ? 'Aprobado' : action === 'rechazar' ? 'Rechazado' : action}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mostrar mensaje de éxito
        const actionText = action === 'aprobar' ? 'aprobado' : action === 'rechazar' ? 'rechazado' : action;
        showSuccess(
          'Acción completada',
          `El producto "${productName}" ha sido ${actionText} exitosamente.`,
          () => loadProducts()
        );
        
        // Limpiar errores
        setError(null);
      } else {
        showError('Error', data.message || 'Error al moderar producto');
      }
    } catch (error) {
      console.error('Error al moderar producto:', error);
      showError('Error', 'Error de conexión al moderar producto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProduct = (productId: number, productName: string) => {
    showWarning(
      '¿Aprobar producto?',
      `¿Estás seguro de que quieres aprobar el producto "${productName}"? Este producto será visible para todos los compradores.`,
      () => handleModerationAction(productId, 'aprobar', productName),
      undefined // onCancel - no necesita hacer nada especial
    );
  };

  const handleRejectProduct = (productId: number, productName: string) => {
    showWarning(
      '¿Rechazar producto?',
      `¿Estás seguro de que quieres rechazar el producto "${productName}"? Este producto será suspendido y no será visible para los compradores.`,
      () => handleModerationAction(productId, 'rechazar', productName),
      undefined // onCancel - no necesita hacer nada especial
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  const getStatusBadge = (estado: string) => {
    const statusColors = {
      pendiente_revision: 'bg-yellow-100 text-yellow-800',
      activo: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
      suspendido: 'bg-gray-100 text-gray-800',
      peligroso: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[estado as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {estado.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (tipo: string) => {
    return tipo === 'servicio' ? <Calendar className="h-4 w-4" /> : <Package className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h2>
          <p className="text-gray-600">Obteniendo productos para moderación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header profesional */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Centro de Moderación
                </h1>
                <p className="text-blue-100 text-base mt-1">
                  Revisión y aprobación de contenido
                </p>
              </div>
            </div>
            
            {/* Información del rol y estadísticas */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-200">Moderador activo</div>
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
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {products.filter(p => p.estado === 'pendiente_revision').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Aprobados</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {products.filter(p => p.estado === 'activo').length}
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
                  <p className="text-sm font-medium text-red-700">Rechazados</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">
                    {products.filter(p => p.estado === 'suspendido').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {pagination.total_items}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros mejorados */}
        <Card className="mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Filtros de Moderación</span>
                <p className="text-sm text-gray-600 font-normal">Filtra productos por estado para revisión</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado del Producto
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
          className="w-full sm:w-64 flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                >
          <option value="">Todos</option>
                  <option value="pendiente_revision">Pendiente de Revisión</option>
                  <option value="activo">Activos</option>
          <option value="suspendido">Rechazados/Suspendidos</option>
                  <option value="peligroso">Peligrosos</option>
                </select>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200">
                <div className="text-sm font-medium text-blue-700">
                  Mostrando <span className="font-bold text-blue-900">{products.length}</span> de <span className="font-bold text-blue-900">{pagination.total_items}</span> productos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group">
              <div className="relative">
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {product.total_imagenes > 0 && product.primera_imagen ? (
                    <>
                      <img
                        src={product.primera_imagen}
                        alt={product.nombre}
                        className="w-full h-full object-cover"
                      />
                      {/* Indicador de múltiples imágenes */}
                      {product.total_imagenes > 1 && (
                        <div className="absolute bottom-3 right-3">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
                            +{product.total_imagenes - 1} más
                          </div>
                    </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-600">
                      <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Package className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium">
                        {product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'Sin imágenes'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Badges mejorados */}
                <div className="absolute top-3 right-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200">
                  {getStatusBadge(product.estado)}
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200">
                    <Badge variant="outline" className="bg-transparent border-gray-300 text-gray-700">
                    {getTypeIcon(product.tipo)}
                      <span className="ml-1 capitalize text-xs">{product.tipo}</span>
                  </Badge>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">
                    {product.nombre}
                  </h3>
                    <p className="text-sm text-gray-500 font-medium">Código: {product.codigo}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {product.descripcion}
                  </p>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatPrice(product.precio)}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {product.categoria_nombre}
                    </span>
                  </div>
                  
                  {product.ubicacion_nombre && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{product.ubicacion_nombre}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">Por: {product.vendedor_nombre}</span>
                    <span>{formatDate(product.fecha_publicacion)}</span>
                  </div>
                </div>
                
                {/* Acciones de moderación mejoradas */}
                <div className="space-y-3 mt-6">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                  
                  {product.estado === 'pendiente_revision' && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleApproveProduct(product.id, product.nombre)}
                        disabled={actionLoading === product.id || !product.fecha_revision}
                        className={`h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                          !product.fecha_revision 
                            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        } text-white`}
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="ml-2">{!product.fecha_revision ? 'Revisar primero' : 'Aprobar'}</span>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleRejectProduct(product.id, product.nombre)}
                        disabled={actionLoading === product.id || !product.fecha_revision}
                        className={`h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                          !product.fecha_revision 
                            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                        } text-white`}
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="ml-2">{!product.fecha_revision ? 'Revisar primero' : 'Rechazar'}</span>
                      </Button>
                    </div>
                  )}
                  
                  {product.estado === 'activo' && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'suspender', product.nombre)}
                        disabled={actionLoading === product.id}
                        className="h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="ml-2">Suspender</span>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'marcar_peligroso', product.nombre)}
                        disabled={actionLoading === product.id}
                        className="h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="ml-2">Peligroso</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación mejorada */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                {/* Botón Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className={`
                    px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${!pagination.has_prev 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                      : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                    }
                  `}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </span>
                </Button>
                
                {/* Números de página */}
                <div className="flex items-center space-x-1.5">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => {
                    const isCurrentPage = page === pagination.current_page;
                    const isNearCurrent = Math.abs(page - pagination.current_page) <= 1;
                    const isFirstOrLast = page === 1 || page === pagination.total_pages;
                    
                    // Mostrar solo páginas cercanas, primera y última
                    if (!isNearCurrent && !isFirstOrLast && pagination.total_pages > 5) {
                      // Mostrar puntos suspensivos
                      if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                        return (
                          <span key={page} className="px-2 text-gray-400 text-sm">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`
                          min-w-[2.75rem] h-11 rounded-xl font-semibold text-sm
                          transition-all duration-200 transform
                          ${isCurrentPage 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                            : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105'
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                {/* Botón Siguiente */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className={`
                    px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${!pagination.has_next 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                      : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                    }
                  `}
                >
                  <span className="flex items-center">
                    Siguiente
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Button>
              </div>
              
              {/* Información adicional */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center font-medium">
                  Página <span className="text-blue-600 font-bold">{pagination.current_page}</span> de{' '}
                  <span className="text-gray-700 font-bold">{pagination.total_pages}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-700">{pagination.total_items}</span> productos en total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas finales */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resumen de Moderación
              </h3>
              <div className="flex justify-center space-x-8 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.estado === 'pendiente_revision').length}
                  </p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.estado === 'activo').length}
                  </p>
                  <p className="text-sm text-gray-600">Aprobados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter(p => p.estado === 'suspendido').length}
                  </p>
                  <p className="text-sm text-gray-600">Rechazados</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Página {pagination.current_page} de {pagination.total_pages} • Total: {pagination.total_items} productos
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

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
