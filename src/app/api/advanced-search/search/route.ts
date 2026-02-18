import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { performSearch, recordQuery } from '@/lib/advanced-search';
import type { SearchResult } from '@/types/advanced-search';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const typesParam = searchParams.get('types');

  if (!query) return NextResponse.json({ docs: [] });

  const types = typesParam
    ? (typesParam.split(',') as SearchResult['type'][])
    : undefined;

  const docs = await performSearch(query, types);
  void recordQuery(query, docs.length, types?.join(',') ?? 'all', user);
  return NextResponse.json({ docs });
}
