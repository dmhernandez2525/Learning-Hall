import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Get Payload CMS client instance
 * This should be used in server-side code only
 */
export async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Type-safe wrapper for Payload queries
 */
export type { Payload } from 'payload';
