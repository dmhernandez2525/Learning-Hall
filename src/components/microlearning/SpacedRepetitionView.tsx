'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SpacedRepetitionCard } from '@/types/microlearning';

export function SpacedRepetitionView() {
  const [cards, setCards] = useState<SpacedRepetitionCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/microlearning/cards?due=true');
    if (res.ok) {
      const data = await res.json();
      setCards(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading due cards...</p>;

  if (cards.length === 0) {
    return <p className="text-sm text-muted-foreground">No cards due for review.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Due for Review</h2>
      <div className="space-y-2">
        {cards.map((c) => (
          <div key={c.id} className="rounded-lg border p-3">
            <p className="font-medium">{c.question}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Interval: {c.interval}d</span>
              <span>Ease: {c.easeFactor.toFixed(1)}</span>
              <span>Reps: {c.repetitions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
