import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getModulesByCourse } from '@/lib/modules';
import { requireCourseAccess } from '@/lib/courses/access';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseLessonsPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) {
    notFound();
  }

  await requireCourseAccess(courseId, user);
  const modules = await getModulesByCourse(courseId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{course.title}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">Lessons</h1>
      </div>
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            This course does not have any published modules yet.
          </CardContent>
        </Card>
      ) : (
        modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              {module.description && <p className="text-sm text-muted-foreground">{module.description}</p>}
            </CardHeader>
            <CardContent className="space-y-2">
              {module.lessons && module.lessons.length > 0 ? (
                module.lessons
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{lesson.contentType}</p>
                      </div>
                      <Link
                        className="text-sm text-blue-600 hover:underline"
                        href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                      >
                        Open
                      </Link>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No lessons in this module yet.</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
