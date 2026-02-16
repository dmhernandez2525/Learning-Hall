'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ContentItem } from '@/types/content-library';

interface ContentBrowserProps {
  organizationId?: string;
}

export function ContentBrowser({ organizationId }: ContentBrowserProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (organizationId) params.set('organizationId', organizationId);
    if (typeFilter) params.set('contentType', typeFilter);

    const res = await fetch(`/api/content-library/items?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.docs ?? []);
    }
    setLoading(false);
  }, [organizationId, typeFilter]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading content...</p>;

  const typeLabels: Record<string, string> = {
    document: 'Document',
    video: 'Video',
    image: 'Image',
    template: 'Template',
    scorm: 'SCORM',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content Library</h2>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content items found.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                    {typeLabels[item.contentType] ?? item.contentType}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColors[item.status] ?? ''}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>v{item.versionCount}</span>
                {item.tags.length > 0 && <span>Tags: {item.tags.join(', ')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
