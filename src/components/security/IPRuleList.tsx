'use client';

import { useState, useCallback, useEffect } from 'react';
import type { IPRestriction } from '@/types/security';

export function IPRuleList() {
  const [rules, setRules] = useState<IPRestriction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/security/ip-restrictions');
    if (res.ok) {
      const data = await res.json();
      setRules(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading IP rules...</p>;

  if (rules.length === 0) {
    return <p className="text-sm text-muted-foreground">No IP restrictions configured.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">IP Restrictions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Label</th>
            <th className="pb-2 font-medium">CIDR Range</th>
            <th className="pb-2 font-medium">Action</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.label}</td>
              <td className="py-2 font-mono text-xs">{r.cidrRange}</td>
              <td className="py-2">
                <span className={`rounded px-2 py-0.5 text-xs ${r.action === 'allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {r.action}
                </span>
              </td>
              <td className="py-2">{r.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
