import { apiService } from '../services/api';

// Obtener la URL base de la API desde variables de entorno
// Si VITE_API_URL incluye /api, lo removemos para construir URLs correctamente
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Si la URL termina con /api, la removemos
  if (envUrl.endsWith('/api')) {
    return envUrl.replace('/api', '');
  }
  // Si no tiene /api, asumimos que es la base y agregamos /api si es necesario
  // Pero para mantener compatibilidad, si ya tiene /api, lo dejamos
  return envUrl.includes('/api') ? envUrl.replace('/api', '') : envUrl;
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
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

// Función helper para obtener la URL base de la API (con /api incluido)
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Si VITE_API_URL ya incluye /api, usarlo directamente
  if (envUrl.endsWith('/api')) {
    return envUrl;
  }
  // Si no termina con /api, agregarlo
  return envUrl.includes('/api') ? envUrl : `${envUrl}/api`;
};

// Función helper simple para construir URLs de API
// Uso: getApiUrl('/products') -> 'http://localhost:3001/api/products'
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Asegurar que el endpoint comience con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Asegurar que el endpoint comience con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Si el endpoint ya incluye /api, no duplicarlo
  if (cleanEndpoint.startsWith('/api/')) {
    return `${baseUrl.replace('/api', '')}${cleanEndpoint}`;
  }
  return `${baseUrl}${cleanEndpoint}`;
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
