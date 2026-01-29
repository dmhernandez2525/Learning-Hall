'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';

interface BookmarkLessonButtonProps {
  lessonId: string;
  initialBookmarked?: boolean;
  videoTimestamp?: number;
  variant?: 'default' | 'icon-only';
}

export function BookmarkLessonButton({
  lessonId,
  initialBookmarked = false,
  videoTimestamp,
  variant = 'default',
}: BookmarkLessonButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  const toggleBookmark = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookmarks/${lessonId}`, {
          method: bookmarked ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoTimestamp }),
        });
        if (!response.ok) throw new Error('Request failed');
        setBookmarked((prev) => !prev);
      } catch (error) {
        console.error('Bookmark toggle error', error);
      }
    });
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleBookmark}
        disabled={pending}
        className={`transition-all duration-200 ${bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : bookmarked ? (
          <BookmarkCheck className="w-5 h-5 fill-current" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={bookmarked ? 'secondary' : 'outline'}
      size="sm"
      onClick={toggleBookmark}
      disabled={pending}
      className={`transition-all duration-200 ${bookmarked ? 'text-primary' : ''}`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="w-4 h-4 mr-2 fill-current" />
      ) : (
        <Bookmark className="w-4 h-4 mr-2" />
      )}
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
}
