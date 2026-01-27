'use client';

import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ReviewSummaryProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

export function ReviewSummary({ stats }: ReviewSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  // Calculate percentages for each rating
  const getPercentage = (rating: number): number => {
    if (totalReviews === 0) return 0;
    return Math.round(((ratingDistribution[rating] || 0) / totalReviews) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = getPercentage(rating);

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-12 text-right">{rating} star</span>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-12">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
