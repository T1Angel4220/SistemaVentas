import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  MapPin, 
  ArrowLeft,
  Clock,
  Calendar,
  Timer,
  Tag,
  FileText,
  Heart,
  MessageCircle,
  Flag,
  User
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // Estado para productos guardados
  const [isSaved, setIsSaved] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsZoomed(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const popupX = rect.right + 20;
    const popupY = rect.top;
    setPopupPosition({ x: popupX, y: popupY });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        
        // Verificar si el producto está guardado
        if (user) {
          checkIfSaved(data.data.id);
        }
      } else {
        setError(data.message || 'Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const checkIfSaved = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/saved-status`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error al verificar si está guardado:', error);
    }
  };

  useEffect(() => {
    // Forzar scroll al inicio INMEDIATAMENTE cuando se monta el componente
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);
  
  // Asegurar que siempre esté arriba después de cargar
  useEffect(() => {
    if (!loading && product) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [loading, product]);

  const handleSaveProduct = async () => {
    if (!user) {
      showError('Error', 'Debes iniciar sesión para guardar productos');
      return;
    }

    // Solo compradores y vendedores pueden guardar productos
    if (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor') {
      showError('Error', 'Solo los compradores y vendedores pueden guardar productos');
      return;
    }

    setSavingProduct(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${product?.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('¡Producto guardado!', 'El producto se ha añadido a tu lista de favoritos.');
        setIsSaved(true);
      } else {
        showError('Error', data.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showError('Error', 'Error al guardar el producto');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUnsaveProduct = async () => {
    if (!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) return;

    setSavingProduct(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${product?.id}/unsave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('¡Producto eliminado!', 'El producto se ha eliminado de tu lista de favoritos.');
        setIsSaved(false);
      } else {
        showError('Error', data.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showError('Error', 'Error al eliminar el producto');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleReportProduct = () => {
    if (!user) {
      showError('Error', 'Debes iniciar sesión para reportar productos');
      return;
    }

    showWarning(
      '¿Reportar producto?',
      `¿Estás seguro de que quieres reportar "${product?.nombre}"? Por favor, selecciona un motivo.`,
      () => {
        // Aquí se abriría un modal para seleccionar el motivo del reporte
        navigate(`/products/report/${product?.id}`);
      },
      undefined
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Package className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cargando producto...</h2>
          <p className="text-gray-600 text-lg">Obteniendo información detallada</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 text-lg mb-8">{error || 'Producto no encontrado'}</p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Button>
            </Link>
          </CardContent>
        </Card>
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
          <div className="flex items-center space-x-8">
            {/* Botón de regresar */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/products')}
              className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Regresar
            </Button>
            
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-base text-blue-100">
              <Link to="/products" className="hover:text-white transition-colors">Productos</Link>
              <span>/</span>
              <span className="text-white">{product.categoria_nombre}</span>
              <span>/</span>
              <span className="text-white font-medium">{product.nombre}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Layout principal estilo Amazon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna izquierda - Imágenes y descripción */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {product.imagenes.length > 0 ? (
                <div className="relative group">
                  <div 
                    className="relative overflow-hidden cursor-zoom-in"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      src={product.imagenes[currentImageIndex]?.url_imagen}
                      alt={product.nombre}
                      className="w-full h-[500px] object-contain bg-white"
                    />
                    
                    {/* Overlay de zoom */}
                    {isZoomed && (
                      <div className="absolute inset-0 bg-black/10 pointer-events-none">
                        <div 
                          className="absolute w-20 h-20 border-2 border-blue-500 bg-blue-500/20 rounded-full pointer-events-none"
                          style={{
                            left: `${mousePosition.x}%`,
                            top: `${mousePosition.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Contador de imágenes */}
                  {product.imagenes.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/70 rounded px-2 py-1 text-white text-xs">
                        {currentImageIndex + 1} de {product.imagenes.length}
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de zoom */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/90 rounded px-2 py-1 text-xs text-gray-600 shadow-sm">
                      Mover mouse para zoom
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Sin imágenes disponibles</h3>
                  </div>
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {product.imagenes.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.imagenes.map((imagen, index) => (
                  <button
                    key={imagen.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={imagen.url_imagen}
                      alt={`${product.nombre} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Información específica de servicios - Solo para servicios */}
            {product.tipo === 'servicio' && product.servicio && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-600" />
                  Detalles del servicio
                </h3>
                <div className="space-y-3 text-sm">
                  {product.servicio.horario_atencion && (
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-600 block">Horario de atención:</span>
                        <span className="text-gray-900 font-medium">{product.servicio.horario_atencion}</span>
                      </div>
                    </div>
                  )}
                  {product.servicio.dias_disponibles && (
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-600 block">Días disponibles:</span>
                        <span className="text-gray-900 font-medium">{product.servicio.dias_disponibles}</span>
                      </div>
                    </div>
                  )}
                  {product.servicio.duracion_estimada && (
                    <div className="flex items-start space-x-2">
                      <Timer className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-600 block">Duración estimada:</span>
                        <span className="text-gray-900 font-medium">{product.servicio.duracion_estimada}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Columna derecha - Información del producto */}
          <div className="space-y-6">
            {/* Título del producto */}
            <div>
              <h1 className="text-2xl font-medium text-gray-900 leading-tight mb-2">
                {product.nombre}
              </h1>
              <div className="text-sm text-gray-500 mb-4">
                Código: {product.codigo}
              </div>
              
              {/* Precio */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.precio ? Number(product.precio).toFixed(2) : '0.00'}
                </span>
              </div>
              
              {/* Estado */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Package className="h-4 w-4 mr-2" />
                  Disponible
                </span>
              </div>
            </div>

            {/* Acciones para compradores y vendedores */}
            {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Acciones disponibles</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={isSaved ? handleUnsaveProduct : handleSaveProduct}
                    disabled={savingProduct}
                    className={`w-full h-12 ${
                      isSaved 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-medium`}
                  >
                    {savingProduct ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isSaved ? 'Eliminando...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? 'Eliminar de favoritos' : 'Me interesa'}
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={handleReportProduct}
                    className="w-full h-10 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar producto
                  </Button>
                </div>
              </div>
            )}

            {/* Mensaje para visualizadores */}
            {(!user || (user.tipo_usuario !== 'comprador' && user.tipo_usuario !== 'vendedor')) && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium text-blue-900 mb-3">¿Te interesa este producto?</h3>
                <p className="text-blue-800 text-sm mb-3">
                  {!user 
                    ? 'Inicia sesión para guardar productos en tus favoritos y contactar al vendedor.'
                    : 'Regístrate como comprador o vendedor para guardar productos en tus favoritos y contactar al vendedor.'
                  }
                </p>
                <Link to={!user ? "/login" : "/register"}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {!user ? 'Iniciar Sesión' : 'Registrarse'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Información del vendedor */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Información del vendedor
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {product.vendedor_nombre?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.vendedor_nombre}</div>
                    <div className="text-sm text-gray-600">{product.vendedor_email}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/products/contact/${product.id}`)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md text-sm font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar vendedor
                </Button>
              </div>
            </div>

            {/* Ubicación */}
            {(product.ubicacion_provincia || product.ubicacion_canton || product.ubicacion_distrito || product.ubicacion_direccion) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  📍 Ubicación del producto
                </h3>
                <div className="space-y-2">
                  {product.ubicacion_provincia && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-20 font-medium">Provincia:</span>
                      <span className="text-gray-900 font-semibold">{product.ubicacion_provincia}</span>
                    </div>
                  )}
                  {product.ubicacion_canton && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-20 font-medium">Cantón:</span>
                      <span className="text-gray-900 font-semibold">{product.ubicacion_canton}</span>
                    </div>
                  )}
                  {product.ubicacion_distrito && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-20 font-medium">Distrito:</span>
                      <span className="text-gray-900">{product.ubicacion_distrito}</span>
                    </div>
                  )}
                  {product.ubicacion_direccion && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-20 font-medium">Dirección:</span>
                      <span className="text-gray-900">{product.ubicacion_direccion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-green-600" />
                Información del {product.tipo === 'servicio' ? 'servicio' : 'producto'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="text-gray-900 font-medium">{product.categoria_nombre}</span>
                </div>
                {product.categoria_descripcion && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Descripción de la categoría:</span>
                        <span className="text-gray-700 text-xs">{product.categoria_descripcion}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Publicado:</span>
                  <span className="text-gray-900">{formatDate(product.fecha_publicacion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-gray-900 font-medium">{product.tipo === 'servicio' ? 'Servicio' : 'Producto'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Popup de zoom - aparece como overlay estático */}
        {isZoomed && product.imagenes.length > 0 && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${popupPosition.x}px`,
              top: `${Math.max(10, popupPosition.y)}px`,
            }}
          >
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xl">
              <div className="w-[700px] h-[600px] overflow-hidden relative">
                <img
                  src={product.imagenes[currentImageIndex]?.url_imagen}
                  alt={`${product.nombre} - Vista ampliada`}
                  className="absolute object-contain bg-white"
                  style={{
                    width: '200%',
                    height: '200%',
                    left: `${25 - mousePosition.x}%`,
                    top: `${25 - mousePosition.y}%`,
                    transition: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Descripción del producto - estilo Amazon */}
        <div className="mt-12">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Descripción del producto</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.descripcion}
              </p>
            </div>
          </div>
        </div>
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
