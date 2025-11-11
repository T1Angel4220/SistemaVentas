import { useState, useEffect, useCallback } from 'react';
export const useApiData = (url, options = {}) => {
    const { enabled = true, retryOnError = false, maxRetries = 3 } = options;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const fetchData = useCallback(async () => {
        if (!enabled || loading)
            return;
        setLoading(true);
        setError(null);
        try {
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
            if (result.success) {
                setData(result.data);
                setRetryCount(0); // Reset retry count on success
            }
            else {
                throw new Error(result.message || 'Error al cargar datos');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error(`Error fetching ${url}:`, err);
        }
        finally {
            setLoading(false);
        }
    }, [url, enabled, loading, retryOnError, maxRetries, retryCount]);
    useEffect(() => {
        // Solo cargar si no hay datos y está habilitado
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
    return useApiData('http://localhost:3001/api/categories', {
        enabled: true,
        retryOnError: true,
        maxRetries: 3
    });
};
// Hook específico para ubicaciones
export const useLocations = () => {
    return useApiData('http://localhost:3001/api/locations', {
        enabled: true,
        retryOnError: true,
        maxRetries: 3
    });
};
