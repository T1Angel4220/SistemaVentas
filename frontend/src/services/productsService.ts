import { API_CONFIG, buildApiUrl, getAuthHeaders, getAuthFormHeaders } from '../config/api';

interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'producto' | 'servicio';
  estado: string;
  disponibilidad: boolean;
  fecha_publicacion: string;
  categoria_nombre: string;
  vendedor_nombre: string;
  ubicacion_nombre?: string;
  total_imagenes: number;
}

interface ProductDetail extends Product {
  fecha_actualizacion: string;
  vendedor_email: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  imagenes: Array<{
    id: number;
    url_imagen: string;
    orden: number;
    es_principal: boolean;
  }>;
  servicio?: {
    horario_atencion: string;
    dias_disponibles: string;
    duracion_estimada: string;
  };
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface ProductFilters {
  search?: string;
  categoria_id?: string;
  tipo?: string;
  precio_min?: string;
  precio_max?: string;
  ubicacion_id?: string;
  estado?: string;
  disponibilidad?: boolean;
  page?: number;
  limit?: number;
}

interface CreateProductData {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  tipo: 'producto' | 'servicio';
  categoria_id: string;
  ubicacion_id?: string;
  horario_atencion?: string;
  dias_disponibles?: string;
  duracion_estimada?: string;
  images?: File[];
}

interface UpdateProductData {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  categoria_id?: string;
  ubicacion_id?: string;
  horario_atencion?: string;
  dias_disponibles?: string;
  duracion_estimada?: string;
}

class ProductsService {
  private getHeaders() {
    return getAuthHeaders();
  }

  private getFormDataHeaders() {
    return getAuthFormHeaders();
  }

  // Obtener productos con filtros
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}?${queryParams}`));
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Obtener producto por ID
  async getProductById(id: number): Promise<{ success: boolean; data: ProductDetail }> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)));
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Crear producto
  async createProduct(data: CreateProductData): Promise<{ success: boolean; data: Product; message?: string }> {
    const formData = new FormData();
    
    // Agregar datos del formulario
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((file) => {
            formData.append(`images`, file);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BASE), {
      method: 'POST',
      headers: this.getFormDataHeaders(),
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Actualizar producto
  async updateProduct(id: number, data: UpdateProductData): Promise<{ success: boolean; data: Product; message?: string }> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Eliminar producto
  async deleteProduct(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)), {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Cambiar disponibilidad del producto
  async toggleAvailability(id: number, disponibilidad: boolean): Promise<{ success: boolean; data: Product; message?: string }> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.AVAILABILITY(id)), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ disponibilidad })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Obtener mis productos (para vendedores)
  async getMyProducts(filters: { estado?: string; page?: number; limit?: number } = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}?${queryParams}`), {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Guardar producto como favorito
  async saveProduct(productId: number): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`http://localhost:3001/api/saved-products/${productId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Quitar producto de favoritos
  async unsaveProduct(productId: number): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`http://localhost:3001/api/saved-products/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Verificar si un producto está guardado
  async isProductSaved(productId: number): Promise<{ success: boolean; data: { is_saved: boolean } }> {
    const response = await fetch(`http://localhost:3001/api/saved-products/check/${productId}`, {
      headers: this.getHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Obtener productos guardados
  async getSavedProducts(page: number = 1, limit: number = 12): Promise<ProductsResponse> {
    const response = await fetch(`http://localhost:3001/api/saved-products?page=${page}&limit=${limit}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const productsService = new ProductsService();
export type { Product, ProductDetail, ProductsResponse, ProductFilters, CreateProductData, UpdateProductData };
