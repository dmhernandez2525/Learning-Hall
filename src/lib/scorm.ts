import { getPayload, Where } from 'payload';
import config from '@/payload.config';

// SCORM Data Model types
export interface SCORMScore {
  raw?: number;
  min?: number;
  max?: number;
  scaled?: number;
}

export interface SCORMInteraction {
  id: string;
  type?:
    | 'true-false'
    | 'choice'
    | 'fill-in'
    | 'long-fill-in'
    | 'matching'
    | 'performance'
    | 'sequencing'
    | 'likert'
    | 'numeric'
    | 'other';
  description?: string;
  learnerResponse?: string;
  correctResponse?: string;
  result?: 'correct' | 'incorrect' | 'neutral';
  weighting?: number;
  latency?: string;
  timestamp?: string;
}

export interface SCORMAttemptData {
  status:
    | 'not-attempted'
    | 'incomplete'
    | 'completed'
    | 'passed'
    | 'failed'
    | 'browsed';
  successStatus?: 'unknown' | 'passed' | 'failed';
  score?: SCORMScore;
  progress?: number;
  totalTime?: string;
  totalTimeSeconds?: number;
  suspendData?: string;
  location?: string;
  cmiData?: Record<string, unknown>;
  interactions?: SCORMInteraction[];
  exitReason?: 'time-out' | 'suspend' | 'logout' | 'normal';
}

// SCORM 1.2 API Implementation
export class SCORM12API {
  private data: Record<string, string> = {};
  private attemptId: string;
  private packageId: string;
  private userId: string;
  private initialized = false;
  private terminated = false;
  private lastError = '0';

  constructor(attemptId: string, packageId: string, userId: string) {
    this.attemptId = attemptId;
    this.packageId = packageId;
    this.userId = userId;
  }

  // Initialize the data model with default values
  initializeDataModel(): void {
    this.data = {
      'cmi.core.student_id': this.userId,
      'cmi.core.student_name': '',
      'cmi.core.lesson_location': '',
      'cmi.core.credit': 'credit',
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.entry': 'ab-initio',
      'cmi.core.score.raw': '',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.core.total_time': '0000:00:00.00',
      'cmi.core.lesson_mode': 'normal',
      'cmi.core.exit': '',
      'cmi.core.session_time': '0000:00:00.00',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.comments': '',
      'cmi.comments_from_lms': '',
    };
  }

  // Load existing attempt data
  async loadAttemptData(): Promise<void> {
    const payload = await getPayload({ config });

    const attempt = await payload.findByID({
      collection: 'scorm-attempts',
      id: this.attemptId,
    });

    if (attempt) {
      // Restore CMI data if available
      if (attempt.cmiData && typeof attempt.cmiData === 'object') {
        Object.entries(attempt.cmiData).forEach(([key, value]) => {
          if (typeof value === 'string') {
            this.data[key] = value;
          }
        });
      }

      // Restore specific fields
      if (attempt.location) {
        this.data['cmi.core.lesson_location'] = attempt.location;
      }
      if (attempt.suspendData) {
        this.data['cmi.suspend_data'] = attempt.suspendData;
      }
      if (attempt.score?.raw !== undefined) {
        this.data['cmi.core.score.raw'] = String(attempt.score.raw);
      }
      if (attempt.totalTime) {
        this.data['cmi.core.total_time'] = attempt.totalTime;
      }

      // Set entry based on previous state
      if (attempt.status !== 'not-attempted') {
        this.data['cmi.core.entry'] = attempt.suspendData ? 'resume' : '';
      }

      // Map status
      const statusMap: Record<string, string> = {
        'not-attempted': 'not attempted',
        incomplete: 'incomplete',
        completed: 'completed',
        passed: 'passed',
        failed: 'failed',
        browsed: 'browsed',
      };
      this.data['cmi.core.lesson_status'] = statusMap[attempt.status] || 'not attempted';
    }
  }

  // SCORM 1.2 API Methods
  LMSInitialize(_param: string): string {
    if (this.initialized) {
      this.lastError = '101'; // Already initialized
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '104'; // Content instance terminated
      return 'false';
    }

    this.initializeDataModel();
    this.initialized = true;
    this.lastError = '0';
    return 'true';
  }

