import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  MapPin, 
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  Timer,
  Tag,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingCart,
  Camera,
  DollarSign
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canModifyProduct, canDeleteProduct } = usePermissions();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsZoomed(true);
    // Calcular posición del popup solo una vez al entrar
    const rect = e.currentTarget.getBoundingClientRect();
    const popupX = rect.right + 20; // 20px a la derecha de la imagen
    const popupY = rect.top; // Alineado con la parte superior de la imagen
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
      } else {
        setError(data.message || 'Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Forzar scroll al inicio
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);


  const handleDeleteProduct = async () => {
    if (!product || !user) return;
    
    const isOwner = user.id === product.vendedor_id || user.tipo_usuario === 'administrador';
    if (!isOwner) return;
    
    showWarning(
      '¿Eliminar producto?',
      `¿Estás seguro de que quieres eliminar "${product.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiService.getToken()}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
            showSuccess(
              '¡Producto eliminado!',
              'El producto ha sido eliminado correctamente.',
              () => navigate('/products')
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

  const handleMarkAsReviewed = async () => {
    if (!product || !user) return;
    
    setReviewLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${product.id}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          accion: 'marcar_revisado_detalle',
          motivo: 'Producto marcado como revisado en detalle',
          decision_final: 'Revisado en detalle'
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('¡Producto Revisado!', 'El producto ha sido marcado como revisado.');
        // Recargar el producto para obtener la fecha_revision actualizada
        loadProduct();
      } else {
        showError('Error al marcar como revisado', data.message || 'No se pudo marcar el producto como revisado.');
      }
    } catch (error) {
      console.error('Error al marcar como revisado:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor para marcar el producto como revisado.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleModerationAction = async (action: string, productName: string) => {
    if (!product || !user) return;
    
    const actionText = action === 'aprobar' ? 'aprobar' : 'rechazar';
    const actionTitle = action === 'aprobar' ? '¿Aprobar producto?' : '¿Rechazar producto?';
    const actionMessage = action === 'aprobar' 
      ? `¿Estás seguro de que quieres aprobar "${productName}"? Este producto será visible para todos los compradores.`
      : `¿Estás seguro de que quieres rechazar "${productName}"? Este producto será suspendido y no será visible para los compradores.`;
    
    showWarning(
      actionTitle,
      actionMessage,
      async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/products/${product.id}/moderate`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiService.getToken()}`
            },
            body: JSON.stringify({
              accion: action,
              motivo: `Producto ${actionText} por ${user.tipo_usuario}`,
              decision_final: `Decisión: ${action === 'aprobar' ? 'Aprobado' : 'Rechazado'}`
            })
          });

          const data = await response.json();
          
          if (data.success) {
            showSuccess(
              'Acción completada',
              `El producto "${productName}" ha sido ${actionText} exitosamente.`,
              () => navigate('/products/moderation')
            );
          } else {
            showError('Error', data.message || 'Error al moderar producto');
          }
        } catch (error) {
          console.error('Error al moderar producto:', error);
          showError('Error', 'Error de conexión al moderar producto');
        }
      },
      undefined // onCancel - no necesita hacer nada especial
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
      {/* Header con gradiente azul-púrpura - RESPONSIVE MEJORADO */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Layout responsive: columna en móvil, fila en desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
            {/* Botón de regresar - RESPONSIVE */}
            <Link to={
              !user  // Si no hay usuario (visitante)
                ? "/products"
                : user.tipo_usuario === 'moderador' || user.tipo_usuario === 'administrador'
                ? "/products/moderation" 
                : user.tipo_usuario === 'comprador'
                ? "/products"
                : "/products"  // vendedor
            }>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span>Regresar</span>
              </Button>
            </Link>
            
            {/* Breadcrumb - RESPONSIVE */}
            <div className="flex items-center flex-wrap gap-x-1.5 sm:gap-x-2 gap-y-1 text-xs sm:text-sm md:text-base text-blue-100">
              {(user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador') ? (
                <>
                  <Link to="/products/moderation" className="hover:text-white transition-colors whitespace-nowrap">
                    Moderación
                  </Link>
                  <span className="text-blue-200">/</span>
                  <span className="text-white font-medium">Revisión de producto</span>
                </>
              ) : (
                <>
                  <Link to="/products" className="hover:text-white transition-colors whitespace-nowrap">
                    Productos
                  </Link>
                  <span className="text-blue-200">/</span>
                  <span className="text-white whitespace-nowrap truncate max-w-[120px] sm:max-w-none">
                    {product.categoria_nombre}
                  </span>
                  <span className="text-blue-200 hidden sm:inline">/</span>
                  <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-none hidden sm:inline">
                    {product.nombre}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Layout principal estilo Amazon - RESPONSIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
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
                        className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-contain bg-white"
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
                  
                  {/* Indicador de zoom - MEJORADO + RESPONSIVE (solo desktop) */}
                  <div className="hidden lg:block absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-medium shadow-xl flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Pasa el cursor para hacer zoom</span>
                    </div>
                  </div>
                  
                  {/* Indicador de múltiples imágenes - MEJORADO */}
                  {product.imagenes.length > 1 && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs font-bold shadow-lg flex items-center space-x-1">
                        <Camera className="h-4 w-4" />
                        <span>{product.imagenes.length} fotos</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center px-4">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-600">Sin imágenes disponibles</h3>
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


            {/* Información específica de servicios - MEJORADO: Con mejor profundidad + RESPONSIVE */}
            {product.tipo === 'servicio' && product.servicio && (
              <div className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-base">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Detalles del servicio
                </h3>
                <div className="space-y-3 text-sm">
                  {product.servicio.horario_atencion && (
                    <div className="flex items-start space-x-3 p-2 bg-white/60 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-600 block text-xs font-medium mb-1">Horario de atención</span>
                        <span className="text-gray-900 font-semibold">{product.servicio.horario_atencion}</span>
                      </div>
                    </div>
                  )}
                  {product.servicio.dias_disponibles && (
                    <div className="flex items-start space-x-3 p-2 bg-white/60 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-600 block text-xs font-medium mb-1">Días disponibles</span>
                        <span className="text-gray-900 font-semibold">{product.servicio.dias_disponibles}</span>
                      </div>
                    </div>
                  )}
                  {product.servicio.duracion_estimada && (
                    <div className="flex items-start space-x-3 p-2 bg-white/60 rounded-lg">
                      <Timer className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-600 block text-xs font-medium mb-1">Duración estimada</span>
                        <span className="text-gray-900 font-semibold">{product.servicio.duracion_estimada}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Columna derecha - Información del producto */}
          <div className="space-y-4 sm:space-y-6">
            {/* Título del producto - MEJORADO: Mayor peso visual + RESPONSIVE */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-2 sm:mb-3 tracking-tight">
                {product.nombre}
              </h1>
              <div className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex items-center">
                <span className="text-gray-500">Código:</span>
                <span className="font-semibold text-gray-900 ml-2 bg-gray-100 px-3 py-1 rounded-md text-xs sm:text-sm">
                  {product.codigo}
                </span>
              </div>
              
              {/* Precio - MEJORADO: Súper prominente con sombras + RESPONSIVE */}
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-l-4 border-green-500 p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <div className="text-xs sm:text-sm text-green-700 mb-2 font-bold uppercase tracking-wider flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Precio
                </div>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent inline-block leading-none">
                  ${product.precio ? Number(product.precio).toFixed(2) : '0.00'}
                </span>
              </div>
              
              {/* Estado - Solo visible para moderadores, administradores y vendedor dueño */}
              {user && (
                user.tipo_usuario === 'moderador' || 
                user.tipo_usuario === 'administrador' || 
                product.vendedor_id === user.id
              ) && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {product.estado === 'pendiente_revision' ? 'Pendiente de revisión' : product.estado.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
                  
            {/* NUEVO: Botón de acción principal para COMPRADORES + RESPONSIVE */}
            {user?.tipo_usuario === 'comprador' && product.estado === 'activo' && product.disponibilidad && (
              <div className="sticky top-4 z-10">
                <Button 
                  onClick={() => navigate(`/products/contact/${product.id}`)}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  <span>Contactar Vendedor</span>
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  ✓ Disponible para compra inmediata
                </p>
              </div>
            )}

            {/* Información de estado pendiente */}
            {product.estado === 'pendiente_revision' && (
              <Alert className="border-yellow-200 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 font-medium text-sm">
                  Este producto está pendiente de revisión por parte de los moderadores.
                </AlertDescription>
              </Alert>
            )}

            {/* Acciones de Moderación - MEJORADO: Con profundidad + RESPONSIVE */}
            {(user?.tipo_usuario === 'moderador' || user?.tipo_usuario === 'administrador') && (product.estado === 'pendiente_revision' || product.estado === 'activo') && (
              <div className="border border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Acciones de Moderación
                </h3>
                
                {product.estado === 'pendiente_revision' ? (
                  // Flujo para productos pendientes de revisión
                  !product.fecha_revision ? (
                    // Botón para marcar como revisado
                    <div className="text-center">
                      <Button 
                        onClick={handleMarkAsReviewed}
                        disabled={reviewLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-medium"
                      >
                        {reviewLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Marcando como revisado...
                          </>
                        ) : (
                          <>
                            <Eye className="h-5 w-5 mr-2" />
                            Marcar como Revisado
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600 mt-3 text-center">
                        Primero marca el producto como revisado, luego podrás aprobarlo o rechazarlo
                      </p>
                    </div>
                  ) : (
                    // Botones de aprobación/rechazo (solo después de marcar como revisado)
                    <>
                      <div className="mb-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Producto marcado como revisado</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => handleModerationAction('aprobar', product.nombre)}
                          className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button 
                          onClick={() => handleModerationAction('rechazar', product.nombre)}
                          className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-3 text-center">
                        Ahora puedes tomar una decisión sobre este producto
                      </p>
                    </>
                  )
                ) : (
                  // Flujo para productos activos - pueden ser suspendidos o marcados como peligrosos
                  <>
                    <div className="mb-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Producto activo - Acciones disponibles</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleModerationAction('suspender', product.nombre)}
                        className="w-full h-10 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Suspender
                      </Button>
                      <Button 
                        onClick={() => handleModerationAction('marcar_peligroso', product.nombre)}
                        className="w-full h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Marcar como Peligroso
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-3 text-center">
                      Puedes suspender el producto o marcarlo como peligroso
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Acciones de Gestión - MEJORADO: Con profundidad + RESPONSIVE */}
            {(canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id)) && user?.tipo_usuario !== 'moderador' && (
              <div className="border-l-4 border-gray-500 bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-base">
                  <Shield className="h-5 w-5 mr-2 text-gray-600" />
                  Gestionar producto
                </h3>
                <div className="space-y-3">
                  {canModifyProduct(product.vendedor_id) && !product.es_peligroso && (
                    <Button 
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Producto
                    </Button>
                  )}
                    
                  {canDeleteProduct(product.vendedor_id) && !product.es_peligroso && (
                    <Button 
                      onClick={handleDeleteProduct}
                      className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Producto
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Información del vendedor - MEJORADO: Más compacto + Sombras + RESPONSIVE */}
            {user && user.id !== product.vendedor_id && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-sm">
                      {product.vendedor_nombre?.charAt(0) || 'U'}
                    </span>
                  </div>
                  Vendedor
                </h3>
                <div className="space-y-1 mb-3">
                  <div className="font-medium text-gray-900 text-lg">{product.vendedor_nombre}</div>
                  <div className="text-sm text-gray-600">{product.vendedor_email}</div>
                </div>
                {user?.tipo_usuario !== 'comprador' && (
                  <Button 
                    onClick={() => navigate(`/products/contact/${product.id}`)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Contactar vendedor
                  </Button>
                )}
              </div>
            )}

            {/* Ubicación - MEJORADO: Con sombras y mejor profundidad + RESPONSIVE */}
            {(product.ubicacion_nombre || product.provincia || product.canton) && (
              <div className="border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Ubicación
                </h3>
                <div className="space-y-2 text-sm">
                  {product.ubicacion_nombre && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-20 flex-shrink-0">Dirección:</span>
                      <span className="text-gray-900 font-medium">{product.ubicacion_nombre}</span>
                    </div>
                  )}
                  {product.provincia && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-20 flex-shrink-0">Provincia:</span>
                      <span className="text-gray-900">{product.provincia}</span>
                    </div>
                  )}
                  {product.canton && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-20 flex-shrink-0">Cantón:</span>
                      <span className="text-gray-900">{product.canton}</span>
                    </div>
                  )}
                  {product.distrito && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-20 flex-shrink-0">Distrito:</span>
                      <span className="text-gray-900">{product.distrito}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional - MEJORADO: Con sombras y profundidad + RESPONSIVE */}
            <div className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                <Tag className="h-5 w-5 mr-2 text-purple-600" />
                Información del {product.tipo === 'servicio' ? 'servicio' : 'producto'}
              </h3>
              <div className="space-y-3">
                <div className="py-1.5">
                  <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-1">Categoría</span>
                  <span className="text-gray-900 font-bold text-base">{product.categoria_nombre}</span>
                </div>
                {product.categoria_descripcion && (
                  <div className="py-1.5 pl-3 border-l-2 border-purple-300 bg-white/40 rounded-r-lg">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-xs leading-relaxed">{product.categoria_descripcion}</span>
                    </div>
                  </div>
                )}
                <div className="py-1.5">
                  <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-1">Publicado</span>
                  <span className="text-gray-900 font-semibold text-base">{formatDate(product.fecha_publicacion)}</span>
                </div>
                <div className="py-1.5">
                  <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-1">Tipo</span>
                  <span className={`font-bold text-lg ${product.tipo === 'servicio' ? 'text-purple-700' : 'text-blue-700'}`}>
                    {product.tipo === 'servicio' ? '🔧 Servicio' : '📦 Producto'}
                  </span>
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

        {/* Descripción del producto - MEJORADO: Formato enriquecido + Mayor contraste + RESPONSIVE */}
        <div className="mt-8 sm:mt-12 border-t-2 border-gray-200 pt-6 sm:pt-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span>Descripción detallada</span>
          </h2>
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-sm">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap"
                style={{
                  lineHeight: '1.8',
                  wordBreak: 'break-word'
                }}
              >
                {product.descripcion.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  
                  // Detectar si es una lista (comienza con - o *)
                  if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                    return (
                      <div key={index} className="flex items-start space-x-2 my-2">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span className="flex-1">{paragraph.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  
                  // Detectar si es un título (todo en mayúsculas o termina con :)
                  if (paragraph === paragraph.toUpperCase() || paragraph.trim().endsWith(':')) {
                    return (
                      <h3 key={index} className="font-bold text-lg text-gray-900 mt-6 mb-3 first:mt-0">
                        {paragraph}
                      </h3>
                    );
                  }
                  
                  // Párrafo normal
                  return (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de estado adicionales */}
        <div className="mt-8 space-y-4">
              {!product.disponibilidad && (
                <Alert className="border-red-200 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium text-sm">
                    Este producto no está disponible actualmente.
                  </AlertDescription>
                </Alert>
              )}

              {product.es_peligroso && (
                <Alert className="border-red-200 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium text-sm">
                    Este producto está marcado como peligroso y no puede ser modificado.
                  </AlertDescription>
                </Alert>
              )}
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

