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
  listLessons,
  getLesson,
  getLessonsByModule,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  moveLesson,
} from '../lessons';

const mockLessonDoc = {
  id: 'lesson-123',
  title: 'Welcome to the Course',
  module: {
    id: 'module-1',
    title: 'Getting Started',
    course: {
      id: 'course-1',
      title: 'Test Course',
    },
  },
  position: 0,
  contentType: 'video',
  content: {
    videoUrl: 'https://example.com/video.m3u8',
    videoDuration: 600,
  },
  isPreview: true,
  estimatedDuration: 10,
  resources: [
    {
      id: 'res-1',
      title: 'Course Notes',
      file: { id: 'file-1', url: '/files/notes.pdf', filename: 'notes.pdf' },
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('Lessons Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listLessons', () => {
    it('returns paginated lesson list', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockLessonDoc],
        totalDocs: 1,
        totalPages: 1,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      const result = await listLessons();

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'lessons',
        page: 1,
        limit: 50,
        where: undefined,
        sort: 'position',
        depth: 2,
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].title).toBe('Welcome to the Course');
    });

    it('filters by moduleId', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listLessons({ moduleId: 'module-1' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { module: { equals: 'module-1' } },
        })
      );
    });

    it('filters by contentType', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listLessons({ contentType: 'video' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { contentType: { equals: 'video' } },
        })
      );
    });

    it('filters by isPreview', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listLessons({ isPreview: true });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPreview: { equals: true } },
        })
      );
    });

    it('combines multiple filters', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listLessons({ moduleId: 'module-1', contentType: 'video' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { module: { equals: 'module-1' } },
              { contentType: { equals: 'video' } },
            ],
          },
        })
      );
    });
  });

  describe('getLesson', () => {
    it('returns lesson by id', async () => {
      mockPayload.findByID.mockResolvedValue(mockLessonDoc);

      const lesson = await getLesson('lesson-123');

      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
        depth: 2,
      });
      expect(lesson?.title).toBe('Welcome to the Course');
      expect(lesson?.content.videoUrl).toBe('https://example.com/video.m3u8');
    });

    it('returns null when lesson not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const lesson = await getLesson('nonexistent');

      expect(lesson).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Database error'));

      const lesson = await getLesson('lesson-123');

      expect(lesson).toBeNull();
    });
  });

  describe('getLessonsByModule', () => {
    it('returns all lessons for a module', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockLessonDoc],
      });

      const lessons = await getLessonsByModule('module-1');

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'lessons',
        where: { module: { equals: 'module-1' } },
        sort: 'position',
        limit: 100,
        depth: 2,
      });
      expect(lessons).toHaveLength(1);
    });
  });

  describe('createLesson', () => {
    it('creates a new video lesson', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] });
      mockPayload.create.mockResolvedValue(mockLessonDoc);

      const lesson = await createLesson({
        title: 'Welcome to the Course',
        moduleId: 'module-1',
        contentType: 'video',
        content: {
          videoUrl: 'https://example.com/video.m3u8',
          videoDuration: 600,
        },
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'lessons',
        data: expect.objectContaining({
          title: 'Welcome to the Course',
          module: 'module-1',
          contentType: 'video',
          position: 0,
        }),
      });
      expect(lesson.title).toBe('Welcome to the Course');
    });

    it('calculates position based on existing lessons', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ position: 3 }],
      });
      mockPayload.create.mockResolvedValue(mockLessonDoc);

      await createLesson({
        title: 'New Lesson',
        moduleId: 'module-1',
        contentType: 'text',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'lessons',
        data: expect.objectContaining({
          position: 4,
        }),
      });
    });

    it('creates a text lesson', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] });
      mockPayload.create.mockResolvedValue({
        ...mockLessonDoc,
        contentType: 'text',
        content: { textContent: { blocks: [] } },
      });

      await createLesson({
        title: 'Text Lesson',
        moduleId: 'module-1',
        contentType: 'text',
        content: {
          textContent: { blocks: [] },
        },
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'lessons',
        data: expect.objectContaining({
          contentType: 'text',
        }),
      });
    });
  });

  describe('updateLesson', () => {
    it('updates lesson fields', async () => {
      mockPayload.update.mockResolvedValue({
        ...mockLessonDoc,
        title: 'Updated Title',
      });

      const lesson = await updateLesson('lesson-123', {
        title: 'Updated Title',
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
        data: { title: 'Updated Title' },
      });
      expect(lesson.title).toBe('Updated Title');
    });

    it('updates lesson content', async () => {
      mockPayload.update.mockResolvedValue(mockLessonDoc);

      await updateLesson('lesson-123', {
        content: {
          videoUrl: 'https://new-url.com/video.m3u8',
        },
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
        data: {
          content: { videoUrl: 'https://new-url.com/video.m3u8' },
        },
      });
    });
  });

  describe('deleteLesson', () => {
    it('deletes lesson and returns true', async () => {
      mockPayload.delete.mockResolvedValue({});

      const result = await deleteLesson('lesson-123');

      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
      });
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockPayload.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteLesson('lesson-123');

      expect(result).toBe(false);
    });
  });

  describe('reorderLessons', () => {
    it('updates positions for all lessons', async () => {
      mockPayload.update
        .mockResolvedValueOnce({ ...mockLessonDoc, id: 'l-1', position: 1 })
        .mockResolvedValueOnce({ ...mockLessonDoc, id: 'l-2', position: 0 });

      const lessons = await reorderLessons('module-1', [
        { id: 'l-1', position: 1 },
        { id: 'l-2', position: 0 },
      ]);

      expect(mockPayload.update).toHaveBeenCalledTimes(2);
      expect(lessons[0].position).toBe(0);
      expect(lessons[1].position).toBe(1);
    });
  });

  describe('moveLesson', () => {
    it('moves lesson to new module', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ position: 5 }],
      });
      mockPayload.update.mockResolvedValue({
        ...mockLessonDoc,
        module: { id: 'module-2', title: 'New Module' },
        position: 6,
      });

      const lesson = await moveLesson('lesson-123', 'module-2');

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
        data: {
          module: 'module-2',
          position: 6,
        },
      });
      expect(lesson.module.id).toBe('module-2');
    });

    it('places lesson at position 0 if target module is empty', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] });
      mockPayload.update.mockResolvedValue({
        ...mockLessonDoc,
        module: { id: 'module-2', title: 'New Module' },
        position: 0,
      });

      await moveLesson('lesson-123', 'module-2');

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'lessons',
        id: 'lesson-123',
        data: {
          module: 'module-2',
          position: 0,
        },
      });
    });
  });
});
