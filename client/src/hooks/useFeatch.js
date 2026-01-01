import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFunction, params = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (executeParams = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(executeParams || params);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, params]);

  const refetch = useCallback(() => {
    return execute(params);
  }, [execute, params]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData,
  };
};

export default useFetch;
