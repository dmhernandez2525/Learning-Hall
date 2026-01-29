// Search & Discovery Module - Main Exports
export * from './recommendations';
export * from './analytics';
export * from './discovery';

import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';

export interface SearchFilters {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
  rating?: number;
  locale?: string;
  tenantId?: string;
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

/**
 * Search courses and content
 */
export async function search(
  query: string,
  filters: SearchFilters = {},
  page = 1,
  pageSize = 20
): Promise<SearchResponse> {
  const payload = await getPayload({ config });

  // Build where clause
  const conditions: Where[] = [{ status: { equals: 'active' } }];

  // Full-text search on title, description, content
  if (query) {
    conditions.push({
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
        { content: { contains: query } },
      ],
    });
  }

  if (filters.category) {
    conditions.push({ category: { equals: filters.category } });
  }

  if (filters.level) {
    conditions.push({ level: { equals: filters.level } });
  }

  if (filters.isFree !== undefined) {
    conditions.push({ 'pricing.isFree': { equals: filters.isFree } });
  }

  if (filters.priceMin !== undefined) {
    conditions.push({ 'pricing.price': { greater_than_equal: filters.priceMin } });
  }

  if (filters.priceMax !== undefined) {
    conditions.push({ 'pricing.price': { less_than_equal: filters.priceMax } });
  }

  if (filters.rating !== undefined) {
    conditions.push({ 'metrics.rating': { greater_than_equal: filters.rating } });
  }

  if (filters.locale) {
    conditions.push({ locale: { equals: filters.locale } });
  }

  if (filters.tenantId) {
    conditions.push({ tenant: { equals: filters.tenantId } });
  }

  // Execute search
  const searchResults = await payload.find({
    collection: 'search-index',
    where: { and: conditions } as Where,
    sort: '-boostScore,-metrics.rating',
    page,
    limit: pageSize,
  });

  // Map results
  const results: SearchResult[] = searchResults.docs.map((doc, index) => ({
    id: doc.entityId as string,
    entityType: doc.entityType as string,
    title: doc.title,
    slug: doc.slug as string | undefined,
    description: doc.description as string | undefined,
    thumbnail: doc.thumbnail as string | undefined,
    category: doc.category as string | undefined,
    level: doc.level as string | undefined,
    instructor: doc.instructor as { id: string; name: string } | undefined,
    metrics: doc.metrics as SearchResult['metrics'],
    pricing: doc.pricing as SearchResult['pricing'],
    relevanceScore: 1 - index * 0.01, // Simple relevance scoring
  }));

  // Get facets for filtering
  const facets = await getSearchFacets(filters.tenantId);

  return {
    results,
    total: searchResults.totalDocs,
    page: searchResults.page || 1,
    pageSize: searchResults.limit,
    facets,
  };
}

/**
 * Get facets for search filtering
 */
async function getSearchFacets(tenantId?: string) {
  const payload = await getPayload({ config });

  // Get all active items for facet calculation
  const allItems = await payload.find({
    collection: 'search-index',
    where: tenantId
      ? ({ and: [{ status: { equals: 'active' } }, { tenant: { equals: tenantId } }] } as Where)
      : { status: { equals: 'active' } },
    limit: 1000,
  });

  // Calculate category facets
  const categoryCount: Record<string, number> = {};
  const levelCount: Record<string, number> = {};
  const priceBuckets = [
    { min: 0, max: 0, count: 0 },
    { min: 0.01, max: 25, count: 0 },
    { min: 25.01, max: 50, count: 0 },
    { min: 50.01, max: 100, count: 0 },
    { min: 100.01, max: Infinity, count: 0 },
  ];

  for (const item of allItems.docs) {
    // Categories
    if (item.category) {
      categoryCount[item.category as string] = (categoryCount[item.category as string] || 0) + 1;
    }

    // Levels
    if (item.level) {
      levelCount[item.level as string] = (levelCount[item.level as string] || 0) + 1;
    }

    // Price ranges
    const pricing = item.pricing as { price?: number; isFree?: boolean } | undefined;
    const price = pricing?.isFree ? 0 : pricing?.price || 0;
    for (const bucket of priceBuckets) {
      if (price >= bucket.min && price <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  return {
    categories: Object.entries(categoryCount)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    levels: Object.entries(levelCount)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    priceRanges: priceBuckets.filter((b) => b.count > 0),
  };
}

/**
 * Index a course for search
 */
export async function indexCourse(courseId: string) {
  const payload = await getPayload({ config });

  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 2,
  });

  if (!course) return;

  // Check if index entry exists
  const existing = await payload.find({
    collection: 'search-index',
    where: {
      and: [{ entityType: { equals: 'course' } }, { entityId: { equals: courseId } }],
    },
    limit: 1,
  });

  const indexData = {
    entityType: 'course' as const,
    entityId: courseId,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    level: course.level,
    thumbnail:
      typeof course.thumbnail === 'object'
        ? (course.thumbnail as { url?: string })?.url
        : undefined,
    instructor:
      typeof course.instructor === 'object'
        ? {
            id: String((course.instructor as { id: string | number }).id),
            name:
              (course.instructor as { name?: string; firstName?: string; lastName?: string })
                .name ||
              `${(course.instructor as { firstName?: string }).firstName || ''} ${(course.instructor as { lastName?: string }).lastName || ''}`.trim(),
          }
        : undefined,
    metrics: {
      rating: course.averageRating || 0,
      reviewCount: course.reviewCount || 0,
      enrollmentCount: course.enrollmentCount || 0,
    },
    pricing: {
      price: course.price || 0,
      currency: course.currency || 'USD',
      isFree: !course.price || course.price === 0,
    },
    tenant: course.tenant,
    status: course.status === 'published' ? ('active' as const) : ('hidden' as const),
    lastIndexedAt: new Date().toISOString(),
  };

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'search-index',
      id: existing.docs[0].id,
      data: indexData,
    });
  } else {
    await payload.create({
      collection: 'search-index',
      data: indexData,
    });
  }
}

