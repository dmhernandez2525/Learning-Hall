import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateClick } from '@/lib/affiliates';
import { z } from 'zod';

const trackSchema = z.object({
  affiliateCode: z.string().min(1),
  customLink: z.string().optional(),
  landingPage: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  referrer: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = trackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get IP and user agent from request
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const tracking = await trackAffiliateClick({
      ...result.data,
      ipAddress,
      userAgent,
    });

    if (!tracking) {
      return NextResponse.json(
        { error: 'Invalid affiliate code' },
        { status: 404 }
      );
    }

    // Return data for setting cookie on client
    return NextResponse.json({
      success: true,
      referralId: tracking.referralId,
      affiliateCode: tracking.affiliateCode,
      cookieExpiresAt: tracking.cookieExpiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Affiliate tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track affiliate click' },
      { status: 500 }
    );
  }
}
