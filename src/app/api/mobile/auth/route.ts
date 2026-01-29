import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { z } from 'zod';
import crypto from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  platform: z.enum(['ios', 'android']).optional(),
  pushToken: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// Generate a secure token
function generateToken(length = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

// Token expiry times
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();

    // Check if this is a login or refresh request
    const action = request.headers.get('X-Auth-Action') || 'login';

    if (action === 'refresh') {
      // Refresh token flow
      const parsed = refreshSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid refresh token' },
          { status: 400 }
        );
      }

      // In a real implementation, you'd validate the refresh token
      // against a stored token in the database
      // For now, we'll return an error as this is a placeholder
      return NextResponse.json(
        { error: 'Refresh token implementation requires token storage' },
        { status: 501 }
      );
    }

    // Login flow
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid credentials format', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, deviceId, deviceName, platform, pushToken } = parsed.data;

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    });

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users.docs[0];

    // Verify password using Payload's authentication
    try {
      await payload.login({
        collection: 'users',
        data: { email, password },
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateToken(64);
    const refreshToken = generateToken(128);
    const now = Date.now();

    // Store device info and tokens (in production, store in database)
    const deviceInfo = {
      deviceId: deviceId || generateToken(16),
      deviceName: deviceName || 'Unknown Device',
      platform: platform || 'unknown',
      pushToken,
      lastLogin: new Date().toISOString(),
    };

    // Return mobile-optimized response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        tenant: user.tenant,
      },
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpiry: now + ACCESS_TOKEN_EXPIRY,
        refreshTokenExpiry: now + REFRESH_TOKEN_EXPIRY,
      },
      device: deviceInfo,
    });
  } catch (error) {
    console.error('Mobile auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // In production, invalidate the token in the database
    // For now, just return success
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Mobile logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
