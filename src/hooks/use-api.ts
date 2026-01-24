'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

interface UseApiResult<T> {
  data: T | undefined;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, immediate = true } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Greška pri učitavanju podataka');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { data, error, isLoading, refetch: fetchData };
}

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseMutationResult<T, TVariables> {
  mutate: (variables: TVariables) => Promise<T | undefined>;
  data: T | undefined;
  error: string | null;
  isLoading: boolean;
  reset: () => void;
}

export function useMutation<T, TVariables = unknown>(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
  options: UseMutationOptions<T> = {}
): UseMutationResult<T, TVariables> {
  const { onSuccess, onError } = options;
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(variables),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Greška pri izvršavanju akcije');
        }

        setData(result);
        onSuccess?.(result);
        return result as T;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nepoznata greška';
        setError(errorMessage);
        onError?.(errorMessage);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, error, isLoading, reset };
}
