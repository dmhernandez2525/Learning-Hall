import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPackageById } from '@/lib/scorm';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(
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

    const { id } = await params;
    const pkg = await getPackageById(id);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
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

    return NextResponse.json({
      package: {
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        courseId: typeof pkg.course === 'object' ? pkg.course?.id : pkg.course,
        lessonId: typeof pkg.lesson === 'object' ? pkg.lesson?.id : pkg.lesson,
        version: pkg.version,
        status: pkg.status,
        launchUrl: pkg.launchUrl,
        settings: pkg.settings,
        manifestData: pkg.manifestData,
        extractedPath: pkg.extractedPath,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get SCORM package error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Only instructors and admins can update packages
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const payload = await getPayload({ config });

    const pkg = await getPackageById(id);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
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

    const body = await request.json();
    const { title, description, settings, status } = body;

    const updatedPkg = await payload.update({
      collection: 'scorm-packages',
      id,
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(settings && { settings }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      package: {
        id: updatedPkg.id,
        title: updatedPkg.title,
        status: updatedPkg.status,
      },
    });
  } catch (error) {
    console.error('Update SCORM package error:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only admins can delete packages
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const payload = await getPayload({ config });

    const pkg = await getPackageById(id);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Archive instead of hard delete
    await payload.update({
      collection: 'scorm-packages',
      id,
      data: {
        status: 'archived',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete SCORM package error:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
