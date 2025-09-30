import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Heart,
  ShoppingCart,
  Eye
} from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    tipo: 'producto' | 'servicio';
    estado: string;
    disponibilidad: boolean;
    fecha_publicacion: string;
    categoria_nombre: string;
    vendedor_nombre: string;
    ubicacion_nombre?: string;
    total_imagenes: number;
  };
  showActions?: boolean;
  onSave?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  isSaved?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showActions = true,
  onSave,
  onAddToCart,
  isSaved = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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
    return tipo === 'servicio' ? <Calendar className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          {product.total_imagenes > 0 ? (
            <div className="text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">{product.total_imagenes} imagen{product.total_imagenes !== 1 ? 'es' : ''}</p>
            </div>
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <div className="absolute top-2 right-2">
          {getStatusBadge(product.estado, product.disponibilidad)}
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white">
            {getTypeIcon(product.tipo)}
            <span className="ml-1 capitalize">{product.tipo}</span>
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.nombre}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.descripcion}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-medium text-green-600">
              {formatPrice(product.precio)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{product.categoria_nombre}</span>
          </div>
          {product.ubicacion_nombre && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{product.ubicacion_nombre}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Por: {product.vendedor_nombre}</span>
            <span>{formatDate(product.fecha_publicacion)}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2 mt-4">
            <Link to={`/products/${product.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Ver detalles
              </Button>
            </Link>
            {onSave && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSave(product.id)}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}
            {onAddToCart && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddToCart(product.id)}
                disabled={!product.disponibilidad}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
