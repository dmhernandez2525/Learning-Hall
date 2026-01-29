'use client';

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewSummary } from './ReviewSummary';
import { ReviewForm } from './ReviewForm';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, Star, X, MessageSquareOff, Loader2 } from 'lucide-react';

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
  const [sort, setSort] = useState<string>('newest');
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchReviews = useCallback(async (pageNum: number, sortBy: string, rating: number | null, search: string, append = false) => {
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '10',
        sort: sortBy,
        includeStats: String(!append),
        includeUserReview: String(!append && isLoggedIn),
      });

      if (rating) params.set('rating', String(rating));
      if (search) params.set('search', search);

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

      setHasMore(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [courseSlug, isLoggedIn]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchReviews(1, sort, ratingFilter, debouncedSearch);
  }, [fetchReviews, sort, ratingFilter, debouncedSearch]);

  const loadMore = () => {
    if (pending || !hasMore) return;
    startTransition(async () => {
      const nextPage = page + 1;
      await fetchReviews(nextPage, sort, ratingFilter, debouncedSearch, true);
      setPage(nextPage);
    });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  const handleRatingFilter = (rating: number | null) => {
    setRatingFilter(rating);
  };

  const handleReviewSubmitted = () => {
    setPage(1);
    fetchReviews(1, sort, ratingFilter, debouncedSearch);
  };

  const clearFilters = () => {
    setRatingFilter(null);
    setSearchQuery('');
    setSort('newest');
  };

  const hasActiveFilters = ratingFilter !== null || searchQuery !== '' || sort !== 'newest';

  // Filter stats for display
  const filteredCount = useMemo(() => {
    if (!ratingFilter || !stats) return null;
    return stats.ratingDistribution[ratingFilter] || 0;
  }, [ratingFilter, stats]);

  if (loading && reviews.length === 0) {
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
      {/* Summary with clickable rating bars */}
      {stats && (
        <ReviewSummary
          stats={stats}
          selectedRating={ratingFilter}
          onRatingFilter={handleRatingFilter}
        />
      )}

      {/* Review Form */}
      {isLoggedIn && !userReview && (
        <ReviewForm courseSlug={courseSlug} onSuccess={handleReviewSubmitted} />
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Your Review</h3>
          <ReviewCard review={userReview} showHelpfulButton={false} />
          <ReviewForm
            courseSlug={courseSlug}
            existingReview={userReview}
            onSuccess={handleReviewSubmitted}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {/* Header with Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              All Reviews
              {stats && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredCount !== null ? `${filteredCount} of ${stats.totalReviews}` : stats.totalReviews})
                </span>
              )}
            </h3>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px]">
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

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(ratingFilter || searchQuery) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Filtering by:</span>
              {ratingFilter && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  {ratingFilter} star{ratingFilter !== 1 ? 's' : ''}
                  <button
                    type="button"
                    onClick={() => setRatingFilter(null)}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                  &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageSquareOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium text-muted-foreground">
                {hasActiveFilters ? 'No reviews match your filters' : 'No reviews yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share your experience with this course!'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
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
          <div className="text-center pt-4">
            <Button variant="outline" onClick={loadMore} disabled={pending} className="min-w-[200px]">
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Reviews'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
