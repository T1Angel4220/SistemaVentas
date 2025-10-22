import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useApiData';
import { useAlert } from '../hooks/useAlert';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertDialog } from '../components/ui/AlertDialog';
import HierarchicalCategorySearch from '../components/ui/HierarchicalCategorySearch';
import { ServiceDetailsForm } from '../components/ui/ServiceDetailsForm';
import { VisibilityToggle } from '../components/ui/VisibilityToggle';
import { 
  Package, 
  Calendar, 
  Upload, 
  X, 
  Save,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  MapPin,
  Info
} from 'lucide-react';
import type { ProductForm, ImageFile } from '../types/product.types';

export const CreateProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletedExistingImages, setDeletedExistingImages] = useState<number[]>([]);

  // Usar hooks optimizados para evitar múltiples requests
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [form, setForm] = useState<ProductForm>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    tipo: 'producto',
    categoria_id: '',
    ubicacion_id: '',
    ubicacion_provincia: '',
    ubicacion_canton: '',
    ubicacion_distrito: '',
    ubicacion_direccion: '',
    disponibilidad: false, // Por defecto no visible hasta aprobación
    estado: 'pendiente_revision', // Por defecto pendiente de revisión
    horario_atencion: '',
    horario_inicio: '',
    horario_fin: '',
    dias_disponibles: [],
    duracion_estimada: ''
  });

  // Función para cargar datos del producto en modo edición
  const loadProductData = useCallback(async (productId: string) => {
    try {
      setLoadingData(true);
      const response = await fetch(`http://localhost:3001/api/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        const product = data.data;
        setIsEditMode(true);
        
        // Cargar datos del formulario
        setForm({
          codigo: product.codigo || '',
          nombre: product.nombre || '',
          descripcion: product.descripcion || '',
          precio: product.precio ? product.precio.toString() : '',
          tipo: product.tipo || 'producto',
          categoria_id: product.categoria_id?.toString() || '',
          ubicacion_id: product.ubicacion_id?.toString() || '',
          ubicacion_provincia: product.provincia || '',
          ubicacion_canton: product.canton || '',
          ubicacion_distrito: product.distrito || '',
          ubicacion_direccion: product.ubicacion_nombre || '',
          disponibilidad: product.disponibilidad === true, // Solo true si explícitamente es true
          estado: product.estado || 'pendiente_revision',
          horario_atencion: product.servicio?.horario_atencion || '',
          horario_inicio: '', // Se extraerá del horario_atencion
          horario_fin: '', // Se extraerá del horario_atencion
          dias_disponibles: product.servicio?.dias_disponibles ? product.servicio.dias_disponibles.split(',') : [],
          duracion_estimada: product.servicio?.duracion_estimada || ''
        });

        // Cargar imágenes existentes
        if (product.imagenes && product.imagenes.length > 0) {
          const imageUrls = product.imagenes.map((img: { url_imagen: string }) => img.url_imagen);
          setExistingImages(imageUrls);
        } else {
          setExistingImages([]);
        }
        
        // Limpiar estado de imágenes eliminadas
        setDeletedExistingImages([]);
      } else {
        showError('Error', 'No se pudo cargar el producto para editar');
        navigate('/my-products');
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      showError('Error', 'Error al cargar el producto');
      navigate('/my-products');
    } finally {
      setLoadingData(false);
    }
  }, [showError, navigate]);

  useEffect(() => {
    // Verificar permisos
    if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
      navigate('/products');
      return;
    }

    // Si hay un ID en la URL, cargar datos del producto para editar
    if (id) {
      loadProductData(id);
    }
  }, [user, navigate, id, loadProductData]);

  const handleInputChange = (field: keyof ProductForm, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleVisibilityToggle = (visible: boolean) => {
    setForm(prev => ({ ...prev, disponibilidad: visible }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 5;
    
    // Calcular imágenes existentes que NO han sido eliminadas (modo edición)
    const existingImagesCount = isEditMode 
      ? existingImages.length - deletedExistingImages.length 
      : 0;
    
    // Total actual de imágenes
    const currentTotal = existingImagesCount + images.length;
    
    // Slots disponibles
    const remainingSlots = maxImages - currentTotal;
    
    // Validar que haya espacio disponible
    if (remainingSlots <= 0) {
      setErrors(prev => ({ 
        ...prev, 
        images: `Ya tienes el máximo de ${maxImages} imágenes. ${isEditMode ? 'Elimina algunas imágenes existentes para agregar nuevas.' : ''}` 
      }));
      event.target.value = '';
      return;
    }

    const newImages: ImageFile[] = [];
    
    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Solo se permiten archivos de imagen' }));
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Las imágenes deben ser menores a 5MB' }));
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        file,
        preview,
        id
      });
    });

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      // Limpiar error de imágenes si había
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    } else if (files.length > remainingSlots) {
      // Informar al usuario si intentó subir más de las permitidas
      setErrors(prev => ({ 
        ...prev, 
        images: `Solo puedes agregar ${remainingSlots} imagen${remainingSlots !== 1 ? 'es' : ''} más. Límite: ${maxImages} imágenes totales.` 
      }));
    }

    // Resetear el input para permitir subir el mismo archivo de nuevo
    event.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const removeExistingImage = (index: number) => {
    setDeletedExistingImages(prev => [...prev, index]);
  };

  const restoreExistingImage = (index: number) => {
    setDeletedExistingImages(prev => prev.filter(i => i !== index));
  };

  const restoreAllExistingImages = () => {
    setDeletedExistingImages([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (form.codigo.length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    }

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (form.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!form.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (form.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!form.precio.trim()) {
      newErrors.precio = 'El precio es requerido';
    } else {
      const price = parseFloat(form.precio);
      if (isNaN(price) || price <= 0) {
        newErrors.precio = 'El precio debe ser un número mayor a 0';
      }
    }

    if (!form.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }

    if (form.tipo === 'servicio') {
      if (!form.horario_inicio.trim()) {
        newErrors.horario_inicio = 'La hora de inicio es requerida para servicios';
      }
      if (!form.horario_fin.trim()) {
        newErrors.horario_fin = 'La hora de fin es requerida para servicios';
      }
      if (form.dias_disponibles.length === 0) {
        newErrors.dias_disponibles = 'Debe seleccionar al menos un día disponible';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const actionText = isEditMode ? 'guardar los cambios' : 'crear el producto';
    const productName = form.nombre || 'este producto';
    
    showWarning(
      `¿${isEditMode ? 'Guardar cambios' : 'Crear producto'}?`,
      `¿Estás seguro de que quieres ${actionText} "${productName}"?`,
      submitProduct,
      undefined // onCancel - no necesita hacer nada especial
    );
  };

  const submitProduct = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar datos del formulario (excluyendo campos específicos de servicio que se procesarán por separado)
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'horario_inicio' || key === 'horario_fin' || key === 'dias_disponibles') {
          return; // Estos se procesarán por separado
        }
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Procesar datos específicos del servicio
      if (form.tipo === 'servicio') {
        // Construir horario_atencion desde horario_inicio y horario_fin
        if (form.horario_inicio && form.horario_fin) {
          const formatTime = (time24: string) => {
            const [hours, minutes] = time24.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
          };
          
          const horarioCompleto = `${formatTime(form.horario_inicio)} - ${formatTime(form.horario_fin)}`;
          formData.append('horario_atencion', horarioCompleto);
        }
        
        // Convertir array de días a string separado por comas
        if (form.dias_disponibles.length > 0) {
          formData.append('dias_disponibles', form.dias_disponibles.join(', '));
        }
      }

      // Agregar imágenes (solo si hay nuevas)
      images.forEach((imageFile) => {
        formData.append('images', imageFile.file);
      });

      // Agregar información de imágenes eliminadas (solo en modo edición)
      console.log('🔍 Debug imágenes:', {
        isEditMode,
        deletedExistingImages,
        length: deletedExistingImages.length
      });
      
      if (isEditMode) {
        // Siempre enviar deleted_images, incluso si está vacío
        const deletedImagesString = deletedExistingImages.length > 0 
          ? JSON.stringify(deletedExistingImages) 
          : '[]';
        
        console.log('✅ Agregando deleted_images al formData:', deletedImagesString);
        formData.append('deleted_images', deletedImagesString);
        
        // Debug: Verificar que se agregó correctamente
        console.log('🔍 Verificando que se agregó deleted_images:', formData.has('deleted_images'));
      } else {
        console.log('❌ No se agregaron deleted_images (no es modo edición)');
      }

      const url = isEditMode 
        ? `http://localhost:3001/api/products/${id}`
        : 'http://localhost:3001/api/products';
      
      const method = isEditMode ? 'PUT' : 'POST';

      // Debug: Log de los datos que se van a enviar
      console.log('Sending data:', {
        isEditMode,
        url,
        method,
        formData: Object.fromEntries(formData.entries())
      });
      
      // Debug adicional: Verificar si deleted_images está en formData
      console.log('🔍 Verificando FormData:', {
        hasDeletedImages: formData.has('deleted_images'),
        deletedImagesValue: formData.get('deleted_images'),
        allFormDataKeys: Array.from(formData.keys())
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        const actionText = isEditMode ? 'actualizado' : 'creado';
        
        // Construir mensaje basado en información adicional
        let mensajeExito = `El producto ha sido ${actionText} correctamente.`;
        let tipoAlerta = 'success';
        
        if (data.informacion) {
          if (data.informacion.estado === 'peligroso') {
            tipoAlerta = 'warning';
            mensajeExito = `⚠️ Producto ${actionText} pero marcado como peligroso automáticamente. Motivo: ${data.informacion.motivo}`;
          } else if (data.informacion.requiere_revision) {
            tipoAlerta = 'info';
            mensajeExito = `ℹ️ Producto ${actionText} y enviado para revisión. ${data.informacion.motivo || ''}`;
          }
        }
        
        if (tipoAlerta === 'warning') {
          showWarning(
            'Producto Marcado como Peligroso', 
            mensajeExito,
            () => navigate(`/products/${data.data.id || id}`)
          );
        } else if (tipoAlerta === 'info') {
          showSuccess(
            'Producto Enviado para Revisión', 
            mensajeExito,
            () => navigate(`/products/${data.data.id || id}`)
          );
        } else {
          showSuccess(
            '¡Éxito!', 
            mensajeExito,
            () => navigate(`/products/${data.data.id || id}`)
          );
        }
      } else {
        // Manejar errores específicos del servidor
        if (data.errors) {
          setErrors(data.errors);
        } else {
          const actionText = isEditMode ? 'actualizar' : 'crear';
          setErrors({ general: data.message || `Error al ${actionText} el producto` });
        }
      }
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} producto:`, error);
      const actionText = isEditMode ? 'actualizar' : 'crear';
      setErrors({ general: `Error al ${actionText} el producto. Por favor intenta nuevamente.` });
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return null;
  }

  // Mostrar carga mientras se cargan los datos del producto en modo edición
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Package className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cargando producto...</h2>
          <p className="text-gray-600 text-lg">Obteniendo información para editar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header mejorado - ESTILO UNIFICADO */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/my-products')}
                className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
                  {isEditMode ? 'Editar' : 'Crear'} {form.tipo === 'producto' ? 'Producto' : 'Servicio'}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {isEditMode 
                    ? `Modifica la información de tu ${form.tipo}` 
                    : `Completa la información para publicar tu ${form.tipo}`
                  }
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                {form.tipo === 'producto' ? (
                  <Package className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 -mt-12 relative z-10">
        {/* Alertas */}
        {errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {categoriesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar categorías: {categoriesError}
            </AlertDescription>
          </Alert>
        )}


        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Producto creado exitosamente! Redirigiendo...
            </AlertDescription>
          </Alert>
        )}

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de publicación - MEJORADO */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tipo de Publicación</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'producto')}
                  className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    form.tipo === 'producto'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <Package className="h-6 w-6" />
                  <span className="font-semibold text-base">Producto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'servicio')}
                  className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    form.tipo === 'servicio'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="font-semibold text-base">Servicio</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Información básica - MEJORADO */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información Básica</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Campo Código */}
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="flex items-center text-sm font-semibold text-gray-700">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <Package className="h-3 w-3 text-blue-600" />
                    </div>
                    Código del {form.tipo} *
                  </Label>
                  <Input
                    id="codigo"
                    value={form.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ej: PROD-001"
                    className={`w-full h-12 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                      errors.codigo 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.codigo && (
                    <p className="text-red-500 text-xs font-medium flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.codigo}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Identificador único (mínimo 3 caracteres)
                  </p>
                </div>

                {/* Campo Precio - MEJORADO CON AYUDA VISUAL */}
                <div className="space-y-2">
                  <Label htmlFor="precio" className="flex items-center text-sm font-semibold text-gray-700">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                    </div>
                    Precio (USD) *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                      $
                    </div>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precio}
                      onChange={(e) => handleInputChange('precio', e.target.value)}
                      placeholder="0.00"
                      className={`w-full h-12 pl-8 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                        errors.precio 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-red-500 text-xs font-medium flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.precio}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Acepta decimales (Ej: 25.99)
                  </p>
                </div>
              </div>

              {/* Campo Nombre */}
              <div className="mb-6 space-y-2">
                <Label htmlFor="nombre" className="flex items-center text-sm font-semibold text-gray-700">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                    {form.tipo === 'servicio' ? (
                      <Calendar className="h-3 w-3 text-purple-600" />
                    ) : (
                      <Package className="h-3 w-3 text-purple-600" />
                    )}
                  </div>
                  Nombre del {form.tipo} *
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder={`Nombre descriptivo del ${form.tipo}`}
                  className={`w-full h-12 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                    errors.nombre 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs font-medium flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Campo Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="flex items-center text-sm font-semibold text-gray-700">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">
                    <AlertCircle className="h-3 w-3 text-indigo-600" />
                  </div>
                  Descripción *
                </Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder={`Describe detalladamente tu ${form.tipo}...`}
                  rows={5}
                  className={`w-full rounded-xl border-2 transition-all resize-none shadow-sm hover:shadow-md ${
                    errors.descripcion 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.descripcion ? (
                    <p className="text-red-500 text-xs font-medium flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Mínimo 10 caracteres</p>
                  )}
                  <p className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    form.descripcion.length < 10 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {form.descripcion.length} caracteres
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos específicos de servicio */}
          {form.tipo === 'servicio' && (
            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <ServiceDetailsForm
                  horarioInicio={form.horario_inicio}
                  horarioFin={form.horario_fin}
                  diasDisponibles={form.dias_disponibles}
                  duracionEstimada={form.duracion_estimada}
                  onHorarioInicioChange={(time) => handleInputChange('horario_inicio', time)}
                  onHorarioFinChange={(time) => handleInputChange('horario_fin', time)}
                  onDiasDisponiblesChange={(days) => handleInputChange('dias_disponibles', days)}
                  onDuracionEstimadaChange={(duration) => handleInputChange('duracion_estimada', duration)}
                />
                
                {/* Mostrar errores de validación */}
                {errors.horario_inicio && (
                  <p className="text-red-500 text-sm mt-2">{errors.horario_inicio}</p>
                )}
                {errors.horario_fin && (
                  <p className="text-red-500 text-sm mt-2">{errors.horario_fin}</p>
                )}
                    {errors.dias_disponibles && (
                  <p className="text-red-500 text-sm mt-2">{errors.dias_disponibles}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Categoría y Ubicación - BLOQUES MÁS DEFINIDOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categoría - Bloque mejorado */}
            <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Categoría *</h2>
                    <p className="text-xs text-gray-600">Selecciona la categoría más apropiada</p>
                  </div>
                </div>
                <HierarchicalCategorySearch
                  categories={categories}
                  selectedCategoryId={form.categoria_id}
                  onCategorySelect={(categoryId) => {
                    handleInputChange('categoria_id', categoryId);
                  }}
                  loading={categoriesLoading}
                  error={errors.categoria_id}
                  placeholder="Buscar categoría (ej: Hogar > Muebles, Servicios > Diseño...)"
                />
              </CardContent>
            </Card>

            {/* Ubicación - Bloque mejorado con ayuda contextual */}
            <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-white rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Ubicación</h2>
                    <p className="text-xs text-gray-600">Indica dónde se encuentra tu {form.tipo}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Provincia - CON TOOLTIP */}
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion_provincia" className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-green-600" />
                        Provincia *
                      </Label>
                      <Input
                        id="ubicacion_provincia"
                        type="text"
                        placeholder="Ej: San José, Alajuela..."
                        value={form.ubicacion_provincia}
                        onChange={(e) => handleInputChange('ubicacion_provincia', e.target.value)}
                        className="h-11 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm hover:shadow-md transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Escribe la provincia de Costa Rica
                      </p>
                    </div>

                    {/* Cantón - CON TOOLTIP */}
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion_canton" className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-green-600" />
                        Cantón *
                      </Label>
                      <Input
                        id="ubicacion_canton"
                        type="text"
                        placeholder="Ej: Santa Ana, Escazú..."
                        value={form.ubicacion_canton}
                        onChange={(e) => handleInputChange('ubicacion_canton', e.target.value)}
                        className="h-11 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm hover:shadow-md transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Escribe el cantón correspondiente
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Distrito */}
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion_distrito" className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                        Distrito
                        <span className="ml-1 text-xs text-gray-500">(opcional)</span>
                      </Label>
                      <Input
                        id="ubicacion_distrito"
                        type="text"
                        placeholder="Ej: Pozos, Uruca..."
                        value={form.ubicacion_distrito}
                        onChange={(e) => handleInputChange('ubicacion_distrito', e.target.value)}
                        className="h-11 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm hover:shadow-md transition-all"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion_direccion" className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-green-600" />
                        Dirección específica *
                      </Label>
                      <Input
                        id="ubicacion_direccion"
                        type="text"
                        placeholder="Ej: 100m norte del supermercado"
                        value={form.ubicacion_direccion}
                        onChange={(e) => handleInputChange('ubicacion_direccion', e.target.value)}
                        className="h-11 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm hover:shadow-md transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información de ayuda mejorada */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-700">
                      <p className="font-semibold mb-1">Consejos para ubicación:</p>
                      <ul className="space-y-0.5">
                        <li>• Escribe la información lo más precisa posible</li>
                        <li>• Los compradores verán esta información para contactarte</li>
                        <li>• Campos con * son obligatorios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toggle de Visibilidad - Solo en modo edición y si el producto está activo */}
          {isEditMode && form.estado === 'activo' && (
            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidad en Stock</h2>
                <VisibilityToggle
                  isVisible={form.disponibilidad}
                  onChange={handleVisibilityToggle}
                  label=""
                />
                <p className="text-sm text-gray-500 mt-3">
                  {form.disponibilidad 
                    ? '✅ Tu producto está disponible en stock y los clientes pueden comprarlo' 
                    : '❌ Tu producto está sin stock temporalmente (sin stock)'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mensaje informativo para productos no activos */}
          {isEditMode && form.estado !== 'activo' && (
            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Estado del Producto</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {form.estado === 'pendiente_revision' 
                        ? 'Tu producto está pendiente de revisión por parte de los moderadores. Una vez aprobado, podrás controlar su disponibilidad en stock.'
                        : form.estado === 'rechazado'
                        ? 'Tu producto fue rechazado. Puedes apelar la decisión o editarlo y volver a enviarlo.'
                        : form.estado === 'peligroso'
                        ? 'Tu producto fue marcado como peligroso y requiere revisión urgente. No puede ser editado hasta que sea revisado.'
                        : 'Tu producto no está aprobado y no será visible para los clientes.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Imágenes - VALIDACIÓN MEJORADA */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Upload className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isEditMode ? 'Gestionar Imágenes' : 'Imágenes del Producto'}
                    </h2>
                    <p className="text-xs text-gray-600">Máximo 5 imágenes por producto</p>
                  </div>
                </div>
                {(() => {
                  const existingImagesCount = isEditMode 
                    ? existingImages.length - deletedExistingImages.length 
                    : 0;
                  const totalImages = existingImagesCount + images.length;
                  const maxImages = 5;
                  const isAtLimit = totalImages >= maxImages;
                  
                  return (
                    <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      isAtLimit 
                        ? 'bg-red-100 text-red-700' 
                        : totalImages >= 3 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {totalImages}/{maxImages}
                    </div>
                  );
                })()}
              </div>
              
              {(() => {
                const existingImagesCount = isEditMode 
                  ? existingImages.length - deletedExistingImages.length 
                  : 0;
                const totalImages = existingImagesCount + images.length;
                const maxImages = 5;
                const isAtLimit = totalImages >= maxImages;
                
                return (
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isAtLimit 
                      ? 'border-red-300 bg-red-50/50 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                  }`}>
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isAtLimit}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`${isAtLimit ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${
                        isAtLimit ? 'text-red-400' : 'text-purple-400'
                      }`} />
                      <p className={`font-semibold mb-2 text-base ${
                        isAtLimit ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {isAtLimit
                          ? '❌ Máximo de imágenes alcanzado'
                          : isEditMode 
                          ? '📸 Click para agregar nuevas imágenes'
                          : '📸 Click para subir imágenes'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isEditMode 
                          ? `Tienes ${existingImagesCount} imagen${existingImagesCount !== 1 ? 'es' : ''} existente${existingImagesCount !== 1 ? 's' : ''} | Puedes agregar ${maxImages - totalImages} más`
                          : 'Máximo 5 imágenes, hasta 5MB cada una'
                        }
                      </p>
                      {isEditMode && isAtLimit && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          💡 Elimina imágenes existentes para agregar nuevas
                        </p>
                      )}
                    </label>
                  </div>
                );
              })()}

              {errors.images && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.images}</AlertDescription>
                </Alert>
              )}

              {/* Preview de imágenes existentes (modo edición) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Imágenes actuales</h3>
                    <div className="flex items-center space-x-2">
                      {deletedExistingImages.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          {deletedExistingImages.length} marcada{deletedExistingImages.length !== 1 ? 's' : ''} para eliminar
                        </span>
                      )}
                      {deletedExistingImages.length > 0 && (
                        <button
                          type="button"
                          onClick={restoreAllExistingImages}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                        >
                          Restaurar todas
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingImages.map((imageUrl, index) => {
                      const isDeleted = deletedExistingImages.includes(index);
                      
                      // No mostrar imágenes marcadas para eliminar
                      if (isDeleted) {
                        return null;
                      }
                      
                      return (
                        <div
                          key={`existing-${index}`}
                          className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200"
                        >
                          <img
                            src={imageUrl}
                            alt={`Imagen existente ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          
                          {/* Badge de estado */}
                          <div className="absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">
                            Actual
                          </div>

                          {/* Botón de eliminar */}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Sección de imágenes eliminadas */}
                  {deletedExistingImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes eliminadas:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {deletedExistingImages.map((deletedIndex) => (
                          <div
                            key={`deleted-${deletedIndex}`}
                            className="relative group rounded-lg overflow-hidden border border-red-300 bg-red-50 opacity-75 transition-all duration-200"
                          >
                            <img
                              src={existingImages[deletedIndex]}
                              alt={`Imagen eliminada ${deletedIndex + 1}`}
                              className="w-full h-24 object-cover grayscale"
                            />
                            
                            {/* Badge de eliminada */}
                            <div className="absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
                              Eliminada
                            </div>

                            {/* Botón de restaurar */}
                            <button
                              type="button"
                              onClick={() => restoreExistingImage(deletedIndex)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Información sobre las acciones */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Gestionar imágenes:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Haz clic en la <span className="font-medium">X roja</span> para eliminar una imagen existente</li>
                          <li>• Haz clic en el <span className="font-medium">ícono de restauración</span> para restaurar una imagen eliminada</li>
                          <li>• Las imágenes nuevas se agregarán junto con las existentes no eliminadas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview de imágenes nuevas */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {isEditMode ? 'Nuevas imágenes' : 'Imágenes del producto'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de cambios en modo edición */}
          {isEditMode && (deletedExistingImages.length > 0 || images.length > 0) && (
            <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Resumen de cambios en imágenes:</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  {deletedExistingImages.length > 0 && (
                    <p>• Se eliminarán {deletedExistingImages.length} imagen{deletedExistingImages.length !== 1 ? 'es' : ''} existente{deletedExistingImages.length !== 1 ? 's' : ''}</p>
                  )}
                  {images.length > 0 && (
                    <p>• Se agregarán {images.length} imagen{images.length !== 1 ? 'es' : ''} nueva{images.length !== 1 ? 's' : ''}</p>
                  )}
                  {deletedExistingImages.length === 0 && images.length === 0 && (
                    <p>• No hay cambios en las imágenes</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Espaciado para el sticky button */}
          <div className="h-24"></div>
        </form>

        {/* Botón de envío STICKY - MEJORA FINAL PARA 10/10 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Información del progreso */}
              <div className="hidden sm:block">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    {form.tipo === 'producto' ? (
                      <Package className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Calendar className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {isEditMode ? 'Editando' : 'Creando'} {form.tipo}
                    </p>
                    <p className="text-xs text-gray-600">
                      {form.nombre || 'Sin nombre aún'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de publicar */}
              <Button
                type="submit"
                form="product-form"
                disabled={loading || success}
                className="w-full sm:w-auto h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-10 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.preventDefault();
                  // Trigger form submit
                  const form = document.getElementById('product-form') as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
              >
                {loading ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    <span>{isEditMode ? 'Actualizando...' : 'Creando...'}</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>{isEditMode ? '¡Actualizado!' : '¡Creado!'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    <span>{isEditMode ? 'Actualizar' : 'Publicar'} {form.tipo}</span>
                  </>
                )}
              </Button>
            </div>
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
