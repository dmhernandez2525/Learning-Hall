import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { isValidLocale, Locale } from '@/lib/i18n/config';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    const body = await request.json();
    const { locale } = body;

    if (!locale || !isValidLocale(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    // If user is authenticated, save preference to database
    if (user) {
      const payload = await getPayload({ config });

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          preferredLocale: locale,
        },
      });
    }

    // Set cookie for unauthenticated users or as backup
    const response = NextResponse.json({ success: true, locale });
    response.cookies.set('locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Save locale error:', error);
    return NextResponse.json(
      { error: 'Failed to save locale' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    let locale: Locale = 'en';

    // Check user preference from database
    if (user) {
      const payload = await getPayload({ config });
      const userData = await payload.findByID({
        collection: 'users',
        id: user.id,
      });

      if (userData.preferredLocale && isValidLocale(userData.preferredLocale)) {
        locale = userData.preferredLocale;
      }
    }

    // Check cookie as fallback
    const cookieLocale = request.cookies.get('locale')?.value;
    if (!user && cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale;
    }

    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Get locale error:', error);
    return NextResponse.json(
      { error: 'Failed to get locale' },
      { status: 500 }
    );
  }
}
