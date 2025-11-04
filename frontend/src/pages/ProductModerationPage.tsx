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
  Filter,
  FileText,
  Search
} from 'lucide-react';
import type { Product, ProductsResponse } from '../types/product.types';
import { ModerationReasonModal } from '../components/ui/ModerationReasonModal';

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

  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
    suspendidos: 0,
    peligrosos: 0,
    en_apelacion: 0
  });

  const [filters, setFilters] = useState({
    estado: '',
    page: 1,
    limit: 12,
    search_product_name: '',
    search_vendedor_name: ''
  });

  // Estados locales para los campos de búsqueda (antes de hacer click en buscar)
  const [searchInputs, setSearchInputs] = useState({
    productName: '',
    sellerName: ''
  });

  // Estado para modal de motivo de moderación
  const [moderationModal, setModerationModal] = useState<{
    isOpen: boolean;
    action: 'rechazar' | 'suspender' | 'marcar_peligroso';
    productId: number;
    productName: string;
  } | null>(null);

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
        if (data.estadisticas) {
          setEstadisticas(data.estadisticas);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

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
        // Mensajes de éxito personalizados según la acción
        let titulo = 'Acción completada';
        let mensaje = '';

        switch (action) {
          case 'aprobar':
            titulo = '✅ Producto Aprobado';
            mensaje = `"${productName}" ha sido APROBADO exitosamente.\n\n` +
                     `El producto ahora es visible para todos los compradores.`;
            break;
          
          case 'rechazar':
            titulo = '🔴 Producto Rechazado';
            mensaje = `"${productName}" ha sido RECHAZADO.\n\n` +
                     `El vendedor podrá verlo, editarlo, eliminarlo o apelar esta decisión.`;
            break;
          
          case 'suspender':
            titulo = '🟡 Producto Suspendido';
            mensaje = `"${productName}" ha sido SUSPENDIDO temporalmente.\n\n` +
                     `El vendedor podrá verlo y apelar, pero no editarlo ni eliminarlo hasta que se resuelva.`;
            break;
          
          case 'marcar_peligroso':
            titulo = '🚫 Producto Marcado como Peligroso';
            mensaje = `"${productName}" ha sido marcado como PELIGROSO.\n\n` +
                     `El producto está ahora OCULTO para vendedor y compradores.\n` +
                     `Solo moderadores y administradores pueden verlo.\n\n` +
                     `El vendedor podrá apelar esta decisión.`;
            break;
          
          default:
            titulo = 'Acción completada';
            mensaje = `El producto "${productName}" ha sido procesado exitosamente.`;
        }

        showSuccess(titulo, mensaje, () => loadProducts());
        
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
      `¿Estás seguro de que quieres aprobar "${productName}"?\n\nEste producto será APROBADO y visible para todos los compradores en la plataforma.`,
      () => handleModerationAction(productId, 'aprobar', productName),
      undefined // onCancel - no necesita hacer nada especial
    );
  };

  const handleRejectProduct = (productId: number, productName: string) => {
    setModerationModal({
      isOpen: true,
      action: 'rechazar',
      productId,
      productName
    });
  };

  const handleSuspendProduct = (productId: number, productName: string) => {
    setModerationModal({
      isOpen: true,
      action: 'suspender',
      productId,
      productName
    });
  };

  const handleMarkAsDangerous = (productId: number, productName: string) => {
    setModerationModal({
      isOpen: true,
      action: 'marcar_peligroso',
      productId,
      productName
    });
  };

  const handleModerationConfirm = (motivo: string) => {
    if (moderationModal) {
      handleModerationAction(
        moderationModal.productId,
        moderationModal.action,
        moderationModal.productName,
        motivo
      );
      setModerationModal(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSearchInputChange = (key: string, value: string) => {
    setSearchInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search_product_name: searchInputs.productName,
      search_vendedor_name: searchInputs.sellerName,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-blue-700 mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estadisticas.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-yellow-700 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {estadisticas.pendientes}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-green-700 mb-1">Aprobados</p>
                <p className="text-2xl font-bold text-green-900">
                  {estadisticas.aprobados}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-orange-700 mb-1">Rechazados</p>
                <p className="text-2xl font-bold text-orange-900">
                  {estadisticas.rechazados}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">Suspendidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas.suspendidos}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-red-700 mb-1">Peligrosos</p>
                <p className="text-2xl font-bold text-red-900">
                  {estadisticas.peligrosos}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-purple-700 mb-1">Apelaciones</p>
                <p className="text-2xl font-bold text-purple-900">
                  {estadisticas.en_apelacion}
                </p>
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
            <div className="space-y-6">
              {/* Fila 1: Filtro de estado y contador */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado del Producto
                  </label>
                  <select
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    className="w-full sm:w-80 flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors font-medium"
                  >
                    <option value="">📦 Todos ({estadisticas.total})</option>
                    <option value="pendiente_revision">🕐 Pendientes de Revisión ({estadisticas.pendientes})</option>
                    <option value="activo">✅ Aprobados ({estadisticas.aprobados})</option>
                    <option value="rechazado">❌ Rechazados ({estadisticas.rechazados})</option>
                    <option value="suspendido">⚠️ Suspendidos ({estadisticas.suspendidos})</option>
                    <option value="peligroso">🚫 Peligrosos ({estadisticas.peligrosos})</option>
                    <option value="en_apelacion">📋 En Apelación ({estadisticas.en_apelacion})</option>
                  </select>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200">
                  <div className="text-sm font-medium text-blue-700">
                    Mostrando <span className="font-bold text-blue-900">{products.length}</span> de <span className="font-bold text-blue-900">{pagination.total_items}</span> productos
                  </div>
                </div>
              </div>

              {/* Fila 2: Campos de búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar por Nombre de Producto
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchInputs.productName}
                      onChange={(e) => handleSearchInputChange('productName', e.target.value)}
                      placeholder="Ej: Laptop, Mueble, Servicio..."
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-colors font-medium"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar por Nombre del Vendedor
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchInputs.sellerName}
                      onChange={(e) => handleSearchInputChange('sellerName', e.target.value)}
                      placeholder="Ej: Juan, Pérez, María..."
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-colors font-medium"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Botón de búsqueda */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </Button>
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
                  
                  {(product.ubicacion_provincia || product.ubicacion_canton) && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {product.ubicacion_provincia && product.ubicacion_canton 
                          ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                          : product.ubicacion_provincia || product.ubicacion_canton}
                      </span>
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
                    <>
                      {/* Acciones principales: Aprobar, Rechazar, Suspender */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                        <Button 
                          size="sm"
                          onClick={() => handleApproveProduct(product.id, product.nombre)}
                          disabled={actionLoading === product.id || !product.fecha_revision}
                          className={`h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                            !product.fecha_revision 
                              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          } text-white`}
                          title="Aprobar producto"
                        >
                          {actionLoading === product.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">{!product.fecha_revision ? 'Revisar' : 'Aprobar'}</span>
                          <span className="ml-1 sm:hidden">✓</span>
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleRejectProduct(product.id, product.nombre)}
                          disabled={actionLoading === product.id || !product.fecha_revision}
                          className={`h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                            !product.fecha_revision 
                              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                              : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                          } text-white`}
                          title="Rechazar por errores corregibles (vendedor puede editar)"
                        >
                          {actionLoading === product.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">{!product.fecha_revision ? 'Revisar' : 'Rechazar'}</span>
                          <span className="ml-1 sm:hidden">✗</span>
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleSuspendProduct(product.id, product.nombre)}
                          disabled={actionLoading === product.id || !product.fecha_revision}
                          className={`h-10 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                            !product.fecha_revision 
                              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                              : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                          } text-white`}
                          title="Suspender por violación grave (vendedor NO puede editar)"
                        >
                          {actionLoading === product.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">{!product.fecha_revision ? 'Revisar' : 'Suspender'}</span>
                          <span className="ml-1 sm:hidden">⚠</span>
                        </Button>
                      </div>
                      
                      {/* Acción crítica: Marcar como Peligroso */}
                      {product.fecha_revision && (
                        <div className="pt-3 border-t border-gray-100">
                          <Button 
                            size="sm"
                            onClick={() => handleMarkAsDangerous(product.id, product.nombre)}
                            disabled={actionLoading === product.id}
                            className="w-full h-10 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            title="Contenido prohibido - Producto OCULTO completamente"
                          >
                            {actionLoading === product.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            <span className="ml-2">🚫 Marcar como Peligroso</span>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {product.estado === 'activo' && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleSuspendProduct(product.id, product.nombre)}
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
                        onClick={() => handleMarkAsDangerous(product.id, product.nombre)}
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
              <div className="flex flex-wrap justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {estadisticas.pendientes}
                  </p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {estadisticas.aprobados}
                  </p>
                  <p className="text-sm text-gray-600">Aprobados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {estadisticas.rechazados}
                  </p>
                  <p className="text-sm text-gray-600">Rechazados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {estadisticas.suspendidos}
                  </p>
                  <p className="text-sm text-gray-600">Suspendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {estadisticas.peligrosos}
                  </p>
                  <p className="text-sm text-gray-600">Peligrosos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {estadisticas.en_apelacion}
                  </p>
                  <p className="text-sm text-gray-600">En Apelación</p>
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

      {/* Modal de Motivo de Moderación */}
      {moderationModal && (
        <ModerationReasonModal
          isOpen={moderationModal.isOpen}
          onClose={() => setModerationModal(null)}
          onConfirm={handleModerationConfirm}
          action={moderationModal.action}
          productName={moderationModal.productName}
        />
      )}
    </div>
  );
};
