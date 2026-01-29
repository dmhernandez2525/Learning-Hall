'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';

interface FavoriteCourseButtonProps {
  courseId: string;
  initialFavorite?: boolean;
  variant?: 'default' | 'icon-only';
}

export function FavoriteCourseButton({
  courseId,
  initialFavorite = false,
  variant = 'default',
}: FavoriteCourseButtonProps) {
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

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        disabled={pending}
        className={`transition-all duration-200 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Heart className={`w-5 h-5 transition-transform ${isFavorite ? 'fill-current scale-110' : 'scale-100'}`} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorite ? 'secondary' : 'ghost'}
      size="sm"
      onClick={toggleFavorite}
      disabled={pending}
      className={`transition-all duration-200 ${isFavorite ? 'text-red-500' : ''}`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 mr-2 transition-transform ${isFavorite ? 'fill-current scale-110' : 'scale-100'}`} />
      )}
      {isFavorite ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
