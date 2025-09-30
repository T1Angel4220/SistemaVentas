import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
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
  DollarSign
} from 'lucide-react';

interface Category {
  id: number;
  nombre: string;
}

interface Location {
  id: number;
  nombre: string;
  provincia: string;
  canton: string;
  distrito: string;
}

interface ProductForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  tipo: 'producto' | 'servicio';
  categoria_id: string;
  ubicacion_id: string;
  // Campos específicos para servicios
  horario_atencion: string;
  dias_disponibles: string;
  duracion_estimada: string;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export const CreateProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    loadCategories();
    loadLocations();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') && images.length + newImages.length < 5) {
        const id = Math.random().toString(36).substr(2, 9);
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          id
        });
      }
    });

    setImages(prev => [...prev, ...newImages]);
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

    if (form.tipo === 'servicio' && !form.horario_atencion.trim()) {
      newErrors.horario_atencion = 'El horario de atención es requerido para servicios';
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
        formData.append(`images`, imageFile.file);
      });

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/products/${data.data.id}`);
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
      setErrors({ general: 'Error al crear el producto' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    // Remover caracteres no numéricos excepto punto
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Permitir solo un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/products')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Crear Producto/Servicio
                </h1>
                <p className="text-gray-600">
                  Publica tu producto o servicio en la plataforma
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
              <CardDescription>
                Información principal del producto o servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código del producto *</Label>
                  <Input
                    id="codigo"
                    value={form.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ej: PROD-001"
                    className={errors.codigo ? 'border-red-500' : ''}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-red-600">{errors.codigo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Nombre del producto o servicio"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describe detalladamente tu producto o servicio..."
                  rows={4}
                  className={errors.descripcion ? 'border-red-500' : ''}
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-600">{errors.descripcion}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio (₡) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="precio"
                      type="text"
                      value={form.precio}
                      onChange={(e) => handleInputChange('precio', formatPrice(e.target.value))}
                      placeholder="0.00"
                      className={`pl-10 ${errors.precio ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-sm text-red-600">{errors.precio}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select 
                    value={form.tipo} 
                    onChange={(e) => handleInputChange('tipo', e.target.value as 'producto' | 'servicio')}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <select 
                    value={form.categoria_id} 
                    onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${errors.categoria_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.categoria_id && (
                    <p className="text-sm text-red-600">{errors.categoria_id}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <select 
                  value={form.ubicacion_id} 
                  onChange={(e) => handleInputChange('ubicacion_id', e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar ubicación (opcional)</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id.toString()}>
                      {location.nombre} - {location.provincia}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Información específica de servicios */}
          {form.tipo === 'servicio' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Información del Servicio</span>
                </CardTitle>
                <CardDescription>
                  Detalles específicos para servicios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="horario_atencion">Horario de atención *</Label>
                  <Textarea
                    id="horario_atencion"
                    value={form.horario_atencion}
                    onChange={(e) => handleInputChange('horario_atencion', e.target.value)}
                    placeholder="Ej: Lunes a Viernes de 8:00 AM a 6:00 PM"
                    rows={2}
                    className={errors.horario_atencion ? 'border-red-500' : ''}
                  />
                  {errors.horario_atencion && (
                    <p className="text-sm text-red-600">{errors.horario_atencion}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dias_disponibles">Días disponibles</Label>
                    <Input
                      id="dias_disponibles"
                      value={form.dias_disponibles}
                      onChange={(e) => handleInputChange('dias_disponibles', e.target.value)}
                      placeholder="Ej: Lunes-Viernes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracion_estimada">Duración estimada</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="duracion_estimada"
                        value={form.duracion_estimada}
                        onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                        placeholder="Ej: 2 horas"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Imágenes</span>
              </CardTitle>
              <CardDescription>
                Sube hasta 5 imágenes de tu producto o servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Arrastra y suelta imágenes aquí, o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, GIF. Máximo 5 imágenes.
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline">
                        Seleccionar imágenes
                      </Button>
                    </label>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Errores generales */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Producto
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
