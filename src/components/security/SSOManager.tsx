'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SSOConfig } from '@/types/security';

export function SSOManager() {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/security/sso');
    if (res.ok) {
      const data = await res.json();
      setConfigs(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchConfigs();
  }, [fetchConfigs]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading SSO configs...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">SSO Configuration</h2>

      {configs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No SSO providers configured.</p>
      ) : (
        <div className="space-y-2">
          {configs.map((c) => (
            <div key={c.id} className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {c.provider.toUpperCase()} &middot; {c.issuerUrl}
                </p>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs ${c.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {c.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
