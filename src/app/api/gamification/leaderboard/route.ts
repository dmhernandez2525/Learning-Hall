import { NextResponse } from 'next/server';
import { getLeaderboard, getOrCreateUserPoints } from '@/lib/gamification';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/gamification/leaderboard
 * Get the XP leaderboard
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
  const includeUser = searchParams.get('includeUser') === 'true';

  const leaderboard = await getLeaderboard(limit, page);

  let userRank = null;
  if (includeUser) {
    const user = await getSession();
    if (user) {
      const points = await getOrCreateUserPoints(user.id);
      // Calculate user's rank
      const { users } = await getLeaderboard(1000, 1);
      const index = users.findIndex((u) => u.userId === user.id);
      if (index >= 0) {
        userRank = {
          rank: index + 1,
          totalPoints: points.totalPoints,
          level: points.level,
          title: points.title,
        };
      }
    }
  }

  return NextResponse.json({
    leaderboard: leaderboard.users,
    totalPages: leaderboard.totalPages,
    currentPage: page,
    userRank,
  });
}
