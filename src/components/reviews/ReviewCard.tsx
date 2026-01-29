'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ThumbsUp, BadgeCheck, MessageSquare, User } from 'lucide-react';

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

// Format relative time (e.g., "2 days ago", "3 months ago")
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

// Generate initials from name
function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Generate a consistent color based on name
function getAvatarColor(name?: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function ReviewCard({ review, showHelpfulButton = true, onHelpfulVote }: ReviewCardProps) {
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes);
  const [hasVoted, setHasVoted] = useState(review.hasVotedHelpful || false);
  const [pending, startTransition] = useTransition();

  const timeAgo = formatTimeAgo(review.createdAt);
  const initials = getInitials(review.user.name);
  const avatarColor = getAvatarColor(review.user.name);

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
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with Avatar */}
          <div className="flex gap-4">
            {/* Avatar */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0',
                avatarColor
              )}
            >
              {initials === '?' ? <User className="w-5 h-5" /> : initials}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name and Badge Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {review.user.name || 'Anonymous'}
                </span>
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                    Verified Student
                  </span>
                )}
              </div>

              {/* Rating and Date Row */}
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold text-base">{review.title}</h4>
          )}

          {/* Content */}
          {review.content && (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {review.content}
            </p>
          )}

          {/* Instructor Response */}
          {review.instructorResponse && (
            <div className="mt-4 pl-4 border-l-2 border-primary bg-primary/5 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Instructor Response</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {review.instructorResponse}
              </p>
              {review.respondedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formatTimeAgo(review.respondedAt)}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {showHelpfulButton && (
            <div className="flex items-center gap-4 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulClick}
                disabled={hasVoted || pending}
                className={cn(
                  'text-xs gap-1.5 h-8',
                  hasVoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ThumbsUp className={cn('w-3.5 h-3.5', hasVoted && 'fill-current')} />
                {hasVoted ? 'Helpful' : 'Mark as helpful'}
                {helpfulVotes > 0 && (
                  <span className="ml-1 bg-muted px-1.5 py-0.5 rounded text-xs tabular-nums">
                    {helpfulVotes}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
