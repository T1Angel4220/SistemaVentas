import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiData } from '../hooks/useApiData';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert, AlertDescription } from '../components/ui/Alert';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Heart,
  Eye,
  AlertCircle
} from 'lucide-react';
import type { Product } from '../types/product.types';

export const ProductsCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const { data: categories } = useApiData('categories');
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    precioMin: '',
    precioMax: '',
    ubicacion: '',
    page: 1,
    limit: 12,
    // Filtros de proximidad
    user_lat: '',
    user_lng: '',
    radio_km: '50' // Default 50km
  });

  // Estado para filtro de proximidad
  const [proximityEnabled, setProximityEnabled] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Estado para productos guardados
  const [savedProducts, setSavedProducts] = useState<number[]>([]);
  const [savingProduct, setSavingProduct] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value.toString());
        }
      });

      // Solo productos activos para compradores
      queryParams.append('estado', 'activo');
      queryParams.append('disponibilidad', 'true');

      const response = await fetch(`http://localhost:3001/api/products?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Error al cargar productos');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSavedProducts = useCallback(async () => {
    if (!user) return;
    
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    // Solo cargar productos guardados si NO estamos en /products/saved
    if (user && location.pathname !== '/products/saved') {
      loadSavedProducts();
    }
  }, [user, loadSavedProducts, location.pathname]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleEnableProximity = () => {
    if ('geolocation' in navigator) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          
          setFilters(prev => ({
            ...prev,
            user_lat: lat,
            user_lng: lng,
            page: 1
          }));
          setProximityEnabled(true);
          setGettingLocation(false);
          showSuccess('📍 Ubicación obtenida', 'Mostrando productos cerca de ti');
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setGettingLocation(false);
          showError('Error', 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        }
      );
    } else {
      showError('Error', 'Tu navegador no soporta geolocalización');
    }
  };

  const handleDisableProximity = () => {
    setFilters(prev => ({
      ...prev,
      user_lat: '',
      user_lng: '',
      page: 1
    }));
    setProximityEnabled(false);
    showSuccess('Filtro desactivado', 'Mostrando todos los productos');
  };

  const handleRadiusChange = (newRadius: string) => {
    setFilters(prev => ({
      ...prev,
      radio_km: newRadius,
      page: 1
    }));
  };

  const handleSaveProduct = async (productId: number) => {
    if (!user) {
      showError('Error', 'Debes iniciar sesión para guardar productos');
      return;
    }

    // Solo compradores y vendedores pueden guardar productos
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getStatusBadge = (product: Product) => {
    if (product.es_peligroso) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Peligroso
        </span>
      );
    }
    
    if (!product.disponibilidad) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Package className="h-3 w-3 mr-1" />
          Sin Stock
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Package className="h-3 w-3 mr-1" />
        Disponible
      </span>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Package className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cargando productos...</h2>
          <p className="text-gray-600 text-lg">Obteniendo catálogo de productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con gradiente azul-púrpura */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Catálogo de Productos</h1>
              <p className="text-blue-100 text-lg">
                Descubre productos y servicios disponibles en la plataforma
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Solo compradores y vendedores pueden ver favoritos */}
              {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
                <Link to="/products/saved">
                  <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Heart className="h-5 w-5 mr-2" />
                    Mis Favoritos
                  </Button>
                </Link>
              )}
              
              {/* Botón de login para usuarios no autenticados */}
              {!user && (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nombre, descripción..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <HierarchicalCategorySearch
                categories={(categories as Array<{id: number; nombre: string; categoria_padre_id?: number; nivel: number; orden: number}>) || []}
                selectedCategoryId={filters.categoria}
                onCategorySelect={(categoryId: string) => handleFilterChange('categoria', categoryId)}
                placeholder="Seleccionar categoría..."
              />
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio mínimo ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.precioMin}
                onChange={(e) => handleFilterChange('precioMin', e.target.value)}
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio máximo ($)
              </label>
              <Input
                type="number"
                placeholder="1000.00"
                value={filters.precioMax}
                onChange={(e) => handleFilterChange('precioMax', e.target.value)}
              />
            </div>
          </div>

          {/* Filtro de Proximidad */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Productos cercanos a mi ubicación</h3>
            </div>
            
            {!proximityEnabled ? (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleEnableProximity}
                  disabled={gettingLocation}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {gettingLocation ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Mostrar productos cercanos
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600">
                  Usa tu ubicación actual para ver productos cerca de ti
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Filtro de proximidad activo</p>
                      <p className="text-xs text-green-700">Mostrando productos dentro de {filters.radio_km} km</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDisableProximity}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Desactivar
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Radio de búsqueda:
                  </label>
                  <select
                    value={filters.radio_km}
                    onChange={(e) => handleRadiusChange(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                    <option value="200">200 km</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => {
                setFilters({
                  search: '',
                  categoria: '',
                  precioMin: '',
                  precioMax: '',
                  ubicacion: '',
                  page: 1,
                  limit: 12,
                  user_lat: '',
                  user_lng: '',
                  radio_km: '50'
                });
                setProximityEnabled(false);
              }}
              variant="outline"
              className="mr-3"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {pagination.total} productos encontrados
            </h2>
          </div>
        </div>

        {/* Grid de productos */}
        {error ? (
          <Alert className="border-red-200 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-0">
                  {/* Imagen del producto */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    {product.primera_imagen ? (
                      <img
                        src={product.primera_imagen}
                        alt={product.nombre}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Indicador de múltiples imágenes */}
                    {product.total_imagenes > 1 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{product.total_imagenes - 1}
                        </span>
                      </div>
                    )}

                    {/* Botón de favorito - Solo para compradores y vendedores */}
                    {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
                      <div className="absolute top-2 left-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 w-8 p-0 rounded-full ${
                            savedProducts.includes(product.id)
                              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                              : 'bg-white/90 text-gray-600 border-white/90 hover:bg-white'
                          }`}
                          onClick={() => 
                            savedProducts.includes(product.id)
                              ? handleUnsaveProduct(product.id)
                              : handleSaveProduct(product.id)
                          }
                          disabled={savingProduct === product.id}
                        >
                          <Heart className={`h-4 w-4 ${savedProducts.includes(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    )}

                    {/* Estado del producto */}
                    <div className="absolute bottom-2 left-2">
                      {getStatusBadge(product)}
                    </div>
                  </div>

                  {/* Contenido del producto */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {product.categoria_nombre}
                      </p>
                      {(product.ubicacion_provincia || product.ubicacion_canton) && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {product.ubicacion_provincia && product.ubicacion_canton 
                              ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                              : product.ubicacion_provincia || product.ubicacion_canton}
                          </span>
                        </div>
                      )}
                      {/* Mostrar distancia si el filtro de proximidad está activo */}
                      {proximityEnabled && product.distancia !== undefined && product.distancia !== null && (
                        <div className="flex items-center text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-1 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>A {product.distancia.toFixed(1)} km de ti</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.precio)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link 
                        to={`/products/view/${product.id}`}
                        className="flex-1"
                      >
                        <Button 
                          size="sm" 
                          className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver detalles
                        </Button>
                      </Link>
                      
                      {/* Botón de favorito - Solo para compradores y vendedores */}
                      {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => 
                            savedProducts.includes(product.id)
                              ? handleUnsaveProduct(product.id)
                              : handleSaveProduct(product.id)
                          }
                          disabled={savingProduct === product.id}
                        >
                          {savingProduct === product.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                          ) : (
                            <Heart className={`h-3 w-3 ${savedProducts.includes(product.id) ? 'fill-current text-red-500' : ''}`} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
