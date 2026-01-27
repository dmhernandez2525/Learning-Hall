import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserBadges, markBadgesAsViewed } from '@/lib/gamification';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * GET /api/gamification/badges
 * Get current user's badges or all available badges
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || 'user';
  const markViewed = searchParams.get('markViewed') === 'true';

  if (scope === 'all') {
    // Return all available badges (public)
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'badges',
      where: {
        isActive: { equals: true },
        isSecret: { equals: false },
      },
      sort: 'displayOrder',
      limit: 100,
    });

    return NextResponse.json({ badges: docs });
  }

  // Get user's badges
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { earned, inProgress } = await getUserBadges(user.id);

  if (markViewed) {
    await markBadgesAsViewed(user.id);
  }

  return NextResponse.json({
    earned,
    inProgress,
    newBadges: earned.filter((b) => b.isNew).length,
  });
}
