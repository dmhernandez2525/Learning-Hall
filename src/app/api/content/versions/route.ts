import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createVersion,
  getVersionHistory,
  restoreVersion,
  compareVersions,
} from '@/lib/content-authoring/version-control';

// GET /api/content/versions - Get version history
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
    const contentId = searchParams.get('contentId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    const versions = await getVersionHistory(contentId, limit);

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST /api/content/versions - Create new version
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentId, contentType, content, changeType, changeDescription } = body;

    if (!contentId || !contentType || !content) {
      return NextResponse.json(
        { error: 'contentId, contentType, and content are required' },
        { status: 400 }
      );
    }

    const tenantId = user.tenant as string;

    const versionId = await createVersion(contentId, contentType, content, {
      changeType: changeType || 'manual',
      changeDescription,
      authorId: user.id,
      tenantId,
    });

    return NextResponse.json({ versionId }, { status: 201 });
  } catch (error) {
    console.error('Create version error:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

// PATCH /api/content/versions - Restore version
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, contentId, versionId, compareWith } = body;

    if (action === 'restore') {
      if (!contentId || !versionId) {
        return NextResponse.json(
          { error: 'contentId and versionId are required' },
          { status: 400 }
        );
      }

      await restoreVersion(contentId, versionId, user.id);

      return NextResponse.json({ success: true });
    }

    if (action === 'compare') {
      if (!versionId || !compareWith) {
        return NextResponse.json(
          { error: 'versionId and compareWith are required' },
          { status: 400 }
        );
      }

      const diff = await compareVersions(versionId, compareWith);

      return NextResponse.json({ diff });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Version action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform version action' },
      { status: 500 }
    );
  }
}
