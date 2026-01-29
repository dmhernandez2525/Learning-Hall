// Search Analytics Tracking
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

export interface SearchEvent {
  query: string;
  filters?: Record<string, unknown>;
  resultsCount: number;
  userId?: string;
  tenantId?: string;
}

export interface ClickEvent {
  query: string;
  courseId: string;
  position: number;
  userId?: string;
  tenantId?: string;
}

export interface ConversionEvent {
  query: string;
  courseId: string;
  userId: string;
  tenantId?: string;
}

// Track a search event
export async function trackSearch(event: SearchEvent): Promise<void> {
  const payload = await getPayload({ config });
  const normalizedQuery = event.query.toLowerCase().trim();

  if (!normalizedQuery) return;

  try {
    // Find existing analytics entry
    const where: Where = event.tenantId
      ? {
          and: [
            { normalizedQuery: { equals: normalizedQuery } },
            { tenant: { equals: event.tenantId } },
          ],
        }
      : { normalizedQuery: { equals: normalizedQuery } };

    const existing = await payload.find({
      collection: 'search-analytics',
      where,
      limit: 1,
    });

    const now = new Date().toISOString();

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      const currentCount = (doc.searchCount as number) || 0;
      const currentResultsCount = (doc.resultsCount as number) || 0;
      const currentZeroResults = (doc.zeroResultsCount as number) || 0;

      // Update existing entry
      await payload.update({
        collection: 'search-analytics',
        id: doc.id,
        data: {
          searchCount: currentCount + 1,
          resultsCount: Math.round((currentResultsCount * currentCount + event.resultsCount) / (currentCount + 1)),
          zeroResultsCount: event.resultsCount === 0 ? currentZeroResults + 1 : currentZeroResults,
          lastSearchedAt: now,
          filters: event.filters || doc.filters,
        },
      });
    } else {
      // Create new entry
      await payload.create({
        collection: 'search-analytics',
        data: {
          query: event.query,
          normalizedQuery,
          searchCount: 1,
          resultsCount: event.resultsCount,
          zeroResultsCount: event.resultsCount === 0 ? 1 : 0,
          clicks: 0,
          conversions: 0,
          clickThroughRate: 0,
          firstSearchedAt: now,
          lastSearchedAt: now,
          tenant: event.tenantId,
          topResults: [],
        },
      });
    }
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}

