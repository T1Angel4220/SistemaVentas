import { API_CONFIG, buildApiUrl, getAuthHeaders, getAuthFormHeaders } from '../config/api';
class ProductsService {
    getHeaders() {
        return getAuthHeaders();
    }
    getFormDataHeaders() {
        return getAuthFormHeaders();
    }
    // Obtener productos con filtros
    async getProducts(filters = {}) {
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
    async getProductById(id) {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)));
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    // Crear producto
    async createProduct(data) {
        const formData = new FormData();
        // Agregar datos del formulario
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'images' && Array.isArray(value)) {
                    value.forEach((file) => {
                        formData.append(`images`, file);
                    });
                }
                else {
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
    async updateProduct(id, data) {
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
    async deleteProduct(id) {
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
    async toggleAvailability(id, disponibilidad) {
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
    async getMyProducts(filters = {}) {
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
    async saveProduct(productId) {
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
    async unsaveProduct(productId) {
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
    async isProductSaved(productId) {
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
    async getSavedProducts(page = 1, limit = 12) {
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
