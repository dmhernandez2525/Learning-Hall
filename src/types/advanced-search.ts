export interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'discussion' | 'user';
  title: string;
  excerpt: string;
  score: number;
  url: string;
  highlightedFields: string[];
}

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt';
  value: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: SearchFilter[];
  resultCount: number;
  lastRunAt: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  avgResultCount: number;
  topQueries: Record<string, number>;
  searchesByType: Record<string, number>;
}
