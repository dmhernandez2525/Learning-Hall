import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { getPackageById, getAttemptById } from '@/lib/scorm';

// SCORM Runtime API - handles communication from the SCORM player
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
    const { attemptId, packageId, action, element, value, data } = body;

    if (!attemptId || !packageId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify attempt ownership
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    const attemptUserId =
      typeof attempt.user === 'object' ? attempt.user?.id : attempt.user;

    if (String(attemptUserId) !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });
    const pkg = await getPackageById(packageId);

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get existing CMI data
    const cmiData =
      typeof attempt.cmiData === 'object' ? { ...attempt.cmiData } : {};

    switch (action) {
      case 'Initialize':
      case 'LMSInitialize': {
        // Mark attempt as started
        await payload.update({
          collection: 'scorm-attempts',
          id: attemptId,
          data: {
            status: 'incomplete',
            startedAt: attempt.startedAt || new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
          },
        });

        return NextResponse.json({
          success: true,
          data: cmiData,
        });
      }

      case 'GetValue':
      case 'LMSGetValue': {
        const result = cmiData[element as string] ?? '';
        return NextResponse.json({
          success: true,
          value: result,
        });
      }

      case 'SetValue':
      case 'LMSSetValue': {
        cmiData[element as string] = value;

        // Save CMI data
        await payload.update({
          collection: 'scorm-attempts',
          id: attemptId,
          data: {
            cmiData,
            lastAccessedAt: new Date().toISOString(),
          },
        });

        return NextResponse.json({ success: true });
      }

      case 'Commit':
      case 'LMSCommit': {
        // Process and save all data
        const updateData: Record<string, unknown> = {
          cmiData,
          lastAccessedAt: new Date().toISOString(),
        };

        // Extract key fields from CMI data
        if (data) {
          // Handle SCORM 1.2 fields
          if (data['cmi.core.lesson_status']) {
            const statusMap: Record<string, string> = {
              'not attempted': 'not-attempted',
              incomplete: 'incomplete',
              completed: 'completed',
              passed: 'passed',
              failed: 'failed',
              browsed: 'browsed',
            };
            updateData.status = statusMap[data['cmi.core.lesson_status']] || 'incomplete';
          }

          // Handle SCORM 2004 fields
          if (data['cmi.completion_status'] || data['cmi.success_status']) {
            const completionStatus = data['cmi.completion_status'];
            const successStatus = data['cmi.success_status'];

            if (successStatus === 'passed') {
              updateData.status = 'passed';
            } else if (successStatus === 'failed') {
              updateData.status = 'failed';
            } else if (completionStatus === 'completed') {
              updateData.status = 'completed';
            } else if (completionStatus === 'incomplete') {
              updateData.status = 'incomplete';
            }

            if (successStatus) {
              updateData.successStatus = successStatus;
            }
          }

          // Handle score
          const scoreRaw =
            data['cmi.core.score.raw'] || data['cmi.score.raw'];
          const scoreScaled = data['cmi.score.scaled'];
          const scoreMin =
            data['cmi.core.score.min'] || data['cmi.score.min'];
          const scoreMax =
            data['cmi.core.score.max'] || data['cmi.score.max'];

          if (scoreRaw || scoreScaled) {
            updateData.score = {
              raw: scoreRaw ? parseFloat(scoreRaw) : undefined,
              scaled: scoreScaled ? parseFloat(scoreScaled) : undefined,
              min: scoreMin ? parseFloat(scoreMin) : undefined,
              max: scoreMax ? parseFloat(scoreMax) : undefined,
            };
          }

          // Handle progress
          if (data['cmi.progress_measure']) {
            updateData.progress = parseFloat(data['cmi.progress_measure']) * 100;
          }

          // Handle location
          const location =
            data['cmi.core.lesson_location'] || data['cmi.location'];
          if (location) {
            updateData.location = location;
          }

          // Handle suspend data
          const suspendData = data['cmi.suspend_data'];
          if (suspendData) {
            updateData.suspendData = suspendData;
          }

          // Handle completed status
          if (
            updateData.status === 'completed' ||
            updateData.status === 'passed' ||
            updateData.status === 'failed'
          ) {
            updateData.completedAt = new Date().toISOString();
          }
        }

        await payload.update({
          collection: 'scorm-attempts',
          id: attemptId,
          data: updateData,
        });

        return NextResponse.json({ success: true });
      }

      case 'Terminate':
      case 'LMSFinish': {
        // Final commit and mark session ended
        await payload.update({
          collection: 'scorm-attempts',
          id: attemptId,
          data: {
            cmiData,
            lastAccessedAt: new Date().toISOString(),
            exitReason: data?.exit || 'normal',
          },
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SCORM runtime error:', error);
    return NextResponse.json(
      { error: 'Runtime error' },
      { status: 500 }
    );
  }
}

// Get attempt state
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID required' },
        { status: 400 }
      );
    }

    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    const attemptUserId =
      typeof attempt.user === 'object' ? attempt.user?.id : attempt.user;

    if (String(attemptUserId) !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        cmiData: attempt.cmiData,
        suspendData: attempt.suspendData,
        location: attempt.location,
        score: attempt.score,
        progress: attempt.progress,
      },
    });
  } catch (error) {
    console.error('Get attempt state error:', error);
    return NextResponse.json(
      { error: 'Failed to get attempt state' },
      { status: 500 }
    );
  }
}
