import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook to fetch and manage Ergast F1 API data.
 * @param {Function} apiFunc - The async API function from services/ergastApi.js.
 * @param {Array} params - Parameters to pass to the API function.
 */
export function useErgast(apiFunc, params = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize params to safely use as hook dependency
  const serializedParams = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...params);
      setData(result);
    } catch (err) {
      setError(err || new Error('Failed to fetch data from Ergast API'));
    } finally {
      setLoading(false);
    }
  }, [apiFunc, serializedParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useErgast;
