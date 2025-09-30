import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  ShoppingCart
} from 'lucide-react';

interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'producto' | 'servicio';
  estado: string;
  disponibilidad: boolean;
  fecha_publicacion: string;
  categoria_nombre: string;
  vendedor_nombre: string;
  ubicacion_nombre?: string;
  total_imagenes: number;
}

interface Category {
  id: number;
  nombre: string;
}

interface Location {
  id: number;
  nombre: string;
  provincia: string;
  canton: string;
  distrito: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_prev: false
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    categoria_id: '',
    tipo: '',
    precio_min: '',
    precio_max: '',
    ubicacion_id: '',
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

  // Cargar datos iniciales
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadLocations();
  }, [loadProducts]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
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
            
            {user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador') && (
              <div className="mt-8">
                <Link to="/products/create">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-5 w-5 mr-2" />
                    Crear Producto
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        {/* Filtros */}
        <Card className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Categoría */}
              <select 
                value={filters.categoria_id} 
                onChange={(e) => handleFilterChange('categoria_id', e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.nombre}
                  </option>
                ))}
              </select>

              {/* Tipo */}
              <select 
                value={filters.tipo} 
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Todos los tipos</option>
                <option value="producto">Productos</option>
                <option value="servicio">Servicios</option>
              </select>

              {/* Ubicación */}
              <select 
                value={filters.ubicacion_id} 
                onChange={(e) => handleFilterChange('ubicacion_id', e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id.toString()}>
                    {location.nombre}
                  </option>
                ))}
              </select>

              {/* Precio mínimo */}
              <Input
                type="number"
                placeholder="Precio mínimo"
                value={filters.precio_min}
                onChange={(e) => handleFilterChange('precio_min', e.target.value)}
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm px-4"
              />

              {/* Precio máximo */}
              <Input
                type="number"
                placeholder="Precio máximo"
                value={filters.precio_max}
                onChange={(e) => handleFilterChange('precio_max', e.target.value)}
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm px-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">
                Mostrando <span className="text-blue-600 font-bold">{products.length}</span> de <span className="text-blue-600 font-bold">{pagination.total_items}</span> productos
              </p>
            </div>
            {products.length > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 rounded-full shadow-lg">
                {products.length} encontrados
              </Badge>
            )}
          </div>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-xl rounded-2xl overflow-hidden">
                <div className="h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
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
                onClick={() => setFilters({ search: '', categoria_id: '', tipo: '', precio_min: '', precio_max: '', ubicacion_id: '', page: 1, limit: 12 })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3"
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                      <div className="relative overflow-hidden">
                        <div className="h-56 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative">
                          {product.total_imagenes > 0 ? (
                            <div className="text-center">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Package className="h-10 w-10 text-blue-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                                {product.total_imagenes} imagen{product.total_imagenes !== 1 ? 'es' : ''}
                              </p>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                              <Package className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(product.estado, product.disponibilidad)}
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/95 backdrop-blur-sm border-0 shadow-lg px-3 py-1 rounded-full">
                            {getTypeIcon(product.tipo)}
                            <span className="ml-2 capitalize font-medium text-gray-700">{product.tipo}</span>
                          </Badge>
                        </div>
                      </div>
                
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-xl group-hover:text-blue-600 transition-colors">
                            {product.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {product.descripcion}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatPrice(product.precio)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {product.categoria_nombre}
                            </span>
                          </div>
                          {product.ubicacion_nombre && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-3 w-3 text-blue-500" />
                              </div>
                              <span>{product.ubicacion_nombre}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <span className="font-medium">Por: {product.vendedor_nombre}</span>
                            <span>{formatDate(product.fecha_publicacion)}</span>
                          </div>
                        </div>
                  
                        <div className="flex space-x-3 mt-6">
                          <Link to={`/products/${product.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                          </Link>
                          <Button className="w-12 h-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button className="w-12 h-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};
