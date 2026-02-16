'use client';

import { useState, useCallback, useEffect } from 'react';
import type { EmailDigestConfig } from '@/types/notifications';

export function DigestSettings() {
  const [config, setConfig] = useState<EmailDigestConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/notifications/digest-config');
    if (res.ok) {
      const data = await res.json();
      setConfig(data.doc ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading digest settings...</p>;

  if (!config) {
    return <p className="text-sm text-muted-foreground">No digest configuration found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Email Digest Settings</h2>
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Frequency</span>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs">{config.frequency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Enabled</span>
          <span className="text-sm font-medium">{config.isEnabled ? 'Yes' : 'No'}</span>
        </div>
        {config.lastSentAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Sent</span>
            <span className="text-xs text-muted-foreground">{config.lastSentAt}</span>
          </div>
        )}
      </div>
    </div>
  );
}
