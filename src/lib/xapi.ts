import { getPayload } from 'payload';
import config from '@/payload.config';

// xAPI types
export interface XAPIActor {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
  member?: XAPIActor[];
}

export interface XAPIVerb {
  id: string;
  display?: Record<string, string>;
}

export interface XAPIActivity {
  objectType?: 'Activity';
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
    moreInfo?: string;
    extensions?: Record<string, unknown>;
    interactionType?: string;
    correctResponsesPattern?: string[];
    choices?: Array<{ id: string; description: Record<string, string> }>;
    scale?: Array<{ id: string; description: Record<string, string> }>;
    source?: Array<{ id: string; description: Record<string, string> }>;
    target?: Array<{ id: string; description: Record<string, string> }>;
    steps?: Array<{ id: string; description: Record<string, string> }>;
  };
}

export interface XAPIResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
  extensions?: Record<string, unknown>;
}

export interface XAPIContext {
  registration?: string;
  instructor?: XAPIActor;
  team?: XAPIActor;
  contextActivities?: {
    parent?: XAPIActivity[];
    grouping?: XAPIActivity[];
    category?: XAPIActivity[];
    other?: XAPIActivity[];
  };
  revision?: string;
  platform?: string;
  language?: string;
  statement?: { id: string; objectType: 'StatementRef' };
  extensions?: Record<string, unknown>;
}

export interface XAPIStatement {
  id?: string;
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIActivity | XAPIActor | { objectType: 'StatementRef'; id: string };
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp?: string;
  stored?: string;
  authority?: XAPIActor;
  version?: string;
  attachments?: Array<{
    usageType: string;
    display: Record<string, string>;
    contentType: string;
    length: number;
    sha2: string;
    fileUrl?: string;
  }>;
}

// Common xAPI verbs
export const XAPI_VERBS = {
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  LAUNCHED: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  ATTEMPTED: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  ANSWERED: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  PROGRESSED: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  SUSPENDED: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  RESUMED: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  VOIDED: {
    id: 'http://adlnet.gov/expapi/verbs/voided',
    display: { 'en-US': 'voided' },
  },
  INTERACTED: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  COMMENTED: {
    id: 'http://adlnet.gov/expapi/verbs/commented',
    display: { 'en-US': 'commented' },
  },
  LIKED: {
    id: 'https://w3id.org/xapi/acrossx/verbs/liked',
    display: { 'en-US': 'liked' },
  },
  DISLIKED: {
    id: 'https://w3id.org/xapi/acrossx/verbs/disliked',
    display: { 'en-US': 'disliked' },
  },
  SEARCHED: {
    id: 'https://w3id.org/xapi/acrossx/verbs/searched',
    display: { 'en-US': 'searched' },
  },
  WATCHED: {
    id: 'https://w3id.org/xapi/video/verbs/watched',
    display: { 'en-US': 'watched' },
  },
  PLAYED: {
    id: 'https://w3id.org/xapi/video/verbs/played',
    display: { 'en-US': 'played' },
  },
  PAUSED: {
    id: 'https://w3id.org/xapi/video/verbs/paused',
    display: { 'en-US': 'paused' },
  },
  SEEKED: {
    id: 'https://w3id.org/xapi/video/verbs/seeked',
    display: { 'en-US': 'seeked' },
  },
} as const;

// xAPI activity types
export const XAPI_ACTIVITY_TYPES = {
  COURSE: 'http://adlnet.gov/expapi/activities/course',
  MODULE: 'http://adlnet.gov/expapi/activities/module',
  LESSON: 'http://adlnet.gov/expapi/activities/lesson',
  ASSESSMENT: 'http://adlnet.gov/expapi/activities/assessment',
  QUESTION: 'http://adlnet.gov/expapi/activities/question',
  INTERACTION: 'http://adlnet.gov/expapi/activities/interaction',
  MEDIA: 'http://adlnet.gov/expapi/activities/media',
  VIDEO: 'https://w3id.org/xapi/video/activity-type/video',
  AUDIO: 'https://w3id.org/xapi/audio/activity-type/audio',
} as const;

// xAPI Client class
export class XAPIClient {
  private endpoint: string;
  private authHeader: string;
  private tenantId: string;

  constructor(endpoint: string, authHeader: string, tenantId: string) {
    this.endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
    this.authHeader = authHeader;
    this.tenantId = tenantId;
  }

