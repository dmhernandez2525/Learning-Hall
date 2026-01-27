'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    id: string;
    user: { id: string; name?: string };
    rating: number;
    title?: string;
    content?: string;
    verifiedPurchase: boolean;
    helpfulVotes: number;
    hasVotedHelpful?: boolean;
    instructorResponse?: string;
    respondedAt?: string;
    createdAt: string;
  };
  showHelpfulButton?: boolean;
  onHelpfulVote?: () => void;
}

export function ReviewCard({ review, showHelpfulButton = true, onHelpfulVote }: ReviewCardProps) {
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes);
  const [hasVoted, setHasVoted] = useState(review.hasVotedHelpful || false);
  const [pending, startTransition] = useTransition();

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleHelpfulClick = () => {
    if (hasVoted || pending) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/reviews/${review.id}/helpful`, {
          method: 'POST',
        });

        if (response.ok) {
          setHelpfulVotes((prev) => prev + 1);
          setHasVoted(true);
          onHelpfulVote?.();
        }
      } catch (error) {
        console.error('Failed to vote helpful:', error);
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                {review.title && (
                  <span className="font-medium">{review.title}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{review.user.name || 'Anonymous'}</span>
                <span>·</span>
                <span>{formattedDate}</span>
                {review.verifiedPurchase && (
                  <>
                    <span>·</span>
                    <span className="text-green-600 font-medium">Verified Student</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {review.content && (
            <p className="text-sm whitespace-pre-wrap">{review.content}</p>
          )}

          {/* Instructor Response */}
          {review.instructorResponse && (
            <div className="mt-4 pl-4 border-l-2 border-primary/20 bg-muted/50 p-3 rounded-r">
              <p className="text-sm font-medium mb-1">Instructor Response</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {review.instructorResponse}
              </p>
              {review.respondedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(review.respondedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {showHelpfulButton && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulClick}
                disabled={hasVoted || pending}
                className={cn(
                  'text-xs',
                  hasVoted && 'text-primary'
                )}
              >
                {hasVoted ? 'Marked as helpful' : 'Helpful'}
                {helpfulVotes > 0 && ` (${helpfulVotes})`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
