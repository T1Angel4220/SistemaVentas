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
  Eye
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
      {/* Header con gradiente azul-púrpura */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-8">
            {/* Botón de regresar */}
            <Link to={
              user?.tipo_usuario === 'moderador' 
                ? "/products/moderation" 
                : user?.tipo_usuario === 'comprador'
                ? "/products"
                : "/my-products"
            }>
              <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Regresar
                </Button>
              </Link>
            
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-base text-blue-100">
              {user?.tipo_usuario === 'moderador' ? (
                <>
                  <Link to="/products/moderation" className="hover:text-white transition-colors">Moderación</Link>
                  <span>/</span>
                  <span className="text-white font-medium">Revisión de producto</span>
                </>
              ) : (
                <>
                  <Link to="/products" className="hover:text-white transition-colors">Productos</Link>
              <span>/</span>
                  <span className="text-white">{product.categoria_nombre}</span>
              <span>/</span>
                  <span className="text-white font-medium">{product.nombre}</span>
                </>
              )}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {product.estado === 'pendiente_revision' ? 'Pendiente de revisión' : product.estado.replace('_', ' ')}
                </span>
                    </div>
                  </div>
                  
            {/* Información de estado pendiente */}
            {product.estado === 'pendiente_revision' && (
              <Alert className="border-yellow-200 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 font-medium text-sm">
                  Este producto está pendiente de revisión por parte de los moderadores.
                </AlertDescription>
              </Alert>
            )}

            {/* Acciones de Moderación */}
            {user?.tipo_usuario === 'moderador' && (product.estado === 'pendiente_revision' || product.estado === 'activo') && (
              <div className="border border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
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

            {/* Acciones de Gestión (Solo para Vendedores, NO para Moderadores) */}
            {(canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id)) && user?.tipo_usuario !== 'moderador' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Gestionar producto</h3>
                <div className="space-y-2">
                  {canModifyProduct(product.vendedor_id) && !product.es_peligroso && (
                    <Button 
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      variant="outline"
                      className="w-full h-10 text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                    
                  {canDeleteProduct(product.vendedor_id) && !product.es_peligroso && (
                      <Button 
                      onClick={handleDeleteProduct}
                      variant="outline"
                      className="w-full h-10 text-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                      </Button>
                    )}
                  </div>
                </div>
            )}

            {/* Información del vendedor - Solo si no es el propietario */}
            {user && user.id !== product.vendedor_id && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Vendedor</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
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
                  Contactar vendedor
                </Button>
              </div>
            )}

            {/* Ubicación */}
            {(product.ubicacion_nombre || product.provincia || product.canton) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  Ubicación
                </h3>
                <div className="space-y-2">
            {product.ubicacion_nombre && (
                <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">Dirección:</span>
                      <span className="text-gray-900 font-medium">{product.ubicacion_nombre}</span>
                    </div>
                  )}
                      {product.provincia && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">Provincia:</span>
                      <span className="text-gray-900">{product.provincia}</span>
                    </div>
                  )}
                  {product.canton && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">Cantón:</span>
                      <span className="text-gray-900">{product.canton}</span>
                    </div>
                  )}
                  {product.distrito && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">Distrito:</span>
                      <span className="text-gray-900">{product.distrito}</span>
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

