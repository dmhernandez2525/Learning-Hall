import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserAttempts } from '@/lib/scorm';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId') || undefined;
    const userId = searchParams.get('userId');

    // Non-admins can only view their own attempts
    const targetUserId =
      user.role === 'admin' && userId ? userId : user.id;

    const attempts = await getUserAttempts(targetUserId, packageId);

    return NextResponse.json({
      attempts: attempts.docs.map((attempt) => ({
        id: attempt.id,
        packageId:
          typeof attempt.package === 'object'
            ? attempt.package?.id
            : attempt.package,
        packageTitle:
          typeof attempt.package === 'object' ? attempt.package?.title : null,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        successStatus: attempt.successStatus,
        score: attempt.score,
        progress: attempt.progress,
        totalTime: attempt.totalTime,
        totalTimeSeconds: attempt.totalTimeSeconds,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        lastAccessedAt: attempt.lastAccessedAt,
        createdAt: attempt.createdAt,
      })),
      totalDocs: attempts.totalDocs,
    });
  } catch (error) {
    console.error('Get SCORM attempts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}
