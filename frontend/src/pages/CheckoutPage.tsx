import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  ArrowLeft,
  CreditCard,
  User,
  MapPin,
  ShoppingCart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';

export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cantidad: 1,
    metodoPago: 'transferencia',
    telefono: '',
    direccionEntrega: '',
    notas: ''
  });

  const loadProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
      } else {
        showError('Error', data.message || 'Producto no encontrado');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      showError('Error', 'Error al cargar el producto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, showError, navigate]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = () => {
    if (!user) {
      showError('Error', 'Debes iniciar sesión para realizar una compra');
      return;
    }

    if (user.tipo_usuario !== 'comprador') {
      showError('Error', 'Solo los compradores pueden realizar compras');
      return;
    }

    // Validar campos requeridos
    if (!formData.telefono.trim()) {
      showError('Error', 'El teléfono es requerido');
      return;
    }

    if (!formData.direccionEntrega.trim()) {
      showError('Error', 'La dirección de entrega es requerida');
      return;
    }

    showWarning(
      '¿Confirmar compra?',
      `¿Estás seguro de que quieres comprar "${product?.nombre}" por $${product?.precio}?`,
      async () => {
        setProcessing(true);
        try {
          // Simular proceso de compra
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          showSuccess(
            '¡Compra exitosa!', 
            'Tu pedido ha sido procesado. El vendedor se pondrá en contacto contigo pronto.'
          );
          
          // Redirigir después de 3 segundos
          setTimeout(() => {
            navigate('/products');
          }, 3000);
        } catch {
          showError('Error', 'Hubo un problema al procesar tu compra');
        } finally {
          setProcessing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <ShoppingCart className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Preparando compra...</h2>
          <p className="text-gray-600 text-lg">Cargando información del producto</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
            <p className="text-gray-600 text-lg mb-8">El producto que buscas no está disponible</p>
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

  if (!user || user.tipo_usuario !== 'comprador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {!user ? 'Inicia sesión' : 'Acceso restringido'}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {!user 
                ? 'Debes iniciar sesión como comprador para realizar compras'
                : 'Solo los compradores pueden realizar compras'
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-8">
            <Link to="/products">
              <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-green-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Regresar
              </Button>
            </Link>
            
            <div>
              <h1 className="text-4xl font-bold mb-2">Finalizar Compra</h1>
              <p className="text-green-100 text-lg">
                Completa los datos para procesar tu pedido
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del producto */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-600" />
                  Resumen del pedido
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    {product.imagenes.length > 0 ? (
                      <img
                        src={product.imagenes[0].url_imagen}
                        alt={product.nombre}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {product.nombre}
                      </h4>
                      <p className="text-xs text-gray-500">{product.categoria_nombre}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-medium">{formData.cantidad}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Precio unitario:</span>
                      <span className="font-medium">{formatPrice(product.precio)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">
                        {formatPrice(product.precio * formData.cantidad)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de compra */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-3 text-green-600" />
                  Información de la compra
                </h3>
                
                <div className="space-y-6">
                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      name="cantidad"
                      min="1"
                      max="10"
                      value={formData.cantidad}
                      onChange={handleInputChange}
                      className="w-32"
                    />
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de pago
                    </label>
                    <select
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
                    >
                      <option value="transferencia">Transferencia bancaria</option>
                      <option value="efectivo">Pago en efectivo</option>
                      <option value="contraentrega">Contra entrega</option>
                    </select>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Teléfono de contacto *
                    </label>
                    <Input
                      type="tel"
                      name="telefono"
                      placeholder="Ej: 8888-8888"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Dirección de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Dirección de entrega *
                    </label>
                    <textarea
                      name="direccionEntrega"
                      placeholder="Ingresa tu dirección completa para la entrega"
                      value={formData.direccionEntrega}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  {/* Notas adicionales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      name="notas"
                      placeholder="Instrucciones especiales para la entrega..."
                      value={formData.notas}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Información importante */}
                  <Alert className="border-blue-200 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Importante:</strong> Una vez confirmada la compra, el vendedor se pondrá en contacto contigo 
                      para coordinar la entrega y el pago. Los datos que proporciones serán compartidos con el vendedor.
                    </AlertDescription>
                  </Alert>

                  {/* Botón de confirmar compra */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={processing}
                      className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium rounded-xl"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Procesando compra...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-3" />
                          Confirmar compra - {formatPrice(product.precio * formData.cantidad)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
