import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import crypto from 'crypto';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const payload = await getPayloadClient();

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase() } },
      limit: 1,
    });

    // Always return success to prevent email enumeration
    if (users.docs.length === 0) {
      // Log for debugging but don't reveal to user
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ success: true });
    }

    const user = users.docs[0];

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Store hashed token in user record
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: resetTokenExpiry.toISOString(),
      },
    });

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // In production, send email here
    // For now, log the reset URL for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset URL:', resetUrl);
    }

    // TODO: Send email using Resend or other email provider
    // await sendPasswordResetEmail({ to: email, resetUrl });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
