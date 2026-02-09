import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listCourses } from '@/lib/courses';
import { CourseCard } from '@/components/courses';

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">No courses yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Get started by creating your first course. Add modules, lessons, and multimedia content.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/courses/new">Create Your First Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type PageProps = {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
};

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const status = params.status as 'draft' | 'published' | 'archived' | undefined;
  const search = params.search;

  let courses;
  try {
    courses = await listCourses({ page, limit: 12, status, search });
  } catch {
    courses = { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false, hasPrevPage: false };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Create and manage your courses ({courses.totalDocs} total)
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/courses/new">Create Course</Link>
        </Button>
      </div>

      {courses.docs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.docs.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {courses.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {courses.hasPrevPage && (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/courses?page=${page - 1}`}>Previous</Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {courses.page} of {courses.totalPages}
              </span>
              {courses.hasNextPage && (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/courses?page=${page + 1}`}>Next</Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
