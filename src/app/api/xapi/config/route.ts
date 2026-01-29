import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { z } from 'zod';

const configSchema = z.object({
  name: z.string().min(1),
  endpoint: z.string().url(),
  authType: z.enum(['basic', 'oauth2', 'api-key']),
  credentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    tokenUrl: z.string().optional(),
    apiKey: z.string().optional(),
  }),
  actorFormat: z
    .object({
      type: z.enum(['mbox', 'account', 'openid']).optional(),
      accountHomePage: z.string().optional(),
    })
    .optional(),
  settings: z
    .object({
      enabled: z.boolean().optional(),
      batchSize: z.number().min(1).max(1000).optional(),
      sendInterval: z.number().min(1).optional(),
      retryAttempts: z.number().min(0).max(10).optional(),
      includeContext: z.boolean().optional(),
      trackVoided: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can view xAPI config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });
    const tenantId = user.tenant as string;

    const configs = await payload.find({
      collection: 'xapi-config',
      where: tenantId ? { tenant: { equals: tenantId } } : {},
    });

    return NextResponse.json({
      configs: configs.docs.map((cfg) => ({
        id: cfg.id,
        name: cfg.name,
        endpoint: cfg.endpoint,
        authType: cfg.authType,
        actorFormat: cfg.actorFormat,
        settings: cfg.settings,
        status: cfg.status,
        lastSyncAt: cfg.lastSyncAt,
        stats: cfg.stats,
        createdAt: cfg.createdAt,
        // Don't expose credentials
      })),
    });
  } catch (error) {
    console.error('Get xAPI config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can create xAPI config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = configSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, endpoint, authType, credentials, actorFormat, settings } =
      parsed.data;

    const tenantId = user.tenant as string;
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not configured' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Validate credentials based on auth type
    if (authType === 'basic' && (!credentials.username || !credentials.password)) {
      return NextResponse.json(
        { error: 'Username and password required for basic auth' },
        { status: 400 }
      );
    }
    if (authType === 'api-key' && !credentials.apiKey) {
      return NextResponse.json(
        { error: 'API key required for API key auth' },
        { status: 400 }
      );
    }
    if (
      authType === 'oauth2' &&
      (!credentials.clientId || !credentials.clientSecret)
    ) {
      return NextResponse.json(
        { error: 'Client ID and secret required for OAuth2' },
        { status: 400 }
      );
    }

    const xapiConfig = await payload.create({
      collection: 'xapi-config',
      data: {
        name,
        tenant: tenantId,
        endpoint,
        authType,
        credentials,
        actorFormat: actorFormat || { type: 'mbox' },
        settings: settings || {
          enabled: true,
          batchSize: 50,
          sendInterval: 30,
          retryAttempts: 3,
          includeContext: true,
          trackVoided: false,
        },
        status: 'active',
        stats: {
          statementsSent: 0,
          statementsQueued: 0,
          statementsFailed: 0,
        },
      },
    });

    return NextResponse.json({
      config: {
        id: xapiConfig.id,
        name: xapiConfig.name,
        endpoint: xapiConfig.endpoint,
        status: xapiConfig.status,
      },
    });
  } catch (error) {
    console.error('Create xAPI config error:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration' },
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

    // Only admins can update xAPI config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Verify config exists and belongs to user's tenant
    const existingConfig = await payload.findByID({
      collection: 'xapi-config',
      id,
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (existingConfig.tenant !== user.tenant) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const updatedConfig = await payload.update({
      collection: 'xapi-config',
      id,
      data: updates,
    });

    return NextResponse.json({
      config: {
        id: updatedConfig.id,
        name: updatedConfig.name,
        status: updatedConfig.status,
      },
    });
  } catch (error) {
    console.error('Update xAPI config error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete xAPI config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Verify config exists and belongs to user's tenant
    const existingConfig = await payload.findByID({
      collection: 'xapi-config',
      id,
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (existingConfig.tenant !== user.tenant) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await payload.delete({
      collection: 'xapi-config',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete xAPI config error:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
