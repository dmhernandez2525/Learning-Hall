import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ id: string }>;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <StatusBadge status={course.status} />
          </div>
          <p className="text-muted-foreground">
            Created {new Date(course.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/courses">Back to Courses</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/courses/${course.id}/edit`}>Edit Course</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.shortDescription && (
              <div>
                <h3 className="font-medium mb-1">Short Description</h3>
                <p className="text-muted-foreground">{course.shortDescription}</p>
              </div>
            )}
            {course.description && (
              <div>
                <h3 className="font-medium mb-1">Full Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {typeof course.description === 'string'
                    ? course.description
                    : 'Rich text content'}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-medium mb-1">URL Slug</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">{course.slug}</code>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatPrice(course.price.amount, course.price.currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{course.modules?.length || 0}</span>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href={`/dashboard/courses/${course.id}/builder`}>
                  Open Course Builder
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allow Preview</span>
                <span>{course.settings?.allowPreview ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sequential Progress</span>
                <span>{course.settings?.requireSequentialProgress ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate</span>
                <span>{course.settings?.certificateEnabled ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
