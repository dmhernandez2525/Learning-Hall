import { getPayload } from 'payload';
import config from '@/payload.config';

// Event types that can trigger badge checks
export type BadgeEvent =
  | 'lesson_completed'
  | 'course_completed'
  | 'quiz_passed'
  | 'quiz_perfect'
  | 'certificate_earned'
  | 'review_written'
  | 'discussion_posted'
  | 'streak_updated'
  | 'enrollment';

export interface BadgeEventContext {
  userId: string;
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  score?: number;
}

interface Badge {
  id: string;
  name: string;
  slug: string;
  points: number;
  criteria: {
    type: string;
    threshold?: number;
    specificCourse?: string;
    actionType?: string;
  };
}

interface UserStats {
  coursesCompleted: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  certificatesEarned: number;
  discussionPosts: number;
  reviewsWritten: number;
  currentStreak: number;
}

/**
 * Check and award badges based on an event
 */
export async function checkAndAwardBadges(
  event: BadgeEvent,
  context: BadgeEventContext
): Promise<{ awarded: string[]; pointsEarned: number }> {
  const payload = await getPayload({ config });
  const awarded: string[] = [];
  let pointsEarned = 0;

  // Get active badges
  const { docs: badges } = await payload.find({
    collection: 'badges',
    where: { isActive: { equals: true } },
    limit: 100,
  });

  // Get user's current stats
  const userStats = await getUserStats(context.userId);

  // Get user's existing badges
  const { docs: existingBadges } = await payload.find({
    collection: 'user-badges',
    where: {
      user: { equals: context.userId },
      'progress.isComplete': { equals: true },
    },
    limit: 100,
  });
  const earnedBadgeSlugs = new Set(
    existingBadges.map((ub) => (typeof ub.badge === 'object' ? ub.badge.slug : ''))
  );

  // Check each badge
  for (const badge of badges as Badge[]) {
    if (earnedBadgeSlugs.has(badge.slug)) continue;

    const shouldAward = await shouldAwardBadge(badge, event, context, userStats);

    if (shouldAward) {
      // Award the badge
      await payload.create({
        collection: 'user-badges',
        data: {
          user: context.userId,
          badge: badge.id,
          awardedAt: new Date().toISOString(),
          progress: {
            current: badge.criteria.threshold || 1,
            required: badge.criteria.threshold || 1,
            isComplete: true,
          },
          earnedFrom: {
            course: context.courseId,
            lesson: context.lessonId,
            quiz: context.quizId,
          },
          notified: false,
        },
      });

      awarded.push(badge.slug);
      pointsEarned += badge.points;
    }
  }

  // If any badges were awarded, add points
  if (pointsEarned > 0) {
    await addPoints(context.userId, pointsEarned, 'badge', 'Badges earned');
  }

  return { awarded, pointsEarned };
}

/**
 * Determine if a badge should be awarded based on the event
 */
async function shouldAwardBadge(
  badge: Badge,
  event: BadgeEvent,
  context: BadgeEventContext,
  stats: UserStats
): Promise<boolean> {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'first_action':
      return checkFirstAction(criteria.actionType || '', event, stats);

    case 'course_completed':
      if (event !== 'course_completed') return false;
      if (criteria.specificCourse && criteria.specificCourse !== context.courseId) return false;
      return true;

    case 'courses_completed_count':
      if (event !== 'course_completed') return false;
      return stats.coursesCompleted >= (criteria.threshold || 1);

    case 'lesson_completed':
      if (event !== 'lesson_completed') return false;
      if (criteria.specificCourse && criteria.specificCourse !== context.courseId) return false;
      return true;

    case 'lessons_completed_count':
      if (event !== 'lesson_completed') return false;
      return stats.lessonsCompleted >= (criteria.threshold || 1);

    case 'quiz_passed':
      if (event !== 'quiz_passed' && event !== 'quiz_perfect') return false;
      return true;

    case 'quiz_perfect':
      if (event !== 'quiz_perfect') return false;
      return true;

    case 'quizzes_passed_count':
      if (event !== 'quiz_passed' && event !== 'quiz_perfect') return false;
      return stats.quizzesPassed >= (criteria.threshold || 1);

    case 'certificate_earned':
      if (event !== 'certificate_earned') return false;
      return true;

    case 'certificates_count':
      if (event !== 'certificate_earned') return false;
      return stats.certificatesEarned >= (criteria.threshold || 1);

    case 'daily_streak':
      if (event !== 'streak_updated') return false;
      return stats.currentStreak >= (criteria.threshold || 1);

    case 'discussion_posts':
      if (event !== 'discussion_posted') return false;
      return stats.discussionPosts >= (criteria.threshold || 1);

    case 'helpful_reviews':
      if (event !== 'review_written') return false;
      return stats.reviewsWritten >= (criteria.threshold || 1);

    default:
      return false;
  }
}

