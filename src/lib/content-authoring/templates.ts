// Content Templates
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

export interface TemplateContent {
  sections?: Array<{
    title: string;
    type: string;
    content?: string;
    duration?: number;
  }>;
  settings?: {
    estimatedDuration?: number;
    difficulty?: string;
    includeQuiz?: boolean;
    includeAssignment?: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  thumbnail?: string;
  content: TemplateContent;
  settings?: {
    estimatedDuration?: number;
    difficulty?: string;
    includeQuiz?: boolean;
    includeAssignment?: boolean;
  };
  usageCount: number;
  isPublic: boolean;
  tags: string[];
}

// Get available templates
export async function getTemplates(options: {
  type?: string;
  category?: string;
  isPublic?: boolean;
  tenantId?: string;
  userId?: string;
  search?: string;
  limit?: number;
}): Promise<Template[]> {
  const payload = await getPayload({ config });

  const where: Where = {};

  if (options.type) {
    where.type = { equals: options.type };
  }

  if (options.category) {
    where.category = { equals: options.category };
  }

  if (options.isPublic !== undefined) {
    where.isPublic = { equals: options.isPublic };
  }

  // If not showing public templates, filter by tenant/user
  if (!options.isPublic) {
    if (options.tenantId) {
      where.tenant = { equals: options.tenantId };
    }
    if (options.userId) {
      where.createdBy = { equals: options.userId };
    }
  }

  if (options.search) {
    where.or = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
  }

  const templates = await payload.find({
    collection: 'content-templates',
    where,
    limit: options.limit || 20,
    sort: '-usageCount',
  });

  return templates.docs.map((t) => ({
    id: String(t.id),
    name: t.name,
    description: t.description || undefined,
    type: t.type,
    category: t.category || undefined,
    thumbnail: typeof t.thumbnail === 'object' ? t.thumbnail.url : undefined,
    content: t.content as TemplateContent,
    settings: t.settings,
    usageCount: t.usageCount || 0,
    isPublic: t.isPublic || false,
    tags: t.tags?.map((tag: { tag?: string }) => tag.tag).filter(Boolean) as string[] || [],
  }));
}

// Get template by ID
export async function getTemplate(templateId: string): Promise<Template | null> {
  const payload = await getPayload({ config });

  try {
    const template = await payload.findByID({
      collection: 'content-templates',
      id: templateId,
    });

    if (!template) {
      return null;
    }

    return {
      id: String(template.id),
      name: template.name,
      description: template.description || undefined,
      type: template.type,
      category: template.category || undefined,
      thumbnail: typeof template.thumbnail === 'object' ? template.thumbnail.url : undefined,
      content: template.content as TemplateContent,
      settings: template.settings,
      usageCount: template.usageCount || 0,
      isPublic: template.isPublic || false,
      tags: template.tags?.map((tag: { tag?: string }) => tag.tag).filter(Boolean) as string[] || [],
    };
  } catch {
    return null;
  }
}

// Create template from existing content
export async function createTemplateFromContent(
  name: string,
  content: TemplateContent,
  options: {
    description?: string;
    type: 'lesson' | 'section' | 'course' | 'quiz' | 'assignment';
    category?: string;
    isPublic?: boolean;
    userId: string;
    tenantId?: string;
    tags?: string[];
  }
): Promise<string> {
  const payload = await getPayload({ config });

  const template = await payload.create({
    collection: 'content-templates',
    data: {
      name,
      description: options.description,
      type: options.type,
      category: options.category,
      content,
      isPublic: options.isPublic || false,
      createdBy: options.userId,
      tenant: options.tenantId,
      tags: options.tags?.map((tag) => ({ tag })),
      usageCount: 0,
    },
  });

  return String(template.id);
}

// Apply template to create new content
export async function applyTemplate(
  templateId: string,
  options: {
    title: string;
    userId: string;
    tenantId?: string;
  }
): Promise<{ contentId: string; type: string }> {
  const payload = await getPayload({ config });

  const template = await getTemplate(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  // Increment usage count
  await payload.update({
    collection: 'content-templates',
    id: templateId,
    data: {
      usageCount: (template.usageCount || 0) + 1,
    },
  });

  // Create content based on template type
  let contentId: string;

  if (template.type === 'lesson') {
    const lesson = await payload.create({
      collection: 'lessons',
      data: {
        title: options.title,
        content: template.content,
        duration: template.settings?.estimatedDuration,
        status: 'draft',
        tenant: options.tenantId,
      },
    });
    contentId = String(lesson.id);
  } else if (template.type === 'course') {
    const course = await payload.create({
      collection: 'courses',
      data: {
        title: options.title,
        description: template.content.metadata?.description as string || '',
        sections: template.content.sections || [],
        level: template.settings?.difficulty || 'beginner',
        status: 'draft',
        instructor: options.userId,
        tenant: options.tenantId,
      },
    });
    contentId = String(course.id);
  } else {
    throw new Error(`Unsupported template type: ${template.type}`);
  }

  return { contentId, type: template.type };
}

// Built-in template structures
export const builtInTemplates = {
  videoLesson: {
    name: 'Video Lesson',
    type: 'lesson',
    category: 'video',
    content: {
      sections: [
        { title: 'Introduction', type: 'video', duration: 5 },
        { title: 'Main Content', type: 'video', duration: 15 },
        { title: 'Summary', type: 'text', content: '' },
        { title: 'Quiz', type: 'quiz' },
      ],
      settings: {
        estimatedDuration: 25,
        includeQuiz: true,
      },
    },
  },
  textLesson: {
    name: 'Text Lesson',
    type: 'lesson',
    category: 'text',
    content: {
      sections: [
        { title: 'Overview', type: 'text', content: '' },
        { title: 'Key Concepts', type: 'text', content: '' },
        { title: 'Examples', type: 'text', content: '' },
        { title: 'Summary', type: 'text', content: '' },
      ],
      settings: {
        estimatedDuration: 15,
        includeQuiz: false,
      },
    },
  },
  workshop: {
    name: 'Workshop',
    type: 'lesson',
    category: 'workshop',
    content: {
      sections: [
        { title: 'Workshop Overview', type: 'video', duration: 5 },
        { title: 'Hands-on Exercise', type: 'interactive', duration: 30 },
        { title: 'Solution Walkthrough', type: 'video', duration: 10 },
        { title: 'Next Steps', type: 'text', content: '' },
      ],
      settings: {
        estimatedDuration: 50,
        includeAssignment: true,
      },
    },
  },
  bootcampCourse: {
    name: 'Bootcamp Course',
    type: 'course',
    category: 'bootcamp',
    content: {
      sections: [
        { title: 'Week 1: Fundamentals', type: 'section' },
        { title: 'Week 2: Core Concepts', type: 'section' },
        { title: 'Week 3: Advanced Topics', type: 'section' },
        { title: 'Week 4: Final Project', type: 'section' },
      ],
      settings: {
        estimatedDuration: 480,
        difficulty: 'intermediate',
      },
    },
  },
};
