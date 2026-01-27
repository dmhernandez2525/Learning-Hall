import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Payload client
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/payload', () => ({
  getPayloadClient: () => Promise.resolve(mockPayload),
}));

import {
  listCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../courses';

const mockCourseDoc = {
  id: 'course-123',
  title: 'Test Course',
  slug: 'test-course',
  shortDescription: 'A test course',
  instructor: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  status: 'draft',
  price: { amount: 4999, currency: 'USD' },
  settings: {
    allowPreview: true,
    requireSequentialProgress: false,
    certificateEnabled: true,
  },
  modules: ['mod-1', 'mod-2'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('Courses Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCourses', () => {
    it('returns paginated course list', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockCourseDoc],
        totalDocs: 1,
        totalPages: 1,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      const result = await listCourses();

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'courses',
        page: 1,
        limit: 10,
        where: undefined,
        sort: '-updatedAt',
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].title).toBe('Test Course');
      expect(result.totalDocs).toBe(1);
    });

    it('applies pagination parameters', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 2,
        hasNextPage: false,
        hasPrevPage: true,
      });

      await listCourses({ page: 2, limit: 20 });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
        })
      );
    });

    it('filters by status', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listCourses({ status: 'published' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: { equals: 'published' } },
        })
      );
    });

    it('filters by instructorId', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listCourses({ instructorId: 'user-123' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { instructor: { equals: 'user-123' } },
        })
      );
    });

    it('filters by search term', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listCourses({ search: 'typescript' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            or: [
              { title: { contains: 'typescript' } },
              { shortDescription: { contains: 'typescript' } },
            ],
          },
        })
      );
    });

    it('combines multiple filters with and', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listCourses({ status: 'published', instructorId: 'user-123' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { status: { equals: 'published' } },
              { instructor: { equals: 'user-123' } },
            ],
          },
        })
      );
    });
  });

  describe('getCourse', () => {
    it('returns course by id', async () => {
      mockPayload.findByID.mockResolvedValue(mockCourseDoc);

      const course = await getCourse('course-123');

      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'courses',
        id: 'course-123',
      });
      expect(course?.title).toBe('Test Course');
      expect(course?.instructor.email).toBe('john@example.com');
    });

    it('returns null when course not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const course = await getCourse('nonexistent');

      expect(course).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Database error'));

      const course = await getCourse('course-123');

      expect(course).toBeNull();
    });
  });

  describe('getCourseBySlug', () => {
    it('returns course by slug', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockCourseDoc],
      });

      const course = await getCourseBySlug('test-course');

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'courses',
        where: { slug: { equals: 'test-course' } },
        limit: 1,
      });
      expect(course?.title).toBe('Test Course');
    });

    it('returns null when course not found', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] });

      const course = await getCourseBySlug('nonexistent');

      expect(course).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.find.mockRejectedValue(new Error('Database error'));

      const course = await getCourseBySlug('test-course');

      expect(course).toBeNull();
    });
  });

  describe('createCourse', () => {
    it('creates a new course', async () => {
      mockPayload.create.mockResolvedValue(mockCourseDoc);

      const course = await createCourse({
        title: 'Test Course',
        instructorId: 'user-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'courses',
        data: expect.objectContaining({
          title: 'Test Course',
          instructor: 'user-1',
          status: 'draft',
        }),
      });
      expect(course.title).toBe('Test Course');
    });

    it('generates slug from title', async () => {
      mockPayload.create.mockResolvedValue(mockCourseDoc);

      await createCourse({
        title: 'My Amazing Course!',
        instructorId: 'user-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'courses',
        data: expect.objectContaining({
          slug: 'my-amazing-course',
        }),
      });
    });

    it('uses provided slug', async () => {
      mockPayload.create.mockResolvedValue(mockCourseDoc);

      await createCourse({
        title: 'Test Course',
        slug: 'custom-slug',
        instructorId: 'user-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'courses',
        data: expect.objectContaining({
          slug: 'custom-slug',
        }),
      });
    });

    it('uses default price when not provided', async () => {
      mockPayload.create.mockResolvedValue(mockCourseDoc);

      await createCourse({
        title: 'Test Course',
        instructorId: 'user-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'courses',
        data: expect.objectContaining({
          price: { amount: 0, currency: 'USD' },
        }),
      });
    });
  });

  describe('updateCourse', () => {
    it('updates course fields', async () => {
      mockPayload.update.mockResolvedValue({
        ...mockCourseDoc,
        title: 'Updated Title',
      });

      const course = await updateCourse('course-123', {
        title: 'Updated Title',
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'courses',
        id: 'course-123',
        data: { title: 'Updated Title' },
      });
      expect(course.title).toBe('Updated Title');
    });

    it('updates course settings', async () => {
      mockPayload.update.mockResolvedValue(mockCourseDoc);

      await updateCourse('course-123', {
        settings: {
          allowPreview: false,
          certificateEnabled: true,
        },
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'courses',
        id: 'course-123',
        data: {
          settings: {
            allowPreview: false,
            certificateEnabled: true,
          },
        },
      });
    });
  });

  describe('deleteCourse', () => {
    it('deletes course and returns true', async () => {
      mockPayload.delete.mockResolvedValue({});

      const result = await deleteCourse('course-123');

      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'courses',
        id: 'course-123',
      });
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockPayload.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteCourse('course-123');

      expect(result).toBe(false);
    });
  });
});
