import { NextRequest, NextResponse } from 'next/server';
import {
  getVideoUpload,
  completeVideoUpload,
  failVideoUpload,
  deleteVideo,
  getVideoPlaybackUrl,
} from '@/lib/video';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const video = await getVideoUpload(id);

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user owns this video or is admin
    if (user.role !== 'admin' && video.uploaderId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this video' },
        { status: 403 }
      );
    }

    // If video is ready, include playback URL
    let playbackUrl: string | null = null;
    if (video.status === 'ready' && video.storageKey) {
      playbackUrl = await getVideoPlaybackUrl(id, video.tenantId);
    }

    return NextResponse.json({
      doc: {
        ...video,
        playbackUrl,
      },
    });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Failed to get video' },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  action: z.enum(['complete', 'fail']),
  error: z.string().optional(),
  metadata: z
    .object({
      duration: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
      codec: z.string().optional(),
    })
    .optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const video = await getVideoUpload(id);

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user owns this video or is admin
    if (user.role !== 'admin' && video.uploaderId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this video' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { action, error, metadata } = result.data;

    if (action === 'complete') {
      const completeResult = await completeVideoUpload(id, metadata);

      if (!completeResult.success) {
        return NextResponse.json(
          { error: completeResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ doc: completeResult.video });
    } else if (action === 'fail') {
      await failVideoUpload(id, error || 'Upload failed');
      const updated = await getVideoUpload(id);
      return NextResponse.json({ doc: updated });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update video error:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const video = await getVideoUpload(id);

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user owns this video or is admin
    if (user.role !== 'admin' && video.uploaderId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this video' },
        { status: 403 }
      );
    }

    const success = await deleteVideo(id, video.tenantId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
