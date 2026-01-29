import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getPersonalizedRecommendations,
  getSimilarCourses,
  getTrendingCourses,
  getNewCourses,
  getPopularCourses,
  getFeaturedCourses,
  getContinueLearning,
  getCoursesByCategory,
} from '@/lib/search/recommendations';

// GET /api/recommendations - Get course recommendations
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'personalized';
    const courseId = searchParams.get('courseId') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const tenantId = user?.tenant as string | undefined;

    let recommendations;

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations({
          userId: user?.id,
          tenantId,
          limit,
        });
        break;

      case 'similar':
        if (!courseId) {
          return NextResponse.json(
            { error: 'courseId is required for similar recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getSimilarCourses(courseId, tenantId, limit);
        break;

      case 'trending':
        recommendations = await getTrendingCourses(tenantId, limit);
        break;

      case 'new':
        recommendations = await getNewCourses(tenantId, limit);
        break;

      case 'popular':
        recommendations = await getPopularCourses(tenantId, limit);
        break;

      case 'featured':
        recommendations = await getFeaturedCourses(tenantId, limit);
        break;

      case 'continue':
        if (!user?.id) {
          return NextResponse.json(
            { error: 'Authentication required for continue learning' },
            { status: 401 }
          );
        }
        recommendations = await getContinueLearning(user.id, tenantId, limit);
        break;

      case 'category':
        if (!category) {
          return NextResponse.json(
            { error: 'category is required for category recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getCoursesByCategory(category, tenantId, limit);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ recommendations, type });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
