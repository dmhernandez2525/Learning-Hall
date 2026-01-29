'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  isFetching: boolean;
}

interface UseOptimizedQueryOptions<T> {
  enabled?: boolean;
  staleTime?: number; // Time in ms before data is considered stale
  cacheTime?: number; // Time in ms to keep data in cache
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number | false;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  placeholderData?: T;
}

// Simple in-memory cache for client-side
const queryCache = new Map<string, { data: unknown; timestamp: number; promise?: Promise<unknown> }>();

export function useOptimizedQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseOptimizedQueryOptions<T> = {}
): QueryState<T> & { refetch: () => Promise<void>; invalidate: () => void } {
  const {
    enabled = true,
    staleTime = 30000, // 30 seconds
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    refetchInterval = false,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    placeholderData,
  } = options;

  const cacheKey = Array.isArray(key) ? key.join(':') : key;

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryCache.get(cacheKey);
    if (cached) {
      const isStale = Date.now() - cached.timestamp > staleTime;
      return {
        data: cached.data as T,
        isLoading: false,
        error: null,
        isStale,
        isFetching: false,
      };
    }
    return {
      data: placeholderData || null,
      isLoading: enabled,
      error: null,
      isStale: false,
      isFetching: false,
    };
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isMountedRef.current) return;

    // Check for ongoing request
    const cached = queryCache.get(cacheKey);
    if (cached?.promise) {
      try {
        await cached.promise;
      } catch {
        // Ignore, will be handled by the original request
      }
      return;
    }

    if (!isBackground) {
      setState((prev) => ({ ...prev, isLoading: true, isFetching: true }));
    } else {
      setState((prev) => ({ ...prev, isFetching: true }));
    }

    const fetchPromise = fetcher();

    // Store promise in cache to dedupe requests
    queryCache.set(cacheKey, {
      data: cached?.data,
      timestamp: cached?.timestamp || 0,
      promise: fetchPromise,
    });

    try {
      const data = await fetchPromise;

      if (!isMountedRef.current) return;

      // Update cache
      queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      setState({
        data,
        isLoading: false,
        error: null,
        isStale: false,
        isFetching: false,
      });

      retryCountRef.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if (!isMountedRef.current) return;

      const err = error instanceof Error ? error : new Error('Query failed');

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => fetchData(isBackground), retryDelay * retryCountRef.current);
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err,
        isFetching: false,
      }));

      onError?.(err);
    }
  }, [cacheKey, fetcher, retry, retryDelay, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) return;

    const cached = queryCache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;

      if (age < staleTime) {
        // Data is fresh, use cache
        setState({
          data: cached.data as T,
          isLoading: false,
          error: null,
          isStale: false,
          isFetching: false,
        });
        return;
      }

      if (age < cacheTime) {
        // Data is stale but still in cache, show it and refetch in background
        setState({
          data: cached.data as T,
          isLoading: false,
          error: null,
          isStale: true,
          isFetching: true,
        });
        fetchData(true);
        return;
      }
    }

    // No cache or expired, fetch fresh data
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [cacheKey, enabled, staleTime, cacheTime, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      const cached = queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp > staleTime) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [cacheKey, refetchOnWindowFocus, enabled, staleTime, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => fetchData(true), refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    queryCache.delete(cacheKey);
    setState((prev) => ({ ...prev, isStale: true }));
  }, [cacheKey]);

  return {
    ...state,
    refetch,
    invalidate,
  };
}

// Hook for mutations with optimistic updates
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  invalidateQueries?: string[];
}

interface MutationState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): MutationState<TData> & {
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
} {
  const { onSuccess, onError, onSettled, invalidateQueries } = options;

  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState({
        data: null,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await mutationFn(variables);

        setState({
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
          isError: false,
        });

        // Invalidate related queries
        if (invalidateQueries) {
          for (const key of invalidateQueries) {
            queryCache.delete(key);
          }
        }

        onSuccess?.(data, variables);
        onSettled?.(data, null, variables);

        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Mutation failed');

        setState({
          data: null,
          isLoading: false,
          error: err,
          isSuccess: false,
          isError: true,
        });

        onError?.(err, variables);
        onSettled?.(null, err, variables);

        throw err;
      }
    },
    [mutationFn, onSuccess, onError, onSettled, invalidateQueries]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Hook for infinite scrolling queries
interface UseInfiniteQueryOptions<T> {
  getNextPageParam: (lastPage: T, allPages: T[]) => unknown | undefined;
  enabled?: boolean;
  staleTime?: number;
}

export function useInfiniteQuery<T>(
  key: string | string[],
  fetcher: (pageParam: unknown) => Promise<T>,
  options: UseInfiniteQueryOptions<T>
): {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
} {
  const { getNextPageParam, enabled = true, staleTime = 30000 } = options;

  const [pages, setPages] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextPageParam, setNextPageParam] = useState<unknown>(undefined);

  const cacheKey = Array.isArray(key) ? key.join(':') : key;

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    const fetchInitial = async () => {
      setIsLoading(true);

      try {
        const firstPage = await fetcher(undefined);
        setPages([firstPage]);
        setNextPageParam(getNextPageParam(firstPage, [firstPage]));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Query failed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [cacheKey, enabled, fetcher, getNextPageParam]);

  const fetchNextPage = useCallback(async () => {
    if (!nextPageParam || isFetchingNextPage) return;

    setIsFetchingNextPage(true);

    try {
      const nextPage = await fetcher(nextPageParam);
      setPages((prev) => {
        const newPages = [...prev, nextPage];
        setNextPageParam(getNextPageParam(nextPage, newPages));
        return newPages;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [nextPageParam, isFetchingNextPage, fetcher, getNextPageParam]);

  return {
    data: pages,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage: nextPageParam !== undefined,
    fetchNextPage,
  };
}

// Utility to invalidate queries
export function invalidateQuery(key: string | string[]): void {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  queryCache.delete(cacheKey);
}

// Utility to prefetch queries
export async function prefetchQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;

  const cached = queryCache.get(cacheKey);
  if (cached && cached.data) {
    return cached.data as T;
  }

  const data = await fetcher();
  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

export default useOptimizedQuery;
