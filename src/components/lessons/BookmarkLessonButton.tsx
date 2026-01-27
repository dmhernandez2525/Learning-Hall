'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

interface BookmarkLessonButtonProps {
  lessonId: string;
  initialBookmarked?: boolean;
}

export function BookmarkLessonButton({ lessonId, initialBookmarked = false }: BookmarkLessonButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  const toggleBookmark = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookmarks/${lessonId}`, {
          method: bookmarked ? 'DELETE' : 'POST',
        });
        if (!response.ok) throw new Error('Request failed');
        setBookmarked((prev) => !prev);
      } catch (error) {
        console.error('Bookmark toggle error', error);
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleBookmark} disabled={pending}>
      {bookmarked ? 'Bookmarked' : 'Bookmark lesson'}
    </Button>
  );
}
