import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'instructor'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });

    // Get user's tenant
    const tenantId = user.tenant;
    if (!tenantId) {
      return NextResponse.json(
        { error: 'No tenant associated with user' },
        { status: 404 }
      );
    }

    const tenant = await payload.findByID({
      collection: 'tenants',
      id: typeof tenantId === 'string' ? tenantId : tenantId.id,
      depth: 2,
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Tenant settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load tenant settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const tenantId = user.tenant;
    if (!tenantId) {
      return NextResponse.json(
        { error: 'No tenant associated with user' },
        { status: 404 }
      );
    }

    const payload = await getPayload({ config });
    const updates = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'branding',
      'seo',
      'emails',
      'footer',
      'features',
      'localization',
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updated = await payload.update({
      collection: 'tenants',
      id: typeof tenantId === 'string' ? tenantId : tenantId.id,
      data: filteredUpdates,
    });

    return NextResponse.json({ tenant: updated });
  } catch (error) {
    console.error('Tenant settings PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tenant settings' },
      { status: 500 }
    );
  }
}
