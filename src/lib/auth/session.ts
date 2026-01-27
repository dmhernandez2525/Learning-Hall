import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getUserById, type User } from './config';

const SESSION_COOKIE_NAME = 'learning-hall-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface SessionData {
  userId: string;
  expiresAt: number;
}

/**
 * Get the session signing key from environment
 * Falls back to PAYLOAD_SECRET if SESSION_SECRET is not set
 */
function getSigningKey(): string {
  const key = process.env.SESSION_SECRET || process.env.PAYLOAD_SECRET;
  if (!key) {
    throw new Error('SESSION_SECRET or PAYLOAD_SECRET environment variable must be set');
  }
  return key;
}

/**
 * Create HMAC signature for session data
 */
function createSignature(data: string): string {
  const key = getSigningKey();
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = createSignature(data);
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Encode and sign session data
 * Format: base64(data).signature
 */
function encodeSession(data: SessionData): string {
  const jsonData = JSON.stringify(data);
  const encodedData = Buffer.from(jsonData).toString('base64');
  const signature = createSignature(encodedData);
  return `${encodedData}.${signature}`;
}

/**
 * Decode and verify session data
 * Returns null if signature is invalid or data is corrupted
 */
function decodeSession(token: string): SessionData | null {
  try {
    const [encodedData, signature] = token.split('.');

    if (!encodedData || !signature) {
      return null;
    }

    // Verify signature before decoding
    if (!verifySignature(encodedData, signature)) {
      console.warn('Invalid session signature detected');
      return null;
    }

    const jsonData = Buffer.from(encodedData, 'base64').toString('utf-8');
    return JSON.parse(jsonData) as SessionData;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  const sessionData: SessionData = {
    userId,
    expiresAt,
  };

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  const sessionData = decodeSession(sessionCookie.value);

  if (!sessionData) {
    // Invalid or tampered session - destroy it
    await destroySession();
    return null;
  }

  if (Date.now() > sessionData.expiresAt) {
    await destroySession();
    return null;
  }

  const user = await getUserById(sessionData.userId);
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireRole(allowedRoles: User['role'][]): Promise<User> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
