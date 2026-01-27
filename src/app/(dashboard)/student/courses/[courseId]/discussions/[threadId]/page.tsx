import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getDiscussionThread, listDiscussionPosts } from '@/lib/discussions';
import DiscussionThreadView from '@/components/discussions/DiscussionThreadView';

interface PageProps {
  params: Promise<{ courseId: string; threadId: string }>;
}

export default async function DiscussionThreadPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { courseId, threadId } = await params;
  const course = await getCourse(courseId);
  if (!course) {
    notFound();
  }

  const thread = await getDiscussionThread(threadId, user);
  if (!thread || thread.courseId !== courseId) {
    notFound();
  }

  const replies = await listDiscussionPosts(threadId, user);

  return <DiscussionThreadView initialThread={thread} initialReplies={replies} userRole={user.role} />;
}
