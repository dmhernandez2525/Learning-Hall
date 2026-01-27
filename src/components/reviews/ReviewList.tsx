'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewSummary } from './ReviewSummary';
import { ReviewForm } from './ReviewForm';

interface Review {
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
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ReviewListProps {
  courseSlug: string;
  isLoggedIn?: boolean;
}

export function ReviewList({ courseSlug, isLoggedIn = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<string>('newest');
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const fetchReviews = async (pageNum: number, sortBy: string, append = false) => {
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '10',
        sort: sortBy,
        includeStats: String(!append),
        includeUserReview: String(!append && isLoggedIn),
      });

      const response = await fetch(`/api/courses/${courseSlug}/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to load reviews');

      const data = await response.json();

      if (append) {
        setReviews((prev) => [...prev, ...data.docs]);
      } else {
        setReviews(data.docs);
        if (data.stats) setStats(data.stats);
        if (data.userReview !== undefined) setUserReview(data.userReview);
      }

      setTotalPages(data.totalPages);
      setHasMore(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchReviews(1, sort);
  }, [courseSlug, sort, isLoggedIn]);

  const loadMore = () => {
    if (pending || !hasMore) return;
    startTransition(async () => {
      const nextPage = page + 1;
      await fetchReviews(nextPage, sort, true);
      setPage(nextPage);
    });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  const handleReviewSubmitted = () => {
    // Refresh the reviews list
    setPage(1);
    fetchReviews(1, sort);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {stats && <ReviewSummary stats={stats} />}

      {/* Review Form */}
      {isLoggedIn && !userReview && (
        <ReviewForm courseSlug={courseSlug} onSuccess={handleReviewSubmitted} />
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div>
          <h3 className="text-lg font-medium mb-2">Your Review</h3>
          <ReviewCard review={userReview} showHelpfulButton={false} />
          <div className="mt-2">
            <ReviewForm
              courseSlug={courseSlug}
              existingReview={userReview}
              onSuccess={handleReviewSubmitted}
            />
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Reviews</h3>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this course!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpfulVote={handleReviewSubmitted}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMore} disabled={pending}>
              {pending ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
