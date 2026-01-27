import { getPayloadClient } from '@/lib/payload';
import { getCourse, type Course } from '@/lib/courses';
import type { User } from '@/lib/auth/config';
import { sendDiscussionReplyEmail } from '@/lib/email';

export interface DiscussionAuthor {
  id: string;
  name?: string;
  role?: User['role'];
  avatarUrl?: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  slug?: string;
  body: unknown;
  courseId: string;
  courseTitle?: string;
  author: DiscussionAuthor;
  status: 'open' | 'answered' | 'closed';
  isPinned: boolean;
  isAnswered: boolean;
  tags: string[];
  voteScore: number;
  replyCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  userVote?: -1 | 0 | 1;
  answerPostId?: string;
}

export interface DiscussionPost {
  id: string;
  threadId: string;
  parentId?: string;
  author: DiscussionAuthor;
  content: unknown;
  voteScore: number;
  isAnswer: boolean;
  depth: number;
  createdAt: string;
  updatedAt: string;
  children?: DiscussionPost[];
  userVote?: -1 | 0 | 1;
}

export interface ThreadListParams {
  courseId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ThreadListResult {
  docs: DiscussionThread[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatAuthor(raw: Record<string, unknown> | string | null): DiscussionAuthor {
  if (!raw) return { id: '' };
  if (typeof raw === 'string') return { id: raw };
  const avatar = raw.avatar as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    name: raw.name ? String(raw.name) : undefined,
    role: (raw.role as User['role']) || undefined,
    avatarUrl: avatar?.url ? String(avatar.url) : undefined,
  };
}

function getUserVote(votes: Array<Record<string, unknown>> | undefined, userId?: string) {
  if (!userId || !votes) return 0;
  const vote = votes.find((entry) => {
    if (!entry || !entry.user) return false;
    if (typeof entry.user === 'string') return entry.user === userId;
    return (entry.user as Record<string, unknown>).id === userId;
  });
  return vote ? (Number(vote.value) as -1 | 0 | 1) : 0;
}

function formatThread(doc: Record<string, unknown>, currentUserId?: string): DiscussionThread {
  const course = doc.course as Record<string, unknown> | string;
  const votes = doc.votes as Array<Record<string, unknown>> | undefined;
  const answerPost = doc.answerPost as Record<string, unknown> | string | undefined;
  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    slug: doc.slug ? String(doc.slug) : undefined,
    body: doc.body,
    courseId: typeof course === 'object' ? String(course.id) : String(course),
    courseTitle: typeof course === 'object' ? String(course.title || '') : undefined,
    author: formatAuthor(doc.author as Record<string, unknown> | string | null),
    status: (doc.status as DiscussionThread['status']) || 'open',
    isPinned: Boolean(doc.isPinned),
    isAnswered: Boolean(doc.isAnswered),
    tags: ((doc.tags as Array<Record<string, unknown>>) || []).map((tag) => String(tag.value || '')),
    voteScore: Number(doc.voteScore || 0),
    replyCount: Number(doc.replyCount || 0),
    lastActivityAt: doc.lastActivityAt ? String(doc.lastActivityAt) : undefined,
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
    userVote: getUserVote(votes, currentUserId),
    answerPostId: answerPost ? (typeof answerPost === 'object' ? String(answerPost.id) : String(answerPost)) : undefined,
  };
}

function formatPost(doc: Record<string, unknown>, currentUserId?: string): DiscussionPost {
  const votes = doc.votes as Array<Record<string, unknown>> | undefined;
  return {
    id: String(doc.id),
    threadId: typeof doc.thread === 'object' ? String((doc.thread as Record<string, unknown>).id) : String(doc.thread),
    parentId: doc.parent
      ? typeof doc.parent === 'object'
        ? String((doc.parent as Record<string, unknown>).id)
        : String(doc.parent)
      : undefined,
    author: formatAuthor(doc.author as Record<string, unknown> | string | null),
    content: doc.content,
    voteScore: Number(doc.voteScore || 0),
    isAnswer: Boolean(doc.isAnswer),
    depth: Number(doc.depth || 0),
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
    userVote: getUserVote(votes, currentUserId),
  };
}

function extractTextFromRichContent(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((item) => extractTextFromRichContent(item)).join(' ');
  }
  if (typeof content === 'object') {
    const node = content as Record<string, unknown>;
    if (typeof node.text === 'string') {
      return node.text;
    }
    if (Array.isArray(node.children)) {
      return extractTextFromRichContent(node.children);
    }
    if (typeof node.content === 'string') {
      return node.content;
    }
  }
  return '';
}

