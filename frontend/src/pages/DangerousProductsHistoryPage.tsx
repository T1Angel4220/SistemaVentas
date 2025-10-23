import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Shield, 
  AlertTriangle, 
  Calendar,
  FileText,
  User,
  ArrowLeft,
  Package,
  Camera
} from 'lucide-react';

interface DangerousProduct {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  tipo: string;
  fecha_deteccion_peligroso: string;
  motivo_rechazo?: string;
  moderador_nombre?: string;
  moderador_apellido?: string;
  categoria_nombre?: string;
  primera_imagen?: string;
}

export const DangerousProductsHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alert, showError, hideAlert } = useAlert();
  
  const [products, setProducts] = useState<DangerousProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDangerousProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3001/api/products/my-dangerous`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        showError('Error', 'No se pudieron cargar los productos peligrosos');
      }
    } catch (error) {
      console.error('Error al cargar productos peligrosos:', error);
      showError('Error', 'Error de conexión al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador')) {
      loadDangerousProducts();
    }
  }, [user, loadDangerousProducts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
              <p className="text-gray-600">
                No tienes permisos para ver esta página.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/my-products')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Regresar
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <AlertTriangle className="h-8 w-8 mr-3" />
                  Productos Peligrosos
                </h1>
                <p className="text-red-100 mt-1">
                  Historial de productos marcados como peligrosos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información importante */}
        <Card className="mb-6 border-l-4 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  ℹ️ Información Importante
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Los productos marcados como <strong>peligrosos</strong> no son visibles para ti ni para los compradores.</li>
                  <li>• Solo los moderadores y administradores pueden visualizar estos productos.</li>
                  <li>• <strong>No puedes editar ni eliminar</strong> estos productos (solo administradores pueden hacerlo).</li>
                  <li>• <strong className="text-red-600">No es posible apelar productos peligrosos</strong> debido a la gravedad de la violación.</li>
                  <li>• Si consideras que esto es un error grave, contacta directamente con el equipo de moderación.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando historial...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay productos peligrosos
                </h3>
                <p className="text-gray-600">
                  Ninguno de tus productos ha sido marcado como peligroso.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                <CardHeader className="bg-red-50 border-b border-red-100">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 w-full md:w-32 h-32">
                      {product.primera_imagen ? (
                        <img
                          src={product.primera_imagen}
                          alt={product.nombre}
                          className="w-full h-full object-cover rounded-lg border-2 border-red-200"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center rounded-lg border-2 ${
                          product.tipo === 'servicio' 
                            ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                        }`}>
                          <Camera className={`h-12 w-12 ${
                            product.tipo === 'servicio' ? 'text-purple-400' : 'text-gray-400'
                          }`} />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {product.tipo === 'servicio' ? 'Servicio Peligroso' : 'Producto Peligroso'}
                        </Badge>
                        {product.categoria_nombre && (
                          <Badge variant="outline" className="text-gray-600">
                            {product.categoria_nombre}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl text-gray-900 mb-1">
                        {product.nombre}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Código: <span className="font-mono">{product.codigo}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Descripción del producto */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-600" />
                        Descripción del Producto
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {product.descripcion}
                      </p>
                    </div>

                    {/* Motivo del rechazo */}
                    {product.motivo_rechazo && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-bold text-red-900 mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Motivo por el cual fue marcado como peligroso
                        </h4>
                        <p className="text-sm text-red-800 whitespace-pre-wrap">
                          {product.motivo_rechazo}
                        </p>
                      </div>
                    )}

                    {/* Información del moderador y fecha */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            Detectado: {formatDate(product.fecha_deteccion_peligroso)}
                          </span>
                        </div>
                        {product.moderador_nombre && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span>
                              Por: {product.moderador_nombre} {product.moderador_apellido}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mensaje informativo - NO se puede apelar productos peligrosos */}
                      <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800 font-semibold">
                          No se puede apelar
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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