/**
 * Check first action badges
 */
function checkFirstAction(actionType: string, event: BadgeEvent, stats: UserStats): boolean {
  switch (actionType) {
    case 'first_enrollment':
      return event === 'enrollment';
    case 'first_lesson':
      return event === 'lesson_completed' && stats.lessonsCompleted === 1;
    case 'first_quiz':
      return (event === 'quiz_passed' || event === 'quiz_perfect') && stats.quizzesPassed === 1;
    case 'first_certificate':
      return event === 'certificate_earned' && stats.certificatesEarned === 1;
    case 'first_review':
      return event === 'review_written' && stats.reviewsWritten === 1;
    case 'first_post':
      return event === 'discussion_posted' && stats.discussionPosts === 1;
    default:
      return false;
  }
}

/**
 * Get or create user points record
 */
export async function getOrCreateUserPoints(userId: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'user-points',
    where: { user: { equals: userId } },
    limit: 1,
  });

  if (docs.length > 0) return docs[0];

  // Create new record
  return payload.create({
    collection: 'user-points',
    data: {
      user: userId,
      totalPoints: 0,
      level: 1,
      pointsToNextLevel: 100,
      streak: {
        current: 0,
        longest: 0,
      },
      stats: {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        quizzesPassed: 0,
        perfectQuizzes: 0,
        certificatesEarned: 0,
        discussionPosts: 0,
        reviewsWritten: 0,
        helpfulVotesReceived: 0,
        badgesEarned: 0,
      },
      pointsHistory: [],
    },
  });
}

/**
 * Get user stats for badge checking
 */
async function getUserStats(userId: string): Promise<UserStats> {
  const points = await getOrCreateUserPoints(userId);
  const stats = points.stats || {};

  return {
    coursesCompleted: stats.coursesCompleted || 0,
    lessonsCompleted: stats.lessonsCompleted || 0,
    quizzesPassed: stats.quizzesPassed || 0,
    perfectQuizzes: stats.perfectQuizzes || 0,
    certificatesEarned: stats.certificatesEarned || 0,
    discussionPosts: stats.discussionPosts || 0,
    reviewsWritten: stats.reviewsWritten || 0,
    currentStreak: points.streak?.current || 0,
  };
}

/**
 * Add points to a user
 */