async function requireCourseAccess(courseId: string, user: User): Promise<Course> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (user.role === 'admin') {
    return course;
  }

  if (user.role === 'instructor') {
    if (course.instructor?.id === user.id) {
      return course;
    }
    throw new Error('Not authorized for this course');
  }

  const payload = await getPayloadClient();
  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: user.id } },
        { course: { equals: courseId } },
        { status: { not_equals: 'expired' } },
      ],
    },
    limit: 1,
  });

  if (enrollment.totalDocs === 0) {
    throw new Error('Please enroll in the course to access discussions');
  }

  return course;
}

export async function listDiscussionThreads(
  params: ThreadListParams,
  user: User
): Promise<ThreadListResult> {
  await requireCourseAccess(params.courseId, user);
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'discussion-threads',
    where: {
      and: [
        { course: { equals: params.courseId } },
        ...(params.search
          ? [
              {
                or: [
                  { title: { contains: params.search } },
                  { 'body.text': { contains: params.search } },
                ],
              },
            ]
          : []),
      ],
    },
    depth: 2,
    page: params.page || 1,
    limit: params.limit || 20,
    sort: '-lastActivityAt',
  });

  const docs = result.docs.map((doc) => formatThread(doc as Record<string, unknown>, user.id));

  // ensure pinned threads bubble to the top client-side if sort fails
  docs.sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return (b.lastActivityAt || '').localeCompare(a.lastActivityAt || '');
    }
    return a.isPinned ? -1 : 1;
  });

  return {
    docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getDiscussionThread(id: string, user: User): Promise<DiscussionThread | null> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({
    collection: 'discussion-threads',
    id,
    depth: 2,
  });

  if (!doc) return null;
  await requireCourseAccess(
    typeof doc.course === 'object' ? String((doc.course as Record<string, unknown>).id) : String(doc.course),
    user
  );

  return formatThread(doc as Record<string, unknown>, user.id);
}

export async function listDiscussionPosts(threadId: string, user: User): Promise<DiscussionPost[]> {
  const thread = await getDiscussionThread(threadId, user);
  if (!thread) return [];
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'discussion-posts',
    where: { thread: { equals: threadId } },
    limit: 500,
    depth: 2,
    sort: 'createdAt',
  });

  const posts = result.docs.map((doc) => formatPost(doc as Record<string, unknown>, user.id));
  const postMap = new Map<string, DiscussionPost>();
  posts.forEach((post) => postMap.set(post.id, { ...post, children: [] }));

  const roots: DiscussionPost[] = [];
  postMap.forEach((post) => {
    if (post.parentId && postMap.has(post.parentId)) {
      postMap.get(post.parentId)!.children!.push(post);
    } else {
      roots.push(post);
    }
  });

  return roots;
}

export interface CreateThreadInput {
  courseId: string;
  title: string;
  body: unknown;
  tags?: string[];
}

export async function createDiscussionThread(input: CreateThreadInput, user: User): Promise<DiscussionThread> {
  const course = await requireCourseAccess(input.courseId, user);
  const payload = await getPayloadClient();

  const data = await payload.create({
    collection: 'discussion-threads',
    data: {
      title: input.title,
      body: input.body,
      course: input.courseId,
      status: 'open',
      tags: input.tags?.map((value) => ({ value })),
      subscribers: [user.id, course.instructor?.id].filter(Boolean),
    },
  });

  return formatThread(data as Record<string, unknown>, user.id);
}

export interface CreatePostInput {
  threadId: string;
  parentId?: string;
  content: unknown;
}

