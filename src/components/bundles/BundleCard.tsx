'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, BookOpen, Percent, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CoursePreview {
  id: string;
  title: string;
  slug: string;
  thumbnail?: { url: string } | null;
}

interface BundleCardProps {
  bundle: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string;
    thumbnail?: { url: string } | null;
    courseCount: number;
    courses: CoursePreview[];
    pricing: {
      amount: number;
      compareAtPrice?: number;
      savings?: number;
      savingsPercent?: number;
      currency?: string;
    };
    badges?: Array<{ text: string; color?: string }>;
    isFeatured?: boolean;
  };
  className?: string;
  onAddToCart?: (bundleId: string) => void;
}

export function BundleCard({ bundle, className, onAddToCart }: BundleCardProps) {
  const formatPrice = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const hasDiscount = bundle.pricing.compareAtPrice &&
    bundle.pricing.compareAtPrice > bundle.pricing.amount;

  return (
    <Card className={cn(
      'group overflow-hidden transition-all hover:shadow-lg',
      bundle.isFeatured && 'ring-2 ring-primary',
      className
    )}>
      <CardHeader className="p-0">
        <Link href={`/bundles/${bundle.slug}`}>
          <div className="relative aspect-video bg-muted overflow-hidden">
            {bundle.thumbnail?.url ? (
              <Image
                src={bundle.thumbnail.url}
                alt={bundle.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Package className="w-16 h-16 text-primary/50" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {bundle.isFeatured && (
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
              {hasDiscount && bundle.pricing.savingsPercent && (
                <Badge variant="destructive" className="gap-1">
                  <Percent className="w-3 h-3" />
                  Save {bundle.pricing.savingsPercent}%
                </Badge>
              )}
              {bundle.badges?.map((badge, index) => (
                <Badge
                  key={index}
                  style={badge.color ? { backgroundColor: badge.color } : undefined}
                >
                  {badge.text}
                </Badge>
              ))}
            </div>

            {/* Course count */}
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="gap-1 bg-black/70 text-white">
                <BookOpen className="w-3 h-3" />
                {bundle.courseCount} courses
              </Badge>
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <Link href={`/bundles/${bundle.slug}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {bundle.title}
          </h3>
        </Link>

        {bundle.shortDescription && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {bundle.shortDescription}
          </p>
        )}

        {/* Course preview thumbnails */}
        <div className="flex items-center gap-1 mt-3">
          {bundle.courses.slice(0, 4).map((course, index) => (
            <div
              key={course.id}
              className="relative w-10 h-10 rounded-md overflow-hidden bg-muted border-2 border-background"
              style={{ marginLeft: index > 0 ? -8 : 0 }}
              title={course.title}
            >
              {course.thumbnail?.url ? (
                <Image
                  src={course.thumbnail.url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {bundle.courseCount > 4 && (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-medium border-2 border-background"
                 style={{ marginLeft: -8 }}>
              +{bundle.courseCount - 4}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatPrice(bundle.pricing.amount, bundle.pricing.currency)}
            </span>
            {hasDiscount && bundle.pricing.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(bundle.pricing.compareAtPrice, bundle.pricing.currency)}
              </span>
            )}
          </div>
          {bundle.pricing.savings && bundle.pricing.savings > 0 && (
            <p className="text-sm text-green-600 font-medium">
              Save {formatPrice(bundle.pricing.savings, bundle.pricing.currency)}
            </p>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => onAddToCart?.(bundle.id)}
          className="gap-1"
        >
          <ShoppingCart className="w-4 h-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
