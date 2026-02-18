import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  SearchResult,
  SearchFilter,
  SavedSearch,
  SearchAnalytics,
} from '@/types/advanced-search';

// --------------- Formatters ---------------

export function formatSearchResult(
  doc: Record<string, unknown>,
  type: SearchResult['type'],
): SearchResult {
  return {
    id: String(doc.id),
    type,
    title: String(doc.title ?? doc.name ?? doc.email ?? ''),
    excerpt: String(doc.description ?? doc.content ?? doc.body ?? '').slice(0, 200),
    score: Number(doc._score ?? 1),
    url: `/${type}s/${String(doc.id)}`,
    highlightedFields: [],
  };
}

export function formatSavedSearch(doc: Record<string, unknown>): SavedSearch {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    name: String(doc.name ?? ''),
    query: String(doc.query ?? ''),
    filters: Array.isArray(doc.filters) ? (doc.filters as SearchFilter[]) : [],
    resultCount: Number(doc.resultCount ?? 0),
    lastRunAt: String(doc.lastRunAt ?? ''),
  };
}

// --------------- Search ---------------

function buildWhereFromQuery(query: string): Where {
  return {
    or: [
      { title: { contains: query } },
      { name: { contains: query } },
      { description: { contains: query } },
      { content: { contains: query } },
    ],
  } as Where;
}

export async function performSearch(
  query: string,
  types: SearchResult['type'][] = ['course', 'lesson', 'discussion', 'user'],
): Promise<SearchResult[]> {
  const payload = await getPayloadClient();
  const results: SearchResult[] = [];
  const where = buildWhereFromQuery(query);

  const collectionMap: Record<string, SearchResult['type']> = {
    courses: 'course',
    lessons: 'lesson',
    'discussion-threads': 'discussion',
    users: 'user',
  };

  for (const [collection, type] of Object.entries(collectionMap)) {
    if (!types.includes(type)) continue;
    try {
      const found = await payload.find({
        collection: collection as 'courses' | 'lessons' | 'discussion-threads' | 'users',
        where,
        limit: 20,
        depth: 0,
      });
      for (const doc of found.docs) {
        results.push(formatSearchResult(doc as Record<string, unknown>, type));
      }
    } catch {
      // Collection may not support all where conditions; skip silently
    }
  }

  return results;
}

// --------------- Saved Searches ---------------

export async function listSavedSearches(userId: string): Promise<SavedSearch[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'saved-searches',
    where: { user: { equals: userId } } as Where,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatSavedSearch(doc as Record<string, unknown>));
}

interface SaveSearchInput {
  name: string;
  query: string;
  filters?: SearchFilter[];
  resultCount?: number;
}

export async function saveSearch(input: SaveSearchInput, user: User): Promise<SavedSearch> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'saved-searches',
    data: {
      user: user.id,
      name: input.name,
      query: input.query,
      filters: input.filters ?? [],
      resultCount: input.resultCount ?? 0,
      lastRunAt: new Date().toISOString(),
      tenant: user.tenant,
    },
  });
  return formatSavedSearch(doc as Record<string, unknown>);
}

// --------------- Query Tracking ---------------

export async function recordQuery(
  query: string,
  resultCount: number,
  searchType: string,
  user: User,
): Promise<void> {
  const payload = await getPayloadClient();
  await payload.create({
    collection: 'search-queries',
    data: {
      user: user.id,
      query,
      resultCount,
      searchType,
      tenant: user.tenant,
    },
  });
}

// --------------- Analytics ---------------

export async function getSearchAnalytics(): Promise<SearchAnalytics> {
  const payload = await getPayloadClient();
  const queries = await payload.find({ collection: 'search-queries', limit: 500, depth: 0 });

  let totalResultCount = 0;
  const topQueries: Record<string, number> = {};
  const searchesByType: Record<string, number> = {};

  for (const doc of queries.docs) {
    const raw = doc as Record<string, unknown>;
    totalResultCount += Number(raw.resultCount ?? 0);
    const q = String(raw.query ?? '');
    topQueries[q] = (topQueries[q] ?? 0) + 1;
    const t = String(raw.searchType ?? 'all');
    searchesByType[t] = (searchesByType[t] ?? 0) + 1;
  }

  const totalSearches = queries.totalDocs;
  const avgResultCount = totalSearches > 0 ? Math.round(totalResultCount / totalSearches) : 0;

  return {
    totalSearches,
    avgResultCount,
    topQueries,
    searchesByType,
  };
}
