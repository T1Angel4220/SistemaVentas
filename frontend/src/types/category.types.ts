/**
 * Tipos e interfaces relacionados con categorías
 */

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo?: boolean;
}

export interface CategoryWithCount extends Category {
  total_productos: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}
