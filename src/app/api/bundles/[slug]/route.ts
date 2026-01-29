import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const payload = await getPayload({ config });

    const bundles = await payload.find({
      collection: 'course-bundles',
      where: {
        slug: { equals: slug },
        isActive: { equals: true },
      },
      limit: 1,
      depth: 3,
    });

    if (bundles.docs.length === 0) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    const bundle = bundles.docs[0];
    const courses = Array.isArray(bundle.courses) ? bundle.courses : [];

    // Calculate pricing details
    let totalOriginalPrice = 0;
    let totalDuration = 0;
    let totalLessons = 0;

    const courseDetails = courses.map((course: Record<string, unknown>) => {
      if (typeof course === 'object' && course !== null) {
        const coursePrice = (course.pricing as Record<string, unknown>)?.amount as number || 0;
        totalOriginalPrice += coursePrice;

        // Aggregate course stats
        const stats = course.stats as Record<string, unknown> || {};
        totalDuration += (stats.totalDuration as number) || 0;
        totalLessons += (stats.lessonCount as number) || 0;

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          price: coursePrice,
          instructor: course.instructor,
          stats: {
            enrollments: stats.enrollments || 0,
            avgRating: stats.avgRating || 0,
            totalDuration: stats.totalDuration || 0,
            lessonCount: stats.lessonCount || 0,
          },
          level: course.level,
        };
      }
      return null;
    }).filter(Boolean);

    const bundlePrice = (bundle.pricing as Record<string, unknown>)?.amount as number || 0;
    const savings = totalOriginalPrice - bundlePrice;
    const savingsPercent = totalOriginalPrice > 0
      ? Math.round((savings / totalOriginalPrice) * 100)
      : 0;

    const response = {
      id: bundle.id,
      title: bundle.title,
      slug: bundle.slug,
      description: bundle.description,
      shortDescription: bundle.shortDescription,
      thumbnail: bundle.thumbnail,
      courseCount: courseDetails.length,
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
      stats: {
        ...(bundle.stats || {}),
        totalDuration,
        totalLessons,
      },
      availability: bundle.availability,
      seo: bundle.seo,
    };

    return NextResponse.json({ bundle: response });
  } catch (error) {
    console.error('Bundle GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
      { status: 500 }
    );
  }
}
