import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Flag
} from 'lucide-react';

interface ProductDetail {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'producto' | 'servicio';
  estado: string;
  disponibilidad: boolean;
  fecha_publicacion: string;
  fecha_actualizacion: string;
  categoria_nombre: string;
  vendedor_nombre: string;
  vendedor_email: string;
  vendedor_id: number;
  ubicacion_nombre?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  imagenes: Array<{
    id: number;
    url_imagen: string;
    orden: number;
    es_principal: boolean;
  }>;
  servicio?: {
    horario_atencion: string;
    dias_disponibles: string;
    duracion_estimada: string;
  };
  es_peligroso?: boolean;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
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
    return tipo === 'servicio' ? <Calendar className="h-5 w-5" /> : <Package className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h2>
          <p className="text-gray-600">Obteniendo información del producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Producto no encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'El producto que buscas no existe o ha sido eliminado.'}
            </p>
            <Link to="/products">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && (user.id === product.vendedor_id || user.tipo_usuario === 'administrador');
  const canEdit = isOwner && product.estado !== 'rechazado' && !product.es_peligroso;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/products">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.nombre}
                </h1>
                <p className="text-gray-600">
                  Código: {product.codigo}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Link to={`/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteProduct}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Reportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imágenes */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {product.imagenes.length > 0 ? (
                  <div className="space-y-4">
                    {/* Imagen principal */}
                    <div className="relative">
                      <img
                        src={product.imagenes[currentImageIndex]?.url_imagen}
                        alt={product.nombre}
                        className="w-full h-96 object-cover rounded-t-lg"
                      />
                      {product.imagenes.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-2">
                            {product.imagenes.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Miniaturas */}
                    {product.imagenes.length > 1 && (
                      <div className="flex space-x-2 p-4 overflow-x-auto">
                        {product.imagenes.map((imagen, index) => (
                          <button
                            key={imagen.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
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
                  <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4" />
                      <p>Sin imágenes disponibles</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Precio y acciones */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatPrice(product.precio)}
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {getStatusBadge(product.estado, product.disponibilidad)}
                      <Badge variant="outline" className="bg-white">
                        {getTypeIcon(product.tipo)}
                        <span className="ml-1 capitalize">{product.tipo}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" disabled={!product.disponibilidad}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.disponibilidad ? 'Agregar al carrito' : 'No disponible'}
                    </Button>
                    
                    {user && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleSaveProduct}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                        {saved ? 'Guardado' : 'Guardar como favorito'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del vendedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Vendedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{product.vendedor_nombre}</p>
                  <p className="text-sm text-gray-600">{product.vendedor_email}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Contactar vendedor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            {product.ubicacion_nombre && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Ubicación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{product.ubicacion_nombre}</p>
                    {product.provincia && (
                      <p className="text-sm text-gray-600">
                        {product.provincia}, {product.canton}, {product.distrito}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Descripción y detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.descripcion}
                </p>
              </CardContent>
            </Card>

            {/* Información específica de servicios */}
            {product.tipo === 'servicio' && product.servicio && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Información del Servicio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Horario de atención</label>
                      <p className="text-gray-900">{product.servicio.horario_atencion}</p>
                    </div>
                    {product.servicio.dias_disponibles && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Días disponibles</label>
                        <p className="text-gray-900">{product.servicio.dias_disponibles}</p>
                      </div>
                    )}
                    {product.servicio.duracion_estimada && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Duración estimada</label>
                        <p className="text-gray-900">{product.servicio.duracion_estimada}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoría</label>
                    <p className="text-gray-900">{product.categoria_nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Publicado</label>
                    <p className="text-gray-900">{formatDate(product.fecha_publicacion)}</p>
                  </div>
                  {product.fecha_actualizacion !== product.fecha_publicacion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Última actualización</label>
                      <p className="text-gray-900">{formatDate(product.fecha_actualizacion)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alertas de estado */}
            {!product.disponibilidad && (
              <Alert variant="destructive">
                <AlertDescription>
                  Este producto no está disponible actualmente.
                </AlertDescription>
              </Alert>
            )}

            {product.estado === 'pendiente_revision' && (
              <Alert variant="warning">
                <AlertDescription>
                  Este producto está pendiente de revisión por parte de los moderadores.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
