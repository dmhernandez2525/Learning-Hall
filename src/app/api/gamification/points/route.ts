import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getOrCreateUserPoints, updateStreak } from '@/lib/gamification';

/**
 * GET /api/gamification/points
 * Get current user's points, level, and streak
 */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const points = await getOrCreateUserPoints(user.id);

  return NextResponse.json({
    totalPoints: points.totalPoints,
    level: points.level,
    title: points.title,
    pointsToNextLevel: points.pointsToNextLevel,
    streak: {
      current: points.streak?.current || 0,
      longest: points.streak?.longest || 0,
      lastActivityDate: points.streak?.lastActivityDate,
    },
    stats: points.stats,
    recentHistory: (points.pointsHistory || []).slice(0, 10),
  });
}

/**
 * POST /api/gamification/points
 * Update streak (called on daily activity)
 */
export async function POST() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const streakResult = await updateStreak(user.id);

  return NextResponse.json({
    streak: streakResult,
  });
}
