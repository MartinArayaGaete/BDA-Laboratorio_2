import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar llamadas a la API con estados de loading y error
 *
 * @param {Function} apiFunction - Función de servicio API a ejecutar
 * @returns {Object} { execute, data, loading, error, reset }
 *
 * @example
 * const { execute, data, loading, error } = useApi(torneoService.obtenerTodos);
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Error desconocido";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
}

/**
 * Hook para ejecutar una función API inmediatamente al montar el componente
 */
export function useApiOnMount(apiFunction, ...args) {
  const { execute, data, loading, error, reset } = useApi(apiFunction);

  useState(() => {
    execute(...args);
  }, []);

  return { data, loading, error, refetch: () => execute(...args), reset };
}
