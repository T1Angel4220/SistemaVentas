import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import { 
  Package, 
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import type { ProductDetail } from '../types/product.types';

interface VendorContact {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export const ContactVendorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [vendorInfo, setVendorInfo] = useState<VendorContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    mensaje: '',
    tipoContacto: 'whatsapp'
  });

  const loadProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/products/view/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        // Extraer información del vendedor
        setVendorInfo({
          nombre: data.data.vendedor_nombre || '',
          apellido: data.data.vendedor_apellido || '',
          correo: data.data.vendedor_correo || '',
          telefono: data.data.vendedor_telefono || '',
          direccion: data.data.vendedor_direccion || ''
        });
        
        // Pre-llenar datos del usuario si está logueado
        if (user) {
          setFormData(prev => ({
            ...prev,
            nombre: `${user.nombre} ${user.apellido}`,
            email: user.correo || '',
            telefono: user.telefono || ''
          }));
        }
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
  }, [id, showError, navigate, user]);

  useEffect(() => {
    // Forzar scroll al inicio
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
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

  const handleWhatsAppContact = () => {
    if (!vendorInfo?.telefono) {
      showError('Error', 'El vendedor no tiene número de teléfono disponible');
      return;
    }

    const message = `¡Hola! Me interesa tu producto "${product?.nombre}" por ${formatPrice(product?.precio || 0)}. ¿Está disponible?`;
    const whatsappUrl = `https://wa.me/506${vendorInfo.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    if (!vendorInfo?.correo) {
      showError('Error', 'El vendedor no tiene email disponible');
      return;
    }

    const subject = `Interés en tu producto: ${product?.nombre}`;
    const body = `Hola ${vendorInfo.nombre},\n\nMe interesa tu producto "${product?.nombre}" por ${formatPrice(product?.precio || 0)}.\n\n¿Está disponible? ¿Podríamos coordinar para verlo?\n\nGracias!`;
    const mailtoUrl = `mailto:${vendorInfo.correo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handlePhoneContact = () => {
    if (!vendorInfo?.telefono) {
      showError('Error', 'El vendedor no tiene número de teléfono disponible');
      return;
    }

    const phoneUrl = `tel:${vendorInfo.telefono}`;
    window.location.href = phoneUrl;
  };

  const handleSendMessage = () => {
    if (!formData.nombre.trim()) {
      showError('Error', 'El nombre es requerido');
      return;
    }

    if (!formData.telefono.trim()) {
      showError('Error', 'El teléfono es requerido');
      return;
    }

    if (!formData.mensaje.trim()) {
      showError('Error', 'El mensaje es requerido');
      return;
    }

    showWarning(
      '¿Enviar mensaje?',
      `¿Estás seguro de que quieres enviar este mensaje al vendedor ${vendorInfo?.nombre}?`,
      async () => {
        setSendingMessage(true);
        try {
          // Simular envío de mensaje
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          showSuccess(
            '¡Mensaje enviado!', 
            'Tu mensaje ha sido enviado al vendedor. Te responderá pronto.'
          );
          
          // Limpiar formulario
          setFormData(prev => ({
            ...prev,
            mensaje: ''
          }));
        } catch {
          showError('Error', 'Hubo un problema al enviar tu mensaje');
        } finally {
          setSendingMessage(false);
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
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cargando información...</h2>
          <p className="text-gray-600 text-lg">Obteniendo datos del vendedor</p>
        </div>
      </div>
    );
  }

  if (!product || !vendorInfo) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-8">
            <Link to={
              user?.tipo_usuario === 'moderador' 
                ? "/products/moderation" 
                : "/products"
            }>
              <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Regresar
              </Button>
            </Link>
            
            <div>
              <h1 className="text-4xl font-bold mb-2">Contactar Vendedor</h1>
              <p className="text-blue-100 text-lg">
                Conecta directamente con {vendorInfo.nombre} {vendorInfo.apellido}
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
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Producto de interés
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
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        {formatPrice(product.precio)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      {product.ubicacion_nombre || 'Ubicación no especificada'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Publicado: {new Date(product.fecha_publicacion).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información del vendedor y opciones de contacto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del vendedor */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-blue-600" />
                  Información del Vendedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {vendorInfo.nombre} {vendorInfo.apellido}
                        </h4>
                        <p className="text-sm text-gray-500">Vendedor</p>
                      </div>
                    </div>
                    
                    {vendorInfo.telefono && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span>{vendorInfo.telefono}</span>
                      </div>
                    )}
                    
                    {vendorInfo.correo && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span>{vendorInfo.correo}</span>
                      </div>
                    )}
                    
                    {vendorInfo.direccion && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>{vendorInfo.direccion}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">Opciones de contacto rápido</h4>
                    
                    {vendorInfo.telefono && (
                      <Button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    
                    {vendorInfo.telefono && (
                      <Button
                        onClick={handlePhoneContact}
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                    )}
                    
                    {vendorInfo.correo && (
                      <Button
                        onClick={handleEmailContact}
                        variant="outline"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de contacto */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageCircle className="h-6 w-6 mr-3 text-blue-600" />
                  Enviar mensaje
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Tu nombre *
                      </label>
                      <Input
                        type="text"
                        name="nombre"
                        placeholder="Tu nombre completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Tu teléfono *
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Tu email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      Mensaje *
                    </label>
                    <Textarea
                      name="mensaje"
                      placeholder="Hola, me interesa tu producto..."
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Información importante */}
                  <Alert className="border-blue-200 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Importante:</strong> Tu mensaje será enviado al vendedor junto con tus datos de contacto. 
                      El vendedor podrá responderte directamente por los medios que proporciones.
                    </AlertDescription>
                  </Alert>

                  {/* Botón de enviar mensaje */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium rounded-xl"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Enviando mensaje...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5 mr-3" />
                          Enviar mensaje
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