export async function addPoints(
  userId: string,
  amount: number,
  source: string,
  reason: string,
  relatedId?: string
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> {
  const payload = await getPayload({ config });
  const points = await getOrCreateUserPoints(userId);
  const oldLevel = points.level;
  const newTotal = (points.totalPoints || 0) + amount;

  // Calculate new level
  const newLevel = Math.floor(Math.sqrt(newTotal / 100)) + 1;
  const levelUp = newLevel > oldLevel;

  // Add to history (keep last 100)
  const history = points.pointsHistory || [];
  history.unshift({
    amount,
    reason,
    source,
    earnedAt: new Date().toISOString(),
    relatedId,
  });
  if (history.length > 100) history.pop();

  await payload.update({
    collection: 'user-points',
    id: points.id,
    data: {
      totalPoints: newTotal,
      pointsHistory: history,
    },
  });

  return { newTotal, levelUp, newLevel };
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string): Promise<{
  current: number;
  isNewDay: boolean;
  streakBroken: boolean;
}> {
  const payload = await getPayload({ config });
  const points = await getOrCreateUserPoints(userId);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const lastActivity = points.streak?.lastActivityDate
    ? new Date(points.streak.lastActivityDate)
    : null;

  const lastActivityDay = lastActivity
    ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
    : null;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  let current = points.streak?.current || 0;
  let isNewDay = false;
  let streakBroken = false;

  if (!lastActivityDay) {
    // First activity
    current = 1;
    isNewDay = true;
  } else if (lastActivityDay.getTime() === new Date(today).getTime()) {
    // Already active today, no change
    isNewDay = false;
  } else if (lastActivityDay.getTime() === yesterdayDay.getTime()) {
    // Active yesterday, continue streak
    current += 1;
    isNewDay = true;
  } else {
    // Streak broken
    streakBroken = current > 0;
    current = 1;
    isNewDay = true;
  }

  if (isNewDay) {
    await payload.update({
      collection: 'user-points',
      id: points.id,
      data: {
        streak: {
          current,
          longest: Math.max(current, points.streak?.longest || 0),
          lastActivityDate: now.toISOString(),
        },
      },
    });

    // Award streak bonus points
    if (current > 1) {
      const streakBonus = Math.min(current * 5, 50); // 5 XP per day, max 50
      await addPoints(userId, streakBonus, 'streak', `${current}-day streak bonus`);
    }

    // Check for streak badges
    await checkAndAwardBadges('streak_updated', { userId });
  }

  return { current, isNewDay, streakBroken };
}

/**
 * Update a specific stat and check for badges
 */
export async function incrementStat(
  userId: string,
  stat: keyof UserStats,
  event: BadgeEvent,
  context: Omit<BadgeEventContext, 'userId'>
): Promise<void> {
  const payload = await getPayload({ config });
  const points = await getOrCreateUserPoints(userId);

  const stats = points.stats || {};
  const currentValue = (stats[stat] as number) || 0;

  await payload.update({
    collection: 'user-points',
    id: points.id,
    data: {
      stats: {
        ...stats,
        [stat]: currentValue + 1,
      },
    },
  });

  // Check for badges
  await checkAndAwardBadges(event, { userId, ...context });
}

/**
 * Get user's badges (earned and in-progress)
 */
export async function getUserBadges(userId: string): Promise<{
  earned: Array<{
    badge: Badge;
    awardedAt: string;
    isNew: boolean;
  }>;
  inProgress: Array<{
    badge: Badge;
    current: number;
    required: number;
  }>;
}> {
  const payload = await getPayload({ config });

  // Get user's badges
  const { docs: userBadges } = await payload.find({
    collection: 'user-badges',
    where: { user: { equals: userId } },
    depth: 2,
    limit: 100,
    sort: '-awardedAt',
  });

  const earned = userBadges
    .filter((ub) => ub.progress?.isComplete)
    .map((ub) => ({
      badge: ub.badge as Badge,
      awardedAt: ub.awardedAt,
      isNew: !ub.displayedAt,
    }));

  // Get all active badges to show in-progress
  const { docs: allBadges } = await payload.find({
    collection: 'badges',
    where: {
      isActive: { equals: true },
      isSecret: { equals: false },
    },
    limit: 100,
  });

  const earnedIds = new Set(earned.map((e) => e.badge.id));
  const stats = await getUserStats(userId);

  const inProgress = (allBadges as Badge[])
    .filter((b) => !earnedIds.has(b.id) && b.criteria.threshold)
    .map((badge) => {
      const current = getProgressForBadge(badge, stats);
      return {
        badge,
        current,
        required: badge.criteria.threshold || 1,
      };
    })
    .filter((p) => p.current > 0);

  return { earned, inProgress };
}

/**
 * Get current progress for a badge based on stats
 */
function getProgressForBadge(badge: Badge, stats: UserStats): number {
  switch (badge.criteria.type) {
    case 'courses_completed_count':
      return stats.coursesCompleted;
    case 'lessons_completed_count':
      return stats.lessonsCompleted;
    case 'quizzes_passed_count':
      return stats.quizzesPassed;
    case 'certificates_count':
      return stats.certificatesEarned;
    case 'daily_streak':
      return stats.currentStreak;
    case 'discussion_posts':
      return stats.discussionPosts;
    case 'helpful_reviews':
      return stats.reviewsWritten;
    default:
      return 0;
  }
}

/**
 * Mark badges as viewed
 */
export async function markBadgesAsViewed(userId: string): Promise<void> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'user-badges',
    where: {
      user: { equals: userId },
      'progress.isComplete': { equals: true },
      displayedAt: { exists: false },
    },
    limit: 100,
  });

  for (const badge of docs) {
    await payload.update({
      collection: 'user-badges',
      id: badge.id,
      data: {
        displayedAt: new Date().toISOString(),
      },
    });
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  limit: number = 10,
  page: number = 1
): Promise<{
  users: Array<{
    userId: string;
    totalPoints: number;
    level: number;
    title: string;
    rank: number;
  }>;
  totalPages: number;
}> {
  const payload = await getPayload({ config });

  const { docs, totalPages } = await payload.find({
    collection: 'user-points',
    sort: '-totalPoints',
    limit,
    page,
    depth: 1,
  });

  const startRank = (page - 1) * limit + 1;

  return {
    users: docs.map((doc, index) => ({
      userId: typeof doc.user === 'object' ? doc.user.id : doc.user,
      totalPoints: doc.totalPoints || 0,
      level: doc.level || 1,
      title: doc.title || 'Novice',
      rank: startRank + index,
    })),
    totalPages,
  };
}

// XP amounts for different actions
export const XP_REWARDS = {
  lessonCompleted: 10,
  courseCompleted: 100,
  quizPassed: 20,
  quizPerfect: 50,
  certificateEarned: 200,
  reviewWritten: 15,
  discussionPosted: 5,
  discussionReply: 3,
  dailyLogin: 5,
};
