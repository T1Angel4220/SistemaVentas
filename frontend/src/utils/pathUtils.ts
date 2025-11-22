/**
 * Utilidades para manejar rutas con el base path de la aplicación
 * Necesario para el despliegue en WildFly con contexto /SistemaVentas
 */

// Base path de la aplicación (debe coincidir con vite.config.ts base)
export const BASE_PATH = '/SistemaVentas';

/**
 * Obtiene la ruta completa incluyendo el base path
 * @param path - Ruta relativa (ej: '/login', '/dashboard')
 * @returns Ruta completa con base path (ej: '/SistemaVentas/login')
 */
export const getFullPath = (path: string | null | undefined): string => {
  // Validar que path sea una cadena válida
  if (!path || typeof path !== 'string') {
    console.warn('getFullPath recibió un path inválido:', path);
    return `${BASE_PATH}/`;
  }
  
  // Si la ruta ya incluye el base path, retornarla tal cual
  if (path.startsWith(BASE_PATH)) {
    return path;
  }
  
  // Asegurar que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};

/**
 * Redirige a una ruta usando window.location.href con el base path
 * Útil cuando se necesita forzar una recarga completa de la página
 * @param path - Ruta relativa (ej: '/login', '/dashboard')
 */
export const redirectTo = (path: string | null | undefined): void => {
  if (!path || typeof path !== 'string') {
    console.error('redirectTo recibió un path inválido:', path);
    return;
  }
  window.location.href = getFullPath(path);
};

/**
 * Normaliza una ruta para uso con React Router (sin base path)
 * React Router maneja el base path automáticamente cuando se usa basename
 * @param path - Ruta completa o relativa
 * @returns Ruta normalizada para React Router
 */
export const normalizeRoutePath = (path: string | null | undefined): string => {
  if (!path || typeof path !== 'string') {
    return '/';
  }
  
  // Si la ruta incluye el base path, removerlo
  if (path.startsWith(BASE_PATH)) {
    const normalized = path.substring(BASE_PATH.length);
    return normalized || '/';
  }
  
  // Asegurar que comience con /
  return path.startsWith('/') ? path : `/${path}`;
};

