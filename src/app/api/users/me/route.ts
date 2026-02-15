import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayloadClient } from '@/lib/payload';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await getPayloadClient();
    const userDoc = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    });

    const preferences = userDoc.preferences as Record<string, unknown> | undefined;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: {
          videoPlaybackRate: Number(preferences?.videoPlaybackRate ?? 1),
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  videoPlaybackRate: z.number().min(0.5).max(2).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    const existing = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    });

    const existingPreferences =
      (existing.preferences as Record<string, unknown> | undefined) ?? {};

    const updateData: Record<string, unknown> = {};
    if (result.data.name !== undefined) {
      updateData.name = result.data.name;
    }

    if (result.data.videoPlaybackRate !== undefined) {
      updateData.preferences = {
        ...existingPreferences,
        videoPlaybackRate: result.data.videoPlaybackRate,
      };
    }

    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    });

    const updatedPreferences =
      (updated.preferences as Record<string, unknown> | undefined) ?? {};

    return NextResponse.json({
      user: {
        id: String(updated.id),
        email: updated.email,
        name: updated.name || undefined,
        role: updated.role,
        preferences: {
          videoPlaybackRate: Number(updatedPreferences.videoPlaybackRate ?? 1),
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
