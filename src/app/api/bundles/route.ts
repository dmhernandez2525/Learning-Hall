import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);

    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Build query conditions
    const where: Record<string, unknown> = {
      isActive: { equals: true },
    };

    // Check availability dates
    const now = new Date().toISOString();
    where.or = [
      { 'availability.startDate': { exists: false } },
      { 'availability.startDate': { less_than_equal: now } },
    ];

    if (featured === 'true') {
      where.isFeatured = { equals: true };
    }

    const bundles = await payload.find({
      collection: 'course-bundles',
      where,
      limit,
      page,
      depth: 2,
      sort: '-createdAt',
    });

    // Transform bundles for frontend
    const transformedBundles = bundles.docs.map((bundle) => {
      const courses = Array.isArray(bundle.courses) ? bundle.courses : [];
      const courseCount = courses.length;

      // Calculate total original price from individual courses
      let totalOriginalPrice = 0;
      const courseDetails = courses.map((course: Record<string, unknown>) => {
        if (typeof course === 'object' && course !== null) {
          const coursePrice = (course.pricing as Record<string, unknown>)?.amount as number || 0;
          totalOriginalPrice += coursePrice;
          return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            thumbnail: course.thumbnail,
            price: coursePrice,
          };
        }
        return null;
      }).filter(Boolean);

      const bundlePrice = (bundle.pricing as Record<string, unknown>)?.amount as number || 0;
      const savings = totalOriginalPrice - bundlePrice;
      const savingsPercent = totalOriginalPrice > 0
        ? Math.round((savings / totalOriginalPrice) * 100)
        : 0;

      return {
        id: bundle.id,
        title: bundle.title,
        slug: bundle.slug,
        description: bundle.description,
        shortDescription: bundle.shortDescription,
        thumbnail: bundle.thumbnail,
        courseCount,
        courses: courseDetails,
        pricing: {
          amount: bundlePrice,
          compareAtPrice: (bundle.pricing as Record<string, unknown>)?.compareAtPrice || totalOriginalPrice,
          savings,
          savingsPercent,
          currency: (bundle.pricing as Record<string, unknown>)?.currency || 'USD',
        },
        badges: bundle.badges || [],
        isFeatured: bundle.isFeatured,
        stats: bundle.stats || { enrollments: 0, revenue: 0 },
        availability: bundle.availability,
      };
    });

    return NextResponse.json({
      bundles: transformedBundles,
      totalDocs: bundles.totalDocs,
      totalPages: bundles.totalPages,
      page: bundles.page,
      hasNextPage: bundles.hasNextPage,
      hasPrevPage: bundles.hasPrevPage,
    });
  } catch (error) {
    console.error('Bundles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}
