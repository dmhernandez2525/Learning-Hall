'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckoutButton } from './CheckoutButton';
import { Check, Clock, BookOpen, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  courseId: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  features?: string[];
  lessonCount?: number;
  duration?: string;
  enrollmentCount?: number;
  hasCertificate?: boolean;
  isPopular?: boolean;
  isEnrolled?: boolean;
  className?: string;
}

export function PricingCard({
  courseId,
  title,
  description,
  price,
  originalPrice,
  features = [],
  lessonCount,
  duration,
  enrollmentCount,
  hasCertificate = true,
  isPopular = false,
  isEnrolled = false,
  className,
}: PricingCardProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        isPopular && 'border-primary ring-2 ring-primary/20',
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            Most Popular
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discountPercent}% OFF
          </span>
        </div>
      )}

      <CardHeader className={cn(isPopular && 'pt-8')}>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatPrice(price)}</span>
            {price > 0 ? (
              <span className="text-sm text-muted-foreground">one-time</span>
            ) : (
              <span className="text-sm font-medium text-green-600">Free</span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground">
              <span className="line-through">{formatPrice(originalPrice)}</span>
              <span className="ml-2 text-green-600">
                Save {formatPrice(originalPrice - price)}
              </span>
            </p>
          )}
        </div>

        {/* Course Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {lessonCount !== undefined && lessonCount > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{lessonCount} lessons</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
          {enrollmentCount !== undefined && enrollmentCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{enrollmentCount.toLocaleString()} students</span>
            </div>
          )}
        </div>

        {/* Features List */}
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {hasCertificate && (
              <li className="flex items-start gap-2 text-sm">
                <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Certificate of completion</span>
              </li>
            )}
          </ul>
        )}

        {/* CTA Button */}
        {isEnrolled ? (
          <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <Check className="w-5 h-5" />
              Already Enrolled
            </div>
          </div>
        ) : price > 0 ? (
          <CheckoutButton
            courseId={courseId}
            price={price}
            fullWidth
            size="lg"
            showPrice={false}
          />
        ) : (
          <CheckoutButton
            courseId={courseId}
            price={0}
            fullWidth
            size="lg"
            label="Enroll for Free"
            showPrice={false}
          />
        )}

        {/* Money-back Guarantee */}
        {price > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            30-day money-back guarantee. No questions asked.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
