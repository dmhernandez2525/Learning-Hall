'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewFormProps {
  courseSlug: string;
  onSuccess?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    title?: string;
    content?: string;
  };
}

export function ReviewForm({ courseSlug, onSuccess, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isEditing = Boolean(existingReview);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    startTransition(async () => {
      try {
        const url = isEditing
          ? `/api/reviews/${existingReview!.id}`
          : `/api/courses/${courseSlug}/reviews`;

        const response = await fetch(url, {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            title: title || undefined,
            content: content || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to submit review');
        }

        onSuccess?.();

        if (!isEditing) {
          setRating(0);
          setTitle('');
          setContent('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit review');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Your Review' : 'Write a Review'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onChange={setRating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Review (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this course..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/2000 characters
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={pending || rating === 0}>
            {pending ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </Button>

          {!isEditing && (
            <p className="text-xs text-muted-foreground">
              Your review will be visible after moderation.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