  LMSFinish(_param: string): string {
    if (!this.initialized) {
      this.lastError = '301'; // Not initialized
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '111'; // Already terminated
      return 'false';
    }

    // Save data
    this.saveAttemptData().catch(console.error);

    this.terminated = true;
    this.lastError = '0';
    return 'true';
  }

  LMSGetValue(element: string): string {
    if (!this.initialized) {
      this.lastError = '301';
      return '';
    }
    if (this.terminated) {
      this.lastError = '123';
      return '';
    }

    const value = this.data[element];
    if (value === undefined) {
      this.lastError = '201'; // Invalid argument error
      return '';
    }

    this.lastError = '0';
    return value;
  }

  LMSSetValue(element: string, value: string): string {
    if (!this.initialized) {
      this.lastError = '301';
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '123';
      return 'false';
    }

    // Check for read-only elements
    const readOnlyElements = [
      'cmi.core.student_id',
      'cmi.core.student_name',
      'cmi.core.credit',
      'cmi.core.entry',
      'cmi.core.total_time',
      'cmi.core.lesson_mode',
      'cmi.launch_data',
      'cmi.comments_from_lms',
    ];

    if (readOnlyElements.includes(element)) {
      this.lastError = '403'; // Read-only element
      return 'false';
    }

    this.data[element] = value;
    this.lastError = '0';
    return 'true';
  }

  LMSCommit(_param: string): string {
    if (!this.initialized) {
      this.lastError = '301';
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '123';
      return 'false';
    }

    // Save data
    this.saveAttemptData().catch(console.error);

    this.lastError = '0';
    return 'true';
  }

  LMSGetLastError(): string {
    return this.lastError;
  }

  LMSGetErrorString(errorCode: string): string {
    const errors: Record<string, string> = {
      '0': 'No error',
      '101': 'General exception',
      '102': 'Server busy',
      '103': 'Invalid argument error',
      '104': 'Content instance terminated',
      '111': 'Termination after termination',
      '123': 'Retrieve data after termination',
      '201': 'Invalid argument error',
      '202': 'Element cannot have children',
      '203': 'Element not an array',
      '301': 'Not initialized',
      '401': 'Not implemented error',
      '402': 'Invalid set value',
      '403': 'Element is read only',
      '404': 'Element is write only',
      '405': 'Incorrect data type',
    };
    return errors[errorCode] || 'Unknown error';
  }

  LMSGetDiagnostic(errorCode: string): string {
    return this.LMSGetErrorString(errorCode);
  }

  // Save attempt data to database
  private async saveAttemptData(): Promise<void> {
    const payload = await getPayload({ config });

    // Parse status
    const statusMap: Record<string, SCORMAttemptData['status']> = {
      'not attempted': 'not-attempted',
      incomplete: 'incomplete',
      completed: 'completed',
      passed: 'passed',
      failed: 'failed',
      browsed: 'browsed',
    };

    const lessonStatus = this.data['cmi.core.lesson_status'] || 'not attempted';
    const status = statusMap[lessonStatus] || 'not-attempted';

    // Calculate time
    const sessionTime = this.parseTimeInterval(this.data['cmi.core.session_time'] || '');
    const totalTime = this.parseTimeInterval(this.data['cmi.core.total_time'] || '');
    const newTotalTime = totalTime + sessionTime;

    // Parse score
    const scoreRaw = this.data['cmi.core.score.raw'];
    const scoreMin = this.data['cmi.core.score.min'];
    const scoreMax = this.data['cmi.core.score.max'];

    const score: SCORMScore = {};
    if (scoreRaw) score.raw = parseFloat(scoreRaw);
    if (scoreMin) score.min = parseFloat(scoreMin);
    if (scoreMax) score.max = parseFloat(scoreMax);
    if (score.raw !== undefined && score.max !== undefined && score.max > 0) {
      score.scaled = score.raw / score.max;
    }

    // Parse exit
    const exitMap: Record<string, SCORMAttemptData['exitReason']> = {
      'time-out': 'time-out',
      suspend: 'suspend',
      logout: 'logout',
      '': 'normal',
    };

    await payload.update({
      collection: 'scorm-attempts',
      id: this.attemptId,
      data: {
        status,
        score: Object.keys(score).length > 0 ? score : undefined,
        totalTimeSeconds: newTotalTime,
        totalTime: this.formatTimeInterval(newTotalTime),
        suspendData: this.data['cmi.suspend_data'] || undefined,
        location: this.data['cmi.core.lesson_location'] || undefined,
        cmiData: this.data,
        exitReason: exitMap[this.data['cmi.core.exit'] || ''] || 'normal',
        lastAccessedAt: new Date().toISOString(),
        completedAt:
          status === 'completed' || status === 'passed'
            ? new Date().toISOString()
            : undefined,
      },
    });
  }

