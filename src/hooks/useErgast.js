import { useState, useEffect, useCallback, useRef } from 'react';

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
  const requestVersion = useRef(0);

  const fetchData = useCallback(async () => {
    const request = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...JSON.parse(serializedParams));
      if (request === requestVersion.current) setData(result);
    } catch (err) {
      if (request === requestVersion.current) setError(err || new Error('Failed to fetch F1 data'));
    } finally {
      if (request === requestVersion.current) setLoading(false);
    }
  }, [apiFunc, serializedParams]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) fetchData(); });
    // This ref is a request counter, not a DOM node; invalidate in-flight responses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { cancelled = true; requestVersion.current++; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useErgast;
