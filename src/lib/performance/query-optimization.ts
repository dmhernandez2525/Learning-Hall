// Database Query Optimization Utilities
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

// Query options for optimized fetching
export interface OptimizedQueryOptions {
  fields?: string[];
  depth?: number;
  cache?: boolean;
  cacheTtl?: number;
  batchSize?: number;
}

// Batch loader for N+1 query prevention
export class DataLoader<K, V> {
  private batch: Map<K, { resolve: (value: V) => void; reject: (error: Error) => void }[]> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchFn: (keys: K[]) => Promise<Map<K, V>>;
  private batchDelayMs: number;

  constructor(
    batchFn: (keys: K[]) => Promise<Map<K, V>>,
    options: { batchDelayMs?: number } = {}
  ) {
    this.batchFn = batchFn;
    this.batchDelayMs = options.batchDelayMs || 10;
  }

  async load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      const existing = this.batch.get(key);
      if (existing) {
        existing.push({ resolve, reject });
      } else {
        this.batch.set(key, [{ resolve, reject }]);
      }

      // Schedule batch execution
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.executeBatch(), this.batchDelayMs);
      }
    });
  }

  private async executeBatch(): Promise<void> {
    this.batchTimeout = null;
    const currentBatch = this.batch;
    this.batch = new Map();

    const keys = Array.from(currentBatch.keys());
    if (keys.length === 0) return;

    try {
      const results = await this.batchFn(keys);

      for (const [key, callbacks] of currentBatch) {
        const value = results.get(key);
        if (value !== undefined) {
          callbacks.forEach((cb) => cb.resolve(value));
        } else {
          callbacks.forEach((cb) => cb.reject(new Error(`No result for key: ${key}`)));
        }
      }
    } catch (error) {
      for (const callbacks of currentBatch.values()) {
        callbacks.forEach((cb) => cb.reject(error as Error));
      }
    }
  }

  clear(): void {
    this.batch.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

// Create a course loader
export function createCourseLoader(): DataLoader<string, Record<string, unknown>> {
  return new DataLoader(async (ids) => {
    const payload = await getPayload({ config });

    const courses = await payload.find({
      collection: 'courses',
      where: { id: { in: ids } },
      limit: ids.length,
    });

    const map = new Map<string, Record<string, unknown>>();
    for (const course of courses.docs) {
      map.set(String(course.id), course as Record<string, unknown>);
    }

    return map;
  });
}

// Create a user loader
export function createUserLoader(): DataLoader<string, Record<string, unknown>> {
  return new DataLoader(async (ids) => {
    const payload = await getPayload({ config });

    const users = await payload.find({
      collection: 'users',
      where: { id: { in: ids } },
      limit: ids.length,
    });

    const map = new Map<string, Record<string, unknown>>();
    for (const user of users.docs) {
      map.set(String(user.id), user as Record<string, unknown>);
    }

    return map;
  });
}

// Paginated query helper with cursor-based pagination
export interface PaginationResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export async function paginatedQuery<T>(
  collection: string,
  options: {
    where?: Where;
    cursor?: string;
    limit?: number;
    sort?: string;
    includeTotal?: boolean;
  }
): Promise<PaginationResult<T>> {
  const payload = await getPayload({ config });
  const { where = {}, cursor, limit = 20, sort = '-createdAt', includeTotal = false } = options;

  // Build where clause with cursor
  let finalWhere = where;
  if (cursor) {
    const cursorCondition: Where = { id: { greater_than: cursor } };
    finalWhere = where && Object.keys(where).length > 0
      ? { and: [where, cursorCondition] }
      : cursorCondition;
  }

  // Fetch one extra to check for more
  const results = await payload.find({
    collection: collection as 'courses',
    where: finalWhere,
    limit: limit + 1,
    sort,
  });

  const hasMore = results.docs.length > limit;
  const items = results.docs.slice(0, limit) as T[];
  const nextCursor = hasMore && items.length > 0
    ? String((items[items.length - 1] as { id: string }).id)
    : undefined;

  // Get total count if requested
  let totalCount: number | undefined;
  if (includeTotal) {
    const countResult = await payload.find({
      collection: collection as 'courses',
      where,
      limit: 0,
    });
    totalCount = countResult.totalDocs;
  }

  return {
    items,
    hasMore,
    nextCursor,
    totalCount,
  };
}

// Parallel query execution
export async function parallelQueries<T extends Record<string, () => Promise<unknown>>>(
  queries: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(queries) as (keyof T)[];
  const promises = keys.map((key) => queries[key]());
  const results = await Promise.all(promises);

  const output = {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
  keys.forEach((key, index) => {
    output[key] = results[index] as Awaited<ReturnType<T[typeof key]>>;
  });

  return output;
}

// Query timing decorator
export function TimedQuery(): MethodDecorator {
  return function (
    _target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const start = performance.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;

        if (duration > 100) {
          console.warn(`Slow query: ${String(propertyKey)} took ${duration.toFixed(2)}ms`);
        }

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`Failed query: ${String(propertyKey)} took ${duration.toFixed(2)}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}

// Select specific fields to reduce payload size
export function selectFields<T extends Record<string, unknown>>(
  item: T,
  fields: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of fields) {
    if (field in item) {
      result[field] = item[field];
    }
  }
  return result;
}

// Aggregation helper
export async function aggregate<T>(
  collection: string,
  options: {
    where?: Where;
    groupBy: string;
    aggregations: {
      field: string;
      operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
      as: string;
    }[];
  }
): Promise<Record<string, T>[]> {
  const payload = await getPayload({ config });
  const { where, groupBy, aggregations } = options;

  // Fetch all matching documents
  const results = await payload.find({
    collection: collection as 'courses',
    where: where || {},
    limit: 10000, // Adjust based on expected data size
  });

  // Group and aggregate
  const groups = new Map<string, { items: Record<string, unknown>[]; aggregates: Record<string, number> }>();

  for (const doc of results.docs) {
    const groupKey = String((doc as Record<string, unknown>)[groupBy]);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        items: [],
        aggregates: {},
      });
    }

    groups.get(groupKey)!.items.push(doc as Record<string, unknown>);
  }

  // Calculate aggregations
  const output: Record<string, T>[] = [];

  for (const [key, group] of groups) {
    const result: Record<string, unknown> = { [groupBy]: key };

    for (const agg of aggregations) {
      const values = group.items
        .map((item) => Number(item[agg.field] || 0))
        .filter((v) => !isNaN(v));

      let value: number;
      switch (agg.operation) {
        case 'sum':
          value = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'count':
          value = values.length;
          break;
        case 'min':
          value = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          value = values.length > 0 ? Math.max(...values) : 0;
          break;
        default:
          value = 0;
      }

      result[agg.as] = value;
    }

    output.push(result as Record<string, T>);
  }

  return output;
}

// Query builder for complex queries
export class QueryBuilder {
  private conditions: Where[] = [];
  private _sort: string = '-createdAt';
  private _limit: number = 20;
  private _page: number = 1;
  private _depth: number = 0;

  where(condition: Where): this {
    this.conditions.push(condition);
    return this;
  }

  equals(field: string, value: unknown): this {
    this.conditions.push({ [field]: { equals: value } });
    return this;
  }

  contains(field: string, value: string): this {
    this.conditions.push({ [field]: { contains: value } });
    return this;
  }

  greaterThan(field: string, value: number): this {
    this.conditions.push({ [field]: { greater_than: value } });
    return this;
  }

  lessThan(field: string, value: number): this {
    this.conditions.push({ [field]: { less_than: value } });
    return this;
  }

  inList(field: string, values: unknown[]): this {
    this.conditions.push({ [field]: { in: values } });
    return this;
  }

  sort(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._sort = direction === 'desc' ? `-${field}` : field;
    return this;
  }

  limit(count: number): this {
    this._limit = count;
    return this;
  }

  page(num: number): this {
    this._page = num;
    return this;
  }

  depth(level: number): this {
    this._depth = level;
    return this;
  }

  build(): { where: Where; sort: string; limit: number; page: number; depth: number } {
    const where: Where = this.conditions.length > 1
      ? { and: this.conditions }
      : this.conditions[0] || {};

    return {
      where,
      sort: this._sort,
      limit: this._limit,
      page: this._page,
      depth: this._depth,
    };
  }

  async execute<T>(collection: string): Promise<{ docs: T[]; totalDocs: number }> {
    const payload = await getPayload({ config });
    const query = this.build();

    const result = await payload.find({
      collection: collection as 'courses',
      ...query,
    });

    return {
      docs: result.docs as T[],
      totalDocs: result.totalDocs,
    };
  }
}

// Export factory function
export function query(): QueryBuilder {
  return new QueryBuilder();
}
