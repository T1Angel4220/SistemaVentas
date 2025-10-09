import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories, useLocations } from '../hooks/useApiData';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { 
  Package, 
  Calendar, 
  Upload, 
  X, 
  Save,
  ArrowLeft,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { ProductForm, ImageFile } from '../types/product.types';
import type { Category } from '../types/category.types';
import type { Location } from '../types/location.types';

export const CreateProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Usar hooks optimizados para evitar múltiples requests
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: locations, loading: locationsLoading, error: locationsError } = useLocations();

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
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Crear {form.tipo === 'producto' ? 'Producto' : 'Servicio'}
                </h1>
                <p className="text-blue-100">
                  Completa la información para publicar tu {form.tipo}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {form.tipo === 'producto' ? (
                  <Package className="w-10 h-10 text-white" />
                ) : (
                  <Calendar className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
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

        {locationsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar ubicaciones: {locationsError}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Información básica */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tipo de publicación */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xl font-bold">Tipo de Publicación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('tipo', 'producto')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        form.tipo === 'producto'
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <Package className={`h-10 w-10 mx-auto mb-3 ${
                        form.tipo === 'producto' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h3 className={`font-semibold text-lg ${
                        form.tipo === 'producto' ? 'text-blue-900' : 'text-gray-700'
                      }`}>Producto</h3>
                      <p className="text-sm text-gray-600 mt-1">Artículo físico o digital</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('tipo', 'servicio')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        form.tipo === 'servicio'
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className={`h-10 w-10 mx-auto mb-3 ${
                        form.tipo === 'servicio' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h3 className={`font-semibold text-lg ${
                        form.tipo === 'servicio' ? 'text-blue-900' : 'text-gray-700'
                      }`}>Servicio</h3>
                      <p className="text-sm text-gray-600 mt-1">Servicio profesional</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Información básica */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xl font-bold">Información Básica</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="codigo" className="text-sm font-medium text-gray-700 mb-2 block">
                        Código del {form.tipo} *
                      </Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="codigo"
                          value={form.codigo}
                          onChange={(e) => handleInputChange('codigo', e.target.value)}
                          placeholder="Ej: PROD-001"
                          className={`pl-10 h-12 ${errors.codigo ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.codigo && (
                        <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="precio" className="text-sm font-medium text-gray-700 mb-2 block">
                        Precio (₡) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="precio"
                          type="number"
                          step="0.01"
                          value={form.precio}
                          onChange={(e) => handleInputChange('precio', e.target.value)}
                          placeholder="0.00"
                          className={`pl-10 h-12 ${errors.precio ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.precio && (
                        <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-2 block">
                      Nombre del {form.tipo} *
                    </Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder={`Nombre descriptivo del ${form.tipo}`}
                      className={`h-12 ${errors.nombre ? 'border-red-500' : ''}`}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción *
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={form.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder={`Describe detalladamente tu ${form.tipo}...`}
                      rows={6}
                      className={errors.descripcion ? 'border-red-500' : ''}
                    />
                    {errors.descripcion && (
                      <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {form.descripcion.length} caracteres (mínimo 10)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Campos específicos de servicio */}
              {form.tipo === 'servicio' && (
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
                    <CardTitle className="flex items-center space-x-3 text-gray-800">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-xl font-bold">Detalles del Servicio</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="horario_atencion" className="text-sm font-medium text-gray-700 mb-2 block">
                        Horario de Atención *
                      </Label>
                      <Input
                        id="horario_atencion"
                        value={form.horario_atencion}
                        onChange={(e) => handleInputChange('horario_atencion', e.target.value)}
                        placeholder="Ej: Lunes a Viernes 8:00 AM - 5:00 PM"
                        className={`h-12 ${errors.horario_atencion ? 'border-red-500' : ''}`}
                      />
                      {errors.horario_atencion && (
                        <p className="text-red-500 text-sm mt-1">{errors.horario_atencion}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dias_disponibles" className="text-sm font-medium text-gray-700 mb-2 block">
                        Días Disponibles *
                      </Label>
                      <Input
                        id="dias_disponibles"
                        value={form.dias_disponibles}
                        onChange={(e) => handleInputChange('dias_disponibles', e.target.value)}
                        placeholder="Ej: Lunes a Viernes"
                        className={`h-12 ${errors.dias_disponibles ? 'border-red-500' : ''}`}
                      />
                      {errors.dias_disponibles && (
                        <p className="text-red-500 text-sm mt-1">{errors.dias_disponibles}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duracion_estimada" className="text-sm font-medium text-gray-700 mb-2 block">
                        Duración Estimada
                      </Label>
                      <Input
                        id="duracion_estimada"
                        value={form.duracion_estimada}
                        onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                        placeholder="Ej: 2 horas"
                        className="h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Imágenes */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                  <CardTitle className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-xl font-bold">Imágenes</span>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {images.length}/5
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Botón de subir imagen */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
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
                        <p className="text-gray-600 font-medium mb-1">
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
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.images}</AlertDescription>
                      </Alert>
                    )}

                    {/* Preview de imágenes */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                          >
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                                Principal
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Categoría y ubicación */}
            <div className="space-y-6">
              {/* Categoría */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden sticky top-4">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Tag className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-xl font-bold">Categoría *</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <select
                    value={form.categoria_id}
                    onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.categoria_id ? 'border-red-500' : 'border-gray-300'
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
                    <p className="text-red-500 text-sm mt-2">{errors.categoria_id}</p>
                  )}
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 p-6">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <span className="text-xl font-bold">Ubicación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <select
                    value={form.ubicacion_id}
                    onChange={(e) => handleInputChange('ubicacion_id', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={locationsLoading}
                  >
                    <option value="">
                      {locationsLoading ? 'Cargando ubicaciones...' : 'Selecciona una ubicación (opcional)'}
                    </option>
                    {locations.map((location: Location) => (
                      <option key={location.id} value={location.id}>
                        {location.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    La ubicación ayuda a los compradores a encontrarte
                  </p>
                </CardContent>
              </Card>

              {/* Botón de enviar */}
              <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className="w-full h-14 bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        ¡Creado!
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Publicar {form.tipo}
                      </>
                    )}
                  </Button>
                  <p className="text-center text-white text-sm mt-4">
                    * Campos obligatorios
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
