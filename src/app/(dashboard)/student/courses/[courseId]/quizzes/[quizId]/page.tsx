import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getQuiz } from '@/lib/quizzes';
import { getPayloadClient } from '@/lib/payload';
import { listQuizAttempts, maskAttemptForLearner } from '@/lib/quizAttempts';
import QuizRunner from '@/components/quizzes/QuizRunner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ courseId: string; quizId: string }>;
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { courseId, quizId } = await params;
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const [course, quiz] = await Promise.all([getCourse(courseId), getQuiz(quizId)]);
  if (!course || !quiz || quiz.course.id !== course.id || quiz.status !== 'published') {
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

  const attempts = await listQuizAttempts({ quizId, userId: user.id, limit: 25 });
  const sanitizedAttempts = attempts.docs.map((attempt) =>
    maskAttemptForLearner(attempt, {
      revealSolutions: attempt.status !== 'inProgress' && quiz.allowReview,
      revealExplanations:
        attempt.status !== 'inProgress' && quiz.allowReview && quiz.showExplanations,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{course.title}</p>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/student/courses/${courseId}/quizzes`}>Back to assessments</Link>
        </Button>
      </div>
      <QuizRunner quiz={quiz} attempts={sanitizedAttempts} />
    </div>
  );
}
