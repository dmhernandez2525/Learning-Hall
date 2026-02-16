'use client';

import { useState, useCallback, useEffect } from 'react';
import type { BreakoutRoom } from '@/types/virtual-classroom';

interface BreakoutRoomManagerProps {
  sessionId: string;
}

export function BreakoutRoomManager({ sessionId }: BreakoutRoomManagerProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/virtual-classroom/sessions/${sessionId}/breakout-rooms`);
    if (res.ok) {
      const data = await res.json();
      setRooms(data.docs ?? []);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading breakout rooms...</p>;

  if (rooms.length === 0) {
    return <p className="text-sm text-muted-foreground">No breakout rooms created.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Breakout Rooms</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rooms.map((r) => (
          <div key={r.id} className="rounded-lg border p-3 text-center">
            <h3 className="font-medium">{r.name}</h3>
            <p className="text-xs text-muted-foreground">
              {r.participantCount}/{r.capacity} participants
            </p>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${r.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
