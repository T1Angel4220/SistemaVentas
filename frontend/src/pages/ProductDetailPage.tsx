import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  Heart,
  ShoppingCart,
  Edit,
  Trash2,
  ArrowLeft,
  Share2,
  Flag,
  Shield,
  AlertTriangle
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canModifyProduct, canDeleteProduct, canModerateProduct } = usePermissions();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const checkIfSaved = useCallback(async (productId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/saved-products/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSaved(data.success && data.data.is_saved);
    } catch (error) {
      console.error('Error al verificar si está guardado:', error);
    }
  }, [user]);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        checkIfSaved(data.data.id);
      } else {
        setError(data.message || 'Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id, checkIfSaved]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const handleSaveProduct = async () => {
    if (!user || !product) return;
    
    try {
      const method = saved ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:3001/api/saved-products/${product.id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !user) return;
    
    const isOwner = user.id === product.vendedor_id || user.tipo_usuario === 'administrador';
    if (!isOwner) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          navigate('/products');
        } else {
          alert(data.message || 'Error al eliminar el producto');
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (estado: string, disponibilidad: boolean) => {
    if (!disponibilidad) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-4 py-2 rounded-full shadow-lg">
          NO DISPONIBLE
        </Badge>
      );
    }
    
    const statusColors = {
      activo: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 rounded-full shadow-lg',
      pendiente_revision: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 rounded-full shadow-lg',
      rechazado: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-4 py-2 rounded-full shadow-lg',
      suspendido: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 px-4 py-2 rounded-full shadow-lg'
    };
    
    return (
      <Badge className={statusColors[estado as keyof typeof statusColors] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 px-4 py-2 rounded-full shadow-lg'}>
        {estado.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (tipo: string) => {
    return tipo === 'servicio' ? <Calendar className="h-5 w-5" /> : <Package className="h-5 w-5" />;
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

  const isOwner = (productOwnerId?: number) => {
    return user && productOwnerId && user.id === productOwnerId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/products">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    {getTypeIcon(product.tipo)}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {product.nombre}
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Código: {product.codigo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canModifyProduct(product.vendedor_id) && !product.es_peligroso && (
                <Link to={`/products/${product.id}/edit`}>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {canDeleteProduct(product.vendedor_id) && !product.es_peligroso && (
                <Button 
                  onClick={handleDeleteProduct}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Flag className="h-4 w-4 mr-2" />
                Reportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imágenes */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {product.imagenes.length > 0 ? (
                  <div className="space-y-6">
                    {/* Imagen principal */}
                    <div className="relative">
                      <img
                        src={product.imagenes[currentImageIndex]?.url_imagen}
                        alt={product.nombre}
                        className="w-full h-[500px] object-cover"
                      />
                      {product.imagenes.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-3">
                            {product.imagenes.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                  index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Miniaturas */}
                    {product.imagenes.length > 1 && (
                      <div className="flex space-x-4 p-6 overflow-x-auto">
                        {product.imagenes.map((imagen, index) => (
                          <button
                            key={imagen.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                              index === currentImageIndex ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={imagen.url_imagen}
                              alt={`${product.nombre} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Package className="h-16 w-16 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin imágenes disponibles</h3>
                      <p className="text-gray-500">Este producto no tiene imágenes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información del producto */}
          <div className="space-y-8">
            {/* Precio y acciones */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                      {formatPrice(product.precio)}
                    </div>
                    <div className="flex items-center justify-center space-x-3 mb-6">
                      {getStatusBadge(product.estado, product.disponibilidad)}
                      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-4 py-2 rounded-full shadow-lg">
                        {getTypeIcon(product.tipo)}
                        <span className="ml-2 capitalize font-semibold">{product.tipo}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold" 
                      disabled={!product.disponibilidad}
                    >
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      {product.disponibilidad ? 'Agregar al carrito' : 'No disponible'}
                    </Button>
                    
                    {user && (
                      <Button 
                        onClick={handleSaveProduct}
                        className="w-full h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      >
                        <Heart className={`h-5 w-5 mr-2 ${saved ? 'fill-white' : ''}`} />
                        {saved ? 'Guardado en favoritos' : 'Guardar como favorito'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del vendedor */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-800">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Vendedor</span>
                    <p className="text-sm text-gray-600 font-normal">Información de contacto</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">{product.vendedor_nombre}</p>
                      <p className="text-sm text-gray-600">{product.vendedor_email}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12">
                    Contactar vendedor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            {product.ubicacion_nombre && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Ubicación</span>
                      <p className="text-sm text-gray-600 font-normal">Información de ubicación</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-900">{product.ubicacion_nombre}</p>
                        {product.provincia && (
                          <p className="text-sm text-gray-600">
                            {product.provincia}, {product.canton}, {product.distrito}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Descripción y detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-800">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Descripción</span>
                    <p className="text-sm text-gray-600 font-normal">Detalles del producto</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {product.descripcion}
                </p>
              </CardContent>
            </Card>

            {/* Información específica de servicios */}
            {product.tipo === 'servicio' && product.servicio && (
              <Card className="mt-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Información del Servicio</span>
                      <p className="text-sm text-gray-600 font-normal">Detalles específicos</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Horario de atención</label>
                      <p className="text-gray-900 text-lg font-medium">{product.servicio.horario_atencion}</p>
                    </div>
                    {product.servicio.dias_disponibles && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Días disponibles</label>
                        <p className="text-gray-900 text-lg font-medium">{product.servicio.dias_disponibles}</p>
                      </div>
                    )}
                    {product.servicio.duracion_estimada && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Duración estimada</label>
                        <p className="text-gray-900 text-lg font-medium">{product.servicio.duracion_estimada}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            {/* Información adicional */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-800">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Información adicional</span>
                    <p className="text-sm text-gray-600 font-normal">Detalles del producto</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Categoría</span>
                    <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-3 py-1 rounded-full">
                      {product.categoria_nombre}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Publicado</span>
                    <span className="text-gray-900 font-semibold">{formatDate(product.fecha_publicacion)}</span>
                  </div>
                  {product.fecha_actualizacion !== product.fecha_publicacion && (
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Actualizado</span>
                      <span className="text-gray-900 font-semibold">{formatDate(product.fecha_actualizacion)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-4">
                    <span className="text-gray-600 font-medium">Estado</span>
                    {getStatusBadge(product.estado, product.disponibilidad)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas de estado */}
            {!product.disponibilidad && (
              <Alert className="border-red-200 bg-red-50 shadow-lg rounded-xl">
                <AlertDescription className="text-red-800 font-medium">
                  Este producto no está disponible actualmente.
                </AlertDescription>
              </Alert>
            )}

            {product.estado === 'pendiente_revision' && (
              <Alert className="border-yellow-200 bg-yellow-50 shadow-lg rounded-xl">
                <AlertDescription className="text-yellow-800 font-medium">
                  Este producto está pendiente de revisión por parte de los moderadores.
                </AlertDescription>
              </Alert>
            )}

            {product.es_peligroso && (
              <Alert className="border-red-200 bg-red-50 shadow-lg rounded-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800 font-medium">
                  Este producto está marcado como peligroso y no puede ser modificado.
                </AlertDescription>
              </Alert>
            )}

            {/* Acciones de gestión según permisos */}
            {(canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id) || canModerateProduct()) && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden mt-6">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Acciones de Gestión</span>
                      <p className="text-sm text-gray-600 font-normal">Gestiona este producto</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canModifyProduct(product.vendedor_id) && !product.es_peligroso && (
                      <Button 
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Producto
                      </Button>
                    )}
                    
                    {canDeleteProduct(product.vendedor_id) && !product.es_peligroso && (
                      <Button 
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                            // Implementar eliminación
                            console.log('Eliminar producto:', product.id);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white h-12"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Producto
                      </Button>
                    )}
                    
                    {canModerateProduct() && (
                      <Button 
                        onClick={() => navigate('/products/moderation')}
                        className="bg-purple-600 hover:bg-purple-700 text-white h-12"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Moderar Producto
                      </Button>
                    )}
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {isOwner(product.vendedor_id) && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Eres el propietario de este producto
                        </Badge>
                      )}
                      {canModerateProduct() && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Tienes permisos de moderación
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
