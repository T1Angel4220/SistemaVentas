import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { Product, ProductsResponse } from '../types/product.types';

export const MyProductsPage: React.FC = () => {
  const { user } = useAuth();
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      } else {
        alert(data.message || 'Error al cambiar disponibilidad');
      }
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      alert('Error al cambiar disponibilidad');
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          // Recargar productos
          loadProducts();
        } else {
          alert(data.message || 'Error al eliminar el producto');
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Productos
              </h1>
              <p className="text-gray-600">
                Gestiona tus productos y servicios publicados
              </p>
            </div>
            <Link to="/products/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Crear Producto</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total productos</p>
                  <p className="text-2xl font-semibold text-gray-900">{pagination.total_items}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.estado === 'activo' && p.disponibilidad).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.estado === 'pendiente_revision').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rechazados</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.estado === 'rechazado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
                <select 
                  value={filters.estado} 
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-48 flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pendiente_revision">Pendientes de revisión</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Mostrando {products.length} de {pagination.total_items} productos
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
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes productos publicados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer producto o servicio
              </p>
              <Link to="/products/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear mi primer producto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {product.total_imagenes > 0 ? (
                      <div className="text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">{product.total_imagenes} imagen{product.total_imagenes !== 1 ? 'es' : ''}</p>
                      </div>
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product.estado, product.disponibilidad)}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white">
                      {getTypeIcon(product.tipo)}
                      <span className="ml-1 capitalize">{product.tipo}</span>
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {product.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.descripcion}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-green-600">
                        {formatPrice(product.precio)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.categoria_nombre}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Publicado: {formatDate(product.fecha_publicacion)}
                    </div>
                    
                    {/* Mensaje de estado */}
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {getStatusMessage(product.estado)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    
                    {product.estado !== 'rechazado' && !product.es_peligroso && (
                      <Link to={`/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(product.id, product.disponibilidad)}
                      className={product.disponibilidad ? 'text-green-600' : 'text-gray-400'}
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
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
            >
              Anterior
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.current_page;
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
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
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
