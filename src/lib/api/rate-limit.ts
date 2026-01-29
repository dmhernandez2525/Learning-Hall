// Rate Limiting
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
}

interface RateLimitState {
  minuteCount: number;
  minuteResetAt: number;
  dayCount: number;
  dayResetAt: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitState>();

// Check rate limit
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const state = rateLimitStore.get(identifier) || {
    minuteCount: 0,
    minuteResetAt: now + 60000,
    dayCount: 0,
    dayResetAt: now + 86400000,
  };

  // Reset minute counter if needed
  if (now >= state.minuteResetAt) {
    state.minuteCount = 0;
    state.minuteResetAt = now + 60000;
  }

  // Reset day counter if needed
  if (now >= state.dayResetAt) {
    state.dayCount = 0;
    state.dayResetAt = now + 86400000;
  }

  // Check limits
  if (state.minuteCount >= config.requestsPerMinute) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((state.minuteResetAt - now) / 1000),
    };
  }

  if (state.dayCount >= config.requestsPerDay) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((state.dayResetAt - now) / 1000),
    };
  }

  // Increment counters
  state.minuteCount++;
  state.dayCount++;
  rateLimitStore.set(identifier, state);

  return {
    allowed: true,
    remaining: Math.min(
      config.requestsPerMinute - state.minuteCount,
      config.requestsPerDay - state.dayCount
    ),
    reset: Math.ceil((state.minuteResetAt - now) / 1000),
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimit: { remaining: number; reset: number; limit: number }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.reset));
  return response;
}

// Rate limit middleware response
export function rateLimitExceeded(reset: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: reset,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(reset),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
      },
    }
  );
}

// Sliding window rate limiter (more accurate)
interface SlidingWindowState {
  timestamps: number[];
}

const slidingWindowStore = new Map<string, SlidingWindowState>();

export function checkSlidingWindowRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const state = slidingWindowStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside the window
  state.timestamps = state.timestamps.filter((ts) => now - ts < windowMs);

  // Check limit
  if (state.timestamps.length >= maxRequests) {
    const oldestTimestamp = Math.min(...state.timestamps);
    const reset = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      reset,
    };
  }

  // Add current timestamp
  state.timestamps.push(now);
  slidingWindowStore.set(identifier, state);

  return {
    allowed: true,
    remaining: maxRequests - state.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

// Clean up expired entries (call periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  // Clean token bucket store
  for (const [key, state] of rateLimitStore.entries()) {
    if (now >= state.dayResetAt) {
      rateLimitStore.delete(key);
    }
  }

  // Clean sliding window store
  for (const [key, state] of slidingWindowStore.entries()) {
    if (state.timestamps.length === 0) {
      slidingWindowStore.delete(key);
    }
  }
}

// Set up periodic cleanup (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 300000);
}
