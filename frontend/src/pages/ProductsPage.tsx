import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  MapPin, 
  Calendar,
  Heart,
  Eye,
  ShoppingCart,
  DollarSign,
  Shield,
  Camera,
  Flag
} from 'lucide-react';
import type { Product, ProductsResponse, ProductFilters } from '../types/product.types';
import type { Category } from '../types/category.types';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import { ReportProductDialog } from '../components/ui/ReportProductDialog';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName, getRoleColor } = usePermissions();
  const { showSuccess, showError } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_prev: false
  });

  // Filtros optimizados para muchos datos
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoria_id: '',
    tipo: '',
    precio_min: '',
    precio_max: '',
    estado: 'activo', // Por defecto solo activos
    disponibilidad: 'true', // Por defecto solo disponibles
    page: 1,
    limit: 12
  });

  // Estado para productos guardados
  const [savedProducts, setSavedProducts] = useState<number[]>([]);
  const [savingProduct, setSavingProduct] = useState<number | null>(null);
  
  // Estado para modal de reportes
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedProductForReport, setSelectedProductForReport] = useState<{id: number; nombre: string} | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`http://localhost:3001/api/products?${queryParams}`);
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

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      // No mostrar error al usuario, solo log
    }
  };

  const loadSavedProducts = useCallback(async () => {
    if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/products/saved', {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSavedProducts(data.data.map((p: { id: number }) => p.id));
      }
    } catch (error) {
      console.error('Error al cargar productos guardados:', error);
    }
  }, [user]);

  // Cargar datos iniciales
  useEffect(() => {
    loadProducts();
    // Solo cargar categorías si no están cargadas
    if (categories.length === 0) {
      loadCategories();
    }
  }, [loadProducts, categories.length]);

  useEffect(() => {
    if (user) {
      loadSavedProducts();
    }
  }, [user, loadSavedProducts]);

  const handleSaveProduct = async (productId: number) => {
    if (!user) {
      showError('Error', 'Debes iniciar sesión para guardar productos');
      return;
    }

    if (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor') {
      showError('Error', 'Solo los compradores y vendedores pueden guardar productos');
      return;
    }

    setSavingProduct(productId);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('¡Producto guardado!', 'El producto se ha añadido a tu lista de favoritos.');
        setSavedProducts(prev => [...prev, productId]);
      } else {
        showError('Error', data.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showError('Error', 'Error al guardar el producto');
    } finally {
      setSavingProduct(null);
    }
  };

  const handleUnsaveProduct = async (productId: number) => {
    if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) return;

    setSavingProduct(productId);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/unsave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
        setSavedProducts(prev => prev.filter(id => id !== productId));
      } else {
        showError('Error', data.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showError('Error', 'Error al eliminar el producto');
    } finally {
      setSavingProduct(null);
    }
  };

  const handleReportProduct = (product: Product) => {
    setSelectedProductForReport({
      id: product.id,
      nombre: product.nombre
    });
    setReportModalOpen(true);
  };

  const handleReportSuccess = () => {
    showSuccess(
      '¡Reporte enviado!', 
      user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador'
        ? 'Tu reporte será revisado por otro moderador o administrador.'
        : 'Tu reporte será revisado por un moderador.'
    );
    setReportModalOpen(false);
    setSelectedProductForReport(null);
    loadProducts(); // Recargar productos
  };


  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' USD';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (product: Product) => {
    const { estado, disponibilidad, tipo, es_peligroso } = product;
    
    // Si es peligroso, mostrar badge rojo
    if (estado === 'peligroso' || es_peligroso) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          {tipo === 'servicio' ? 'Servicio Peligroso' : 'Producto Peligroso'}
        </Badge>
      );
    }
    
    // Si está activo pero sin stock
    if (estado === 'activo' && !disponibilidad) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          {tipo === 'servicio' ? 'Servicio sin Stock' : 'Producto sin Stock'}
        </Badge>
      );
    }
    
    // Estados normales
    const statusConfig = {
      activo: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: tipo === 'servicio' ? 'Servicio Activo' : 'Producto Activo'
      },
      pendiente_revision: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendiente de Revisión'
      },
      rechazado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rechazado'
      },
      suspendido: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Suspendido'
      }
    };
    
    const config = statusConfig[estado as keyof typeof statusConfig] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      text: 'Estado Desconocido'
    };
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (tipo: string) => {
    return tipo === 'servicio' ? <Calendar className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <Package className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Productos y Servicios
                </h1>
                <p className="text-blue-100 text-lg mt-2">
                  Descubre una amplia variedad de productos y servicios de calidad
                </p>
              </div>
            </div>
            
            {/* Botones de acción según permisos */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {/* Solo mostrar "Crear Producto" si es vendedor (NO admin o moderador) */}
              {user?.tipo_usuario === 'vendedor' && (
                <Link to="/products/create">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-5 w-5 mr-2" />
                    Crear Producto
                  </Button>
                </Link>
              )}
              
              {/* Solo mostrar "Mis Productos" si es vendedor (NO admin o moderador) */}
              {user?.tipo_usuario === 'vendedor' && (
                <Link to="/my-products">
                  <Button size="lg" variant="outline" className="bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Package className="h-5 w-5 mr-2" />
                    Mis Productos
                  </Button>
                </Link>
              )}
              
              {/* Solo mostrar "Mis Favoritos" si es comprador o vendedor (NO admin o moderador) */}
              {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
                <Link to="/products/saved">
                  <Button size="lg" variant="outline" className="bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Heart className="h-5 w-5 mr-2" />
                    Mis Favoritos
                  </Button>
                </Link>
              )}
              
              {/* Solo mostrar "Moderación" si tiene permisos de moderación */}
              {canModerateProduct() && (
                <Link to="/products/moderation">
                  <Button size="lg" variant="outline" className="bg-white/20 text-white border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Shield className="h-5 w-5 mr-2" />
                    Moderación
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Información del rol del usuario */}
            {user && (
              <div className="mt-6 flex justify-center">
                <Badge className={`${getRoleColor()} px-4 py-2 text-sm font-medium`}>
                  {getRoleDisplayName()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        {/* Filtros */}
        <Card className="mb-12 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Filtros de Búsqueda</span>
                <p className="text-sm text-gray-600 font-normal">Encuentra exactamente lo que buscas</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Filtros principales - siempre visibles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Búsqueda - más prominente */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar productos, servicios, códigos..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Tipo - filtro rápido */}
                <select 
                  value={filters.tipo} 
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <option value="">Todos los tipos</option>
                  <option value="producto">Solo Productos</option>
                  <option value="servicio">Solo Servicios</option>
                </select>
              </div>

              {/* Filtros adicionales */}
              <div className="border-t border-gray-100 pt-6 space-y-6">
                {/* Primera fila - Categoría y Precios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categoría */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Search className="h-4 w-4 mr-2 text-blue-500" />
                      Categoría
                    </label>
                    <HierarchicalCategorySearch
                      categories={categories}
                      selectedCategoryId={filters.categoria_id}
                      onCategorySelect={(categoryId) => {
                        handleFilterChange('categoria_id', categoryId);
                      }}
                      loading={false}
                      placeholder="Buscar categoría..."
                    />
                  </div>

                  {/* Precio mínimo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      Precio mínimo (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="Precio mínimo"
                      value={filters.precio_min}
                      onChange={(e) => handleFilterChange('precio_min', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* Precio máximo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      Precio máximo (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="Precio máximo"
                      value={filters.precio_max}
                      onChange={(e) => handleFilterChange('precio_max', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => {
                    setFilters({
                      search: '',
                      categoria_id: '',
                      tipo: '',
                      precio_min: '',
                      precio_max: '',
                      estado: 'activo',
                      disponibilidad: 'true',
                      page: 1,
                      limit: 12
                    });
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
                >
                  Limpiar filtros
                </Button>
                <span className="text-sm text-gray-500">
                  {pagination.total_items} producto{pagination.total_items !== 1 ? 's' : ''} encontrado{pagination.total_items !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Mostrar:</span>
                <select 
                  value={filters.limit} 
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12 por página</option>
                  <option value="24">24 por página</option>
                  <option value="48">48 por página</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Resultados de búsqueda
            </span>
          </div>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-xl rounded-2xl overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                <CardContent className="p-7 space-y-5">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded-xl"></div>
                    <div className="h-4 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded-xl w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
                <Package className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Intenta ajustar los filtros de búsqueda o explorar otras categorías para encontrar lo que buscas
              </p>
              <Button
                onClick={() => {
                  setFilters({
                    search: '',
                    categoria_id: '',
                    tipo: '',
                    precio_min: '',
                    precio_max: '',
                    estado: 'activo',
                    disponibilidad: 'true',
                    page: 1,
                    limit: 12
                  });
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3"
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {products.map((product) => (
                    <Card key={product.id} className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden flex flex-col ${
                      product.tipo === 'servicio' 
                        ? 'bg-gradient-to-br from-purple-50/90 to-blue-50/90 border-2 border-purple-200' 
                        : 'bg-white/90 border-0'
                    }`}>
                      <div className="relative overflow-hidden">
                        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
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
                            <div className="text-center text-gray-500">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Camera className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Sin Foto</p>
                              <p className="text-xs text-gray-400">
                                {product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'No disponible'}
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Badge de estado - Solo visible para moderadores, administradores y vendedor dueño */}
                        {user && (
                          user.tipo_usuario === 'moderador' || 
                          user.tipo_usuario === 'administrador' || 
                          product.vendedor_id === user.id
                        ) && (
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(product)}
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge className={`backdrop-blur-sm shadow-lg px-3 py-1.5 rounded-full font-semibold ${
                            product.tipo === 'servicio'
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
                              : 'bg-white/95 text-gray-700 border-0'
                          }`}>
                            {getTypeIcon(product.tipo)}
                            <span className="ml-2 capitalize text-sm">{product.tipo}</span>
                          </Badge>
                        </div>
                      </div>
                
                      <CardContent className="p-7 flex flex-col flex-grow">
                        <div className="space-y-5 flex-grow">
                          <div className="space-y-3">
                            <h3 className="font-bold text-gray-900 line-clamp-2 text-lg leading-snug group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                              {product.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                              {product.descripcion}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {formatPrice(product.precio)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold">
                                {product.categoria_nombre}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2.5 pt-3 border-t border-gray-100">
                            {product.ubicacion_nombre && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                </div>
                                <span className="truncate">{product.ubicacion_nombre}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="font-medium truncate flex-1 mr-2">Por: {product.vendedor_nombre}</span>
                              <span className="flex-shrink-0">{formatDate(product.fecha_publicacion)}</span>
                            </div>
                          </div>
                        </div>
                  
                        <div className="flex space-x-3 mt-7 pt-6 border-t border-gray-100">
                          <Link to={`/products/${product.id}`} className="flex-1">
                            <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-sm font-semibold">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                          </Link>
                          
                          {/* Botones de favoritos y carrito - Solo para compradores y vendedores (NO admin o moderador) */}
                          {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
                            <>
                              <Button 
                                onClick={() => 
                                  savedProducts.includes(product.id)
                                    ? handleUnsaveProduct(product.id)
                                    : handleSaveProduct(product.id)
                                }
                                disabled={savingProduct === product.id}
                                className={`w-11 h-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl ${
                                  savedProducts.includes(product.id)
                                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                                } text-white`}
                              >
                                {savingProduct === product.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Heart className={`h-4 w-4 ${savedProducts.includes(product.id) ? 'fill-current' : ''}`} />
                                )}
                              </Button>
                              <Link to={`/products/contact/${product.id}`}>
                                <Button className="w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </Link>
                            </>
                          )}
                          
                          {/* Botón de Reportar - Solo para moderadores y administradores */}
                          {(user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador') && (
                            <Button 
                              onClick={() => handleReportProduct(product)}
                              className="w-11 h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                              title="Reportar producto"
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-16">
            <Button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className="bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
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
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                      isCurrentPage 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>

      {/* Modal de Reportes */}
      {selectedProductForReport && (
        <ReportProductDialog
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedProductForReport(null);
          }}
          productId={selectedProductForReport.id}
          productName={selectedProductForReport.nombre}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
};
