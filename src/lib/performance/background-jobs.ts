// Background Job Processing System
import { acquireLock, releaseLock } from './redis';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
}

export interface JobDefinition<T = unknown> {
  type: string;
  handler: (data: T) => Promise<unknown>;
  maxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

// In-memory job queue (for development/simple deployments)
class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobDefinition> = new Map();
  private processing: Set<string> = new Set();
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;

  // Register a job handler
  register<T>(definition: JobDefinition<T>): void {
    this.handlers.set(definition.type, definition as JobDefinition);
  }

  // Add a job to the queue
  async enqueue<T>(
    type: string,
    data: T,
    options: { priority?: number; delay?: number } = {}
  ): Promise<string> {
    const { priority = 0, delay = 0 } = options;

    const job: Job<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      data,
      status: 'pending',
      priority,
      attempts: 0,
      maxAttempts: this.handlers.get(type)?.maxAttempts || 3,
      createdAt: new Date(Date.now() + delay),
    };

    this.jobs.set(job.id, job);

    // If delay, schedule for later
    if (delay > 0) {
      setTimeout(() => this.processJob(job.id), delay);
    }

    return job.id;
  }

  // Get job by ID
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  // Get jobs by status
  getJobsByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  // Cancel a job
  async cancel(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'pending') {
      return false;
    }

    job.status = 'cancelled';
    return true;
  }

  // Start processing jobs
  start(pollIntervalMs: number = 1000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pollInterval = setInterval(() => this.processNextJob(), pollIntervalMs);
    console.log('Job queue started');
  }

  // Stop processing jobs
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('Job queue stopped');
  }

  // Process the next available job
  private async processNextJob(): Promise<void> {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(
        (job) =>
          job.status === 'pending' &&
          !this.processing.has(job.id) &&
          new Date(job.createdAt) <= new Date()
      )
      .sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());

    if (pendingJobs.length === 0) return;

    await this.processJob(pendingJobs[0].id);
  }

  // Process a specific job
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      console.error(`No handler for job type: ${job.type}`);
      job.status = 'failed';
      job.error = `No handler for job type: ${job.type}`;
      return;
    }

    // Acquire lock to prevent duplicate processing
    const lockValue = await acquireLock(`job:${jobId}`, handler.timeout || 300000);
    if (!lockValue) {
      // Another worker is processing this job
      return;
    }

    this.processing.add(jobId);
    job.status = 'running';
    job.startedAt = new Date();
    job.attempts++;

    try {
      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), handler.timeout || 300000);
      });

      // Execute handler
      const result = await Promise.race([
        handler.handler(job.data),
        timeoutPromise,
      ]);

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        job.status = 'pending';
        job.error = errorMessage;
        const retryDelay = handler.retryDelay || 1000 * Math.pow(2, job.attempts);
        job.createdAt = new Date(Date.now() + retryDelay);
      } else {
        job.status = 'failed';
        job.error = errorMessage;
      }
    } finally {
      this.processing.delete(jobId);
      await releaseLock(`job:${jobId}`, lockValue);
    }
  }

  // Clean up old completed/failed jobs
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;

    for (const [id, job] of this.jobs) {
      if (
        (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') &&
        job.createdAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        removed++;
      }
    }

    return removed;
  }

  // Get queue statistics
  getStats(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const stats = { pending: 0, running: 0, completed: 0, failed: 0, total: 0 };

    for (const job of this.jobs.values()) {
      stats.total++;
      switch (job.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'running':
          stats.running++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    }

    return stats;
  }
}

// Singleton job queue instance
const jobQueue = new JobQueue();

// Export job queue
export { jobQueue };

// Pre-defined job types
export const JobTypes = {
  SEND_EMAIL: 'send-email',
  PROCESS_VIDEO: 'process-video',
  GENERATE_CERTIFICATE: 'generate-certificate',
  SYNC_ANALYTICS: 'sync-analytics',
  REINDEX_SEARCH: 'reindex-search',
  EXPORT_DATA: 'export-data',
  IMPORT_DATA: 'import-data',
  SEND_NOTIFICATION: 'send-notification',
  CLEANUP_SESSIONS: 'cleanup-sessions',
  CALCULATE_PROGRESS: 'calculate-progress',
} as const;

// Register common job handlers
export function registerDefaultHandlers(): void {
  // Send email job
  jobQueue.register({
    type: JobTypes.SEND_EMAIL,
    maxAttempts: 3,
    retryDelay: 5000,
    timeout: 30000,
    handler: async (data: { to: string; subject: string; body: string }) => {
      // Email sending would be implemented here
      console.log(`Sending email to ${data.to}: ${data.subject}`);
      return { sent: true };
    },
  });

  // Generate certificate job
  jobQueue.register({
    type: JobTypes.GENERATE_CERTIFICATE,
    maxAttempts: 2,
    timeout: 60000,
    handler: async (data: { userId: string; courseId: string }) => {
      // Certificate generation would be implemented here
      console.log(`Generating certificate for user ${data.userId}, course ${data.courseId}`);
      return { generated: true };
    },
  });

  // Send notification job
  jobQueue.register({
    type: JobTypes.SEND_NOTIFICATION,
    maxAttempts: 3,
    retryDelay: 3000,
    timeout: 15000,
    handler: async (data: { userId: string; type: string; message: string }) => {
      // Notification would be sent here
      console.log(`Sending notification to user ${data.userId}: ${data.message}`);
      return { sent: true };
    },
  });

  // Cleanup sessions job
  jobQueue.register({
    type: JobTypes.CLEANUP_SESSIONS,
    maxAttempts: 1,
    timeout: 300000,
    handler: async () => {
      // Session cleanup would be implemented here
      console.log('Cleaning up expired sessions');
      return { cleaned: true };
    },
  });
}

// Helper functions for common job operations
export async function sendEmailAsync(to: string, subject: string, body: string): Promise<string> {
  return jobQueue.enqueue(JobTypes.SEND_EMAIL, { to, subject, body });
}

export async function generateCertificateAsync(userId: string, courseId: string): Promise<string> {
  return jobQueue.enqueue(JobTypes.GENERATE_CERTIFICATE, { userId, courseId }, { priority: 5 });
}

export async function sendNotificationAsync(
  userId: string,
  type: string,
  message: string
): Promise<string> {
  return jobQueue.enqueue(JobTypes.SEND_NOTIFICATION, { userId, type, message });
}

// Schedule recurring jobs
export function scheduleRecurringJob(
  type: string,
  data: unknown,
  intervalMs: number
): () => void {
  const schedule = async () => {
    await jobQueue.enqueue(type, data);
    setTimeout(schedule, intervalMs);
  };

  schedule();

  return () => {
    // Return cancellation function (would need more sophisticated tracking)
  };
}
