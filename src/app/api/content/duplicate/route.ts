import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  duplicateCourse,
  duplicateLesson,
  duplicateQuiz,
  bulkDuplicate,
} from '@/lib/content-authoring/duplicate';

// POST /api/content/duplicate - Duplicate content
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
    const { contentId, contentType, newTitle, bulk } = body;

    const tenantId = user.tenant as string;

    // Handle bulk duplication
    if (bulk && Array.isArray(bulk)) {
      const results = await bulkDuplicate(bulk, {
        userId: user.id,
        tenantId,
      });

      return NextResponse.json({ results });
    }

    // Handle single duplication
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'contentId and contentType are required' },
        { status: 400 }
      );
    }

    let newId: string;

    switch (contentType) {
      case 'course':
        newId = await duplicateCourse(contentId, {
          newTitle,
          userId: user.id,
          tenantId,
        });
        break;

      case 'lesson':
        newId = await duplicateLesson(contentId, {
          newTitle,
          userId: user.id,
          tenantId,
        });
        break;

      case 'quiz':
        newId = await duplicateQuiz(contentId, {
          newTitle,
          userId: user.id,
          tenantId,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ newId, contentType }, { status: 201 });
  } catch (error) {
    console.error('Duplicate content error:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate content' },
      { status: 500 }
    );
  }
}
