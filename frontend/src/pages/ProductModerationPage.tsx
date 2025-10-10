import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/Alert';
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
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName, getRoleColor } = usePermissions();
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
    estado: 'pendiente_revision',
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

  const handleModerationAction = async (productId: number, action: string, motivo?: string) => {
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
          motivo: motivo || `Producto ${action} por ${getRoleDisplayName()}`,
          decision_final: `Decisión: ${action}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar productos
        await loadProducts();
      } else {
        setError(data.message || 'Error al moderar producto');
      }
    } catch (error) {
      console.error('Error al moderar producto:', error);
      setError('Error al moderar producto');
    } finally {
      setActionLoading(null);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Moderación de Productos
                </h1>
                <p className="text-purple-100 text-lg mt-2">
                  Revisa y aprueba productos pendientes de moderación
                </p>
              </div>
            </div>
            
            {/* Información del rol del usuario */}
            <div className="mt-6 flex justify-center">
              <Badge className={`${getRoleColor()} px-4 py-2 text-sm font-medium`}>
                {getRoleDisplayName()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        {/* Filtros */}
        <Card className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Filtros de Moderación</span>
                <p className="text-sm text-gray-600 font-normal">Filtra productos por estado</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Producto
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="pendiente_revision">Pendiente de Revisión</option>
                  <option value="activo">Activos</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="suspendido">Suspendidos</option>
                  <option value="peligroso">Peligrosos</option>
                </select>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow group">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
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
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.estado)}
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-white">
                    {getTypeIcon(product.tipo)}
                    <span className="ml-1 capitalize">{product.tipo}</span>
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.descripcion}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="font-medium text-green-600">
                      {formatPrice(product.precio)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{product.categoria_nombre}</span>
                  </div>
                  {product.ubicacion_nombre && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{product.ubicacion_nombre}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Por: {product.vendedor_nombre}</span>
                    <span>{formatDate(product.fecha_publicacion)}</span>
                  </div>
                </div>
                
                {/* Acciones de moderación */}
                <div className="space-y-2 mt-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`/products/${product.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  
                  {product.estado === 'pendiente_revision' && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'aprobar')}
                        disabled={actionLoading === product.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Aprobar</span>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'rechazar')}
                        disabled={actionLoading === product.id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Rechazar</span>
                      </Button>
                    </div>
                  )}
                  
                  {product.estado === 'activo' && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'suspender')}
                        disabled={actionLoading === product.id}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Suspender</span>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleModerationAction(product.id, 'marcar_peligroso')}
                        disabled={actionLoading === product.id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {actionLoading === product.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Peligroso</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
              >
                Anterior
              </Button>
              
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.current_page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Productos {filters.estado.replace('_', ' ')}
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {pagination.total_items}
              </p>
              <p className="text-sm text-gray-600">
                Página {pagination.current_page} de {pagination.total_pages}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
