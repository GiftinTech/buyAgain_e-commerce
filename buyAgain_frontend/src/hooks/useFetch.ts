/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (overrideUrl?: string) => Promise<void>; // accepts optional override URL
}

function useFetch<T = any>(
  url: string | null,
  options?: RequestInit,
  enabled: boolean = true, // default = true
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (overrideUrl?: string) => {
      if (!enabled || !(overrideUrl || url)) return; // don't fetch if disabled or no URL

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(
          `${BUYAGAIN_API_BASE_URL}${overrideUrl || url}`,
          options,
        );
        const result = await res.json();

        if (!res.ok) {
          throw new Error(
            result.message || `HTTP error! Status: ${res.status}`,
          );
        } else {
          setData(result.data || result);
          setError(null);
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'An unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [url, options, enabled],
  );

  useEffect(() => {
    if (enabled && url) {
      fetchData();
    }
  }, [fetchData, enabled, url]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