async function gatherSubscriberEmails(
  threadDoc: Record<string, unknown>,
  authorId: string,
  course: Course,
  replyContent: string,
  replyAuthor: DiscussionAuthor,
  threadId: string
) {
  const payload = await getPayloadClient();
  const subscriberIds = new Set<string>();
  const threadAuthor = threadDoc.author as Record<string, unknown> | string | undefined;
  if (typeof threadAuthor === 'object' && threadAuthor.id) subscriberIds.add(String(threadAuthor.id));
  if (typeof threadAuthor === 'string') subscriberIds.add(threadAuthor);

  const rawSubscribers = threadDoc.subscribers as Array<Record<string, unknown> | string> | undefined;
  rawSubscribers?.forEach((subscriber) => {
    if (typeof subscriber === 'string') {
      subscriberIds.add(subscriber);
    } else if (subscriber?.id) {
      subscriberIds.add(String(subscriber.id));
    }
  });

  if (course.instructor?.id) {
    subscriberIds.add(course.instructor.id);
  }

  subscriberIds.delete(authorId);

  if (subscriberIds.size === 0) return [];

  const users = await payload.find({
    collection: 'users',
    where: { id: { in: Array.from(subscriberIds) } },
    depth: 0,
    limit: subscriberIds.size,
  });

  const preview = replyContent.length > 280 ? `${replyContent.slice(0, 277)}...` : replyContent;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const discussionPath = `${baseUrl}/student/courses/${course.id}/discussions/${threadId}`;

  return users.docs
    .filter((doc): doc is { email: string; name?: string; id: string } => Boolean(doc.email))
    .map((doc) => ({
      to: doc.email!,
      data: {
        userName: doc.name || undefined,
        courseName: course.title,
        threadTitle: String(threadDoc.title || ''),
        threadUrl: discussionPath,
        replyPreview: preview,
        replyAuthorName: replyAuthor.name || 'A teammate',
      },
    }));
}

export async function createDiscussionPost(input: CreatePostInput, user: User): Promise<DiscussionPost> {
  const payload = await getPayloadClient();
  const threadDoc = await payload.findByID({
    collection: 'discussion-threads',
    id: input.threadId,
    depth: 2,
  });

  if (!threadDoc) {
    throw new Error('Thread not found');
  }

  const courseId =
    typeof threadDoc.course === 'object' ? String((threadDoc.course as Record<string, unknown>).id) : String(threadDoc.course);
  const course = await requireCourseAccess(courseId, user);

  const data = await payload.create({
    collection: 'discussion-posts',
    data: {
      thread: input.threadId,
      parent: input.parentId,
      content: input.content,
    },
  });

  const updatedSubscribers = new Set<string>();
  const existing = (threadDoc.subscribers as Array<Record<string, unknown> | string> | undefined) || [];
  existing.forEach((subscriber) => {
    if (typeof subscriber === 'string') updatedSubscribers.add(subscriber);
    else if (subscriber?.id) updatedSubscribers.add(String(subscriber.id));
  });
  updatedSubscribers.add(user.id);
  if (course.instructor?.id) updatedSubscribers.add(course.instructor.id);

  await payload.update({
    collection: 'discussion-threads',
    id: input.threadId,
    data: {
      replyCount: Number(threadDoc.replyCount || 0) + 1,
      lastActivityAt: new Date().toISOString(),
      subscribers: Array.from(updatedSubscribers),
    },
  });

  const formatted = formatPost(data as Record<string, unknown>, user.id);

  const contentText = extractTextFromRichContent(input.content);
  const notifications = await gatherSubscriberEmails(
    threadDoc as Record<string, unknown>,
    user.id,
    course,
    contentText,
    formatted.author,
    input.threadId
  );
  await Promise.all(
    notifications.map((notification) =>
      sendDiscussionReplyEmail(notification.to, {
        ...notification.data,
        threadUrl: notification.data.threadUrl as string,
      })
    )
  );

  return formatted;
}

async function applyVote(
  collection: 'discussion-threads' | 'discussion-posts',
  id: string,
  userId: string,
  value: -1 | 0 | 1
) {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection, id });
  if (!doc) throw new Error('Item not found');
  const votes = ((doc.votes as Array<Record<string, unknown>>) || []).filter((vote) => vote && vote.user);
  const normalizedVotes = votes.filter((vote) => String(vote.user) !== userId);
  if (value !== 0) {
    normalizedVotes.push({ user: userId, value });
  }
  const newScore = normalizedVotes.reduce((sum, vote) => sum + Number(vote.value || 0), 0);
  await payload.update({
    collection,
    id,
    data: {
      votes: normalizedVotes,
      voteScore: newScore,
    },
  });
  return newScore;
}