  // Parse SCORM time interval to seconds
  private parseTimeInterval(timeString: string): number {
    if (!timeString) return 0;

    // Format: HHHH:MM:SS.SS
    const match = timeString.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (!match) return 0;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const fraction = match[4] ? parseFloat(`0.${match[4]}`) : 0;

    return hours * 3600 + minutes * 60 + seconds + fraction;
  }

  // Format seconds to SCORM time interval
  private formatTimeInterval(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(4, '0')}:${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
  }

  // Get all data for serialization
  getData(): Record<string, string> {
    return { ...this.data };
  }
}

// SCORM 2004 API Implementation
export class SCORM2004API {
  private data: Record<string, string> = {};
  private attemptId: string;
  private packageId: string;
  private userId: string;
  private initialized = false;
  private terminated = false;
  private lastError = '0';

  constructor(attemptId: string, packageId: string, userId: string) {
    this.attemptId = attemptId;
    this.packageId = packageId;
    this.userId = userId;
  }

  // Initialize the data model with default values
  initializeDataModel(): void {
    this.data = {
      'cmi.learner_id': this.userId,
      'cmi.learner_name': '',
      'cmi.location': '',
      'cmi.credit': 'credit',
      'cmi.completion_status': 'unknown',
      'cmi.success_status': 'unknown',
      'cmi.entry': 'ab-initio',
      'cmi.score.raw': '',
      'cmi.score.min': '',
      'cmi.score.max': '',
      'cmi.score.scaled': '',
      'cmi.total_time': 'PT0S',
      'cmi.mode': 'normal',
      'cmi.exit': '',
      'cmi.session_time': 'PT0S',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.progress_measure': '',
      'cmi.completion_threshold': '',
      'cmi.scaled_passing_score': '',
    };
  }

  // Load existing attempt data
  async loadAttemptData(): Promise<void> {
    const payload = await getPayload({ config });

    const attempt = await payload.findByID({
      collection: 'scorm-attempts',
      id: this.attemptId,
    });

    if (attempt) {
      // Restore CMI data if available
      if (attempt.cmiData && typeof attempt.cmiData === 'object') {
        Object.entries(attempt.cmiData).forEach(([key, value]) => {
          if (typeof value === 'string') {
            this.data[key] = value;
          }
        });
      }

      // Restore specific fields
      if (attempt.location) {
        this.data['cmi.location'] = attempt.location;
      }
      if (attempt.suspendData) {
        this.data['cmi.suspend_data'] = attempt.suspendData;
      }
      if (attempt.score?.scaled !== undefined) {
        this.data['cmi.score.scaled'] = String(attempt.score.scaled);
      }
      if (attempt.totalTime) {
        this.data['cmi.total_time'] = this.secondsToISO8601(attempt.totalTimeSeconds || 0);
      }
      if (attempt.progress !== undefined) {
        this.data['cmi.progress_measure'] = String(attempt.progress / 100);
      }

      // Set entry based on previous state
      if (attempt.status !== 'not-attempted') {
        this.data['cmi.entry'] = attempt.suspendData ? 'resume' : '';
      }

      // Map completion status
      const completionMap: Record<string, string> = {
        'not-attempted': 'unknown',
        incomplete: 'incomplete',
        completed: 'completed',
        passed: 'completed',
        failed: 'completed',
        browsed: 'incomplete',
      };
      this.data['cmi.completion_status'] = completionMap[attempt.status] || 'unknown';

      // Map success status
      if (attempt.successStatus) {
        this.data['cmi.success_status'] = attempt.successStatus;
      }
    }
  }

  // SCORM 2004 API Methods
  Initialize(_param: string): string {
    if (this.initialized) {
      this.lastError = '103'; // Already initialized
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '104'; // Content instance terminated
      return 'false';
    }

    this.initializeDataModel();
    this.initialized = true;
    this.lastError = '0';
    return 'true';
  }

