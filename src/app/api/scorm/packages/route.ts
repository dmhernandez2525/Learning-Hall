import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const version = searchParams.get('version');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause
    const conditions: Where[] = [];

    // Tenant isolation
    if (user.role !== 'admin' && user.tenant) {
      conditions.push({ tenant: { equals: user.tenant as string } });
    }

    if (courseId) {
      conditions.push({ course: { equals: courseId } });
    }

    if (status) {
      conditions.push({ status: { equals: status } });
    }

    if (version) {
      conditions.push({ version: { equals: version } });
    }

    const where: Where = conditions.length > 0 ? { and: conditions } : {};

    const packages = await payload.find({
      collection: 'scorm-packages',
      where,
      page,
      limit,
      sort: '-createdAt',
    });

    return NextResponse.json({
      packages: packages.docs.map((pkg) => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        courseId: typeof pkg.course === 'object' ? pkg.course?.id : pkg.course,
        lessonId: typeof pkg.lesson === 'object' ? pkg.lesson?.id : pkg.lesson,
        version: pkg.version,
        status: pkg.status,
        launchUrl: pkg.launchUrl,
        settings: pkg.settings,
        createdAt: pkg.createdAt,
      })),
      totalDocs: packages.totalDocs,
      totalPages: packages.totalPages,
      page: packages.page,
    });
  } catch (error) {
    console.error('Get SCORM packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only instructors and admins can upload packages
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });
    const body = await request.json();

    const {
      title,
      description,
      courseId,
      lessonId,
      packageFileId,
      version,
      launchUrl,
      settings,
    } = body;

    if (!title || !packageFileId || !version) {
      return NextResponse.json(
        { error: 'Title, package file, and version are required' },
        { status: 400 }
      );
    }

    // Validate version
    const validVersions = ['scorm-1.2', 'scorm-2004-3rd', 'scorm-2004-4th', 'xapi', 'cmi5'];
    if (!validVersions.includes(version)) {
      return NextResponse.json(
        { error: 'Invalid SCORM/xAPI version' },
        { status: 400 }
      );
    }

    const pkg = await payload.create({
      collection: 'scorm-packages',
      data: {
        title,
        description,
        course: courseId || undefined,
        lesson: lessonId || undefined,
        packageFile: packageFileId,
        version,
        launchUrl: launchUrl || 'index.html',
        settings: settings || {
          fullScreen: false,
          width: 1024,
          height: 768,
          exitBehavior: 'close',
        },
        status: 'processing',
        tenant: user.tenant as string,
        uploadedBy: user.id,
      },
    });

    // In a real implementation, you would trigger package extraction here
    // For now, we'll just set status to active
    await payload.update({
      collection: 'scorm-packages',
      id: String(pkg.id),
      data: {
        status: 'active',
      },
    });

    return NextResponse.json({
      package: {
        id: pkg.id,
        title: pkg.title,
        version: pkg.version,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Create SCORM package error:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
}
