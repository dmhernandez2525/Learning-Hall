import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Course } from '@/lib/courses';

interface CourseCardProps {
  course: Course;
  showActions?: boolean;
}

function StatusBadge({ status }: { status: Course['status'] }) {
  const colors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return 'Free';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });

  return formatter.format(amount / 100);
}

export function CourseCard({ course, showActions = true }: CourseCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          <StatusBadge status={course.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {course.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.shortDescription}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {course.modules?.length || 0} modules
          </span>
          <span className="font-medium">
            {formatPrice(course.price.amount, course.price.currency)}
          </span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/courses/${course.id}`}>View</Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/courses/${course.id}/edit`}>Edit</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export function CourseCardSkeleton() {
  return (
    <Card className="flex flex-col animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-12" />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <div className="h-9 bg-muted rounded flex-1" />
        <div className="h-9 bg-muted rounded flex-1" />
      </CardFooter>
    </Card>
  );
}
