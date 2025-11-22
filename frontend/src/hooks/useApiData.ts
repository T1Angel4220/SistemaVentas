import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types/location.types';
import type { Category } from '../types/category.types';

interface UseApiDataOptions {
  enabled?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export const useApiData = <T>(
  url: string,
  options: UseApiDataOptions = {}
) => {
  const { enabled = true, retryOnError = false, maxRetries = 3 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Cargando datos desde: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - esperar antes de reintentar
          if (retryOnError && retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchData();
            }, Math.pow(2, retryCount) * 1000); // Exponential backoff
            return;
          }
          throw new Error('Demasiadas solicitudes. Intenta más tarde.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Datos recibidos de ${url}:`, result);
      
      if (result.success) {
        const dataArray = Array.isArray(result.data) ? result.data : [];
        setData(dataArray);
        setRetryCount(0); // Reset retry count on success
        console.log(`✅ ${dataArray.length} elementos cargados`);
      } else {
        throw new Error(result.message || 'Error al cargar datos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error(`❌ Error fetching ${url}:`, err);
    } finally {
      setLoading(false);
    }
  }, [url, enabled, retryOnError, maxRetries, retryCount]);

  useEffect(() => {
    // Cargar datos cuando el componente se monta o cuando se habilita
    // Solo cargar si no hay datos o si está habilitado y no está cargando
    if (enabled && data.length === 0 && !loading) {
      fetchData();
    }
  }, [enabled, data.length, loading, fetchData]);

  const refetch = useCallback(() => {
    setData([]);
    setError(null);
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Hook específico para categorías
export const useCategories = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
  return useApiData<Category>(`${apiUrl}/categories`, {
    enabled: true,
    retryOnError: true,
    maxRetries: 3
  });
};

// Hook específico para ubicaciones
export const useLocations = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
  return useApiData<Location>(`${apiUrl}/locations`, {
    enabled: true,
    retryOnError: true,
    maxRetries: 3
  });
};
