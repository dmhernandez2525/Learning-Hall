'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface SearchFilters {
  category?: string;
  level?: string;
  isFree?: boolean;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  level?: string;
  instructor?: { id: string; name: string };
  metrics?: {
    rating?: number;
    reviewCount?: number;
    enrollmentCount?: number;
  };
  pricing?: {
    price?: number;
    currency?: string;
    isFree?: boolean;
  };
  relevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  facets?: {
    categories: { value: string; count: number }[];
    levels: { value: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
  };
}

interface UseSearchOptions {
  debounceMs?: number;
  initialFilters?: SearchFilters;
  pageSize?: number;
  autoSearch?: boolean;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: SearchResult[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
  facets?: SearchResponse['facets'];
  suggestions: string[];
  search: () => Promise<void>;
  clearSearch: () => void;
  trackClick: (courseId: string, position: number) => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    initialFilters = {},
    pageSize = 20,
    autoSearch = true,
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [facets, setFacets] = useState<SearchResponse['facets']>();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');

  // Perform search
  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('q', query);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      if (filters.category) params.set('category', filters.category);
      if (filters.level) params.set('level', filters.level);
      if (filters.isFree) params.set('isFree', 'true');
      if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
      if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
      if (filters.rating !== undefined) params.set('rating', String(filters.rating));

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();

      setResults(data.results);
      setTotal(data.total);
      setFacets(data.facets);
      lastQueryRef.current = query;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, page, pageSize]);

  // Get suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Silently fail for suggestions
    }
  }, []);

  // Track click
  const trackClick = useCallback((courseId: string, position: number) => {
    if (!lastQueryRef.current) return;

    fetch('/api/search/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'click',
        query: lastQueryRef.current,
        courseId,
        position,
      }),
    }).catch(console.error);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters(initialFilters);
    setResults([]);
    setTotal(0);
    setPage(1);
    setSuggestions([]);
    lastQueryRef.current = '';
  }, [initialFilters]);

  // Debounced search effect
  useEffect(() => {
    if (!autoSearch) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Fetch suggestions immediately
    fetchSuggestions(query);

    // Debounce the actual search
    debounceRef.current = setTimeout(() => {
      if (query.length >= 2 || Object.keys(filters).length > 0) {
        search();
      } else if (query.length === 0 && Object.keys(filters).length === 0) {
        setResults([]);
        setTotal(0);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters, autoSearch, debounceMs, search, fetchSuggestions]);

  // Reset page when query or filters change
  useEffect(() => {
    setPage(1);
  }, [query, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    total,
    page,
    setPage,
    isLoading,
    error,
    facets,
    suggestions,
    search,
    clearSearch,
    trackClick,
  };
}

// Hook for getting recommendations
export function useRecommendations(type: string = 'personalized') {
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/recommendations?type=${type}`);

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [type]);

  return { recommendations, isLoading, error };
}

// Hook for getting discovery sections
export function useDiscovery() {
  const [sections, setSections] = useState<
    Array<{
      id: string;
      title: string;
      type: string;
      courses: SearchResult[];
    }>
  >([]);
  const [filters, setFilters] = useState<{
    categories?: { id: string; name: string; count: number }[];
    levels?: { level: string; count: number }[];
    priceRanges?: { min: number; max: number; count: number }[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDiscovery = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/discover?includeFilters=true');

        if (!response.ok) {
          throw new Error('Failed to fetch discovery page');
        }

        const data = await response.json();
        setSections(data.sections || []);
        setFilters(data.filters || {});
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch discovery page'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscovery();
  }, []);

  return { sections, filters, isLoading, error };
}

export default useSearch;
