/**
 * Tipos e interfaces relacionados con productos
 */

// Tipos básicos
export type ProductType = 'producto' | 'servicio';
export type ProductStatus = 'activo' | 'inactivo' | 'pendiente_revision' | 'rechazado' | 'peligroso' | 'suspendido' | 'en_apelacion';

// Interface básica de producto (para listados)
export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: ProductType;
  estado: ProductStatus;
  disponibilidad: boolean;
  fecha_publicacion: string;
  categoria_nombre: string;
  vendedor_nombre: string;
  vendedor_id?: number;
  // Campos de ubicación
  ubicacion_provincia?: string;
  ubicacion_canton?: string;
  ubicacion_distrito?: string;
  ubicacion_direccion?: string;
  coordenadas?: string; // Formato: "lat,lng"
  distancia?: number; // Distancia en kilómetros (solo cuando se usa filtro de proximidad)
  // Imágenes
  total_imagenes: number;
  primera_imagen?: string;
  // Campos de moderación
  es_peligroso?: boolean;
  fecha_revision?: string;
  motivo_rechazo?: string;
}

// Interface detallada de producto (para vista individual)
export interface ProductDetail {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: ProductType;
  estado: ProductStatus;
  disponibilidad: boolean;
  fecha_publicacion: string;
  fecha_actualizacion: string;
  categoria_nombre: string;
  categoria_descripcion?: string;
  vendedor_nombre: string;
  vendedor_email: string;
  vendedor_id: number;
  // Campos de ubicación
  ubicacion_provincia?: string;
  ubicacion_canton?: string;
  ubicacion_distrito?: string;
  ubicacion_direccion?: string;
  coordenadas?: string; // Formato: "lat,lng"
  // Imágenes
  imagenes: ProductImage[];
  // Detalles de servicio
  servicio?: ServiceDetails;
  // Campos de moderación
  es_peligroso?: boolean;
  fecha_revision?: string;
  motivo_rechazo?: string;
}

// Imágenes de producto
export interface ProductImage {
  id: number;
  url_imagen: string;
  orden: number;
  es_principal: boolean;
}

// Detalles de servicio
export interface ServiceDetails {
  horario_atencion: string;
  dias_disponibles: string;
  duracion_estimada: string;
}

// Formulario de producto
export interface ProductForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  tipo: ProductType;
  categoria_id: string;
  ubicacion_id: string;
  ubicacion_provincia: string;
  ubicacion_canton: string;
  ubicacion_distrito: string;
  ubicacion_direccion: string;
  coordenadas?: string; // Formato: "lat,lng"
  disponibilidad: boolean;
  estado: string;
  motivo_rechazo?: string;
  // Campos específicos para servicios
  horario_atencion: string;
  horario_inicio: string;
  horario_fin: string;
  dias_disponibles: string[];
  duracion_estimada: string;
}

// Archivo de imagen (para creación/edición)
export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

// Paginación de productos
export interface ProductPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Estadísticas de moderación
export interface ModerationStatistics {
  total: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  suspendidos: number;
  peligrosos: number;
  en_apelacion: number;
}

// Respuesta de API para productos
export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: ProductPagination;
  estadisticas?: ModerationStatistics;
}

// Respuesta de API para un producto individual
export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

// Filtros de productos
export interface ProductFilters {
  search: string;
  categoria_id: string;
  tipo: string;
  precio_min: string;
  precio_max: string;
  estado: string;
  disponibilidad: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  direccion?: string;
  page: number;
  limit: number;
}

// Acción de moderación
export interface ModerationAction {
  accion: 'aprobar' | 'rechazar' | 'suspender' | 'marcar_peligroso';
  motivo: string;
  decision_final?: string;
}

// Historial de moderación
export interface ModerationHistory {
  id: number;
  item_id: number;
  moderador_id: number;
  moderador_nombre: string;
  accion: string;
  motivo: string;
  fecha: string;
  decision_final?: string;
}
