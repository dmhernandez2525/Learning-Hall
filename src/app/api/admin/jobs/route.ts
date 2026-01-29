import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { jobQueue, JobStatus } from '@/lib/performance/background-jobs';

// GET /api/admin/jobs - Get job queue status (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const jobId = searchParams.get('id');

    if (jobId) {
      const job = jobQueue.getJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ job });
    }

    if (status) {
      const jobs = jobQueue.getJobsByStatus(status);
      return NextResponse.json({ jobs, count: jobs.length });
    }

    return NextResponse.json({
      stats: jobQueue.getStats(),
      pending: jobQueue.getJobsByStatus('pending').slice(0, 20),
      running: jobQueue.getJobsByStatus('running'),
      failed: jobQueue.getJobsByStatus('failed').slice(0, 10),
    });
  } catch (error) {
    console.error('Jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to get jobs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/jobs - Job management actions (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, jobId } = body;

    switch (action) {
      case 'cancel':
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId is required' },
            { status: 400 }
          );
        }
        const cancelled = await jobQueue.cancel(jobId);
        return NextResponse.json({ success: cancelled });

      case 'cleanup':
        const maxAgeMs = body.maxAgeMs || 24 * 60 * 60 * 1000;
        const removed = jobQueue.cleanup(maxAgeMs);
        return NextResponse.json({ removed });

      case 'start':
        jobQueue.start();
        return NextResponse.json({ success: true, message: 'Job queue started' });

      case 'stop':
        jobQueue.stop();
        return NextResponse.json({ success: true, message: 'Job queue stopped' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Jobs action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform job action' },
      { status: 500 }
    );
  }
}
