import { apiService } from '../services/api';

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY_EMAIL: '/api/auth/verify-email',
      RESEND_VERIFICATION_CODE: '/api/auth/resend-verification-code',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
      TEST: '/api/auth/test'
    },
    // Productos
    PRODUCTS: {
      BASE: '/api/products',
      BY_ID: (id: number) => `/api/products/${id}`,
      MY_PRODUCTS: '/api/products/my/products',
      AVAILABILITY: (id: number) => `/api/products/${id}/availability`
    },
    // Categorías
    CATEGORIES: {
      BASE: '/api/categories',
      BY_ID: (id: number) => `/api/categories/${id}`,
      STATS: '/api/categories/stats'
    },
    // Ubicaciones
    LOCATIONS: {
      BASE: '/api/locations',
      BY_ID: (id: number) => `/api/locations/${id}`,
      STATS: '/api/locations/stats',
      PROVINCES: '/api/locations/provinces',
      CANTONS: (provincia: string) => `/api/locations/provinces/${provincia}/cantons`,
      DISTRICTS: (provincia: string, canton: string) => `/api/locations/provinces/${provincia}/cantons/${canton}/districts`
    },
    // Productos guardados (favoritos)
    SAVED_PRODUCTS: {
      BASE: '/api/saved-products',
      BY_ID: (id: number) => `/api/saved-products/${id}`,
      CHECK: (id: number) => `/api/saved-products/check/${id}`,
      STATS: '/api/saved-products/stats'
    },
    // Imágenes
    IMAGES: {
      PRODUCTS: (id: number) => `/api/images/products/${id}`,
      PRODUCT_BY_ID: (productId: number, imageId: number) => `/api/images/products/${productId}/${imageId}`,
      SET_MAIN: (productId: number, imageId: number) => `/api/images/products/${productId}/${imageId}/main`,
      REORDER: (productId: number) => `/api/images/products/${productId}/reorder`
    }
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para obtener headers con autenticación
export const getAuthHeaders = (): HeadersInit => {
  const token = apiService.getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Función helper para obtener headers con autenticación para FormData
export const getAuthFormHeaders = (): HeadersInit => {
  const token = apiService.getToken();
  return {
    'Authorization': `Bearer ${token}`
  };
};