// Track a click on search result
export async function trackClick(event: ClickEvent): Promise<void> {
  const payload = await getPayload({ config });
  const normalizedQuery = event.query.toLowerCase().trim();

  if (!normalizedQuery) return;

  try {
    const where: Where = event.tenantId
      ? {
          and: [
            { normalizedQuery: { equals: normalizedQuery } },
            { tenant: { equals: event.tenantId } },
          ],
        }
      : { normalizedQuery: { equals: normalizedQuery } };

    const existing = await payload.find({
      collection: 'search-analytics',
      where,
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      const currentClicks = (doc.clicks as number) || 0;
      const currentSearchCount = (doc.searchCount as number) || 1;
      const currentAvgPosition = (doc.averagePosition as number) || 0;
      const topResults = (doc.topResults as Array<{ courseId: string; clicks: number; position: number }>) || [];

      // Update top results
      const existingResult = topResults.find((r) => r.courseId === event.courseId);
      if (existingResult) {
        existingResult.clicks += 1;
        existingResult.position = Math.round((existingResult.position + event.position) / 2);
      } else {
        topResults.push({
          courseId: event.courseId,
          clicks: 1,
          position: event.position,
        });
      }

      // Sort by clicks and keep top 10
      topResults.sort((a, b) => b.clicks - a.clicks);
      const updatedTopResults = topResults.slice(0, 10);

      const newClicks = currentClicks + 1;
      const newCTR = Math.round((newClicks / currentSearchCount) * 100);
      const newAvgPosition = Math.round((currentAvgPosition * currentClicks + event.position) / newClicks);

      await payload.update({
        collection: 'search-analytics',
        id: doc.id,
        data: {
          clicks: newClicks,
          clickThroughRate: newCTR,
          averagePosition: newAvgPosition,
          topResults: updatedTopResults,
        },
      });
    }
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

// Track a conversion (enrollment from search)
export async function trackConversion(event: ConversionEvent): Promise<void> {
  const payload = await getPayload({ config });
  const normalizedQuery = event.query.toLowerCase().trim();

  if (!normalizedQuery) return;

  try {
    const where: Where = event.tenantId
      ? {
          and: [
            { normalizedQuery: { equals: normalizedQuery } },
            { tenant: { equals: event.tenantId } },
          ],
        }
      : { normalizedQuery: { equals: normalizedQuery } };

    const existing = await payload.find({
      collection: 'search-analytics',
      where,
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      const currentConversions = (doc.conversions as number) || 0;

      await payload.update({
        collection: 'search-analytics',
        id: doc.id,
        data: {
          conversions: currentConversions + 1,
        },
      });
    }
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
}

// Get trending searches
export async function getTrendingSearches(
  tenantId?: string,
  limit: number = 10
): Promise<{ query: string; searchCount: number }[]> {
  const payload = await getPayload({ config });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const where: Where = tenantId
    ? {
        and: [
          { tenant: { equals: tenantId } },
          { lastSearchedAt: { greater_than: sevenDaysAgo.toISOString() } },
        ],
      }
    : { lastSearchedAt: { greater_than: sevenDaysAgo.toISOString() } };

  const results = await payload.find({
    collection: 'search-analytics',
    where,
    sort: '-searchCount',
    limit,
  });

  return results.docs.map((doc) => ({
    query: doc.query,
    searchCount: doc.searchCount as number,
  }));
}

// Get popular searches
export async function getPopularSearches(
  tenantId?: string,
  limit: number = 10
): Promise<{ query: string; searchCount: number }[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? { tenant: { equals: tenantId } }
    : {};

  const results = await payload.find({
    collection: 'search-analytics',
    where,
    sort: '-searchCount',
    limit,
  });

  return results.docs.map((doc) => ({
    query: doc.query,
    searchCount: doc.searchCount as number,
  }));
}

// Get zero-result searches (useful for content gap analysis)
export async function getZeroResultSearches(
  tenantId?: string,
  limit: number = 20
): Promise<{ query: string; zeroResultsCount: number; searchCount: number }[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? {
        and: [
          { tenant: { equals: tenantId } },
          { zeroResultsCount: { greater_than: 0 } },
        ],
      }
    : { zeroResultsCount: { greater_than: 0 } };

  const results = await payload.find({
    collection: 'search-analytics',
    where,
    sort: '-zeroResultsCount',
    limit,
  });

  return results.docs.map((doc) => ({
    query: doc.query,
    zeroResultsCount: doc.zeroResultsCount as number,
    searchCount: doc.searchCount as number,
  }));
}

// Get low CTR searches (opportunity for improvement)
export async function getLowCTRSearches(
  tenantId?: string,
  minSearches: number = 10,
  limit: number = 20
): Promise<{ query: string; ctr: number; searchCount: number }[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? {
        and: [
          { tenant: { equals: tenantId } },
          { searchCount: { greater_than_equal: minSearches } },
          { clickThroughRate: { less_than: 20 } },
        ],
      }
    : {
        and: [
          { searchCount: { greater_than_equal: minSearches } },
          { clickThroughRate: { less_than: 20 } },
        ],
      };

  const results = await payload.find({
    collection: 'search-analytics',
    where,
    sort: 'clickThroughRate',
    limit,
  });

  return results.docs.map((doc) => ({
    query: doc.query,
    ctr: doc.clickThroughRate as number,
    searchCount: doc.searchCount as number,
  }));
}

// Get search analytics summary
export async function getSearchAnalyticsSummary(
  tenantId?: string,
  days: number = 30
): Promise<{
  totalSearches: number;
  uniqueQueries: number;
  averageCTR: number;
  averageResultsCount: number;
  zeroResultsRate: number;
  topQueries: { query: string; count: number }[];
  topConvertingQueries: { query: string; conversions: number }[];
}> {
  const payload = await getPayload({ config });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: Where = tenantId
    ? {
        and: [
          { tenant: { equals: tenantId } },
          { lastSearchedAt: { greater_than: startDate.toISOString() } },
        ],
      }
    : { lastSearchedAt: { greater_than: startDate.toISOString() } };

  const allAnalytics = await payload.find({
    collection: 'search-analytics',
    where,
    limit: 1000,
  });

  const docs = allAnalytics.docs;

  if (docs.length === 0) {
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      averageCTR: 0,
      averageResultsCount: 0,
      zeroResultsRate: 0,
      topQueries: [],
      topConvertingQueries: [],
    };
  }

  let totalSearches = 0;
  let totalCTR = 0;
  let totalResults = 0;
  let totalZeroResults = 0;

  for (const doc of docs) {
    const searchCount = (doc.searchCount as number) || 0;
    totalSearches += searchCount;
    totalCTR += (doc.clickThroughRate as number) || 0;
    totalResults += ((doc.resultsCount as number) || 0) * searchCount;
    totalZeroResults += (doc.zeroResultsCount as number) || 0;
  }

  const topQueries = docs
    .sort((a, b) => ((b.searchCount as number) || 0) - ((a.searchCount as number) || 0))
    .slice(0, 10)
    .map((doc) => ({
      query: doc.query,
      count: (doc.searchCount as number) || 0,
    }));

  const topConvertingQueries = docs
    .filter((doc) => ((doc.conversions as number) || 0) > 0)
    .sort((a, b) => ((b.conversions as number) || 0) - ((a.conversions as number) || 0))
    .slice(0, 10)
    .map((doc) => ({
      query: doc.query,
      conversions: (doc.conversions as number) || 0,
    }));

  return {
    totalSearches,
    uniqueQueries: docs.length,
    averageCTR: Math.round(totalCTR / docs.length),
    averageResultsCount: totalSearches > 0 ? Math.round(totalResults / totalSearches) : 0,
    zeroResultsRate: totalSearches > 0 ? Math.round((totalZeroResults / totalSearches) * 100) : 0,
    topQueries,
    topConvertingQueries,
  };
}
