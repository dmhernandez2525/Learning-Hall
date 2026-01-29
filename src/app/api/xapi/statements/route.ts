import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  buildActor,
  buildCourseActivity,
  buildLessonActivity,
  buildQuizActivity,
  createXAPIClient,
  queueStatement,
  XAPI_VERBS,
  XAPIStatement,
} from '@/lib/xapi';
import { z } from 'zod';

const statementSchema = z.object({
  verb: z.enum([
    'launched',
    'completed',
    'passed',
    'failed',
    'progressed',
    'answered',
    'played',
    'paused',
    'seeked',
    'suspended',
    'resumed',
    'terminated',
  ]),
  objectType: z.enum(['course', 'lesson', 'quiz']),
  objectId: z.string(),
  objectName: z.string(),
  result: z
    .object({
      score: z
        .object({
          scaled: z.number().min(-1).max(1).optional(),
          raw: z.number().optional(),
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
      success: z.boolean().optional(),
      completion: z.boolean().optional(),
      response: z.string().optional(),
      duration: z.string().optional(),
      extensions: z.record(z.unknown()).optional(),
    })
    .optional(),
  context: z
    .object({
      courseId: z.string().optional(),
      courseName: z.string().optional(),
      registration: z.string().optional(),
    })
    .optional(),
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

    const body = await request.json();
    const parsed = statementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid statement data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { verb, objectType, objectId, objectName, result, context } = parsed.data;
    const tenantId = user.tenant as string;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not configured' },
        { status: 400 }
      );
    }

    // Check if xAPI is configured for this tenant
    const client = await createXAPIClient(tenantId);
    if (!client) {
      // xAPI not configured, just return success without sending
      return NextResponse.json({ success: true, queued: false });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learninghall.app';

    // Build actor
    const actor = await buildActor(user.id, tenantId);

    // Build activity object
    let activity;
    switch (objectType) {
      case 'course':
        activity = buildCourseActivity(objectId, objectName, baseUrl);
        break;
      case 'lesson':
        activity = buildLessonActivity(objectId, objectName, baseUrl);
        break;
      case 'quiz':
        activity = buildQuizActivity(objectId, objectName, baseUrl);
        break;
    }

    // Map verb string to verb object
    const verbMap: Record<string, (typeof XAPI_VERBS)[keyof typeof XAPI_VERBS]> = {
      launched: XAPI_VERBS.LAUNCHED,
      completed: XAPI_VERBS.COMPLETED,
      passed: XAPI_VERBS.PASSED,
      failed: XAPI_VERBS.FAILED,
      progressed: XAPI_VERBS.PROGRESSED,
      answered: XAPI_VERBS.ANSWERED,
      played: XAPI_VERBS.PLAYED,
      paused: XAPI_VERBS.PAUSED,
      seeked: XAPI_VERBS.SEEKED,
      suspended: XAPI_VERBS.SUSPENDED,
      resumed: XAPI_VERBS.RESUMED,
      terminated: XAPI_VERBS.TERMINATED,
    };

    // Build statement
    const statement: XAPIStatement = {
      actor,
      verb: verbMap[verb],
      object: activity,
      timestamp: new Date().toISOString(),
    };

    // Add result if provided
    if (result) {
      statement.result = result;
    }

    // Add context if provided
    if (context) {
      statement.context = {
        registration: context.registration,
      };

      if (context.courseId && context.courseName) {
        const courseActivity = buildCourseActivity(
          context.courseId,
          context.courseName,
          baseUrl
        );
        statement.context.contextActivities = {
          parent: [courseActivity],
        };
      }
    }

    // Queue statement for sending
    queueStatement(statement, tenantId);

    return NextResponse.json({ success: true, queued: true });
  } catch (error) {
    console.error('xAPI statement error:', error);
    return NextResponse.json(
      { error: 'Failed to process statement' },
      { status: 500 }
    );
  }
}

// Get statements for a user/activity
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const tenantId = user.tenant as string;
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not configured' },
        { status: 400 }
      );
    }

    const client = await createXAPIClient(tenantId);
    if (!client) {
      return NextResponse.json(
        { error: 'xAPI not configured for this tenant' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const verbId = searchParams.get('verbId');
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const limit = searchParams.get('limit');

    const actor = await buildActor(user.id, tenantId);

    const result = await client.getStatements({
      agent: actor,
      activity: activityId || undefined,
      verb: verbId || undefined,
      since: since || undefined,
      until: until || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get xAPI statements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statements' },
      { status: 500 }
    );
  }
}
