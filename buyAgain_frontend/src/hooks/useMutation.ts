/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

interface UseMutationState<T, K> {
  loading: boolean;
  error: string | null;
  data: T | null;
  mutate: (variables: K) => Promise<void>;
}

export function useMutation<T = any, K = any>(
  mutationFn: (variables: K) => Promise<Response>,
  onSuccess?: () => void,
): UseMutationState<T, K> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (variables: K) => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, mutate };
}
