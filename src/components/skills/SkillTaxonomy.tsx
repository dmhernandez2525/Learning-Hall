'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Skill } from '@/types/skills';

export function SkillTaxonomy() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);

    const res = await fetch(`/api/skills?${params}`);
    if (res.ok) {
      const data = await res.json();
      setSkills(data.docs ?? []);
    }
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading skills...</p>;

  const categories = [...new Set(skills.map((s) => s.category))].sort();

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skill Taxonomy</h2>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills found.</p>
      ) : (
        <div className="space-y-2">
          {skills.map((s) => (
            <div key={s.id} className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${levelColors[s.level] ?? ''}`}>
                  {s.level}
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