/**
 * Remove a course from the search index
 */
export async function removeCourseFromIndex(courseId: string) {
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'search-index',
    where: {
      and: [{ entityType: { equals: 'course' } }, { entityId: { equals: courseId } }],
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.delete({
      collection: 'search-index',
      id: existing.docs[0].id,
    });
  }
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSuggestions(
  query: string,
  tenantId?: string,
  limit = 5
): Promise<string[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'active' } },
    { title: { contains: query } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const results = await payload.find({
    collection: 'search-index',
    where: { and: conditions } as Where,
    limit,
  });

  return results.docs.map((doc) => doc.title);
}

/**
 * Get popular searches
 */
export async function getPopularSearches(tenantId?: string, limit = 10): Promise<string[]> {
  // In production, this would query analytics data
  // For now, return most enrolled courses
  const payload = await getPayload({ config });

  const conditions: Where[] = [{ status: { equals: 'active' } }];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const results = await payload.find({
    collection: 'search-index',
    where: { and: conditions } as Where,
    sort: '-metrics.enrollmentCount',
    limit,
  });

  return results.docs.map((doc) => doc.title);
}

/**
 * Get related courses
 */
export async function getRelatedCourses(courseId: string, limit = 4): Promise<SearchResult[]> {
  const payload = await getPayload({ config });

  // Get the source course
  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
  });

  if (!course) return [];

  // Find courses with same category or level
  const results = await payload.find({
    collection: 'search-index',
    where: {
      and: [
        { status: { equals: 'active' } },
        { entityType: { equals: 'course' } },
        { entityId: { not_equals: courseId } },
        {
          or: [
            { category: { equals: course.category } },
            { level: { equals: course.level } },
          ],
        },
      ],
    },
    sort: '-metrics.rating',
    limit,
  });

  return results.docs.map((doc) => ({
    id: doc.entityId as string,
    entityType: doc.entityType as string,
    title: doc.title,
    slug: doc.slug as string | undefined,
    description: doc.description as string | undefined,
    thumbnail: doc.thumbnail as string | undefined,
    category: doc.category as string | undefined,
    level: doc.level as string | undefined,
    instructor: doc.instructor as { id: string; name: string } | undefined,
    metrics: doc.metrics as SearchResult['metrics'],
    pricing: doc.pricing as SearchResult['pricing'],
    relevanceScore: 1,
  }));
}

/**
 * Reindex all courses
 */
export async function reindexAll() {
  const payload = await getPayload({ config });

  let page = 1;
  const pageSize = 100;
  let totalIndexed = 0;

  // Paginate through all published courses for scalable reindexing
  while (true) {
    const courses = await payload.find({
      collection: 'courses',
      where: { status: { equals: 'published' } },
      limit: pageSize,
      page,
    });

    if (courses.docs.length === 0) break;

    // Index courses in parallel batches
    await Promise.all(
      courses.docs.map((course) => indexCourse(String(course.id)))
    );

    totalIndexed += courses.docs.length;

    if (!courses.hasNextPage) break;
    page++;
  }

  console.log(`Reindexed ${totalIndexed} courses`);
}
