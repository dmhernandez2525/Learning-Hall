import { getPayloadClient } from '@/lib/payload';
import type { Where } from 'payload';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: {
    id: string;
    url: string;
    alt?: string;
  };
  instructor: {
    id: string;
    name?: string;
    email: string;
  };
  status: 'draft' | 'published' | 'archived';
  price: {
    amount: number;
    currency: string;
  };
  modules?: string[];
  settings?: {
    allowPreview?: boolean;
    requireSequentialProgress?: boolean;
    certificateEnabled?: boolean;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  status?: Course['status'];
  instructorId?: string;
  search?: string;
}

export interface CourseListResult {
  docs: Course[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatCourse(doc: Record<string, unknown>): Course {
  const instructor = doc.instructor as Record<string, unknown> | string;
  const thumbnail = doc.thumbnail as Record<string, unknown> | null;
  const price = doc.price as Record<string, unknown> | null;
  const settings = doc.settings as Record<string, unknown> | null;

  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    slug: String(doc.slug || ''),
    description: doc.description ? String(doc.description) : undefined,
    shortDescription: doc.shortDescription ? String(doc.shortDescription) : undefined,
    thumbnail: thumbnail
      ? {
          id: String(thumbnail.id),
          url: String(thumbnail.url || ''),
          alt: thumbnail.alt ? String(thumbnail.alt) : undefined,
        }
      : undefined,
    instructor:
      typeof instructor === 'object'
        ? {
            id: String(instructor.id),
            name: instructor.name ? String(instructor.name) : undefined,
            email: String(instructor.email || ''),
          }
        : { id: String(instructor), name: undefined, email: '' },
    status: (doc.status as Course['status']) || 'draft',
    price: {
      amount: Number(price?.amount || 0),
      currency: String(price?.currency || 'USD'),
    },
    modules: doc.modules
      ? (doc.modules as Array<unknown>).map((m) =>
          typeof m === 'object' ? String((m as Record<string, unknown>).id) : String(m)
        )
      : undefined,
    settings: settings
      ? {
          allowPreview: Boolean(settings.allowPreview),
          requireSequentialProgress: Boolean(settings.requireSequentialProgress),
          certificateEnabled: Boolean(settings.certificateEnabled),
        }
      : undefined,
    publishedAt: doc.publishedAt ? String(doc.publishedAt) : undefined,
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

export async function listCourses(params: CourseListParams = {}): Promise<CourseListResult> {
  const payload = await getPayloadClient();
  const { page = 1, limit = 10, status, instructorId, search } = params;

  const conditions: Where[] = [];

  if (status) {
    conditions.push({ status: { equals: status } });
  }

  if (instructorId) {
    conditions.push({ instructor: { equals: instructorId } });
  }

  if (search) {
    conditions.push({
      or: [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
      ],
    });
  }

  const where: Where | undefined =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : { and: conditions }
      : undefined;

  const result = await payload.find({
    collection: 'courses',
    page,
    limit,
    where,
    sort: '-updatedAt',
  });

  return {
    docs: result.docs.map((doc) => formatCourse(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getCourse(id: string): Promise<Course | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.findByID({
      collection: 'courses',
      id,
    });

    if (!result) return null;

    return formatCourse(result as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'courses',
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (result.docs.length === 0) return null;

    return formatCourse(result.docs[0] as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getCourseByIdOrSlug(idOrSlug: string): Promise<Course | null> {
  // First try to find by ID (numeric IDs or UUIDs)
  const isNumericId = /^\d+$/.test(idOrSlug);
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  if (isNumericId || isUUID) {
    const course = await getCourse(idOrSlug);
    if (course) return course;
  }

  // Fall back to slug lookup
  return getCourseBySlug(idOrSlug);
}

export interface CreateCourseData {
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  instructorId: string;
  status?: Course['status'];
  price?: {
    amount: number;
    currency: string;
  };
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  const payload = await getPayloadClient();

  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const result = await payload.create({
    collection: 'courses',
    data: {
      title: data.title,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      instructor: data.instructorId,
      status: data.status || 'draft',
      price: data.price || { amount: 0, currency: 'USD' },
    },
  });

  return formatCourse(result as Record<string, unknown>);
}

export interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  status?: Course['status'];
  price?: {
    amount: number;
    currency: string;
  };
  settings?: {
    allowPreview?: boolean;
    requireSequentialProgress?: boolean;
    certificateEnabled?: boolean;
  };
  publishedAt?: string;
}

export async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  const payload = await getPayloadClient();

  const result = await payload.update({
    collection: 'courses',
    id,
    data,
  });

  return formatCourse(result as Record<string, unknown>);
}

export async function deleteCourse(id: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient();

    await payload.delete({
      collection: 'courses',
      id,
    });

    return true;
  } catch {
    return false;
  }
}
