'use client';

import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Star, Users } from 'lucide-react';

interface ReviewSummaryProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
  selectedRating?: number | null;
  onRatingFilter?: (rating: number | null) => void;
}

export function ReviewSummary({ stats, selectedRating, onRatingFilter }: ReviewSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  // Calculate percentages for each rating
  const getPercentage = (rating: number): number => {
    if (totalReviews === 0) return 0;
    return Math.round(((ratingDistribution[rating] || 0) / totalReviews) * 100);
  };

  const handleRatingClick = (rating: number) => {
    if (!onRatingFilter) return;
    if (selectedRating === rating) {
      onRatingFilter(null); // Clear filter
    } else {
      onRatingFilter(rating);
    }
  };

  const isInteractive = Boolean(onRatingFilter);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          Student Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center text-center min-w-[140px]">
            <div className="text-5xl font-bold tracking-tight">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="lg" showHalfStars />
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <Users className="w-4 h-4" />
              <span>{totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}</span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = getPercentage(rating);
              const isSelected = selectedRating === rating;

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  disabled={!isInteractive || count === 0}
                  className={cn(
                    'flex items-center gap-3 w-full py-1.5 px-2 rounded-md transition-all',
                    isInteractive && count > 0 && 'hover:bg-muted/50 cursor-pointer',
                    isSelected && 'bg-primary/10 ring-1 ring-primary/30',
                    !isInteractive && 'cursor-default',
                    count === 0 && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-1 w-16 text-sm">
                    <span className="font-medium">{rating}</span>
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-orange-500',
                        isSelected && 'opacity-100'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-14 text-right tabular-nums">
                    {percentage}% <span className="text-xs">({count})</span>
                  </span>
                </button>
              );
            })}
            {isInteractive && selectedRating && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click the same rating again to clear filter
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
