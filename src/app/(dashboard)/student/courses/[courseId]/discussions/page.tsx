import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { listDiscussionThreads } from '@/lib/discussions';
import DiscussionBoard from '@/components/discussions/DiscussionBoard';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDiscussionsPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) {
    notFound();
  }

  try {
    const data = await listDiscussionThreads({ courseId, page: 1, limit: 20 }, user);
    return <DiscussionBoard courseId={courseId} courseTitle={course.title} initialData={data} />;
  } catch (error) {
    console.error('Discussions access error', error);
    redirect('/student');
  }
}
