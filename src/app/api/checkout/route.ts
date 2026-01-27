import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getPayloadClient } from '@/lib/payload';
import { z } from 'zod';

const checkoutSchema = z.object({
  courseId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId } = result.data;
    const payload = await getPayloadClient();

    // Get course details
    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.status !== 'published') {
      return NextResponse.json({ error: 'Course is not available for purchase' }, { status: 400 });
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json({ error: 'Course price is not set' }, { status: 400 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { user: { equals: user.id } },
          { course: { equals: courseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
    });

    if (existingEnrollment.docs.length > 0) {
      return NextResponse.json({ error: 'You are already enrolled in this course' }, { status: 400 });
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user.email, user.id);

    // Get the app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      courseId,
      priceInCents: Math.round(course.price * 100),
      courseTitle: course.title,
      successUrl: `${appUrl}/dashboard/courses/${courseId}?success=true`,
      cancelUrl: `${appUrl}/courses/${courseId}?canceled=true`,
      customerEmail: user.email,
      metadata: {
        customerId,
      },
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