  // Send a single statement
  async sendStatement(statement: XAPIStatement): Promise<string[]> {
    const response = await fetch(`${this.endpoint}/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'X-Experience-API-Version': '1.0.3',
      },
      body: JSON.stringify(statement),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAPI send failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result as string[];
  }

  // Send multiple statements
  async sendStatements(statements: XAPIStatement[]): Promise<string[]> {
    if (statements.length === 0) return [];

    const response = await fetch(`${this.endpoint}/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'X-Experience-API-Version': '1.0.3',
      },
      body: JSON.stringify(statements),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAPI batch send failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result as string[];
  }

  // Get statements
  async getStatements(params: {
    agent?: XAPIActor;
    verb?: string;
    activity?: string;
    registration?: string;
    since?: string;
    until?: string;
    limit?: number;
  }): Promise<{ statements: XAPIStatement[]; more?: string }> {
    const query = new URLSearchParams();

    if (params.agent) {
      query.set('agent', JSON.stringify(params.agent));
    }
    if (params.verb) {
      query.set('verb', params.verb);
    }
    if (params.activity) {
      query.set('activity', params.activity);
    }
    if (params.registration) {
      query.set('registration', params.registration);
    }
    if (params.since) {
      query.set('since', params.since);
    }
    if (params.until) {
      query.set('until', params.until);
    }
    if (params.limit) {
      query.set('limit', String(params.limit));
    }

    const response = await fetch(`${this.endpoint}/statements?${query}`, {
      headers: {
        Authorization: this.authHeader,
        'X-Experience-API-Version': '1.0.3',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAPI get failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Void a statement
  async voidStatement(statementId: string, actor: XAPIActor): Promise<string[]> {
    const voidStatement: XAPIStatement = {
      actor,
      verb: XAPI_VERBS.VOIDED,
      object: {
        objectType: 'StatementRef',
        id: statementId,
      },
    };

    return this.sendStatement(voidStatement);
  }
}

// Helper to get xAPI config for a tenant
export async function getXAPIConfig(tenantId: string) {
  const payload = await getPayload({ config });

  const configs = await payload.find({
    collection: 'xapi-config',
    where: {
      tenant: { equals: tenantId },
      status: { equals: 'active' },
      'settings.enabled': { equals: true },
    },
    limit: 1,
  });

  if (configs.docs.length === 0) {
    return null;
  }

  return configs.docs[0];
}

// Helper to create an xAPI client from config
export async function createXAPIClient(tenantId: string): Promise<XAPIClient | null> {
  const xapiConfig = await getXAPIConfig(tenantId);
  if (!xapiConfig) return null;

  let authHeader = '';

  switch (xapiConfig.authType) {
    case 'basic':
      const username = xapiConfig.credentials?.username || '';
      const password = xapiConfig.credentials?.password || '';
      authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
      break;
    case 'api-key':
      authHeader = `Bearer ${xapiConfig.credentials?.apiKey || ''}`;
      break;
    case 'oauth2':
      // OAuth2 would require token management
      // For simplicity, we'll skip full implementation
      authHeader = `Bearer ${xapiConfig.credentials?.clientSecret || ''}`;
      break;
  }

  return new XAPIClient(xapiConfig.endpoint, authHeader, tenantId);
}

// Helper to build an actor from user data
export async function buildActor(
  userId: string,
  tenantId: string
): Promise<XAPIActor> {
  const payload = await getPayload({ config });
  const xapiConfig = await getXAPIConfig(tenantId);

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  });

  if (!user) {
    throw new Error('User not found');
  }

  const actorFormat = xapiConfig?.actorFormat?.type || 'mbox';

  switch (actorFormat) {
    case 'mbox':
      return {
        objectType: 'Agent',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        mbox: `mailto:${user.email}`,
      };
    case 'account':
      const homePage = xapiConfig?.actorFormat?.accountHomePage || '';
      return {
        objectType: 'Agent',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        account: {
          homePage,
          name: String(user.id),
        },
      };
    case 'openid':
      return {
        objectType: 'Agent',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        openid: `https://learninghall.app/users/${user.id}`,
      };
    default:
      return {
        objectType: 'Agent',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        mbox: `mailto:${user.email}`,
      };
  }
}

// Helper to build an activity from course/lesson data
export function buildCourseActivity(
  courseId: string,
  courseName: string,
  baseUrl: string
): XAPIActivity {
  return {
    objectType: 'Activity',
    id: `${baseUrl}/courses/${courseId}`,
    definition: {
      name: { 'en-US': courseName },
      type: XAPI_ACTIVITY_TYPES.COURSE,
    },
  };
}

export function buildLessonActivity(
  lessonId: string,
  lessonName: string,
  baseUrl: string
): XAPIActivity {
  return {
    objectType: 'Activity',
    id: `${baseUrl}/lessons/${lessonId}`,
    definition: {
      name: { 'en-US': lessonName },
      type: XAPI_ACTIVITY_TYPES.LESSON,
    },
  };
}

export function buildQuizActivity(
  quizId: string,
  quizName: string,
  baseUrl: string
): XAPIActivity {
  return {
    objectType: 'Activity',
    id: `${baseUrl}/quizzes/${quizId}`,
    definition: {
      name: { 'en-US': quizName },
      type: XAPI_ACTIVITY_TYPES.ASSESSMENT,
    },
  };
}

// Statement generators
export function generateLaunchedStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.LAUNCHED,
    object: activity,
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generateCompletedStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  result?: XAPIResult,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.COMPLETED,
    object: activity,
    result: {
      ...result,
      completion: true,
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generatePassedStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  result: XAPIResult,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.PASSED,
    object: activity,
    result: {
      ...result,
      success: true,
      completion: true,
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generateFailedStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  result: XAPIResult,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.FAILED,
    object: activity,
    result: {
      ...result,
      success: false,
      completion: true,
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generateProgressedStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  progress: number,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.PROGRESSED,
    object: activity,
    result: {
      extensions: {
        'https://w3id.org/xapi/cmi5/result/extensions/progress': progress / 100,
      },
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generateAnsweredStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  response: string,
  correct: boolean,
  score?: number,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb: XAPI_VERBS.ANSWERED,
    object: activity,
    result: {
      response,
      success: correct,
      score: score !== undefined ? { scaled: score / 100 } : undefined,
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

export function generateVideoStatement(
  actor: XAPIActor,
  activity: XAPIActivity,
  verb: typeof XAPI_VERBS.PLAYED | typeof XAPI_VERBS.PAUSED | typeof XAPI_VERBS.SEEKED,
  currentTime: number,
  duration?: number,
  context?: XAPIContext
): XAPIStatement {
  return {
    actor,
    verb,
    object: activity,
    result: {
      extensions: {
        'https://w3id.org/xapi/video/extensions/time': currentTime,
        ...(duration && { 'https://w3id.org/xapi/video/extensions/length': duration }),
      },
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

// Queue management for batching statements
interface StatementQueueItem {
  statement: XAPIStatement;
  tenantId: string;
  createdAt: Date;
}

const statementQueue: StatementQueueItem[] = [];
let processingQueue = false;

export function queueStatement(statement: XAPIStatement, tenantId: string): void {
  statementQueue.push({
    statement,
    tenantId,
    createdAt: new Date(),
  });

  // Start processing if not already running
  if (!processingQueue) {
    processQueue().catch(console.error);
  }
}

async function processQueue(): Promise<void> {
  if (processingQueue || statementQueue.length === 0) return;

  processingQueue = true;

  try {
    // Group statements by tenant
    const byTenant = new Map<string, XAPIStatement[]>();

    while (statementQueue.length > 0) {
      const item = statementQueue.shift()!;
      const existing = byTenant.get(item.tenantId) || [];
      existing.push(item.statement);
      byTenant.set(item.tenantId, existing);
    }

    // Send statements for each tenant
    for (const [tenantId, statements] of byTenant.entries()) {
      try {
        const client = await createXAPIClient(tenantId);
        if (client) {
          await client.sendStatements(statements);

          // Update stats
          const payload = await getPayload({ config });
          const configs = await payload.find({
            collection: 'xapi-config',
            where: {
              tenant: { equals: tenantId },
              status: { equals: 'active' },
            },
            limit: 1,
          });

          if (configs.docs.length > 0) {
            const xapiConfig = configs.docs[0];
            await payload.update({
              collection: 'xapi-config',
              id: String(xapiConfig.id),
              data: {
                lastSyncAt: new Date().toISOString(),
                stats: {
                  statementsSent:
                    (xapiConfig.stats?.statementsSent || 0) + statements.length,
                  statementsQueued: 0,
                  statementsFailed: xapiConfig.stats?.statementsFailed || 0,
                },
              },
            });
          }
        }
      } catch (error) {
        console.error(`Failed to send xAPI statements for tenant ${tenantId}:`, error);

        // Re-queue failed statements
        statements.forEach((stmt) => {
          statementQueue.push({
            statement: stmt,
            tenantId,
            createdAt: new Date(),
          });
        });
      }
    }
  } finally {
    processingQueue = false;

    // Continue processing if more items were added
    if (statementQueue.length > 0) {
      setTimeout(() => processQueue().catch(console.error), 5000);
    }
  }
}

// Duration formatting helpers
export function secondsToISO8601Duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs.toFixed(2)}S`;

  return duration;
}

export function iso8601DurationToSeconds(duration: string): number {
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
