import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  AlertCircle,
  ArrowLeft,
  Camera,
  AlertTriangle,
  Shield,
  MessageSquare
} from 'lucide-react';
import type { Product, ProductsResponse } from '../types/product.types';
import { AppealProductDialog } from '../components/ui/AppealProductDialog';

export const MyProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangerousProductsCount, setDangerousProductsCount] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_prev: false
  });

  const [filters, setFilters] = useState({
    estado: '',
    page: 1,
    limit: 12
  });

  // Estado para modal de apelación
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [selectedProductForAppeal, setSelectedProductForAppeal] = useState<{
    id: number;
    nombre: string;
    motivo_rechazo?: string;
  } | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`http://localhost:3001/api/products/my/products?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDangerousProductsCount = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/my-dangerous`, {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDangerousProductsCount(data.data.length);
      }
    } catch (error) {
      console.error('Error al cargar productos peligrosos:', error);
    }
  }, []);

  useEffect(() => {
    if (user && (user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'administrador')) {
      loadProducts();
      loadDangerousProductsCount();
    }
  }, [user, filters, loadProducts, loadDangerousProductsCount]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };


  const handleEditProduct = (productId: number) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDeleteProduct = async (productId: number, productName: string, productEstado: string) => {
    // Verificar si el producto está en revisión
    if (productEstado === 'pendiente_revision' && user?.tipo_usuario !== 'administrador') {
      showError(
        '⏳ Producto en Revisión',
        'No puedes eliminar este producto mientras esté pendiente de revisión. Espera a que los moderadores lo revisen.'
      );
      return;
    }

    // Verificar si el producto está suspendido
    if (productEstado === 'suspendido' && user?.tipo_usuario !== 'administrador') {
      showError(
        '🚫 Producto Suspendido',
        'No puedes eliminar este producto porque ha sido suspendido por los moderadores. Contacta con ellos para más información.'
      );
      return;
    }

    showWarning(
      '¿Eliminar producto?',
      `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${apiService.getToken()}`
            }
          });

          const data = await response.json();
          if (data.success) {
            showSuccess(
              '¡Producto eliminado!',
              `"${productName}" ha sido eliminado correctamente.`,
              () => loadProducts()
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

  const handleAppealProduct = (product: Product) => {
    setSelectedProductForAppeal({
      id: product.id,
      nombre: product.nombre,
      motivo_rechazo: product.motivo_rechazo || undefined
    });
    setAppealModalOpen(true);
  };

  const handleAppealSuccess = () => {
    showSuccess(
      '¡Apelación enviada!',
      'Tu apelación ha sido enviada correctamente. Será revisada por un moderador.',
      () => loadProducts()
    );
    setAppealModalOpen(false);
    setSelectedProductForAppeal(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (product: Product) => {
    const { estado, disponibilidad, tipo, es_peligroso } = product;
    
    // Si es peligroso, mostrar badge rojo
    if (estado === 'peligroso' || es_peligroso) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          {tipo === 'servicio' ? 'Servicio Peligroso' : 'Producto Peligroso'}
        </Badge>
      );
    }
    
    // Si está activo pero sin stock
    if (estado === 'activo' && !disponibilidad) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          {tipo === 'servicio' ? 'Servicio sin Stock' : 'Producto sin Stock'}
        </Badge>
      );
    }
    
    // Estados normales
    const statusConfig = {
      activo: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: tipo === 'servicio' ? 'Servicio Activo' : 'Producto Activo'
      },
      pendiente_revision: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendiente de Revisión'
      },
      rechazado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rechazado'
      },
      suspendido: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Suspendido'
      },
      en_apelacion: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'En Apelación'
      }
    };
    
    const config = statusConfig[estado as keyof typeof statusConfig] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      text: 'Estado Desconocido'
    };
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (tipo: string) => {
    return tipo === 'servicio' ? <Calendar className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  const getStatusMessage = (estado: string) => {
    const messages = {
      activo: 'Tu producto está activo y visible para los compradores.',
      pendiente_revision: 'Tu producto está siendo revisado por los moderadores.',
      rechazado: 'Tu producto fue rechazado. Haz clic en "Corregir" para ver el motivo y hacer los cambios necesarios.',
      suspendido: 'Tu producto ha sido suspendido por una violación grave. Puedes apelar esta decisión para solicitar una revisión.',
      peligroso: 'Tu producto fue marcado como peligroso. No se puede editar ni apelar. Contacta al equipo de moderación si crees que es un error.',
      en_apelacion: 'Tu apelación está siendo revisada por los moderadores. Recibirás una respuesta pronto.'
    };
    return messages[estado as keyof typeof messages] || 'Estado desconocido';
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso denegado
            </h3>
            <p className="text-gray-600 mb-4">
              Solo los vendedores pueden acceder a esta página.
            </p>
            <Link to="/products">
              <Button>Volver a productos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con gradiente azul-púrpura - RESPONSIVE MEJORADO */}
      <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Layout responsive: columna en móvil, fila en desktop */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Sección izquierda: Botón Volver + Título */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
              {/* Botón Volver - RESPONSIVE */}
              <Link to="/products" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Volver</span>
                </Button>
              </Link>
              
              {/* Título y descripción - RESPONSIVE */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
                  Mis Productos
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Gestiona tus productos y servicios publicados
                </p>
              </div>
            </div>
            
            {/* Botón Crear Producto - RESPONSIVE */}
            <Link to="/products/create" className="w-full sm:w-auto">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto flex items-center justify-center space-x-2">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Crear Producto</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Alerta de productos peligrosos */}
        {dangerousProductsCount > 0 && (
          <div className="mb-6">
            <Alert className="border-l-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="ml-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-bold text-red-900 mb-1">
                      ⚠️ Tienes {dangerousProductsCount} producto{dangerousProductsCount > 1 ? 's' : ''} marcado{dangerousProductsCount > 1 ? 's' : ''} como peligroso{dangerousProductsCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-800">
                      Estos productos no son visibles para ti ni para los compradores. 
                      Haz clic en "Ver Historial" para ver los motivos y poder apelar si consideras que hay un error.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/my-products/dangerous')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Ver Historial
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Estadísticas mejoradas - RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-700">Total productos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{pagination.total_items}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-700">Activos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">
                    {products.filter(p => p.estado === 'activo' && p.disponibilidad).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-700">Pendientes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1">
                    {products.filter(p => p.estado === 'pendiente_revision').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-700">Rechazados</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1">
                    {products.filter(p => p.estado === 'rechazado').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros mejorados - RESPONSIVE */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col space-y-4">
              <div className="w-full">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Filtrar por estado</label>
                <select 
                  value={filters.estado} 
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full flex h-10 sm:h-12 items-center justify-between rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-gray-300 transition-colors"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pendiente_revision">Pendientes de revisión</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="text-xs sm:text-sm font-medium text-blue-700 text-center sm:text-left">
                  Mostrando <span className="font-bold text-blue-900">{products.length}</span> de <span className="font-bold text-blue-900">{pagination.total_items}</span> productos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de productos - RESPONSIVE */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No tienes productos publicados
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Comienza creando tu primer producto o servicio y expande tu negocio
              </p>
              <Link to="/products/create">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4">
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-medium">Crear mi primer producto</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <Card key={product.id} className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group">
                <div className="relative">
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {product.total_imagenes > 0 && product.primera_imagen ? (
                      <>
                        <img
                          src={product.primera_imagen}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                        />
                        {/* Indicador de múltiples imágenes */}
                        {product.total_imagenes > 1 && (
                          <div className="absolute bottom-3 right-3">
                            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
                              +{product.total_imagenes - 1} más
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                          product.tipo === 'servicio'
                            ? 'bg-gradient-to-br from-purple-200 to-blue-300'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300'
                        }`}>
                          <Camera className={`h-10 w-10 ${
                            product.tipo === 'servicio' ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Sin Foto</p>
                        <p className="text-xs text-gray-400">
                          {product.total_imagenes > 0 ? `${product.total_imagenes} imagen${product.total_imagenes !== 1 ? 'es' : ''}` : 'No disponible'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Badges mejorados */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200">
                      {getStatusBadge(product)}
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200">
                      <Badge variant="outline" className="bg-transparent border-gray-300 text-gray-700">
                        {getTypeIcon(product.tipo)}
                        <span className="ml-1 capitalize text-xs">{product.tipo}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">
                        {product.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">Código: {product.codigo}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {product.descripcion}
                    </p>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(product.precio)}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {product.categoria_nombre}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Publicado: {formatDate(product.fecha_publicacion)}
                    </div>
                    
                    {/* Mensaje de estado mejorado */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                      <div className="text-xs text-blue-700 font-medium leading-relaxed">
                        {getStatusMessage(product.estado)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción - UNIFORMES CON ProductsPage.tsx */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
                    <Link to={`/products/${product.id}`} className="flex-1 min-w-[120px]">
                      <Button className="w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span>Ver detalles</span>
                      </Button>
                    </Link>
                    
                    {/* Botón para productos rechazados - Redirige a EDITAR */}
                    {product.estado === 'rechazado' && (
                      <Button 
                        onClick={() => handleEditProduct(product.id)}
                        className="flex-1 min-w-[120px] h-10 sm:h-11 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span>Corregir</span>
                      </Button>
                    )}
                    
                    {/* Botón para productos suspendidos - Abre modal de apelación formal */}
                    {product.estado === 'suspendido' && (
                      <Button 
                        onClick={() => handleAppealProduct(product)}
                        className="flex-1 min-w-[120px] h-10 sm:h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span>Apelar</span>
                      </Button>
                    )}
                    
                    {product.estado !== 'rechazado' && !product.es_peligroso && product.estado !== 'pendiente_revision' && product.estado !== 'suspendido' && (
                      <Button 
                        onClick={() => handleEditProduct(product.id)}
                        className="h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0"
                        title="Editar producto"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                    
                    {/* Botón de eliminar - Uniformado con estilo de ProductsPage */}
                    <Button
                      onClick={() => handleDeleteProduct(product.id, product.nombre, product.estado)}
                      disabled={product.es_peligroso || product.estado === 'peligroso' || product.estado === 'pendiente_revision' || product.estado === 'suspendido'}
                      className={`h-10 w-10 sm:h-11 sm:w-11 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0 ${
                        product.es_peligroso || product.estado === 'peligroso' || product.estado === 'pendiente_revision' || product.estado === 'suspendido'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                      }`}
                      title={
                        product.estado === 'pendiente_revision' ? 'No puedes eliminar un producto en revisión' :
                        product.estado === 'suspendido' ? 'No puedes eliminar un producto suspendido' :
                        'Eliminar producto'
                      }
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación mejorada */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className="h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Anterior
            </Button>
            
            <div className="flex space-x-2">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.current_page;
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-11 rounded-xl font-medium ${
                      isCurrentPage 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg' 
                        : 'border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="h-11 px-6 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Siguiente
            </Button>
          </div>
        )}
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

      {/* Modal de Apelación */}
      {selectedProductForAppeal && (
        <AppealProductDialog
          isOpen={appealModalOpen}
          onClose={() => {
            setAppealModalOpen(false);
            setSelectedProductForAppeal(null);
          }}
          productId={selectedProductForAppeal.id}
          productName={selectedProductForAppeal.nombre}
          motivoRechazo={selectedProductForAppeal.motivo_rechazo}
          onSuccess={handleAppealSuccess}
        />
      )}
    </div>
  );
};
