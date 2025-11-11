import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
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
import HierarchicalLocationSearch from '../components/ui/HierarchicalLocationSearch';
import MapSelector from '../components/ui/MapSelector';
import { ServiceDetailsForm } from '../components/ui/ServiceDetailsForm';
import { VisibilityToggle } from '../components/ui/VisibilityToggle';
import { Package, Calendar, Upload, X, Save, ArrowLeft, Clock, AlertCircle, CheckCircle2, DollarSign, MapPin, Info } from 'lucide-react';
export const CreateProductPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingImages, setExistingImages] = useState([]);
    const [deletedExistingImages, setDeletedExistingImages] = useState([]);
    // Estado para detectar cambios en modo edición
    const [initialFormData, setInitialFormData] = useState(null);
    const [initialImages, setInitialImages] = useState([]);
    // Estado para respuesta del vendedor al rechazo
    const [respuestaRechazo, setRespuestaRechazo] = useState('');
    // Usar hooks optimizados para evitar múltiples requests
    const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState({
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
        coordenadas: '', // Coordenadas en formato "lat,lng"
        disponibilidad: false, // Por defecto no visible hasta aprobación
        estado: 'pendiente_revision', // Por defecto pendiente de revisión
        horario_atencion: '',
        horario_inicio: '',
        horario_fin: '',
        dias_disponibles: [],
        duracion_estimada: ''
    });
    // Función para cargar datos del producto en modo edición
    const loadProductData = useCallback(async (productId) => {
        try {
            setLoadingData(true);
            const response = await fetch(`http://localhost:3001/api/products/${productId}`);
            const data = await response.json();
            if (data.success) {
                const product = data.data;
                setIsEditMode(true);
                // Función auxiliar para convertir hora 12h a 24h
                const parseTime12to24 = (time12) => {
                    const match = time12.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match)
                        return '';
                    let hours = parseInt(match[1]);
                    const minutes = match[2];
                    const period = match[3].toUpperCase();
                    if (period === 'AM' && hours === 12)
                        hours = 0;
                    if (period === 'PM' && hours !== 12)
                        hours += 12;
                    return `${hours.toString().padStart(2, '0')}:${minutes}`;
                };
                // Extraer horario_inicio y horario_fin del horario_atencion
                let horarioInicio = '';
                let horarioFin = '';
                if (product.servicio?.horario_atencion) {
                    const horarioParts = product.servicio.horario_atencion.split('-').map((p) => p.trim());
                    if (horarioParts.length === 2) {
                        horarioInicio = parseTime12to24(horarioParts[0]);
                        horarioFin = parseTime12to24(horarioParts[1]);
                    }
                }
                // Limpiar y deduplicar días disponibles
                let diasLimpios = [];
                if (product.servicio?.dias_disponibles) {
                    const diasArray = product.servicio.dias_disponibles
                        .split(',')
                        .map((dia) => dia.trim().toLowerCase()) // Trim y lowercase
                        .filter((dia) => dia !== ''); // Eliminar vacíos
                    // Eliminar duplicados usando Set
                    diasLimpios = [...new Set(diasArray)];
                }
                // Construir objeto de formulario
                const formData = {
                    codigo: product.codigo || '',
                    nombre: product.nombre || '',
                    descripcion: product.descripcion || '',
                    precio: product.precio ? product.precio.toString() : '',
                    tipo: product.tipo || 'producto',
                    categoria_id: product.categoria_id?.toString() || '',
                    ubicacion_id: product.ubicacion_id?.toString() || '',
                    ubicacion_provincia: product.ubicacion_provincia || '',
                    ubicacion_canton: product.ubicacion_canton || '',
                    ubicacion_distrito: product.ubicacion_distrito || '',
                    ubicacion_direccion: product.ubicacion_direccion || '',
                    coordenadas: product.coordenadas || '', // Cargar coordenadas del producto
                    disponibilidad: product.disponibilidad === true, // Solo true si explícitamente es true
                    estado: product.estado || 'pendiente_revision',
                    motivo_rechazo: product.motivo_rechazo || '',
                    horario_atencion: product.servicio?.horario_atencion || '',
                    horario_inicio: horarioInicio,
                    horario_fin: horarioFin,
                    dias_disponibles: diasLimpios,
                    // Limpiar valores inválidos de duración (placeholder o vacío)
                    duracion_estimada: (product.servicio?.duracion_estimada && product.servicio.duracion_estimada !== 'Selecciona duración')
                        ? product.servicio.duracion_estimada
                        : ''
                };
                // Cargar datos del formulario
                setForm(formData);
                // Guardar copia de los datos iniciales para detectar cambios
                setInitialFormData(JSON.parse(JSON.stringify(formData))); // Deep copy
                // Cargar imágenes existentes
                const imageUrls = product.imagenes && product.imagenes.length > 0
                    ? product.imagenes.map((img) => img.url_imagen)
                    : [];
                setExistingImages(imageUrls);
                setInitialImages([...imageUrls]); // Guardar copia de imágenes iniciales
                // Limpiar estado de imágenes eliminadas
                setDeletedExistingImages([]);
                // ⚠️ Verificar si el producto está en revisión (solo admin puede editarlo)
                if (product.estado === 'pendiente_revision' && user?.tipo_usuario !== 'administrador') {
                    showError('⏳ Producto en Revisión', 'No puedes editar este producto mientras esté pendiente de revisión. Espera a que los moderadores lo revisen.', () => navigate('/my-products'));
                    return;
                }
                // ⚠️ Verificar si el producto está suspendido
                if (product.estado === 'suspendido' && user?.tipo_usuario !== 'administrador') {
                    showError('🚫 Producto Suspendido', 'Este producto ha sido suspendido por los moderadores. No puedes editarlo. Contacta con los moderadores para más información.', () => navigate('/my-products'));
                    return;
                }
                // ⚠️ Verificar si el producto es peligroso
                if (product.es_peligroso && user?.tipo_usuario !== 'administrador') {
                    showError('🚫 Producto Peligroso', 'Este producto ha sido marcado como peligroso y no puede ser editado.', () => navigate('/my-products'));
                    return;
                }
            }
            else {
                showError('Error', 'No se pudo cargar el producto para editar');
                navigate('/my-products');
            }
        }
        catch (error) {
            console.error('Error al cargar producto:', error);
            showError('Error', 'Error al cargar el producto');
            navigate('/my-products');
        }
        finally {
            setLoadingData(false);
        }
    }, [showError, navigate, user]);
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
    // Cargar ubicaciones al montar el componente
    useEffect(() => {
        const loadLocations = async () => {
            try {
                // Pedir todas las ubicaciones (sin paginación)
                const response = await fetch('http://localhost:3001/api/locations?limit=1000');
                const data = await response.json();
                if (data.success) {
                    setLocations(data.data);
                }
            }
            catch (error) {
                console.error('Error al cargar ubicaciones:', error);
            }
        };
        loadLocations();
    }, []);
    const handleInputChange = (field, value) => {
        let processedValue = value;
        // Validaciones específicas por campo (estilo Amazon)
        if (typeof value === 'string') {
            switch (field) {
                case 'codigo':
                    // Solo alfanumérico, guiones y guiones bajos (sin espacios)
                    processedValue = value
                        .replace(/[^a-zA-Z0-9_-]/g, '')
                        .toUpperCase()
                        .slice(0, 20); // Máximo 20 caracteres
                    break;
                case 'nombre': {
                    // Permitir letras, números, espacios y algunos caracteres especiales básicos
                    processedValue = value
                        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()-]/g, '')
                        .slice(0, 100); // Máximo 100 caracteres
                    break;
                }
                case 'precio': {
                    // Solo números y punto decimal
                    processedValue = value
                        .replace(/[^0-9.]/g, '')
                        .replace(/(\..*)\./g, '$1'); // Solo un punto decimal
                    // Validar formato de precio (máximo 2 decimales)
                    const parts = processedValue.split('.');
                    if (parts[1] && parts[1].length > 2) {
                        processedValue = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }
                    // Máximo 7 dígitos antes del punto (9,999,999.99)
                    if (parts[0] && parts[0].length > 7) {
                        processedValue = parts[1] ? `${parts[0].slice(0, 7)}.${parts[1]}` : parts[0].slice(0, 7);
                    }
                    break;
                }
                case 'descripcion':
                    // Permitir casi todo excepto HTML y scripts
                    processedValue = value
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<[^>]*>/g, '')
                        .slice(0, 5000); // Máximo 5000 caracteres
                    break;
                case 'ubicacion_provincia':
                case 'ubicacion_canton':
                case 'ubicacion_distrito':
                    // Solo letras y espacios
                    processedValue = value
                        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                        .slice(0, 50); // Máximo 50 caracteres
                    break;
                case 'ubicacion_direccion':
                    // Permitir letras, números, espacios y caracteres comunes en direcciones
                    processedValue = value
                        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,#-]/g, '')
                        .slice(0, 200); // Máximo 200 caracteres
                    break;
                case 'duracion_estimada':
                    // Solo letras, números, espacios, guiones y caracteres útiles para duraciones
                    processedValue = value
                        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-]/g, '')
                        .slice(0, 50); // Máximo 50 caracteres
                    break;
                case 'horario_inicio':
                case 'horario_fin':
                    // Los horarios vienen en formato HH:mm del input type="time"
                    // No necesitan transformación, solo asignación
                    processedValue = value;
                    break;
            }
        }
        setForm(prev => ({ ...prev, [field]: processedValue }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    const handleVisibilityToggle = (visible) => {
        setForm(prev => ({ ...prev, disponibilidad: visible }));
    };
    const handleImageUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0)
            return;
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
        const newImages = [];
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
        else if (files.length > remainingSlots) {
            // Informar al usuario si intentó subir más de las permitidas
            setErrors(prev => ({
                ...prev,
                images: `Solo puedes agregar ${remainingSlots} imagen${remainingSlots !== 1 ? 'es' : ''} más. Límite: ${maxImages} imágenes totales.`
            }));
        }
        // Resetear el input para permitir subir el mismo archivo de nuevo
        event.target.value = '';
    };
    const removeImage = (id) => {
        setImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
            return prev.filter(img => img.id !== id);
        });
    };
    const removeExistingImage = (index) => {
        setDeletedExistingImages(prev => [...prev, index]);
    };
    const restoreExistingImage = (index) => {
        setDeletedExistingImages(prev => prev.filter(i => i !== index));
    };
    const restoreAllExistingImages = () => {
        setDeletedExistingImages([]);
    };
    const validateForm = () => {
        const newErrors = {};
        // Validación de Código (estilo Amazon)
        if (!form.codigo.trim()) {
            newErrors.codigo = 'El código es requerido';
        }
        else if (form.codigo.length < 3) {
            newErrors.codigo = 'El código debe tener al menos 3 caracteres';
        }
        else if (form.codigo.length > 20) {
            newErrors.codigo = 'El código no puede exceder 20 caracteres';
        }
        else if (!/^[A-Z0-9_-]+$/.test(form.codigo)) {
            newErrors.codigo = 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos';
        }
        // Validación de Nombre
        if (!form.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        else if (form.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        else if (form.nombre.length > 100) {
            newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
        }
        else if (form.nombre.trim().length < 5) {
            newErrors.nombre = 'El nombre debe ser más descriptivo (mínimo 5 caracteres)';
        }
        // Validación de Precio (estilo Amazon)
        if (!form.precio.trim()) {
            newErrors.precio = 'El precio es requerido';
        }
        else {
            const price = parseFloat(form.precio);
            if (isNaN(price)) {
                newErrors.precio = 'El precio debe ser un número válido';
            }
            else if (price <= 0) {
                newErrors.precio = 'El precio debe ser mayor a $0.00';
            }
            else if (price < 0.01) {
                newErrors.precio = 'El precio mínimo es $0.01';
            }
            else if (price > 9999999.99) {
                newErrors.precio = 'El precio máximo es $9,999,999.99';
            }
            else if (!/^\d+(\.\d{1,2})?$/.test(form.precio)) {
                newErrors.precio = 'El precio solo puede tener hasta 2 decimales';
            }
        }
        // Validación de Descripción
        if (!form.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        }
        else if (form.descripcion.trim().length < 20) {
            newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres para ser útil';
        }
        else if (form.descripcion.length > 5000) {
            newErrors.descripcion = 'La descripción no puede exceder 5000 caracteres';
        }
        // Validación de Categoría
        if (!form.categoria_id) {
            newErrors.categoria_id = 'Debe seleccionar una categoría';
        }
        // Validación de Ubicación
        if (!form.ubicacion_provincia.trim()) {
            newErrors.ubicacion_provincia = 'La provincia es requerida';
        }
        else if (form.ubicacion_provincia.trim().length < 3) {
            newErrors.ubicacion_provincia = 'La provincia debe tener al menos 3 caracteres';
        }
        if (!form.ubicacion_canton.trim()) {
            newErrors.ubicacion_canton = 'El cantón es requerido';
        }
        else if (form.ubicacion_canton.trim().length < 3) {
            newErrors.ubicacion_canton = 'El cantón debe tener al menos 3 caracteres';
        }
        // Validación de distrito/parroquia (OBLIGATORIO)
        if (!form.ubicacion_distrito.trim()) {
            newErrors.ubicacion_distrito = 'El distrito/parroquia es requerido';
        }
        else if (form.ubicacion_distrito.trim().length < 3) {
            newErrors.ubicacion_distrito = 'El distrito/parroquia debe tener al menos 3 caracteres';
        }
        // Validación de dirección específica (OBLIGATORIO)
        if (!form.ubicacion_direccion.trim()) {
            newErrors.ubicacion_direccion = 'La dirección específica es requerida';
        }
        else if (form.ubicacion_direccion.trim().length < 10) {
            newErrors.ubicacion_direccion = 'La dirección debe ser más específica (mínimo 10 caracteres)';
        }
        // Validaciones específicas para Servicios (estilo Amazon)
        if (form.tipo === 'servicio') {
            // Validar hora de inicio
            if (!form.horario_inicio || !form.horario_inicio.trim()) {
                newErrors.horario_inicio = 'La hora de inicio es requerida para servicios';
            }
            // Validar hora de fin
            if (!form.horario_fin || !form.horario_fin.trim()) {
                newErrors.horario_fin = 'La hora de fin es requerida para servicios';
            }
            // Validar que hora fin sea mayor que hora inicio
            if (form.horario_inicio && form.horario_fin) {
                const [inicioHoras, inicioMinutos] = form.horario_inicio.split(':').map(Number);
                const [finHoras, finMinutos] = form.horario_fin.split(':').map(Number);
                const inicioTotal = inicioHoras * 60 + inicioMinutos;
                const finTotal = finHoras * 60 + finMinutos;
                if (finTotal <= inicioTotal) {
                    newErrors.horario_fin = 'La hora de fin debe ser posterior a la hora de inicio';
                }
                // Validar que el rango sea razonable (mínimo 30 minutos, máximo 24 horas)
                const diferenciaMinutos = finTotal - inicioTotal;
                if (diferenciaMinutos < 30) {
                    newErrors.horario_fin = 'El horario de atención debe ser de al menos 30 minutos';
                }
            }
            // Validar días disponibles
            if (!form.dias_disponibles || form.dias_disponibles.length === 0) {
                newErrors.dias_disponibles = 'Debe seleccionar al menos un día disponible';
            }
            // Validar duración estimada
            if (!form.duracion_estimada || !form.duracion_estimada.trim() || form.duracion_estimada === 'Selecciona duración') {
                newErrors.duracion_estimada = 'La duración estimada es requerida para servicios';
            }
            else if (form.duracion_estimada.trim().length < 3) {
                newErrors.duracion_estimada = 'La duración debe ser descriptiva (ej: "1 hora", "30 minutos")';
            }
            // 🆕 VALIDACIÓN CRÍTICA: La duración NO debe exceder el horario de atención
            if (form.horario_inicio && form.horario_fin && form.duracion_estimada && form.duracion_estimada !== 'Selecciona duración') {
                // Calcular tiempo disponible en el horario
                const [inicioHoras, inicioMinutos] = form.horario_inicio.split(':').map(Number);
                const [finHoras, finMinutos] = form.horario_fin.split(':').map(Number);
                const inicioTotal = inicioHoras * 60 + inicioMinutos;
                const finTotal = finHoras * 60 + finMinutos;
                const tiempoDisponibleMinutos = finTotal - inicioTotal;
                // Convertir duración estimada a minutos
                const duracionTexto = form.duracion_estimada.toLowerCase();
                let duracionEstimadaMinutos = 0;
                // Parsear horas
                const horasMatch = duracionTexto.match(/(\d+)\s*(hora|hr|h)/i);
                if (horasMatch) {
                    duracionEstimadaMinutos += parseInt(horasMatch[1]) * 60;
                }
                // Parsear minutos
                const minutosMatch = duracionTexto.match(/(\d+)\s*(minuto|min|m)/i);
                if (minutosMatch) {
                    duracionEstimadaMinutos += parseInt(minutosMatch[1]);
                }
                // Validar consistencia lógica
                if (duracionEstimadaMinutos > 0 && duracionEstimadaMinutos > tiempoDisponibleMinutos) {
                    const horasDisponibles = Math.floor(tiempoDisponibleMinutos / 60);
                    const minutosDisponibles = tiempoDisponibleMinutos % 60;
                    const tiempoDisponibleTexto = horasDisponibles > 0
                        ? `${horasDisponibles} hora${horasDisponibles !== 1 ? 's' : ''} ${minutosDisponibles > 0 ? `y ${minutosDisponibles} minutos` : ''}`
                        : `${minutosDisponibles} minutos`;
                    newErrors.duracion_estimada = `⚠️ Inconsistencia lógica: La duración del servicio (${form.duracion_estimada}) excede tu horario de atención disponible (${tiempoDisponibleTexto}). Ajusta el horario o reduce la duración.`;
                }
            }
        }
        // Validación de coordenadas del mapa (OBLIGATORIO)
        if (!form.coordenadas || !form.coordenadas.trim()) {
            newErrors.coordenadas = 'Debes seleccionar la ubicación en el mapa';
        }
        else {
            // Validar formato de coordenadas (lat,lng)
            const coordsArray = form.coordenadas.split(',');
            if (coordsArray.length !== 2) {
                newErrors.coordenadas = 'Formato de coordenadas inválido';
            }
            else {
                const [lat, lng] = coordsArray.map(c => parseFloat(c.trim()));
                if (isNaN(lat) || isNaN(lng)) {
                    newErrors.coordenadas = 'Las coordenadas deben ser números válidos';
                }
                else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    newErrors.coordenadas = 'Las coordenadas están fuera de rango válido';
                }
            }
        }
        // Validación de imágenes (AL MENOS UNA OBLIGATORIA)
        const totalImages = isEditMode
            ? (existingImages.length - deletedExistingImages.length) + images.length
            : images.length;
        if (totalImages === 0) {
            newErrors.imagenes = 'Debes agregar al menos una imagen de tu producto';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Función para detectar si hay cambios en modo edición
    const hasChanges = () => {
        if (!isEditMode || !initialFormData)
            return true; // En modo creación siempre continuar
        // Comparar datos del formulario (excluyendo horario_atencion que se genera dinámicamente)
        const formChanged = Object.keys(form).some(key => {
            if (key === 'horario_atencion')
                return false; // Este se genera, no comparar
            const currentValue = form[key];
            const initialValue = initialFormData[key];
            // Comparar arrays (días disponibles)
            if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
                if (currentValue.length !== initialValue.length)
                    return true;
                const sortedCurrent = [...currentValue].sort();
                const sortedInitial = [...initialValue].sort();
                return sortedCurrent.some((val, idx) => val !== sortedInitial[idx]);
            }
            // Log especial para coordenadas
            if (key === 'coordenadas') {
                const changed = currentValue !== initialValue;
                console.log('📍 Verificando cambios en coordenadas:', {
                    inicial: initialValue,
                    actual: currentValue,
                    cambió: changed
                });
                return changed;
            }
            // Comparar valores simples
            return currentValue !== initialValue;
        });
        // Comparar imágenes
        const imagesChanged = images.length > 0 || // Hay nuevas imágenes
            deletedExistingImages.length > 0 || // Se eliminaron imágenes
            existingImages.length !== initialImages.length; // Cambió el número de imágenes
        console.log('🔍 hasChanges() resultado:', {
            formChanged,
            imagesChanged,
            total: formChanged || imagesChanged
        });
        return formChanged || imagesChanged;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        // En modo edición, verificar si hay cambios
        if (isEditMode && !hasChanges()) {
            showSuccess('Sin cambios', 'No se han realizado cambios en el formulario. Todo está actualizado.', () => window.location.href = `/products/${id}` // Redirigir a la vista del producto con recarga
            );
            return;
        }
        const actionText = isEditMode ? 'guardar los cambios' : 'crear el producto';
        const productName = form.nombre || 'este producto';
        showWarning(`¿${isEditMode ? 'Guardar cambios' : 'Crear producto'}?`, `¿Estás seguro de que quieres ${actionText} "${productName}"?`, submitProduct, undefined // onCancel - no necesita hacer nada especial
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
                // Excluir campos de servicio que se procesarán después
                if (key === 'horario_inicio' || key === 'horario_fin' || key === 'dias_disponibles' || key === 'duracion_estimada' || key === 'horario_atencion') {
                    return; // Estos se procesarán por separado en la sección de servicio
                }
                // Para coordenadas, siempre agregar (incluso si está vacío) para que el backend pueda manejarlo con COALESCE
                if (key === 'coordenadas') {
                    formData.append(key, value?.toString() || '');
                    console.log('📍 Agregando coordenadas al FormData:', value);
                    return;
                }
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, value.toString());
                }
            });
            // Procesar datos específicos del servicio
            if (form.tipo === 'servicio') {
                // Construir horario_atencion desde horario_inicio y horario_fin
                if (form.horario_inicio && form.horario_fin) {
                    const formatTime = (time24) => {
                        const [hours, minutes] = time24.split(':').map(Number);
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                    };
                    const horarioCompleto = `${formatTime(form.horario_inicio)} - ${formatTime(form.horario_fin)}`;
                    formData.append('horario_atencion', horarioCompleto);
                }
                // Convertir array de días a string separado por comas (eliminar duplicados)
                if (form.dias_disponibles.length > 0) {
                    // Eliminar duplicados y normalizar (trim + lowercase)
                    const diasUnicos = [...new Set(form.dias_disponibles.map(d => d.trim().toLowerCase()))];
                    formData.append('dias_disponibles', diasUnicos.join(', '));
                }
                // Agregar duración estimada (ya validada, pero asegurar que no sea placeholder)
                if (form.duracion_estimada && form.duracion_estimada !== 'Selecciona duración' && form.duracion_estimada.trim() !== '') {
                    formData.append('duracion_estimada', form.duracion_estimada);
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
            }
            else {
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
                // Si el producto estaba rechazado y el vendedor escribió una respuesta, crear apelación
                if (isEditMode && form.estado === 'rechazado' && respuestaRechazo.trim()) {
                    try {
                        const appealResponse = await fetch(`http://localhost:3001/api/products/${id}/appeal`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiService.getToken()}`
                            },
                            body: JSON.stringify({
                                motivo_apelacion: respuestaRechazo,
                                informacion_adicional: 'Producto corregido y actualizado según las observaciones del moderador.'
                            })
                        });
                        const appealData = await appealResponse.json();
                        if (!appealData.success) {
                            console.error('Error al crear apelación:', appealData.message);
                        }
                    }
                    catch (error) {
                        console.error('Error al crear apelación automática:', error);
                    }
                }
                // Construir mensaje basado en información adicional
                let mensajeExito = `El producto ha sido ${actionText} correctamente.`;
                // Si se envió una respuesta al moderador, agregar al mensaje
                if (isEditMode && form.estado === 'rechazado' && respuestaRechazo.trim()) {
                    mensajeExito += `\n\n✅ Tu respuesta al moderador ha sido enviada. El producto será revisado nuevamente.`;
                }
                let tipoAlerta = 'success';
                let esPeligroso = false;
                if (data.informacion) {
                    if (data.informacion.estado_nuevo === 'peligroso' || data.informacion.no_eliminable === true) {
                        tipoAlerta = 'error';
                        esPeligroso = true;
                        mensajeExito = `⚠️ ATENCIÓN: El contenido de este producto ha sido detectado como peligroso o inapropiado.\n\n` +
                            `Motivo: ${data.informacion.motivo}\n\n` +
                            `El producto ha sido ocultado automáticamente y NO podrás verlo, editarlo ni eliminarlo. ` +
                            `Solo los moderadores tienen acceso para revisión.\n\n` +
                            `Si consideras que esto es un error, puedes apelar esta decisión.`;
                    }
                    else if (data.informacion.requiere_revision) {
                        tipoAlerta = 'info';
                        mensajeExito = `ℹ️ Producto ${actionText} y enviado para revisión. ${data.informacion.motivo || ''}`;
                    }
                }
                // Determinar si se envió una apelación desde producto rechazado
                const seEnvioApelacion = isEditMode && form.estado === 'rechazado' && respuestaRechazo.trim();
                // Limpiar campo de respuesta después de enviar
                if (respuestaRechazo.trim()) {
                    setRespuestaRechazo('');
                }
                // Pequeño delay para mostrar el AlertDialog después de actualizar el botón
                setTimeout(() => {
                    if (esPeligroso) {
                        // Redirigir a /my-products si el producto fue marcado como peligroso
                        showError('🚫 Contenido Prohibido Detectado', mensajeExito, () => {
                            setSuccess(false);
                            // Forzar recarga completa de la página
                            window.location.href = '/my-products';
                        });
                    }
                    else if (seEnvioApelacion) {
                        // Si se envió una apelación desde producto rechazado, redirigir a Mis Productos
                        showSuccess('✅ Producto Actualizado y Apelación Enviada', mensajeExito, () => {
                            setSuccess(false);
                            // Forzar recarga completa de la página
                            window.location.href = '/my-products';
                        });
                    }
                    else if (tipoAlerta === 'info') {
                        showSuccess('Producto Enviado para Revisión', mensajeExito, () => {
                            setSuccess(false);
                            // Forzar recarga completa de la página para mostrar los cambios
                            window.location.href = `/products/${data.data.id || id}`;
                        });
                    }
                    else {
                        showSuccess('¡Éxito!', mensajeExito, () => {
                            setSuccess(false);
                            // Forzar recarga completa de la página para mostrar los cambios
                            window.location.href = `/products/${data.data.id || id}`;
                        });
                    }
                }, 100);
            }
            else {
                // Manejar errores específicos del servidor
                if (data.errors) {
                    setErrors(data.errors);
                }
                else {
                    const actionText = isEditMode ? 'actualizar' : 'crear';
                    setErrors({ general: data.message || `Error al ${actionText} el producto` });
                }
            }
        }
        catch (error) {
            console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} producto:`, error);
            const actionText = isEditMode ? 'actualizar' : 'crear';
            setErrors({ general: `Error al ${actionText} el producto. Por favor intenta nuevamente.` });
        }
        finally {
            setLoading(false);
        }
    };
    if (!user || (user.tipo_usuario !== 'vendedor' && user.tipo_usuario !== 'administrador')) {
        return null;
    }
    // Mostrar carga mientras se cargan los datos del producto en modo edición
    if (loadingData) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse", children: _jsx(Package, { className: "h-10 w-10 text-blue-600" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Cargando producto..." }), _jsx("p", { className: "text-gray-600 text-lg", children: "Obteniendo informaci\u00F3n para editar" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50", children: [_jsxs("div", { className: "relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden shadow-lg", children: [_jsx("div", { className: "absolute inset-0 bg-black/10", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/my-products'), className: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto", children: [_jsx(ArrowLeft, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-2" }), "Volver"] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight", children: [isEditMode ? 'Editar' : 'Crear', " ", form.tipo === 'producto' ? 'Producto' : 'Servicio'] }), _jsx("p", { className: "text-blue-100 text-sm sm:text-base", children: isEditMode
                                                        ? `Modifica la información de tu ${form.tipo}`
                                                        : `Completa la información para publicar tu ${form.tipo}` })] })] }), _jsx("div", { className: "hidden md:block", children: _jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30", children: form.tipo === 'producto' ? (_jsx(Package, { className: "w-7 h-7 sm:w-8 sm:h-8 text-white" })) : (_jsx(Calendar, { className: "w-7 h-7 sm:w-8 sm:h-8 text-white" })) }) })] }) })] }), isEditMode && form.estado === 'rechazado' && form.motivo_rechazo && (_jsx("div", { className: "bg-red-50 border-t-4 border-red-500 shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-12 h-12 bg-red-500 rounded-full flex items-center justify-center", children: _jsx(AlertCircle, { className: "h-6 w-6 text-white" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg sm:text-xl font-bold text-red-900 mb-3", children: ["\uD83D\uDEAB Tu ", form.tipo, " fue rechazado"] }), _jsxs("div", { className: "bg-white border border-red-200 rounded-lg p-4 mb-4", children: [_jsxs("p", { className: "text-sm font-semibold text-red-800 mb-2 flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-1.5" }), "Comentario del Moderador:"] }), _jsx("p", { className: "text-sm text-red-700 whitespace-pre-wrap", children: form.motivo_rechazo })] }), _jsxs("div", { className: "bg-white border border-orange-200 rounded-lg p-4 mb-3", children: [_jsxs(Label, { htmlFor: "respuesta-rechazo", className: "text-sm font-semibold text-orange-800 mb-2 flex items-center", children: [_jsx(Info, { className: "h-4 w-4 mr-1.5" }), "Tu respuesta al moderador (Opcional)"] }), _jsx(Textarea, { id: "respuesta-rechazo", value: respuestaRechazo, onChange: (e) => setRespuestaRechazo(e.target.value), placeholder: "Explica qu\u00E9 cambios realizaste para corregir el problema... (Ej: 'He actualizado la descripci\u00F3n eliminando contenido inapropiado y agregado informaci\u00F3n m\u00E1s clara sobre el producto')", className: "mt-2 min-h-[100px] text-sm" }), _jsx("p", { className: "text-xs text-gray-600 mt-2", children: "\uD83D\uDCA1 Este comentario ser\u00E1 enviado junto con tus correcciones para facilitar la revisi\u00F3n del moderador." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 text-sm text-red-800", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle2, { className: "h-4 w-4 mr-1.5 text-red-600" }), _jsx("span", { children: "Corrige los errores mencionados" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle2, { className: "h-4 w-4 mr-1.5 text-red-600" }), _jsx("span", { children: "Guarda los cambios para volver a enviar a revisi\u00F3n" })] })] })] })] }) }) })), _jsxs("main", { className: "max-w-7xl mx-auto px-6 py-12 -mt-12 relative z-10", children: [errors.general && (_jsxs(Alert, { variant: "destructive", className: "mb-6", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: errors.general })] })), categoriesError && (_jsxs(Alert, { variant: "destructive", className: "mb-6", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["Error al cargar categor\u00EDas: ", categoriesError] })] })), success && (_jsxs(Alert, { className: "mb-6 bg-green-50 border-green-200", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" }), _jsx(AlertDescription, { className: "text-green-800", children: "\u00A1Producto creado exitosamente! Redirigiendo..." })] })), _jsxs("form", { id: "product-form", onSubmit: handleSubmit, className: "space-y-8", children: [_jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-5", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center", children: _jsx(Package, { className: "h-5 w-5 text-blue-600" }) }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Tipo de Publicaci\u00F3n" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("button", { type: "button", onClick: () => handleInputChange('tipo', 'producto'), className: `flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${form.tipo === 'producto'
                                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'}`, children: [_jsx(Package, { className: "h-6 w-6" }), _jsx("span", { className: "font-semibold text-base", children: "Producto" })] }), _jsxs("button", { type: "button", onClick: () => handleInputChange('tipo', 'servicio'), className: `flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${form.tipo === 'servicio'
                                                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'}`, children: [_jsx(Calendar, { className: "h-6 w-6" }), _jsx("span", { className: "font-semibold text-base", children: "Servicio" })] })] })] }) }), _jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center", children: _jsx(CheckCircle2, { className: "h-5 w-5 text-green-600" }) }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Informaci\u00F3n B\u00E1sica" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "codigo", className: "flex items-center justify-between text-sm font-semibold text-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2", children: _jsx(Package, { className: "h-3 w-3 text-blue-600" }) }), "C\u00F3digo del ", form.tipo, " *"] }), _jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${form.codigo.length === 0
                                                                        ? 'bg-gray-100 text-gray-500'
                                                                        : form.codigo.length >= 3
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-yellow-100 text-yellow-700'}`, children: [form.codigo.length, "/20"] })] }), _jsx(Input, { id: "codigo", value: form.codigo, onChange: (e) => handleInputChange('codigo', e.target.value), placeholder: "Ej: PROD-001 (may\u00FAsculas, n\u00FAmeros, - y _)", className: `w-full h-12 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${errors.codigo
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                                : form.codigo.length >= 3
                                                                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/30'
                                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}` }), errors.codigo ? (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.codigo] })) : (_jsxs("p", { className: "text-xs text-gray-500 flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "Solo MAY\u00DASCULAS, n\u00FAmeros, guiones (-) y guiones bajos (_)"] }), form.codigo.length >= 3 && (_jsx("span", { className: "text-green-600 font-medium", children: "\u2713 V\u00E1lido" }))] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "precio", className: "flex items-center justify-between text-sm font-semibold text-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2", children: _jsx(DollarSign, { className: "h-3 w-3 text-green-600" }) }), "Precio (USD) *"] }), form.precio && parseFloat(form.precio) > 0 && (_jsxs("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: ["$", parseFloat(form.precio).toFixed(2)] }))] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg", children: "$" }), _jsx(Input, { id: "precio", type: "text", inputMode: "decimal", value: form.precio, onChange: (e) => handleInputChange('precio', e.target.value), placeholder: "0.00", className: `w-full h-12 pl-8 rounded-xl border-2 transition-all shadow-sm hover:shadow-md text-lg font-semibold ${errors.precio
                                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                                        : form.precio && parseFloat(form.precio) >= 0.01
                                                                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/30'
                                                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}` })] }), errors.precio ? (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.precio] })) : (_jsxs("p", { className: "text-xs text-gray-500 flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "Rango: $0.01 - $9,999,999.99 (m\u00E1x. 2 decimales)"] }), form.precio && parseFloat(form.precio) >= 0.01 && (_jsx("span", { className: "text-green-600 font-medium", children: "\u2713 V\u00E1lido" }))] }))] })] }), _jsxs("div", { className: "mb-6 space-y-2", children: [_jsxs(Label, { htmlFor: "nombre", className: "flex items-center justify-between text-sm font-semibold text-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2", children: form.tipo === 'servicio' ? (_jsx(Calendar, { className: "h-3 w-3 text-purple-600" })) : (_jsx(Package, { className: "h-3 w-3 text-purple-600" })) }), "Nombre del ", form.tipo, " *"] }), _jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${form.nombre.length === 0
                                                                ? 'bg-gray-100 text-gray-500'
                                                                : form.nombre.length >= 5
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'}`, children: [form.nombre.length, "/100"] })] }), _jsx(Input, { id: "nombre", value: form.nombre, onChange: (e) => handleInputChange('nombre', e.target.value), placeholder: `Ej: ${form.tipo === 'servicio' ? 'Diseño gráfico profesional' : 'Laptop Dell Inspiron 15'}`, className: `w-full h-12 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${errors.nombre
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                        : form.nombre.length >= 5
                                                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/30'
                                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}` }), errors.nombre ? (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.nombre] })) : (_jsxs("p", { className: "text-xs text-gray-500 flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "M\u00EDnimo 5 caracteres - S\u00E9 descriptivo para atraer compradores"] }), form.nombre.length >= 5 && (_jsx("span", { className: "text-green-600 font-medium", children: "\u2713 V\u00E1lido" }))] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "descripcion", className: "flex items-center justify-between text-sm font-semibold text-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-2", children: _jsx(AlertCircle, { className: "h-3 w-3 text-indigo-600" }) }), "Descripci\u00F3n *"] }), _jsxs("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${form.descripcion.length === 0
                                                                ? 'bg-gray-100 text-gray-500'
                                                                : form.descripcion.length >= 20
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : form.descripcion.length >= 10
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-red-100 text-red-700'}`, children: [form.descripcion.length, "/5000"] })] }), _jsx(Textarea, { id: "descripcion", value: form.descripcion, onChange: (e) => handleInputChange('descripcion', e.target.value), placeholder: `Describe detalladamente tu ${form.tipo}:\n• Características principales\n• Estado/condición\n• Incluye/no incluye\n• Garantías o políticas\n• Cualquier detalle relevante`, rows: 6, className: `w-full rounded-xl border-2 transition-all resize-none shadow-sm hover:shadow-md ${errors.descripcion
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                        : form.descripcion.length >= 20
                                                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/30'
                                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}` }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [errors.descripcion ? (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.descripcion] })) : (_jsxs("p", { className: "text-xs text-gray-500 flex items-center", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "M\u00EDnimo 20 caracteres - Descripciones detalladas venden m\u00E1s"] })), _jsxs("div", { className: "flex items-center space-x-2", children: [form.descripcion.length >= 20 && (_jsx("span", { className: "text-green-600 font-medium text-xs", children: "\u2713 Completo" })), _jsxs("span", { className: `text-xs font-semibold px-2 py-1 rounded-full ${form.descripcion.length < 20
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : form.descripcion.length < 100
                                                                            ? 'bg-yellow-100 text-yellow-700'
                                                                            : 'bg-green-100 text-green-700'}`, children: [form.descripcion.length >= 20 ? '✓' : form.descripcion.length, " ", form.descripcion.length < 20 && '/ 20 mín'] })] })] })] })] }) }), form.tipo === 'servicio' && (_jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-5", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center", children: _jsx(Clock, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Detalles del Servicio" }), _jsx("p", { className: "text-xs text-gray-600", children: "Configura horarios y disponibilidad" })] })] }), _jsx(ServiceDetailsForm, { horarioInicio: form.horario_inicio, horarioFin: form.horario_fin, diasDisponibles: form.dias_disponibles, duracionEstimada: form.duracion_estimada, onHorarioInicioChange: (time) => handleInputChange('horario_inicio', time), onHorarioFinChange: (time) => handleInputChange('horario_fin', time), onDiasDisponiblesChange: (days) => handleInputChange('dias_disponibles', days), onDuracionEstimadaChange: (duration) => handleInputChange('duracion_estimada', duration) }), (() => {
                                            // Solo mostrar si hay datos completos
                                            if (!form.horario_inicio || !form.horario_fin || !form.duracion_estimada || form.duracion_estimada === 'Selecciona duración') {
                                                return null;
                                            }
                                            // Calcular tiempo disponible
                                            const [inicioHoras, inicioMinutos] = form.horario_inicio.split(':').map(Number);
                                            const [finHoras, finMinutos] = form.horario_fin.split(':').map(Number);
                                            const tiempoDisponibleMinutos = (finHoras * 60 + finMinutos) - (inicioHoras * 60 + inicioMinutos);
                                            // Parsear duración
                                            const duracionTexto = form.duracion_estimada.toLowerCase();
                                            let duracionEstimadaMinutos = 0;
                                            const horasMatch = duracionTexto.match(/(\d+)\s*(hora|hr|h)/i);
                                            const minutosMatch = duracionTexto.match(/(\d+)\s*(minuto|min|m)/i);
                                            if (horasMatch)
                                                duracionEstimadaMinutos += parseInt(horasMatch[1]) * 60;
                                            if (minutosMatch)
                                                duracionEstimadaMinutos += parseInt(minutosMatch[1]);
                                            // Verificar inconsistencia
                                            if (duracionEstimadaMinutos > 0 && duracionEstimadaMinutos > tiempoDisponibleMinutos) {
                                                const horasDisp = Math.floor(tiempoDisponibleMinutos / 60);
                                                const minsDisp = tiempoDisponibleMinutos % 60;
                                                const tiempoDispTexto = horasDisp > 0
                                                    ? `${horasDisp}h ${minsDisp > 0 ? minsDisp + 'm' : ''}`
                                                    : `${minsDisp}m`;
                                                return (_jsx("div", { className: "mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl shadow-md", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(AlertCircle, { className: "h-6 w-6 text-amber-600 animate-pulse" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-bold text-amber-900 mb-1", children: "\u26A0\uFE0F Inconsistencia L\u00F3gica Detectada" }), _jsxs("p", { className: "text-sm text-amber-800 mb-2", children: [_jsxs("strong", { children: ["La duraci\u00F3n del servicio (", form.duracion_estimada, ")"] }), " excede el tiempo disponible en tu horario de atenci\u00F3n ", _jsxs("strong", { children: ["(", tiempoDispTexto, ")"] }), "."] }), _jsxs("div", { className: "bg-white/60 rounded-lg p-3 space-y-1 text-xs", children: [_jsx("p", { className: "text-amber-900", children: _jsx("strong", { children: "\uD83D\uDCA1 Soluci\u00F3n:" }) }), _jsxs("ul", { className: "list-disc list-inside text-amber-800 space-y-0.5 ml-2", children: [_jsx("li", { children: "Ampl\u00EDa tu horario de atenci\u00F3n, o" }), _jsx("li", { children: "Reduce la duraci\u00F3n estimada del servicio" })] })] })] })] }) }));
                                            }
                                            return null;
                                        })(), (errors.horario_inicio || errors.horario_fin || errors.dias_disponibles || errors.duracion_estimada) && (_jsxs("div", { className: "mt-4 space-y-2", children: [errors.horario_inicio && (_jsxs("div", { className: "flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 flex-shrink-0" }), _jsx("p", { className: "text-red-700 text-sm font-medium", children: errors.horario_inicio })] })), errors.horario_fin && (_jsxs("div", { className: "flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 flex-shrink-0" }), _jsx("p", { className: "text-red-700 text-sm font-medium", children: errors.horario_fin })] })), errors.dias_disponibles && (_jsxs("div", { className: "flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 flex-shrink-0" }), _jsx("p", { className: "text-red-700 text-sm font-medium", children: errors.dias_disponibles })] })), errors.duracion_estimada && (_jsxs("div", { className: "flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 flex-shrink-0" }), _jsx("p", { className: "text-red-700 text-sm font-medium", children: errors.duracion_estimada })] }))] }))] }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { className: "shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-5", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center", children: _jsx(Package, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Categor\u00EDa *" }), _jsx("p", { className: "text-xs text-gray-600", children: "Selecciona la categor\u00EDa m\u00E1s apropiada" })] })] }), _jsx(HierarchicalCategorySearch, { categories: categories, selectedCategoryId: form.categoria_id, onCategorySelect: (categoryId) => {
                                                        handleInputChange('categoria_id', categoryId);
                                                    }, loading: categoriesLoading, error: errors.categoria_id, placeholder: "Buscar categor\u00EDa (ej: Hogar > Muebles, Servicios > Dise\u00F1o...)" })] }) }), _jsx(Card, { className: "shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-white rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-5", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center", children: _jsx(MapPin, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Ubicaci\u00F3n" }), _jsxs("p", { className: "text-xs text-gray-600", children: ["Indica d\u00F3nde se encuentra tu ", form.tipo] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(HierarchicalLocationSearch, { locations: locations, onLocationSelect: (locationData) => {
                                                                setForm(prev => ({
                                                                    ...prev,
                                                                    ubicacion_id: locationData.locationId,
                                                                    ubicacion_provincia: locationData.provincia,
                                                                    ubicacion_canton: locationData.canton,
                                                                    ubicacion_distrito: locationData.distrito,
                                                                    ubicacion_direccion: locationData.direccion
                                                                }));
                                                            }, initialProvincia: form.ubicacion_provincia, initialCanton: form.ubicacion_canton, initialDistrito: form.ubicacion_distrito, initialDireccion: form.ubicacion_direccion, errors: {
                                                                provincia: errors.ubicacion_provincia,
                                                                canton: errors.ubicacion_canton,
                                                                distrito: errors.ubicacion_distrito,
                                                                direccion: errors.ubicacion_direccion
                                                            } }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Ubicaci\u00F3n en el Mapa *" }), _jsx("div", { className: `${errors.coordenadas ? 'border-2 border-red-500 rounded-lg p-2' : ''}`, children: _jsx(MapSelector, { onLocationSelect: (lat, lng) => {
                                                                            setForm(prev => ({
                                                                                ...prev,
                                                                                coordenadas: `${lat},${lng}`
                                                                            }));
                                                                        }, initialLat: form.coordenadas ? parseFloat(form.coordenadas.split(',')[0]) : undefined, initialLng: form.coordenadas ? parseFloat(form.coordenadas.split(',')[1]) : undefined, provincia: form.ubicacion_provincia }) }), errors.coordenadas && (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-2", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.coordenadas] }))] })] }), _jsx("div", { className: "mt-4 p-3 bg-green-50 border border-green-200 rounded-xl", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Info, { className: "h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-xs text-green-700", children: [_jsx("p", { className: "font-semibold mb-1", children: "Consejos para ubicaci\u00F3n:" }), _jsxs("ul", { className: "space-y-0.5", children: [_jsxs("li", { children: ["\u2022 Selecciona la provincia y cant\u00F3n de Ecuador donde se encuentra tu ", form.tipo] }), _jsxs("li", { children: ["\u2022 El distrito/parroquia y direcci\u00F3n espec\u00EDfica son ", _jsx("strong", { children: "obligatorios" })] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Debes marcar la ubicaci\u00F3n en el mapa" }), " (obligatorio)"] }), _jsx("li", { children: "\u2022 Los compradores ver\u00E1n esta informaci\u00F3n para contactarte" }), _jsx("li", { children: "\u2022 Todos los campos con * son obligatorios" })] })] })] }) })] }) })] }), isEditMode && form.estado === 'activo' && (_jsx(Card, { className: "shadow-lg border-0 bg-white rounded-lg overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Disponibilidad en Stock" }), _jsx(VisibilityToggle, { isVisible: form.disponibilidad, onChange: handleVisibilityToggle, label: "" }), _jsx("p", { className: "text-sm text-gray-500 mt-3", children: form.disponibilidad
                                                ? '✅ Tu producto está disponible en stock y los clientes pueden comprarlo'
                                                : '❌ Tu producto está sin stock temporalmente (sin stock)' })] }) })), isEditMode && form.estado !== 'activo' && (_jsx(Card, { className: "shadow-lg border-0 bg-white rounded-lg overflow-hidden", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center", children: _jsx(Clock, { className: "h-5 w-5 text-yellow-600" }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Estado del Producto" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: form.estado === 'pendiente_revision'
                                                            ? 'Tu producto está pendiente de revisión por parte de los moderadores. Una vez aprobado, podrás controlar su disponibilidad en stock.'
                                                            : form.estado === 'rechazado'
                                                                ? 'Tu producto fue rechazado. Puedes apelar la decisión o editarlo y volver a enviarlo.'
                                                                : form.estado === 'peligroso'
                                                                    ? 'Tu producto fue marcado como peligroso y requiere revisión urgente. No puede ser editado hasta que sea revisado.'
                                                                    : 'Tu producto no está aprobado y no será visible para los clientes.' })] })] }) }) })), _jsx(Card, { className: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center", children: _jsx(Upload, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: isEditMode ? 'Gestionar Imágenes' : 'Imágenes del Producto *' }), _jsx("p", { className: "text-xs text-gray-600", children: isEditMode ? 'Máximo 5 imágenes por producto' : 'Al menos 1 imagen es obligatoria. Máximo 5 imágenes.' })] })] }), (() => {
                                                    const existingImagesCount = isEditMode
                                                        ? existingImages.length - deletedExistingImages.length
                                                        : 0;
                                                    const totalImages = existingImagesCount + images.length;
                                                    const maxImages = 5;
                                                    const isAtLimit = totalImages >= maxImages;
                                                    return (_jsxs("div", { className: `px-4 py-2 rounded-xl font-bold text-sm ${isAtLimit
                                                            ? 'bg-red-100 text-red-700'
                                                            : totalImages >= 3
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-green-100 text-green-700'}`, children: [totalImages, "/", maxImages] }));
                                                })()] }), (() => {
                                            const existingImagesCount = isEditMode
                                                ? existingImages.length - deletedExistingImages.length
                                                : 0;
                                            const totalImages = existingImagesCount + images.length;
                                            const maxImages = 5;
                                            const isAtLimit = totalImages >= maxImages;
                                            return (_jsxs("div", { className: `border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isAtLimit
                                                    ? 'border-red-300 bg-red-50/50 cursor-not-allowed'
                                                    : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'}`, children: [_jsx("input", { type: "file", id: "image-upload", multiple: true, accept: "image/*", onChange: handleImageUpload, className: "hidden", disabled: isAtLimit }), _jsxs("label", { htmlFor: "image-upload", className: `${isAtLimit ? 'cursor-not-allowed' : 'cursor-pointer'}`, children: [_jsx(Upload, { className: `h-12 w-12 mx-auto mb-4 ${isAtLimit ? 'text-red-400' : 'text-purple-400'}` }), _jsx("p", { className: `font-semibold mb-2 text-base ${isAtLimit ? 'text-red-700' : 'text-gray-700'}`, children: isAtLimit
                                                                    ? '❌ Máximo de imágenes alcanzado'
                                                                    : isEditMode
                                                                        ? '📸 Click para agregar nuevas imágenes'
                                                                        : '📸 Click para subir imágenes' }), _jsx("p", { className: "text-sm text-gray-600", children: isEditMode
                                                                    ? `Tienes ${existingImagesCount} imagen${existingImagesCount !== 1 ? 'es' : ''} existente${existingImagesCount !== 1 ? 's' : ''} | Puedes agregar ${maxImages - totalImages} más`
                                                                    : 'Máximo 5 imágenes, hasta 5MB cada una' }), isEditMode && isAtLimit && (_jsx("p", { className: "text-xs text-red-600 mt-2 font-medium", children: "\uD83D\uDCA1 Elimina im\u00E1genes existentes para agregar nuevas" }))] })] }));
                                        })(), errors.images && (_jsxs(Alert, { variant: "destructive", className: "mt-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: errors.images })] })), isEditMode && existingImages.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700", children: "Im\u00E1genes actuales" }), _jsxs("div", { className: "flex items-center space-x-2", children: [deletedExistingImages.length > 0 && (_jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium", children: [deletedExistingImages.length, " marcada", deletedExistingImages.length !== 1 ? 's' : '', " para eliminar"] })), deletedExistingImages.length > 0 && (_jsx("button", { type: "button", onClick: restoreAllExistingImages, className: "text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium hover:bg-green-200 transition-colors", children: "Restaurar todas" }))] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: existingImages.map((imageUrl, index) => {
                                                        const isDeleted = deletedExistingImages.includes(index);
                                                        // No mostrar imágenes marcadas para eliminar
                                                        if (isDeleted) {
                                                            return null;
                                                        }
                                                        return (_jsxs("div", { className: "relative group rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200", children: [_jsx("img", { src: imageUrl, alt: `Imagen existente ${index + 1}`, className: "w-full h-24 object-cover" }), _jsx("div", { className: "absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-medium bg-green-600 text-white", children: "Actual" }), _jsx("button", { type: "button", onClick: () => removeExistingImage(index), className: "absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200", children: _jsx(X, { className: "h-3 w-3" }) })] }, `existing-${index}`));
                                                    }) }), deletedExistingImages.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Im\u00E1genes eliminadas:" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: deletedExistingImages.map((deletedIndex) => (_jsxs("div", { className: "relative group rounded-lg overflow-hidden border border-red-300 bg-red-50 opacity-75 transition-all duration-200", children: [_jsx("img", { src: existingImages[deletedIndex], alt: `Imagen eliminada ${deletedIndex + 1}`, className: "w-full h-24 object-cover grayscale" }), _jsx("div", { className: "absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white", children: "Eliminada" }), _jsx("button", { type: "button", onClick: () => restoreExistingImage(deletedIndex), className: "absolute top-1 right-1 p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200", children: _jsx("svg", { className: "h-3 w-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }) })] }, `deleted-${deletedIndex}`))) })] })), _jsx("div", { className: "mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-blue-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("p", { className: "font-medium mb-1", children: "Gestionar im\u00E1genes:" }), _jsxs("ul", { className: "space-y-1 text-xs", children: [_jsxs("li", { children: ["\u2022 Haz clic en la ", _jsx("span", { className: "font-medium", children: "X roja" }), " para eliminar una imagen existente"] }), _jsxs("li", { children: ["\u2022 Haz clic en el ", _jsx("span", { className: "font-medium", children: "\u00EDcono de restauraci\u00F3n" }), " para restaurar una imagen eliminada"] }), _jsx("li", { children: "\u2022 Las im\u00E1genes nuevas se agregar\u00E1n junto con las existentes no eliminadas" })] })] })] }) })] })), images.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: isEditMode ? 'Nuevas imágenes' : 'Imágenes del producto' }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: images.map((image, index) => (_jsxs("div", { className: "relative group rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors", children: [_jsx("img", { src: image.preview, alt: `Preview ${index + 1}`, className: "w-full h-24 object-cover" }), _jsx("button", { type: "button", onClick: () => removeImage(image.id), className: "absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600", children: _jsx(X, { className: "h-3 w-3" }) }), index === 0 && (_jsx("div", { className: "absolute bottom-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium", children: "Principal" }))] }, image.id))) })] })), errors.imagenes && (_jsx("div", { className: "mt-4", children: _jsxs("p", { className: "text-red-500 text-sm font-medium flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), errors.imagenes] }) }))] }) }), isEditMode && (deletedExistingImages.length > 0 || images.length > 0) && (_jsx(Card, { className: "shadow-lg border-0 bg-blue-50 border-blue-200", children: _jsxs(CardContent, { className: "p-4", children: [_jsx("h3", { className: "text-sm font-medium text-blue-900 mb-2", children: "Resumen de cambios en im\u00E1genes:" }), _jsxs("div", { className: "space-y-1 text-sm text-blue-800", children: [deletedExistingImages.length > 0 && (_jsxs("p", { children: ["\u2022 Se eliminar\u00E1n ", deletedExistingImages.length, " imagen", deletedExistingImages.length !== 1 ? 'es' : '', " existente", deletedExistingImages.length !== 1 ? 's' : ''] })), images.length > 0 && (_jsxs("p", { children: ["\u2022 Se agregar\u00E1n ", images.length, " imagen", images.length !== 1 ? 'es' : '', " nueva", images.length !== 1 ? 's' : ''] })), deletedExistingImages.length === 0 && images.length === 0 && (_jsx("p", { children: "\u2022 No hay cambios en las im\u00E1genes" }))] })] }) })), _jsx("div", { className: "h-24" })] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3", children: [_jsx("div", { className: "hidden sm:block", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center", children: form.tipo === 'producto' ? (_jsx(Package, { className: "h-5 w-5 text-blue-600" })) : (_jsx(Calendar, { className: "h-5 w-5 text-purple-600" })) }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [isEditMode ? 'Editando' : 'Creando', " ", form.tipo] }), _jsx("p", { className: "text-xs text-gray-600", children: form.nombre || 'Sin nombre aún' })] })] }) }), _jsx(Button, { type: "submit", form: "product-form", disabled: loading || success, className: "w-full sm:w-auto h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-10 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed", onClick: (e) => {
                                            e.preventDefault();
                                            // Trigger form submit
                                            const form = document.getElementById('product-form');
                                            if (form) {
                                                form.requestSubmit();
                                            }
                                        }, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-5 w-5 mr-2 animate-spin" }), _jsx("span", { children: isEditMode ? 'Actualizando...' : 'Creando...' })] })) : success ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: isEditMode ? '¡Actualizado!' : '¡Creado!' })] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-5 w-5 mr-2" }), _jsxs("span", { children: [isEditMode ? 'Actualizar' : 'Publicar', " ", form.tipo] })] })) })] }) }) })] }), _jsx(AlertDialog, { isOpen: alert.isOpen, onClose: hideAlert, title: alert.title, message: alert.message, type: alert.type, confirmText: alert.confirmText, cancelText: alert.cancelText, onConfirm: alert.onConfirm, onCancel: alert.onCancel })] }));
};
