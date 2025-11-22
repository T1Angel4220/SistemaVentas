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
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Flag
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';
import { ReportProductDialog } from '../components/ui/ReportProductDialog';
import { ModerationReasonModal } from '../components/ui/ModerationReasonModal';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canModifyProduct, canDeleteProduct, canModerateProduct, getRoleDisplayName } = usePermissions();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Estado para detectar scroll
  
  // Estado para modal de reporte
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Estado para modal de motivo de moderación
  const [moderationModal, setModerationModal] = useState<{
    isOpen: boolean;
    action: 'rechazar' | 'suspender' | 'marcar_peligroso';
    productId: number;
    productName: string;
  } | null>(null);

  const handleReportProduct = () => {
    setReportModalOpen(true);
  };

  const handleReportSuccess = () => {
    showSuccess(
      '¡Reporte enviado!',
      'Tu reporte ha sido enviado correctamente. Será revisado por un moderador.',
      () => {}
    );
    setReportModalOpen(false);
  };

  // Handlers de moderación
  const handleModerateProduct = async (action: string, motivo?: string) => {
    if (!product) return;
    
    try {
      setReviewLoading(true);
      
      const response = await fetch(`http://localhost:3001/api/products/${product.id}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          accion: action,
          motivo: motivo || `Producto ${action} por ${getRoleDisplayName()}`,
          decision_final: `Decisión: ${action}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        let titulo = '';
        let mensaje = '';

        switch (action) {
          case 'aprobar':
            titulo = '✅ Producto Aprobado';
            mensaje = `"${product.nombre}" ha sido APROBADO exitosamente.\n\nEl producto ahora es visible para todos los compradores.`;
            break;
          case 'rechazar':
            titulo = '🔴 Producto Rechazado';
            mensaje = `"${product.nombre}" ha sido RECHAZADO.\n\nEl vendedor podrá verlo, editarlo, eliminarlo o apelar esta decisión.`;
            break;
          case 'suspender':
            titulo = '🟡 Producto Suspendido';
            mensaje = `"${product.nombre}" ha sido SUSPENDIDO temporalmente.\n\nEl vendedor podrá verlo y apelar, pero no editarlo ni eliminarlo hasta que se resuelva.`;
            break;
          case 'marcar_peligroso':
            titulo = '🚫 Producto Marcado como Peligroso';
            mensaje = `"${product.nombre}" ha sido marcado como PELIGROSO.\n\nEl producto está ahora OCULTO para vendedor y compradores.\nSolo moderadores y administradores pueden verlo.\n\nEl vendedor podrá apelar esta decisión.`;
            break;
        }

        // Recargar el producto para actualizar el estado
        await loadProduct();
        
        showSuccess(titulo, mensaje, () => {
          // Si estamos en la página de detalle, quedarnos aquí
          // Si estamos en la página de moderación, navegar allí
          if (window.location.pathname.includes('/products/moderation')) {
            navigate('/products/moderation');
          }
        });
      } else {
        showError('Error', data.message || 'Error al moderar producto');
      }
    } catch (error) {
      console.error('Error al moderar producto:', error);
      showError('Error', 'Error de conexión al moderar producto');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApproveProduct = () => {
    if (!product) return;
    showWarning(
      '¿Aprobar producto?',
      `¿Estás seguro de que quieres aprobar "${product.nombre}"?\n\nEste producto será APROBADO y visible para todos los compradores en la plataforma.`,
      () => handleModerateProduct('aprobar')
    );
  };

  const handleRejectProduct = () => {
    if (!product) return;
    setModerationModal({
      isOpen: true,
      action: 'rechazar',
      productId: product.id,
      productName: product.nombre
    });
  };

  const handleSuspendProduct = () => {
    if (!product) return;
    setModerationModal({
      isOpen: true,
      action: 'suspender',
      productId: product.id,
      productName: product.nombre
    });
  };

  const handleMarkAsDangerous = () => {
    if (!product) return;
    setModerationModal({
      isOpen: true,
      action: 'marcar_peligroso',
      productId: product.id,
      productName: product.nombre
    });
  };

  const handleModerationConfirm = (motivo: string) => {
    if (moderationModal) {
      handleModerateProduct(moderationModal.action, motivo);
      setModerationModal(null);
    }
  };

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
        const productData = data.data;
        
        // Verificar si es un producto peligroso y el usuario es el vendedor (no moderador/admin)
        if (productData.es_peligroso && user) {
          const isOwner = user.id === productData.vendedor_id;
          const isModerator = user.tipo_usuario === 'moderador' || user.tipo_usuario === 'administrador';
          
          // Si es el propietario pero NO es moderador/admin, bloquear acceso
          if (isOwner && !isModerator) {
            showError(
              '🚫 Acceso Denegado',
              'Este producto ha sido marcado como peligroso y no está disponible para visualización. Solo los moderadores pueden acceder a él para revisión.',
              () => navigate('/my-products')
            );
            return; // No establecer el producto
          }
        }
        
        setProduct(productData);
      } else {
        setError(data.message || 'Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, showError]);

  useEffect(() => {
    // Forzar scroll al inicio
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  // 🆕 Navegación con teclado (flechas izquierda/derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product || product.imagenes.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndex((prev) => 
          prev === 0 ? product.imagenes.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndex((prev) => 
          prev === product.imagenes.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  // 🆕 Detectar scroll para hacer los botones sticky
  useEffect(() => {
    const handleScroll = () => {
      // Los botones se vuelven sticky después de hacer scroll más de 100px (umbral reducido para mejor UX)
      const scrollThreshold = 100;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


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
                : "/products"  // comprador o vendedor
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
                  <span 
                    className="text-white whitespace-nowrap truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]"
                    title={product.categoria_nombre}
                  >
                    {product.categoria_nombre}
                  </span>
                  <span className="text-blue-200 hidden sm:inline">/</span>
                  <span 
                    className="text-white font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[400px] hidden sm:inline"
                    title={product.nombre}
                  >
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
                  
                  {/* 🆕 Botones de navegación de imágenes (FLECHAS) */}
                  {product.imagenes.length > 1 && (
                    <>
                      {/* Flecha Izquierda */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => 
                            prev === 0 ? product.imagenes.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 shadow-xl hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                      
                      {/* Flecha Derecha */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => 
                            prev === product.imagenes.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 shadow-xl hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </>
                  )}
                  
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
                        <span className="text-gray-600 block text-xs font-medium mb-2">Días disponibles</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.servicio.dias_disponibles.split(',').map((dia: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                            >
                              {dia.trim().charAt(0).toUpperCase() + dia.trim().slice(1)}
                            </span>
                          ))}
                        </div>
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

            {/* Información del producto - Solo para PRODUCTOS en columna izquierda */}
            {product.tipo === 'producto' && (
              <div className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                  <Tag className="h-5 w-5 mr-2 text-green-600" />
                  Información del producto
                </h3>
                <div className="space-y-3">
                  <div className="py-1.5">
                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-1">Categoría</span>
                    <span className="text-gray-900 font-bold text-base">{product.categoria_nombre}</span>
                  </div>
                  {product.categoria_descripcion && (
                    <div className="py-1.5 pl-3 border-l-2 border-green-300 bg-white/40 rounded-r-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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
                    <span className="font-bold text-lg text-green-700">📦 Producto</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Columna derecha - Información del producto */}
          <div className="space-y-4 sm:space-y-6">
            {/* Título del producto - MEJORADO: Mayor peso visual + RESPONSIVE + Manejo de texto largo */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-2 sm:mb-3 tracking-tight break-words">
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
                  
            {/* NUEVO: Botón de acción principal para COMPRADORES Y VENDEDORES + RESPONSIVE + STICKY */}
            {(user?.tipo_usuario === 'comprador' || user?.tipo_usuario === 'vendedor') && product.estado === 'activo' && product.disponibilidad && (
              <div className={`space-y-3 transition-all duration-300 ${isScrolled ? 'sticky top-20 z-40 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg' : ''}`}>
                <Button 
                  onClick={() => navigate(`/products/contact/${product.id}`)}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  <span>Contactar Vendedor</span>
                </Button>
                <Button 
                  onClick={handleReportProduct}
                  variant="outline"
                  className="w-full h-10 sm:h-11 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-white text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                >
                  <Flag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>Reportar producto</span>
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

            {/* Acciones de Gestión - MEJORADO: Con profundidad + RESPONSIVE */}
            {(canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id)) && user?.tipo_usuario !== 'moderador' && (
              <div className="border-l-4 border-gray-500 bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-base">
                  <Shield className="h-5 w-5 mr-2 text-gray-600" />
                  Gestionar producto
                </h3>
                <div className="space-y-3">
                  {canModifyProduct(product.vendedor_id) && !product.es_peligroso && product.estado !== 'pendiente_revision' && product.estado !== 'suspendido' && (
                    <Button 
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Producto
                    </Button>
                  )}
                    
                  {canDeleteProduct(product.vendedor_id) && !product.es_peligroso && product.estado !== 'pendiente_revision' && product.estado !== 'suspendido' && (
                      <Button 
                      onClick={handleDeleteProduct}
                      className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Producto
                      </Button>
                    )}
                    
                  {/* Mensaje informativo si el producto está en revisión */}
                  {product.estado === 'pendiente_revision' && user?.tipo_usuario !== 'administrador' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>⏳ En revisión:</strong> No puedes editar ni eliminar este producto hasta que los moderadores lo revisen.
                      </p>
                    </div>
                  )}
                  
                  {/* Mensaje informativo si el producto está suspendido */}
                  {product.estado === 'suspendido' && user?.tipo_usuario !== 'administrador' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <p className="text-sm text-red-800">
                        <strong>🚫 Suspendido:</strong> Este producto ha sido suspendido por los moderadores. No puedes editarlo ni eliminarlo. Contacta con los moderadores para más información.
                      </p>
                    </div>
                  )}
                  </div>
                </div>
            )}

            {/* Acciones de Moderación - SOLO para Moderadores y Administradores */}
            {canModerateProduct() && (
              <div className="border-l-4 border-slate-700 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-base">
                  <Shield className="h-5 w-5 mr-2 text-slate-700" />
                  Acciones de Moderación
                </h3>
                
                {/* Botones principales: Aprobar, Rechazar, Suspender */}
                <div className={`grid gap-2 mb-3 ${
                  product.estado?.toLowerCase().trim() === 'activo' 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-3'
                }`}>
                  {/* Botón Aprobar - SOLO visible si NO está aprobado */}
                  {product.estado?.toLowerCase().trim() !== 'activo' && (
                    <Button 
                      size="sm"
                      onClick={handleApproveProduct}
                      disabled={reviewLoading}
                      className="h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      title="Aprobar producto"
                    >
                      {reviewLoading ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="ml-2">Aprobar</span>
                    </Button>
                  )}
                  
                  <Button 
                    size="sm"
                    onClick={handleRejectProduct}
                    disabled={reviewLoading}
                    className="h-10 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Rechazar por errores corregibles (vendedor puede editar)"
                  >
                    {reviewLoading ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="ml-2">Rechazar</span>
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={handleSuspendProduct}
                    disabled={reviewLoading}
                    className="h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Suspender por violación grave (vendedor NO puede editar)"
                  >
                    {reviewLoading ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span className="ml-2">Suspender</span>
                  </Button>
                </div>
                
                {/* Acción crítica: Marcar como Peligroso */}
                <div className="pt-3 border-t border-slate-200">
                  <Button 
                    size="sm"
                    onClick={handleMarkAsDangerous}
                    disabled={reviewLoading}
                    className="w-full h-10 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Contenido prohibido - Producto OCULTO completamente"
                  >
                    {reviewLoading ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span className="ml-2">🚫 Marcar como Peligroso</span>
                  </Button>
                </div>

                {/* Nota informativa */}
                <div className="mt-3 p-2 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700">
                  <strong>Nota:</strong> Todas las acciones son permanentes y quedan registradas en el historial de moderación.
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
                {user?.tipo_usuario !== 'comprador' && user?.tipo_usuario !== 'vendedor' && (
                <Button 
                  onClick={() => navigate(`/products/contact/${product.id}`)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Contactar vendedor
                </Button>
                )}
              </div>
            )}

            {/* Ubicación - PARA TODOS (productos y servicios) */}
            {(product.ubicacion_provincia || product.ubicacion_canton || product.ubicacion_distrito || product.ubicacion_direccion || product.coordenadas) && (
              <div className="border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  📍 Ubicación del {product.tipo === 'servicio' ? 'servicio' : 'producto'}
                </h3>
                <div className="space-y-2 text-sm">
                  {product.ubicacion_provincia && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-24 flex-shrink-0 font-medium">Provincia:</span>
                      <span className="text-gray-900 font-semibold">{product.ubicacion_provincia}</span>
                    </div>
                  )}
                  {product.ubicacion_canton && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-24 flex-shrink-0 font-medium">Cantón:</span>
                      <span className="text-gray-900 font-semibold">{product.ubicacion_canton}</span>
                    </div>
                  )}
                  {product.ubicacion_distrito && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-24 flex-shrink-0 font-medium">Distrito:</span>
                      <span className="text-gray-900">{product.ubicacion_distrito}</span>
                    </div>
                  )}
                  {product.ubicacion_direccion && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 w-24 flex-shrink-0 font-medium">Dirección:</span>
                      <span className="text-gray-900">{product.ubicacion_direccion}</span>
                    </div>
                  )}
                  {product.coordenadas && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-600 w-24 flex-shrink-0 font-medium">📌 GPS:</span>
                        <a 
                          href={`https://www.google.com/maps?q=${product.coordenadas}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono text-xs underline hover:no-underline transition-colors"
                          title="Ver en Google Maps"
                        >
                          {product.coordenadas}
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-24">
                        Haz clic para ver en Google Maps
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional - Solo para SERVICIOS en columna derecha */}
            {product.tipo === 'servicio' && (
              <div className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                  <Tag className="h-5 w-5 mr-2 text-green-600" />
                  Información del servicio
                </h3>
                <div className="space-y-3">
                  <div className="py-1.5">
                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide block mb-1">Categoría</span>
                    <span className="text-gray-900 font-bold text-base">{product.categoria_nombre}</span>
                  </div>
                  {product.categoria_descripcion && (
                    <div className="py-1.5 pl-3 border-l-2 border-green-300 bg-white/40 rounded-r-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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
                    <span className="font-bold text-lg text-green-700">🔧 Servicio</span>
                  </div>
                </div>
              </div>
            )}

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
                  
                  // Función para renderizar texto con negritas **texto**
                  const renderWithBold = (text: string) => {
                    const parts = text.split(/(\*\*.*?\*\*)/g);
                    return parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                      }
                      return <span key={i}>{part}</span>;
                    });
                  };
                  
                  // Detectar si es una lista (comienza con - o *)
                  if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                    const listText = paragraph.trim().substring(1).trim();
                    return (
                      <div key={index} className="flex items-start space-x-2 my-2">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span className="flex-1">{renderWithBold(listText)}</span>
                      </div>
                    );
                  }
                  
                  // Detectar si es un título (todo en mayúsculas o termina con :)
                  if (paragraph === paragraph.toUpperCase() || paragraph.trim().endsWith(':')) {
                    return (
                      <h3 key={index} className="font-bold text-lg text-gray-900 mt-6 mb-3 first:mt-0">
                        {renderWithBold(paragraph)}
                      </h3>
                    );
                  }
                  
                  // Párrafo normal
                  return (
                    <p key={index} className="mb-4 last:mb-0">
                      {renderWithBold(paragraph)}
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

      {/* Modal de Reporte */}
      {product && (
        <ReportProductDialog
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          productId={product.id}
          productName={product.nombre}
          onSuccess={handleReportSuccess}
        />
      )}

      {/* Modal de Motivo de Moderación */}
      {moderationModal && (
        <ModerationReasonModal
          isOpen={moderationModal.isOpen}
          onClose={() => setModerationModal(null)}
          onConfirm={handleModerationConfirm}
          action={moderationModal.action}
          productName={moderationModal.productName}
        />
      )}
    </div>
  );
};

