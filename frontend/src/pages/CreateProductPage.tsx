import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useApiData';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { 
  Package, 
  Calendar, 
  Upload, 
  X, 
  Save,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { ProductForm, ImageFile } from '../types/product.types';
import type { Category } from '../types/category.types';

export const CreateProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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
    horario_atencion: '',
    dias_disponibles: '',
    duracion_estimada: ''
  });

  useEffect(() => {
    // Verificar permisos
    if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
      navigate('/products');
      return;
    }
  }, [user, navigate]);

  const handleInputChange = (field: keyof ProductForm, value: string) => {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageFile[] = [];
    const maxImages = 5;
    const remainingSlots = maxImages - images.length;
    
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
      if (!form.horario_atencion.trim()) {
        newErrors.horario_atencion = 'El horario de atención es requerido para servicios';
      }
      if (!form.dias_disponibles.trim()) {
        newErrors.dias_disponibles = 'Los días disponibles son requeridos para servicios';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar datos del formulario
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Agregar imágenes
      images.forEach((imageFile) => {
        formData.append('images', imageFile.file);
      });

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/products/${data.data.id}`);
        }, 1500);
      } else {
        // Manejar errores específicos del servidor
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Error al crear el producto' });
        }
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      setErrors({ general: 'Error al crear el producto. Por favor intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header mejorado */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Crear {form.tipo === 'producto' ? 'Producto' : 'Servicio'}
                </h1>
                <p className="text-blue-100 text-base">
                  Completa la información para publicar tu {form.tipo}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                {form.tipo === 'producto' ? (
                  <Package className="w-8 h-8 text-white" />
                ) : (
                  <Calendar className="w-8 h-8 text-white" />
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de publicación - Estilo Amazon horizontal */}
          <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Publicación</h2>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'producto')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                    form.tipo === 'producto'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Producto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'servicio')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                    form.tipo === 'servicio'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Servicio</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Información básica - Estilo Amazon */}
          <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Básica</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                    Código del {form.tipo} *
                  </Label>
                  <Input
                    id="codigo"
                    value={form.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ej: PROD-001"
                    className={`w-full h-10 rounded-md border transition-colors ${
                      errors.codigo 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.codigo && (
                    <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (₡) *
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => handleInputChange('precio', e.target.value)}
                    placeholder="0.00"
                    className={`w-full h-10 rounded-md border transition-colors ${
                      errors.precio 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.precio && (
                    <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del {form.tipo} *
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder={`Nombre descriptivo del ${form.tipo}`}
                  className={`w-full h-10 rounded-md border transition-colors ${
                    errors.nombre 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder={`Describe detalladamente tu ${form.tipo}...`}
                  rows={4}
                  className={`w-full rounded-md border transition-colors resize-none ${
                    errors.descripcion 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.descripcion ? (
                    <p className="text-red-500 text-sm">{errors.descripcion}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className={`text-sm ${
                    form.descripcion.length < 10 ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {form.descripcion.length} caracteres (mínimo 10)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos específicos de servicio */}
          {form.tipo === 'servicio' && (
            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalles del Servicio</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="horario_atencion" className="block text-sm font-medium text-gray-700 mb-2">
                      Horario de Atención *
                    </Label>
                    <Input
                      id="horario_atencion"
                      value={form.horario_atencion}
                      onChange={(e) => handleInputChange('horario_atencion', e.target.value)}
                      placeholder="Ej: Lunes a Viernes 8:00 AM - 5:00 PM"
                      className={`w-full h-10 rounded-md border transition-colors ${
                        errors.horario_atencion 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.horario_atencion && (
                      <p className="text-red-500 text-sm mt-1">{errors.horario_atencion}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dias_disponibles" className="block text-sm font-medium text-gray-700 mb-2">
                      Días Disponibles *
                    </Label>
                    <Input
                      id="dias_disponibles"
                      value={form.dias_disponibles}
                      onChange={(e) => handleInputChange('dias_disponibles', e.target.value)}
                      placeholder="Ej: Lunes a Viernes"
                      className={`w-full h-10 rounded-md border transition-colors ${
                        errors.dias_disponibles 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.dias_disponibles && (
                      <p className="text-red-500 text-sm mt-1">{errors.dias_disponibles}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700 mb-2">
                      Duración Estimada
                    </Label>
                    <Input
                      id="duracion_estimada"
                      value={form.duracion_estimada}
                      onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                      placeholder="Ej: 2 horas"
                      className="w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categoría y Ubicación - Estilo Amazon horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categoría *</h2>
                <select
                  value={form.categoria_id}
                  onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                  className={`w-full h-10 rounded-md border transition-colors ${
                    errors.categoria_id 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
                  </option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h2>
                <Input
                  value={form.ubicacion_id}
                  onChange={(e) => handleInputChange('ubicacion_id', e.target.value)}
                  placeholder="Ej: San José, Costa Rica"
                  className="w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Escribe tu ubicación (opcional)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Imágenes - Estilo Amazon */}
          <Card className="shadow-lg border-0 bg-white rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Imágenes</h2>
                <span className="text-sm text-gray-500">{images.length}/5</span>
              </div>
              
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                images.length >= 5 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}>
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className={`font-medium mb-1 ${
                    images.length >= 5 ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {images.length >= 5
                      ? 'Máximo de imágenes alcanzado'
                      : 'Click para subir imágenes'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Máximo 5 imágenes, hasta 5MB cada una
                  </p>
                </label>
              </div>

              {errors.images && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.images}</AlertDescription>
                </Alert>
              )}

              {/* Preview de imágenes */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
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
              )}
            </CardContent>
          </Card>

          {/* Botón de envío - Estilo Amazon */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || success}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  ¡Creado!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publicar {form.tipo}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
