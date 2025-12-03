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
  X
} from 'lucide-react';
import type { Product, ProductsResponse, ProductFilters } from '../types/product.types';
import type { Category } from '../types/category.types';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import HierarchicalLocationSearch from '../components/ui/HierarchicalLocationSearch';
import type { Location } from '../components/ui/HierarchicalLocationSearch';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { canModerateProduct, getRoleDisplayName, getRoleColor } = usePermissions();
  const { showSuccess, showError } = useAlert();
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

  // Filtros optimizados para muchos datos
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoria_id: '',
    tipo: '',
    precio_min: '',
    precio_max: '',
    estado: 'activo', // Por defecto solo activos
    disponibilidad: 'true', // Por defecto solo disponibles
    provincia: '',
    canton: '',
    distrito: '',
    direccion: '',
    page: 1,
    limit: 12
  });

  // Filtros de proximidad
  const [proximityFilters, setProximityFilters] = useState({
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
  
  // Estado para mostrar/ocultar filtros de ubicación
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Agregar filtros normales
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      // Agregar filtros de proximidad si están habilitados
      if (proximityEnabled && proximityFilters.user_lat && proximityFilters.user_lng) {
        queryParams.append('user_lat', proximityFilters.user_lat);
        queryParams.append('user_lng', proximityFilters.user_lng);
        queryParams.append('radio_km', proximityFilters.radio_km);
        
        console.log('🌍 Cargando productos con filtro de proximidad:');
        console.log('   → Latitud usuario:', proximityFilters.user_lat);
        console.log('   → Longitud usuario:', proximityFilters.user_lng);
        console.log('   → Radio de búsqueda:', proximityFilters.radio_km, 'km');
      } else {
        console.log('📦 Cargando productos sin filtro de proximidad');
      }

      const response = await fetch(`http://localhost:3001/api/products?${queryParams}`);
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
        
        // Log cuando se usa filtro de proximidad
        if (proximityEnabled) {
          const productosConDistancia = data.data.filter(p => p.distancia !== undefined && p.distancia !== null);
          console.log('✅ Productos recibidos con filtro de proximidad:');
          console.log('   → Total de productos:', data.data.length);
          console.log('   → Productos con distancia calculada:', productosConDistancia.length);
          if (productosConDistancia.length > 0) {
            console.log('   → Producto más cercano:', {
              nombre: productosConDistancia[0].nombre,
              distancia: productosConDistancia[0].distancia?.toFixed(2) + ' km'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, proximityEnabled, proximityFilters]);

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

  const loadLocations = async () => {
    try {
      // Pedir todas las ubicaciones (sin paginación)
      const response = await fetch('http://localhost:3001/api/locations?limit=1000');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
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
    // Solo cargar ubicaciones si no están cargadas
    if (locations.length === 0) {
      loadLocations();
    }
  }, [loadProducts, categories.length, locations.length]);

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Función para validar que solo se ingresen números (con punto decimal opcional)
  const handlePriceChange = (key: 'precio_min' | 'precio_max', value: string) => {
    // Permitir solo números, punto decimal y cadena vacía
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    handleFilterChange(key, formattedValue);
  };

  // Prevenir que se ingresen caracteres no numéricos
  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter, y teclas de dirección
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Asegurar que es un número y evitar el punto decimal duplicado
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
      e.preventDefault();
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleEnableProximity = () => {
    if ('geolocation' in navigator) {
      setGettingLocation(true);
      console.log('📍 Solicitando ubicación del usuario...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          const accuracy = position.coords.accuracy;
          
          console.log('✅ Ubicación obtenida exitosamente:');
          console.log('   → Latitud:', lat);
          console.log('   → Longitud:', lng);
          console.log('   → Precisión:', accuracy, 'metros');
          console.log('   → Radio de búsqueda: 50 km (por defecto)');
          console.log('   → Coordenadas completas:', position.coords);
          
          setProximityFilters({
            user_lat: lat,
            user_lng: lng,
            radio_km: '50'
          });
          setProximityEnabled(true);
          setGettingLocation(false);
          showSuccess('📍 Ubicación obtenida', 'Mostrando productos cerca de ti');
        },
        (error) => {
          console.error('❌ Error obteniendo ubicación:', error);
          console.error('   → Código de error:', error.code);
          console.error('   → Mensaje:', error.message);
          setGettingLocation(false);
          showError('Error', 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        }
      );
    } else {
      console.error('❌ Tu navegador no soporta geolocalización');
      showError('Error', 'Tu navegador no soporta geolocalización');
    }
  };

  const handleDisableProximity = () => {
    setProximityFilters({
      user_lat: '',
      user_lng: '',
      radio_km: '50'
    });
    setProximityEnabled(false);
    showSuccess('Filtro desactivado', 'Mostrando todos los productos');
  };

  const handleRadiusChange = (newRadius: string) => {
    console.log('📏 Radio de búsqueda actualizado:', newRadius, 'km');
    console.log('   → Ubicación actual:', {
      lat: proximityFilters.user_lat,
      lng: proximityFilters.user_lng,
      nuevo_radio: newRadius
    });
    
    setProximityFilters(prev => ({
      ...prev,
      radio_km: newRadius
    }));
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
        <Card className="mb-12 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-visible">
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
          <CardContent className="p-8 overflow-visible">
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
              <div className="border-t border-gray-100 pt-6 space-y-6" style={{ overflow: 'visible' }}>
                {/* Primera fila - Categoría y Precios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ overflow: 'visible' }}>
                  {/* Categoría - Contenedor mejorado */}
                  <div className="space-y-2 relative" style={{ zIndex: 50, overflow: 'visible', position: 'relative' }}>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Search className="h-4 w-4 mr-2 text-blue-500" />
                      Categoría
                    </label>
                    <div className="relative w-full" style={{ overflow: 'visible', position: 'relative' }}>
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
                  </div>

                  {/* Precio mínimo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      Precio mínimo (USD)
                    </label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Precio mínimo"
                      value={filters.precio_min}
                      onChange={(e) => handlePriceChange('precio_min', e.target.value)}
                      onKeyDown={handlePriceKeyDown}
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
                      type="text"
                      inputMode="decimal"
                      placeholder="Precio máximo"
                      value={filters.precio_max}
                      onChange={(e) => handlePriceChange('precio_max', e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Segunda fila - Botones de Ubicación - RESPONSIVE */}
                <div className="space-y-4">
                  {/* Fila de botones - RESPONSIVE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Botón para mostrar/ocultar filtros de ubicación manual */}
                    <Button
                      onClick={() => setShowLocationFilter(!showLocationFilter)}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl flex items-center justify-center space-x-2 h-12 sm:h-11 transition-all duration-200"
                    >
                      <MapPin className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        {showLocationFilter ? 'Ocultar filtros de ubicación' : 'Filtrar por ubicación'}
                      </span>
                    </Button>

                    {/* Botón de Proximidad */}
                    <Button
                      onClick={proximityEnabled ? handleDisableProximity : handleEnableProximity}
                      disabled={gettingLocation}
                      variant="outline"
                      className={`w-full rounded-xl flex items-center justify-center space-x-2 h-12 sm:h-11 transition-all duration-200 ${
                        proximityEnabled 
                          ? 'border-red-300 text-red-700 hover:bg-red-50' 
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {gettingLocation ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-green-700 border-t-transparent rounded-full flex-shrink-0"></div>
                          <span className="text-sm sm:text-base">Obteniendo ubicación...</span>
                        </>
                      ) : proximityEnabled ? (
                        <>
                          <X className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm sm:text-base">
                            <span className="hidden sm:inline">Desactivar proximidad </span>
                            <span className="sm:hidden">Desactivar </span>
                            ({proximityFilters.radio_km} km)
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm sm:text-base">
                            <span className="hidden sm:inline">Filtrar por mi ubicación actual</span>
                            <span className="sm:hidden">Mi ubicación</span>
                          </span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Panel de configuración de proximidad cuando está activo - RESPONSIVE */}
                  {proximityEnabled && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-green-900">Filtro de proximidad activo</p>
                            <p className="text-xs sm:text-sm text-green-700">Mostrando productos dentro de {proximityFilters.radio_km} km</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <label className="text-sm font-medium text-green-900 whitespace-nowrap">
                            Radio:
                          </label>
                          <select
                            value={proximityFilters.radio_km}
                            onChange={(e) => handleRadiusChange(e.target.value)}
                            className="h-9 sm:h-10 w-full sm:w-auto px-3 rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white text-sm"
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
                    </div>
                  )}

                  {/* Filtros de ubicación manual - Solo visible cuando showLocationFilter es true - RESPONSIVE */}
                  {showLocationFilter && (
                    <div className="bg-purple-50/50 border-2 border-purple-200 rounded-xl p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                        <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Filtrar por Provincia/Cantón</h3>
                      </div>
                      <HierarchicalLocationSearch
                        locations={locations}
                        onLocationSelect={(locationData) => {
                          setFilters(prev => ({
                            ...prev,
                            provincia: locationData.provincia,
                            canton: locationData.canton,
                            distrito: locationData.distrito,
                            direccion: locationData.direccion,
                            page: 1
                          }));
                        }}
                        loading={locations.length === 0}
                        initialProvincia={filters.provincia}
                        initialCanton={filters.canton}
                        initialDistrito={filters.distrito}
                        initialDireccion={filters.direccion}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botones de acción - RESPONSIVE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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
                      provincia: '',
                      canton: '',
                      distrito: '',
                      direccion: '',
                      page: 1,
                      limit: 12
                    });
                    // Limpiar filtros de proximidad
                    setProximityFilters({
                      user_lat: '',
                      user_lng: '',
                      radio_km: '50'
                    });
                    setProximityEnabled(false);
                    setShowLocationFilter(false);
                  }}
                  variant="outline"
                  className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md h-10 sm:h-9 text-sm sm:text-base"
                >
                  <X className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">🧹 Limpiar todos los filtros</span>
                  <span className="sm:hidden">🧹 Limpiar filtros</span>
                </Button>
                <span className="text-sm text-gray-500 text-center sm:text-left">
                  {pagination.total_items} producto{pagination.total_items !== 1 ? 's' : ''} encontrado{pagination.total_items !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Mostrar:</span>
                <select 
                  value={filters.limit} 
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="h-9 sm:h-8 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
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
                    provincia: '',
                    canton: '',
                    distrito: '',
                    direccion: '',
                    page: 1,
                    limit: 12
                  });
                  // Limpiar filtros de proximidad
                  setProximityFilters({
                    user_lat: '',
                    user_lng: '',
                    radio_km: '50'
                  });
                  setProximityEnabled(false);
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3 font-semibold"
              >
                <X className="h-5 w-5 mr-2" />
                🧹 Limpiar todos los filtros
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
                            {(product.ubicacion_provincia || product.ubicacion_canton) && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                </div>
                                <span className="truncate">
                                  {product.ubicacion_provincia && product.ubicacion_canton 
                                    ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                                    : product.ubicacion_provincia || product.ubicacion_canton}
                                </span>
                              </div>
                            )}
                            {/* Mostrar distancia si el filtro de proximidad está activo */}
                            {proximityEnabled && product.distancia !== undefined && product.distancia !== null && (
                              <div className="flex items-center space-x-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>A {product.distancia.toFixed(1)} km de ti</span>
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
                          {/* NO mostrar si el producto es del usuario actual */}
                          {(user?.tipo_usuario === 'comprador' || (user?.tipo_usuario === 'vendedor' && user.id !== product.vendedor_id)) && (
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
                              {/* Solo mostrar botón de contactar si el usuario no es el vendedor del producto */}
                              {user?.id !== product.vendedor_id && (
                                <Link to={`/products/contact/${product.id}`}>
                                  <Button className="w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </>
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
    </div>
  );
};
