import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { getTemplates, createTemplateFromContent, builtInTemplates } from '@/lib/content-authoring/templates';

// GET /api/content/templates - List templates
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const includeBuiltIn = searchParams.get('includeBuiltIn') !== 'false';

    const tenantId = user.tenant as string;

    // Get custom templates
    const customTemplates = await getTemplates({
      type,
      category,
      search,
      tenantId,
      userId: user.id,
    });

    // Get public templates
    const publicTemplates = await getTemplates({
      type,
      category,
      search,
      isPublic: true,
    });

    // Combine and dedupe
    const templateMap = new Map<string, typeof customTemplates[0]>();

    for (const t of customTemplates) {
      templateMap.set(t.id, t);
    }

    for (const t of publicTemplates) {
      if (!templateMap.has(t.id)) {
        templateMap.set(t.id, t);
      }
    }

    const templates = Array.from(templateMap.values());

    // Add built-in templates
    let allTemplates = templates;
    if (includeBuiltIn) {
      const builtIn = Object.entries(builtInTemplates).map(([key, value]) => ({
        id: `builtin-${key}`,
        name: value.name,
        type: value.type,
        category: value.category,
        content: value.content,
        isBuiltIn: true,
        isPublic: true,
        usageCount: 0,
        tags: [],
      }));

      allTemplates = [...builtIn, ...templates];
    }

    return NextResponse.json({ templates: allTemplates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/content/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, content, type, category, description, isPublic, tags } = body;

    if (!name || !content || !type) {
      return NextResponse.json(
        { error: 'name, content, and type are required' },
        { status: 400 }
      );
    }

    const tenantId = user.tenant as string;

    const templateId = await createTemplateFromContent(name, content, {
      description,
      type,
      category,
      isPublic: isPublic && user.role === 'admin', // Only admins can create public templates
      userId: user.id,
      tenantId,
      tags,
    });

    return NextResponse.json({ templateId }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
