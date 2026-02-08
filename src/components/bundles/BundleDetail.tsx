'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Package,
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle,
  ShoppingCart,
  AlertCircle,
  ArrowLeft,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: { url: string } | null;
  price: number;
  instructor?: {
    name?: string;
    avatar?: { url: string } | null;
  } | null;
  stats: {
    enrollments?: number;
    avgRating?: number;
    totalDuration?: number;
    lessonCount?: number;
  };
  level?: string;
}

interface BundleData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: { url: string } | null;
  courseCount: number;
  courses: Course[];
  pricing: {
    amount: number;
    compareAtPrice?: number;
    savings?: number;
    savingsPercent?: number;
    currency?: string;
  };
  badges?: Array<{ text: string; color?: string }>;
  isFeatured?: boolean;
  stats: {
    enrollments?: number;
    totalDuration?: number;
    totalLessons?: number;
  };
}

interface BundleDetailProps {
  slug: string;
  className?: string;
  onAddToCart?: (bundleId: string) => void;
  onBuyNow?: (bundleId: string) => void;
}

export function BundleDetail({
  slug,
  className,
  onAddToCart,
  onBuyNow,
}: BundleDetailProps) {
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bundles/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Bundle not found');
        }
        throw new Error('Failed to fetch bundle');
      }

      const data = await response.json();
      setBundle(data.bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundle');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  const formatPrice = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-24" />
          </div>
          <div>
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">{error || 'Bundle not found'}</h2>
        <p className="text-muted-foreground mb-4">
          The bundle you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
        <Button variant="outline" asChild>
          <Link href="/bundles">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bundles
          </Link>
        </Button>
      </div>
    );
  }

  const hasDiscount = bundle.pricing.compareAtPrice &&
    bundle.pricing.compareAtPrice > bundle.pricing.amount;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Back link */}
      <Link
        href="/bundles"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Bundles
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {bundle.isFeatured && (
                <Badge className="bg-primary">Featured Bundle</Badge>
              )}
              {hasDiscount && bundle.pricing.savingsPercent && (
                <Badge variant="destructive" className="gap-1">
                  <Percent className="w-3 h-3" />
                  {bundle.pricing.savingsPercent}% Off
                </Badge>
              )}
              {bundle.badges?.map((badge, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  style={badge.color ? { backgroundColor: badge.color } : undefined}
                >
                  {badge.text}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold mb-2">{bundle.title}</h1>

            {bundle.shortDescription && (
              <p className="text-lg text-muted-foreground">
                {bundle.shortDescription}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          {bundle.thumbnail?.url && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={bundle.thumbnail.url}
                alt={bundle.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span>{bundle.courseCount} courses</span>
            </div>
            {bundle.stats.totalLessons && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <span>{bundle.stats.totalLessons} lessons</span>
              </div>
            )}
            {bundle.stats.totalDuration && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>{formatDuration(bundle.stats.totalDuration)} total</span>
              </div>
            )}
            {bundle.stats.enrollments && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span>{bundle.stats.enrollments.toLocaleString()} students</span>
              </div>
            )}
          </div>

          {/* Description */}
          {bundle.description && (
            <Card>
              <CardHeader>
                <CardTitle>About This Bundle</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: bundle.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Included Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Included Courses ({bundle.courseCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bundle.courses.map((course, index) => (
                <div key={course.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex gap-4">
                    <div className="relative w-32 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                      {course.thumbnail?.url ? (
                        <Image
                          src={course.thumbnail.url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="font-semibold hover:text-primary line-clamp-1"
                      >
                        {course.title}
                      </Link>

                      {course.shortDescription && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {course.shortDescription}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {course.instructor?.name && (
                          <span>By {course.instructor.name}</span>
                        )}
                        {course.stats.lessonCount && (
                          <span>{course.stats.lessonCount} lessons</span>
                        )}
                        {course.stats.totalDuration && (
                          <span>{formatDuration(course.stats.totalDuration)}</span>
                        )}
                        {course.stats.avgRating && course.stats.avgRating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {course.stats.avgRating.toFixed(1)}
                          </span>
                        )}
                        {course.level && (
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(course.price, bundle.pricing.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {formatPrice(bundle.pricing.amount, bundle.pricing.currency)}
                    </span>
                    {hasDiscount && bundle.pricing.compareAtPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(bundle.pricing.compareAtPrice, bundle.pricing.currency)}
                      </span>
                    )}
                  </div>

                  {bundle.pricing.savings && bundle.pricing.savings > 0 && (
                    <p className="text-green-600 font-medium mt-1">
                      You save {formatPrice(bundle.pricing.savings, bundle.pricing.currency)}!
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => onBuyNow?.(bundle.id)}
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => onAddToCart?.(bundle.id)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>

                <Separator />

                {/* Bundle includes */}
                <div>
                  <h4 className="font-semibold mb-3">This bundle includes:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {bundle.courseCount} full courses
                    </li>
                    {bundle.stats.totalLessons && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {bundle.stats.totalLessons} video lessons
                      </li>
                    )}
                    {bundle.stats.totalDuration && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {formatDuration(bundle.stats.totalDuration)} of content
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Lifetime access
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