  Terminate(_param: string): string {
    if (!this.initialized) {
      this.lastError = '112'; // Termination before initialization
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '113'; // Termination after termination
      return 'false';
    }

    // Save data
    this.saveAttemptData().catch(console.error);

    this.terminated = true;
    this.lastError = '0';
    return 'true';
  }

  GetValue(element: string): string {
    if (!this.initialized) {
      this.lastError = '122'; // Retrieve data before initialization
      return '';
    }
    if (this.terminated) {
      this.lastError = '123'; // Retrieve data after termination
      return '';
    }

    const value = this.data[element];
    if (value === undefined) {
      this.lastError = '301'; // Not initialized
      return '';
    }

    this.lastError = '0';
    return value;
  }

  SetValue(element: string, value: string): string {
    if (!this.initialized) {
      this.lastError = '132'; // Store data before initialization
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '133'; // Store data after termination
      return 'false';
    }

    // Check for read-only elements
    const readOnlyElements = [
      'cmi.learner_id',
      'cmi.learner_name',
      'cmi.credit',
      'cmi.entry',
      'cmi.total_time',
      'cmi.mode',
      'cmi.launch_data',
      'cmi.completion_threshold',
      'cmi.scaled_passing_score',
    ];

    if (readOnlyElements.includes(element)) {
      this.lastError = '404'; // Read-only element
      return 'false';
    }

    this.data[element] = value;
    this.lastError = '0';
    return 'true';
  }

  Commit(_param: string): string {
    if (!this.initialized) {
      this.lastError = '142'; // Commit before initialization
      return 'false';
    }
    if (this.terminated) {
      this.lastError = '143'; // Commit after termination
      return 'false';
    }

    // Save data
    this.saveAttemptData().catch(console.error);

    this.lastError = '0';
    return 'true';
  }

  GetLastError(): string {
    return this.lastError;
  }

  GetErrorString(errorCode: string): string {
    const errors: Record<string, string> = {
      '0': 'No error',
      '101': 'General exception',
      '102': 'General initialization failure',
      '103': 'Already initialized',
      '104': 'Content instance terminated',
      '111': 'General termination failure',
      '112': 'Termination before initialization',
      '113': 'Termination after termination',
      '122': 'Retrieve data before initialization',
      '123': 'Retrieve data after termination',
      '132': 'Store data before initialization',
      '133': 'Store data after termination',
      '142': 'Commit before initialization',
      '143': 'Commit after termination',
      '201': 'General argument error',
      '301': 'General get failure',
      '351': 'General set failure',
      '391': 'General commit failure',
      '401': 'Undefined data model element',
      '402': 'Unimplemented data model element',
      '403': 'Data model element value not initialized',
      '404': 'Data model element is read only',
      '405': 'Data model element is write only',
      '406': 'Data model element type mismatch',
      '407': 'Data model element value out of range',
      '408': 'Data model dependency not established',
    };
    return errors[errorCode] || 'Unknown error';
  }

  GetDiagnostic(errorCode: string): string {
    return this.GetErrorString(errorCode);
  }

  // Save attempt data to database
  private async saveAttemptData(): Promise<void> {
    const payload = await getPayload({ config });

    // Determine status
    const completionStatus = this.data['cmi.completion_status'] || 'unknown';
    const successStatus = this.data['cmi.success_status'] || 'unknown';

    let status: SCORMAttemptData['status'] = 'not-attempted';
    if (successStatus === 'passed') {
      status = 'passed';
    } else if (successStatus === 'failed') {
      status = 'failed';
    } else if (completionStatus === 'completed') {
      status = 'completed';
    } else if (completionStatus === 'incomplete') {
      status = 'incomplete';
    }

    // Calculate time
    const sessionTime = this.iso8601ToSeconds(this.data['cmi.session_time'] || 'PT0S');
    const totalTime = this.iso8601ToSeconds(this.data['cmi.total_time'] || 'PT0S');
    const newTotalTime = totalTime + sessionTime;

    // Parse score
    const score: SCORMScore = {};
    if (this.data['cmi.score.scaled']) {
      score.scaled = parseFloat(this.data['cmi.score.scaled']);
    }
    if (this.data['cmi.score.raw']) {
      score.raw = parseFloat(this.data['cmi.score.raw']);
    }
    if (this.data['cmi.score.min']) {
      score.min = parseFloat(this.data['cmi.score.min']);
    }
    if (this.data['cmi.score.max']) {
      score.max = parseFloat(this.data['cmi.score.max']);
    }

    // Parse progress
    const progressMeasure = this.data['cmi.progress_measure'];
    const progress = progressMeasure ? parseFloat(progressMeasure) * 100 : undefined;

    // Parse exit
    const exitMap: Record<string, SCORMAttemptData['exitReason']> = {
      'time-out': 'time-out',
      suspend: 'suspend',
      logout: 'logout',
      normal: 'normal',
      '': 'normal',
    };

    await payload.update({
      collection: 'scorm-attempts',
      id: this.attemptId,
      data: {
        status,
        successStatus: successStatus as 'unknown' | 'passed' | 'failed',
        score: Object.keys(score).length > 0 ? score : undefined,
        progress,
        totalTimeSeconds: newTotalTime,
        totalTime: this.secondsToISO8601(newTotalTime),
        suspendData: this.data['cmi.suspend_data'] || undefined,
        location: this.data['cmi.location'] || undefined,
        cmiData: this.data,
        exitReason: exitMap[this.data['cmi.exit'] || ''] || 'normal',
        lastAccessedAt: new Date().toISOString(),
        completedAt:
          status === 'completed' || status === 'passed'
            ? new Date().toISOString()
            : undefined,
      },
    });
  }

