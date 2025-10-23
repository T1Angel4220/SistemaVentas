import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Heart,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Shield,
  AlertTriangle
} from 'lucide-react';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onSave?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  onEdit?: (productId: number) => void;
  onDelete?: (productId: number) => void;
  onModerate?: (productId: number) => void;
  isSaved?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showActions = true,
  onSave,
  onAddToCart,
  onEdit,
  onDelete,
  onModerate,
  isSaved = false
}) => {
  const { canModifyProduct, canDeleteProduct, canModerateProduct, isOwner } = usePermissions();
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
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {getStatusBadge(product.estado, product.disponibilidad)}
          {product.es_peligroso && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Peligroso
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="outline" className="bg-white">
            {getTypeIcon(product.tipo)}
            <span className="ml-1 capitalize">{product.tipo}</span>
          </Badge>
          {isOwner(product.vendedor_id) && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Propietario
            </Badge>
          )}
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
          {(product.ubicacion_provincia || product.ubicacion_canton) && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>
                {product.ubicacion_provincia && product.ubicacion_canton 
                  ? `${product.ubicacion_provincia}, ${product.ubicacion_canton}`
                  : product.ubicacion_provincia || product.ubicacion_canton}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Por: {product.vendedor_nombre}</span>
            <span>{formatDate(product.fecha_publicacion)}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="space-y-2 mt-4">
            {/* Acciones principales */}
            <div className="flex space-x-2">
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
            
            {/* Acciones de gestión según permisos */}
            {(canModifyProduct(product.vendedor_id) || canDeleteProduct(product.vendedor_id) || canModerateProduct()) && (
              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                {canModifyProduct(product.vendedor_id) && onEdit && !product.es_peligroso && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(product.id)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                {canDeleteProduct(product.vendedor_id) && onDelete && !product.es_peligroso && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                )}
                {canModerateProduct() && onModerate && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onModerate(product.id)}
                    className="flex-1 text-purple-600 hover:text-purple-700 hover:border-purple-300"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Moderar
                  </Button>
                )}
              </div>
            )}
            
            {/* Mensaje para productos peligrosos */}
            {product.es_peligroso && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Este producto está marcado como peligroso y no puede ser modificado
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
