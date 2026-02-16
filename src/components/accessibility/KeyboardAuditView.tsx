'use client';

import { useState, useCallback, useEffect } from 'react';
import type { KeyboardNavAudit } from '@/types/accessibility';

export function KeyboardAuditView() {
  const [audits, setAudits] = useState<KeyboardNavAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/accessibility/keyboard');
    if (res.ok) {
      const data = await res.json();
      setAudits(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAudits();
  }, [fetchAudits]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading keyboard audits...</p>;

  if (audits.length === 0) {
    return <p className="text-sm text-muted-foreground">No keyboard navigation audits yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Keyboard Navigation Audits</h2>
      <div className="space-y-2">
        {audits.map((a) => (
          <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{a.pageUrl}</p>
              <p className="text-xs text-muted-foreground">
                {a.tabOrder.length} elements &middot; {a.trappedElements.length} trapped &middot; {a.missingFocus.length} missing focus
              </p>
            </div>
            <span className={`rounded px-2 py-0.5 text-xs ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {a.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