  // Parse ISO 8601 duration to seconds
  private iso8601ToSeconds(duration: string): number {
    if (!duration) return 0;

    const match = duration.match(
      /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
    );

    if (!match) return 0;

    const years = parseInt(match[1] || '0', 10);
    const months = parseInt(match[2] || '0', 10);
    const days = parseInt(match[3] || '0', 10);
    const hours = parseInt(match[4] || '0', 10);
    const minutes = parseInt(match[5] || '0', 10);
    const seconds = parseFloat(match[6] || '0');

    return (
      years * 365 * 24 * 3600 +
      months * 30 * 24 * 3600 +
      days * 24 * 3600 +
      hours * 3600 +
      minutes * 60 +
      seconds
    );
  }

  // Format seconds to ISO 8601 duration
  private secondsToISO8601(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0 || duration === 'PT') duration += `${seconds.toFixed(2)}S`;

    return duration;
  }

  // Get all data for serialization
  getData(): Record<string, string> {
    return { ...this.data };
  }
}

// Utility functions
export async function createAttempt(
  userId: string,
  packageId: string
): Promise<string> {
  const payload = await getPayload({ config });

  // Get current attempt count
  const existingAttempts = await payload.find({
    collection: 'scorm-attempts',
    where: {
      user: { equals: userId },
      package: { equals: packageId },
    },
  });

  const attemptNumber = existingAttempts.totalDocs + 1;

  // Create new attempt
  const attempt = await payload.create({
    collection: 'scorm-attempts',
    data: {
      user: userId,
      package: packageId,
      attemptNumber,
      status: 'not-attempted',
      startedAt: new Date().toISOString(),
    },
  });

  return String(attempt.id);
}

export async function getLatestAttempt(
  userId: string,
  packageId: string
): Promise<string | null> {
  const payload = await getPayload({ config });

  const attempts = await payload.find({
    collection: 'scorm-attempts',
    where: {
      user: { equals: userId },
      package: { equals: packageId },
    },
    sort: '-attemptNumber',
    limit: 1,
  });

  if (attempts.docs.length === 0) {
    return null;
  }

  // Check if the latest attempt can be resumed
  const latest = attempts.docs[0];
  if (latest.status === 'not-attempted' || latest.status === 'incomplete') {
    return String(latest.id);
  }

  return null;
}

export async function getPackageById(packageId: string) {
  const payload = await getPayload({ config });
  return payload.findByID({
    collection: 'scorm-packages',
    id: packageId,
  });
}

export async function getUserAttempts(userId: string, packageId?: string) {
  const payload = await getPayload({ config });

  const where: Where = packageId
    ? {
        and: [
          { user: { equals: userId } },
          { package: { equals: packageId } },
        ],
      }
    : { user: { equals: userId } };

  return payload.find({
    collection: 'scorm-attempts',
    where,
    sort: '-createdAt',
  });
}

export async function getAttemptById(attemptId: string) {
  const payload = await getPayload({ config });
  return payload.findByID({
    collection: 'scorm-attempts',
    id: attemptId,
  });
}
