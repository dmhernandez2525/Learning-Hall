'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

interface FavoriteCourseButtonProps {
  courseId: string;
  initialFavorite?: boolean;
}

export function FavoriteCourseButton({ courseId, initialFavorite = false }: FavoriteCourseButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  const toggleFavorite = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/favorites/${courseId}`, {
          method: isFavorite ? 'DELETE' : 'POST',
        });
        if (!response.ok) throw new Error('Request failed');
        setIsFavorite((prev) => !prev);
      } catch (error) {
        console.error('Favorite toggle error', error);
      }
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleFavorite} disabled={pending}>
      {isFavorite ? '★ Favorite' : '☆ Favorite'}
    </Button>
  );
}
