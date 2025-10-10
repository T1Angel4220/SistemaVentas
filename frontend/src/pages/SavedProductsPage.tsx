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
  Eye,
  AlertCircle,
  MapPin,
  Trash2,
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
  }, [user]); // Removemos isLoadingProducts de las dependencias

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
      '¿Eliminar de favoritos?',
      `¿Estás seguro de que quieres eliminar "${product.nombre}" de tus favoritos?`,
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
            showSuccess('¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
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
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3">
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
      {/* Header con gradiente azul-púrpura */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Botón de regresar */}
              <Link to="/products">
                <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Regresar
                </Button>
              </Link>
              
              <div>
                <h1 className="text-4xl font-bold mb-2">Mis Favoritos</h1>
                <p className="text-blue-100 text-lg">
                  Productos y servicios que te interesan
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{savedProducts.length}</div>
                <div className="text-blue-100 text-sm">productos guardados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {error ? (
          <Alert className="border-red-200 bg-red-50 rounded-lg mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        ) : savedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No tienes productos guardados</h2>
            <p className="text-gray-600 text-lg mb-8">
              Explora el catálogo de productos y guarda los que te interesen
            </p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Explorar productos
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Grid de productos guardados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedProducts.map((product) => (
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

                      {/* Estado del producto */}
                      <div className="absolute bottom-2 left-2">
                        {getStatusBadge(product)}
                      </div>

                      {/* Botón de eliminar */}
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 rounded-full bg-red-500 text-white border-red-500 hover:bg-red-600"
                          onClick={() => handleRemoveProduct(product)}
                          disabled={removingProduct === product.id}
                        >
                          {removingProduct === product.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
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
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{product.ubicacion_nombre}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Guardado: {formatDate(product.fecha_publicacion)}</span>
                        </div>
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
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleRemoveProduct(product)}
                          disabled={removingProduct === product.id}
                        >
                          {removingProduct === product.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h3>
                  <p className="text-blue-800 text-sm">
                    Los productos que guardes aquí aparecerán en tu lista de favoritos. 
                    Puedes verlos en cualquier momento y contactar al vendedor cuando estés listo para comprar.
                  </p>
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
