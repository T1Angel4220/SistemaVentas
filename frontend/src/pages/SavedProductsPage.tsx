    import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  Heart,
  HeartOff,
  Eye,
  AlertCircle,
  MapPin,
  ArrowLeft,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import type { Product } from '../types/product.types';

export const SavedProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const location = useLocation();
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingProduct, setRemovingProduct] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const loadSavedProducts = useCallback(async () => {
    if (!user || user.tipo_usuario !== 'comprador') return;
    
    // Evitar múltiples peticiones simultáneas
    if (isLoadingProducts) {
      console.log('⏳ Ya hay una petición en curso, saltando...');
      return;
    }
    
    // Verificar que el token existe antes de hacer la petición
    const token = apiService.getToken();
    if (!token) {
      console.error('No hay token disponible');
      setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }
    
    try {
      setIsLoadingProducts(true);
      setLoading(true);
      setError(null);
      
      console.log('🔍 Haciendo petición a /products/saved con token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:3001/api/products/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Respuesta recibida:', response.status, response.statusText);
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Productos guardados cargados:', data.data.length);
        setSavedProducts(data.data);
      } else {
        console.error('❌ Error del servidor:', data.message);
        setError(data.message || 'Error al cargar productos guardados');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setError('Error al cargar productos guardados');
    } finally {
      setLoading(false);
      setIsLoadingProducts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // isLoadingProducts se omite intencionalmente para evitar bucles infinitos

  useEffect(() => {
    if (location.pathname === '/products/saved') {
      if (user && user.tipo_usuario === 'comprador') {
        loadSavedProducts();
      } else {
        setLoading(false);
        setError('Debes iniciar sesión como comprador para ver tus productos guardados');
      }
    }
  }, [user, loadSavedProducts, location.pathname]);

  const handleRemoveProduct = async (product: Product) => {
    showWarning(
      '💔 ¿Eliminar de favoritos?',
      `¿Estás seguro de que quieres eliminar "${product.nombre}" de tu lista de favoritos?`,
      async () => {
        setRemovingProduct(product.id);
        try {
          const response = await fetch(`http://localhost:3001/api/products/${product.id}/unsave`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${apiService.getToken()}`
            }
          });

          const data = await response.json();
          if (data.success) {
            showSuccess('💔 ¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
            setSavedProducts(prev => prev.filter(p => p.id !== product.id));
          } else {
            showError('Error', data.message || 'Error al eliminar el producto');
          }
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          showError('Error', 'Error al eliminar el producto');
        } finally {
          setRemovingProduct(null);
        }
      },
      undefined
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (product: Product) => {
    if (product.es_peligroso) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Peligroso
        </span>
      );
    }
    
    if (!product.disponibilidad) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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

  if (!user || user.tipo_usuario !== 'comprador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {!user ? 'Inicia sesión' : 'Acceso restringido'}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {!user 
                ? 'Debes iniciar sesión como comprador para ver tus productos guardados'
                : 'Solo los compradores pueden acceder a esta sección'
              }
            </p>
            <Link to={!user ? "/login" : "/products"}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3">
                {!user ? 'Iniciar sesión' : 'Volver a productos'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Heart className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cargando favoritos...</h2>
          <p className="text-gray-600 text-lg">Obteniendo tus productos guardados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con gradiente azul-púrpura - RESPONSIVE MEJORADO */}
      <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Layout responsive: columna en móvil, fila en desktop */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Sección izquierda: Botón Volver + Título */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
              {/* Botón Volver - RESPONSIVE */}
              <Link to="/products" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Regresar</span>
                </Button>
              </Link>
              
              {/* Título y descripción - RESPONSIVE */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
                  Mis Favoritos
                </h1>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                  Productos y servicios que te interesan
                </p>
              </div>
            </div>
            
            {/* Contador de productos guardados - RESPONSIVE */}
            <div className="flex items-center justify-center sm:justify-end">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 text-center border border-white/30 shadow-lg">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{savedProducts.length}</div>
                <div className="text-blue-100 text-xs sm:text-sm">productos guardados</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {error ? (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl mb-6 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        ) : savedProducts.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No tienes productos guardados</h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto">
                Explora el catálogo de productos y guarda los que te interesen con el botón ❤️
              </p>
              <Link to="/products">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 sm:px-8 py-3 text-sm sm:text-base">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explorar productos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid de productos guardados - RESPONSIVE MEJORADO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {savedProducts.map((product) => (
                <Card key={product.id} className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group">
                  <div className="relative">
                    {/* Imagen del producto */}
                    <div className={`h-48 sm:h-56 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 ${
                      product.primera_imagen 
                        ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300'
                    }`}>
                      {product.primera_imagen ? (
                        <img
                          src={product.primera_imagen}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-xs sm:text-sm font-medium text-gray-400">Sin imagen</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Indicador de múltiples imágenes */}
                    {product.total_imagenes > 1 && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
                          +{product.total_imagenes - 1} más
                        </div>
                      </div>
                    )}

                    {/* Estado del producto - Badge mejorado */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200">
                        {getStatusBadge(product)}
                      </div>
                    </div>

                    {/* Botón de eliminar - Corazón tachado (visible en hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        className="w-10 h-10 sm:w-11 sm:h-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                        onClick={() => handleRemoveProduct(product)}
                        disabled={removingProduct === product.id}
                        title="Eliminar de favoritos"
                      >
                        {removingProduct === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <HeartOff className="h-4 w-4 sm:h-5 sm:w-5 hover:scale-110 transition-transform duration-200" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Contenido del producto - MEJORADO */}
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Título y categoría */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-2 mb-1">
                          {product.nombre}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {product.categoria_nombre}
                        </p>
                      </div>
                      
                      {/* Información unificada: Ubicación y Fecha */}
                      <div className="space-y-2">
                        {/* Ubicación */}
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          </div>
                          <span className="truncate font-medium">{product.ubicacion_nombre}</span>
                        </div>
                        
                        {/* Fecha guardado */}
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                          </div>
                          <span className="font-medium">{formatDate(product.fecha_publicacion)}</span>
                        </div>
                      </div>

                      {/* Precio y tipo */}
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatPrice(product.precio)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 capitalize bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                          {product.tipo === 'servicio' ? '🔧 Servicio' : '📦 Producto'}
                        </span>
                      </div>

                      {/* Botones de acción - UNIFORMES CON CONSISTENCIA CROMÁTICA */}
                      <div className="flex space-x-2 sm:space-x-3 pt-2">
                        <Link to={`/products/${product.id}`} className="flex-1">
                          <Button className="w-full h-10 sm:h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            <span>Ver detalles</span>
                          </Button>
                        </Link>
                        
                        {/* Botón secundario con corazón tachado - Eliminar de favoritos */}
                        <Button
                          onClick={() => handleRemoveProduct(product)}
                          disabled={removingProduct === product.id}
                          className="h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0"
                          title="Eliminar de favoritos"
                        >
                          {removingProduct === product.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                          ) : (
                            <HeartOff className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Información adicional - RESPONSIVE MEJORADA */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-current" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base flex items-center">
                    ℹ️ ¿Cómo funciona?
                  </h3>
                  <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                    Los productos que guardes con el botón <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold">❤️</span> aparecerán aquí. 
                    Puedes verlos en cualquier momento y contactar al vendedor cuando estés listo para comprar.
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">
                      💡 <strong>Tip:</strong> Para eliminar un producto de favoritos, haz clic en el corazón tachado 💔
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
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
