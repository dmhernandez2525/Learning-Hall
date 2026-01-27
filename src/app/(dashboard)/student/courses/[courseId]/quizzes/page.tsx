import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getPayloadClient } from '@/lib/payload';
import { listQuizzes } from '@/lib/quizzes';
import { listQuizAttempts } from '@/lib/quizAttempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseQuizzesPage({ params }: PageProps) {
  const { courseId } = await params;
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const course = await getCourse(courseId);
  if (!course) {
    notFound();
  }

  const payload = await getPayloadClient();
  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: user.id } },
        { course: { equals: courseId } },
      ],
    },
    limit: 1,
  });

  if (enrollment.totalDocs === 0) {
    redirect('/student');
  }

  const quizList = await listQuizzes({ courseId, status: 'published' });
  const attempts = await Promise.all(
    quizList.docs.map(async (quiz) => {
      const result = await listQuizAttempts({ quizId: quiz.id, userId: user.id, limit: 10 });
      return [quiz.id, result.docs] as const;
    })
  );

  const attemptMap = Object.fromEntries(attempts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/student">Back to Dashboard</Link>
        </Button>
      </div>

      {quizList.docs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            This course does not have any published quizzes yet.
          </CardContent>
        </Card>
      ) : (
        quizList.docs.map((quiz) => {
          const quizAttempts = attemptMap[quiz.id] || [];
          const latestAttempt = quizAttempts.find((attempt) => attempt.status !== 'inProgress');
          const inProgress = quizAttempts.find((attempt) => attempt.status === 'inProgress');
          const completedAttempts = quizAttempts.filter((attempt) => attempt.status !== 'inProgress').length;
          const retakesAvailable =
            quiz.retakes < 0 || completedAttempts < quiz.retakes;

          return (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{quiz.title}</span>
                  <span className="text-sm text-muted-foreground">
                    Passing {quiz.passingScore}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                )}
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time Limit</p>
                    <p className="font-medium">{quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'Untimed'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="font-medium">
                      {quiz.retakes < 0 ? `${completedAttempts} taken` : `${completedAttempts}/${quiz.retakes}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Score</p>
                    <p className="font-medium">
                      {latestAttempt ? `${latestAttempt.percentage.toFixed(1)}%` : 'Not taken'}
                    </p>
                  </div>
                </div>
                {inProgress && (
                  <p className="text-xs text-amber-600">
                    You have an in-progress attempt started on{' '}
                    {new Date(inProgress.startedAt).toLocaleString()}.
                  </p>
                )}
                {!retakesAvailable && quiz.retakes >= 0 && (
                  <p className="text-xs text-red-500">
                    You have reached the maximum number of attempts for this quiz.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button asChild disabled={!retakesAvailable && !inProgress}>
                    <Link href={`/student/courses/${course.id}/quizzes/${quiz.id}`}>
                      {inProgress ? 'Resume Quiz' : 'Open Quiz'}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/student/courses/${course.id}/quizzes/${quiz.id}#history`}>
                      Attempt History
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