export async function voteOnThread(threadId: string, value: -1 | 0 | 1, user: User): Promise<number> {
  const thread = await getDiscussionThread(threadId, user);
  if (!thread) throw new Error('Thread not found');
  return applyVote('discussion-threads', threadId, user.id, value);
}

export async function voteOnPost(postId: string, value: -1 | 0 | 1, user: User): Promise<number> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'discussion-posts', id: postId, depth: 1 });
  if (!doc) throw new Error('Post not found');
  const threadId =
    typeof doc.thread === 'object' ? String((doc.thread as Record<string, unknown>).id) : String(doc.thread);
  await getDiscussionThread(threadId, user);
  return applyVote('discussion-posts', postId, user.id, value);
}

export async function pinDiscussionThread(threadId: string, pin: boolean, user: User): Promise<DiscussionThread> {
  const thread = await getDiscussionThread(threadId, user);
  if (!thread) throw new Error('Thread not found');
  if (!['admin', 'instructor'].includes(user.role)) {
    throw new Error('Only instructors can pin threads');
  }
  const payload = await getPayloadClient();
  const updated = await payload.update({
    collection: 'discussion-threads',
    id: threadId,
    data: { isPinned: pin },
  });
  return formatThread(updated as Record<string, unknown>, user.id);
}

export async function markPostAsAnswer(
  threadId: string,
  postId: string,
  user: User
): Promise<{ thread: DiscussionThread; post: DiscussionPost }> {
  const payload = await getPayloadClient();
  const thread = await getDiscussionThread(threadId, user);
  if (!thread) throw new Error('Thread not found');
  const course = await getCourse(thread.courseId);
  if (
    user.role !== 'admin' &&
    (!course || !course.instructor || course.instructor.id !== user.id)
  ) {
    throw new Error('Only the course instructor can mark answers');
  }
  const postDoc = await payload.findByID({ collection: 'discussion-posts', id: postId, depth: 1 });
  if (!postDoc) throw new Error('Post not found');

  if (thread.isAnswered && thread.answerPostId && thread.answerPostId !== postId) {
    await payload.update({
      collection: 'discussion-posts',
      id: thread.answerPostId,
      data: { isAnswer: false },
    });
  }

  await payload.update({
    collection: 'discussion-posts',
    id: postId,
    data: { isAnswer: true },
  });

  const updatedThreadDoc = await payload.update({
    collection: 'discussion-threads',
    id: threadId,
    data: { isAnswered: true, status: 'answered', answerPost: postId },
  });

  return {
    thread: formatThread(updatedThreadDoc as Record<string, unknown>, user.id),
    post: formatPost(postDoc as Record<string, unknown>, user.id),
  };
}

export async function unmarkAnswer(threadId: string, user: User): Promise<DiscussionThread> {
  const payload = await getPayloadClient();
  const threadDoc = await payload.findByID({ collection: 'discussion-threads', id: threadId, depth: 1 });
  if (!threadDoc) throw new Error('Thread not found');
  const courseId =
    typeof threadDoc.course === 'object' ? String((threadDoc.course as Record<string, unknown>).id) : String(threadDoc.course);
  const course = await getCourse(courseId);
  if (user.role !== 'admin' && (!course || course.instructor?.id !== user.id)) {
    throw new Error('Only the course instructor can mark answers');
  }

  if (threadDoc.answerPost) {
    await payload.update({
      collection: 'discussion-posts',
      id: typeof threadDoc.answerPost === 'object'
        ? String((threadDoc.answerPost as Record<string, unknown>).id)
        : String(threadDoc.answerPost),
      data: { isAnswer: false },
    });
  }

  const updatedThreadDoc = await payload.update({
    collection: 'discussion-threads',
    id: threadId,
    data: { isAnswered: false, status: 'open', answerPost: null },
  });

  return formatThread(updatedThreadDoc as Record<string, unknown>, user.id);
}
