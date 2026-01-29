import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPackageById, createAttempt, getLatestAttempt } from '@/lib/scorm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: packageId } = await params;
    const body = await request.json();
    const { forceNewAttempt = false } = body;

    // Get package
    const pkg = await getPackageById(packageId);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    if (pkg.status !== 'active') {
      return NextResponse.json(
        { error: 'Package is not active' },
        { status: 400 }
      );
    }

    // Check tenant access
    if (
      user.role !== 'admin' &&
      pkg.tenant !== user.tenant
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let attemptId: string;

    // Check for existing resumable attempt
    if (!forceNewAttempt) {
      const existingAttemptId = await getLatestAttempt(user.id, packageId);
      if (existingAttemptId) {
        attemptId = existingAttemptId;
      } else {
        attemptId = await createAttempt(user.id, packageId);
      }
    } else {
      attemptId = await createAttempt(user.id, packageId);
    }

    // Build launch URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const launchUrl = `${baseUrl}/scorm/player?packageId=${packageId}&attemptId=${attemptId}`;

    return NextResponse.json({
      launchUrl,
      attemptId,
      packageId,
      version: pkg.version,
      settings: pkg.settings,
      contentUrl: pkg.launchUrl,
    });
  } catch (error) {
    console.error('Launch SCORM package error:', error);
    return NextResponse.json(
      { error: 'Failed to launch package' },
      { status: 500 }
    );
  }
}
