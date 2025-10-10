import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import type { Product, ProductsResponse } from '../types/product.types';

export const MyProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`http://localhost:3001/api/products/my/products?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador')) {
      loadProducts();
    }
  }, [user, filters, loadProducts]);

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

  const handleToggleAvailability = async (productId: number, currentAvailability: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disponibilidad: !currentAvailability })
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local
        setProducts(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, disponibilidad: !currentAvailability }
            : product
        ));
        
        const newStatus = !currentAvailability ? 'disponible' : 'no disponible';
        showSuccess(
          'Disponibilidad actualizada',
          `El producto ahora está ${newStatus}.`
        );
      } else {
        showError('Error', data.message || 'Error al cambiar disponibilidad');
      }
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      showError('Error', 'Error al cambiar disponibilidad');
    }
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    showWarning(
      '¿Eliminar producto?',
      `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${apiService.getToken()}`
            }
          });

          const data = await response.json();
          if (data.success) {
            showSuccess(
              '¡Producto eliminado!',
              `"${productName}" ha sido eliminado correctamente.`,
              () => loadProducts()
            );
          } else {
            showError('Error', data.message || 'Error al eliminar el producto');
          }
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          showError('Error', 'Error al eliminar el producto');
        }
      },
      undefined // onCancel - no necesita hacer nada especial
    );
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
      day: 'numeric'
    });
  };

  const getStatusBadge = (estado: string, disponibilidad: boolean) => {
    if (!disponibilidad) {
      return <Badge variant="secondary">No disponible</Badge>;
    }
    
    const statusColors = {
      activo: 'bg-green-100 text-green-800',
      pendiente_revision: 'bg-yellow-100 text-yellow-800',
      rechazado: 'bg-red-100 text-red-800',
      suspendido: 'bg-gray-100 text-gray-800'
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

  const getStatusMessage = (estado: string) => {
    const messages = {
      activo: 'Tu producto está activo y visible para los compradores.',
      pendiente_revision: 'Tu producto está siendo revisado por los moderadores.',
      rechazado: 'Tu producto fue rechazado. Revisa los comentarios y haz las correcciones necesarias.',
      suspendido: 'Tu producto ha sido suspendido temporalmente.'
    };
    return messages[estado as keyof typeof messages] || 'Estado desconocido';
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso denegado
            </h3>
            <p className="text-gray-600 mb-4">
              Solo los vendedores pueden acceder a esta página.
            </p>
            <Link to="/products">
              <Button>Volver a productos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con gradiente azul-púrpura */}
      <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Botón Volver */}
              <Link to="/products">
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 rounded-xl px-4 py-2 flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Volver</span>
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Mis Productos
                </h1>
                <p className="text-blue-100 text-base">
                  Gestiona tus productos y servicios publicados
                </p>
              </div>
            </div>
            <Link to="/products/create">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Crear Producto</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Estadísticas mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total productos</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{pagination.total_items}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Activos</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {products.filter(p => p.estado === 'activo' && p.disponibilidad).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="h-6 w-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="h-6 w-6 bg-white rounded-full"></div>
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
                    {products.filter(p => p.estado === 'rechazado').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="h-6 w-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros mejorados */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Filtrar por estado</label>
                <select 
                  value={filters.estado} 
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full sm:w-64 flex h-12 items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pendiente_revision">Pendientes de revisión</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="suspendido">Suspendidos</option>
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

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No tienes productos publicados
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Comienza creando tu primer producto o servicio y expande tu negocio
              </p>
              <Link to="/products/create">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4">
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-medium">Crear mi primer producto</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group">
                <div className="relative">
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
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
                      {getStatusBadge(product.estado, product.disponibilidad)}
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
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Publicado: {formatDate(product.fecha_publicacion)}
                    </div>
                    
                    {/* Mensaje de estado mejorado */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                      <div className="text-xs text-blue-700 font-medium leading-relaxed">
                        {getStatusMessage(product.estado)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción mejorados */}
                  <div className="flex space-x-2 mt-6">
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-10 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    
                    {product.estado !== 'rechazado' && !product.es_peligroso && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditProduct(product.id)}
                        className="h-10 w-10 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(product.id, product.disponibilidad)}
                      className={`h-10 w-10 rounded-xl border-2 font-medium ${
                        product.disponibilidad 
                          ? 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300' 
                          : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {product.disponibilidad ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id, product.nombre)}
                      className="h-10 w-10 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación mejorada */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className="h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Anterior
            </Button>
            
            <div className="flex space-x-2">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.current_page;
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-11 rounded-xl font-medium ${
                      isCurrentPage 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg' 
                        : 'border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Siguiente
            </Button>
          </div>
        )}
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
