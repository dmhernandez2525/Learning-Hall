import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getLesson } from '@/lib/lessons';
import { requireCourseAccess } from '@/lib/courses/access';
import { LessonViewer } from '@/components/lessons/LessonViewer';
import { listLessonNotes } from '@/lib/notes';

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);
  if (!lesson || lesson.module?.course?.id !== courseId) {
    notFound();
  }

  await requireCourseAccess(courseId, user);
  const notes = await listLessonNotes({ lessonId }, user);

  return (
    <LessonViewer
      lessonId={lessonId}
      courseId={courseId}
      lessonTitle={lesson.title}
      videoUrl={lesson.content.videoUrl}
      posterUrl={lesson.content.videoThumbnail?.url}
      textContent={lesson.content.textContent as string | undefined}
      initialNotes={notes.docs}
    />
  );
}
