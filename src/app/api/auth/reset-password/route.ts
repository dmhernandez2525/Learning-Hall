import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import crypto from 'crypto';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { token, email, password } = result.data;
    const payload = await getPayloadClient();

    // Hash the token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by email and token
    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          { email: { equals: email.toLowerCase() } },
          { resetPasswordToken: { equals: tokenHash } },
        ],
      },
      limit: 1,
    });

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users.docs[0] as Record<string, unknown>;

    // Check if token is expired
    const expiryString = user.resetPasswordExpiry as string | undefined;
    if (!expiryString || new Date(expiryString) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    await payload.update({
      collection: 'users',
      id: String(user.id),
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
