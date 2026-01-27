import { NextRequest, NextResponse } from 'next/server';
import { initiateVideoUpload, listVideos } from '@/lib/video';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// Valid video MIME types
const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Maximum file size: 5GB
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

const initiateUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (type) => VIDEO_MIME_TYPES.includes(type),
    { message: 'Invalid video content type' }
  ),
  size: z.number().min(1).max(MAX_FILE_SIZE, 'File size exceeds 5GB limit'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only instructors can upload videos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = initiateUploadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { filename, contentType, size } = result.data;

    const uploadResult = await initiateVideoUpload(user.id, {
      filename,
      contentType,
      size,
      tenantId: user.tenant,
    });

    return NextResponse.json(uploadResult, { status: 201 });
  } catch (error) {
    console.error('Initiate upload error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listVideos(user.id, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List videos error:', error);
    return NextResponse.json(
      { error: 'Failed to list videos' },
      { status: 500 }
    );
  }
}
