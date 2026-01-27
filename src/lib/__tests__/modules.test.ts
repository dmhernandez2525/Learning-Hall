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
  listModules,
  getModule,
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../modules';

const mockModuleDoc = {
  id: 'module-123',
  title: 'Getting Started',
  description: 'Introduction to the course',
  course: {
    id: 'course-1',
    title: 'Test Course',
  },
  position: 0,
  lessons: [
    { id: 'lesson-1', title: 'Welcome', position: 0, contentType: 'video' },
    { id: 'lesson-2', title: 'Setup', position: 1, contentType: 'text' },
  ],
  dripDelay: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('Modules Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listModules', () => {
    it('returns paginated module list', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockModuleDoc],
        totalDocs: 1,
        totalPages: 1,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      const result = await listModules();

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'modules',
        page: 1,
        limit: 50,
        where: undefined,
        sort: 'position',
        depth: 2,
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].title).toBe('Getting Started');
    });

    it('filters by courseId', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      await listModules({ courseId: 'course-1' });

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { course: { equals: 'course-1' } },
        })
      );
    });
  });

  describe('getModule', () => {
    it('returns module by id', async () => {
      mockPayload.findByID.mockResolvedValue(mockModuleDoc);

      const module = await getModule('module-123');

      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'modules',
        id: 'module-123',
        depth: 2,
      });
      expect(module?.title).toBe('Getting Started');
      expect(module?.lessons).toHaveLength(2);
    });

    it('returns null when module not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const module = await getModule('nonexistent');

      expect(module).toBeNull();
    });

    it('returns null on error', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Database error'));

      const module = await getModule('module-123');

      expect(module).toBeNull();
    });
  });

  describe('getModulesByCourse', () => {
    it('returns all modules for a course', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockModuleDoc],
      });

      const modules = await getModulesByCourse('course-1');

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'modules',
        where: { course: { equals: 'course-1' } },
        sort: 'position',
        limit: 100,
        depth: 2,
      });
      expect(modules).toHaveLength(1);
    });
  });

  describe('createModule', () => {
    it('creates a new module at end of course', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] });
      mockPayload.create.mockResolvedValue(mockModuleDoc);

      const module = await createModule({
        title: 'Getting Started',
        courseId: 'course-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'modules',
        data: expect.objectContaining({
          title: 'Getting Started',
          course: 'course-1',
          position: 0,
          dripDelay: 0,
        }),
      });
      expect(module.title).toBe('Getting Started');
    });

    it('calculates position based on existing modules', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ position: 2 }],
      });
      mockPayload.create.mockResolvedValue(mockModuleDoc);

      await createModule({
        title: 'New Module',
        courseId: 'course-1',
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'modules',
        data: expect.objectContaining({
          position: 3,
        }),
      });
    });

    it('uses provided position', async () => {
      mockPayload.create.mockResolvedValue(mockModuleDoc);

      await createModule({
        title: 'New Module',
        courseId: 'course-1',
        position: 5,
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'modules',
        data: expect.objectContaining({
          position: 5,
        }),
      });
    });
  });

  describe('updateModule', () => {
    it('updates module fields', async () => {
      mockPayload.update.mockResolvedValue({
        ...mockModuleDoc,
        title: 'Updated Title',
      });

      const module = await updateModule('module-123', {
        title: 'Updated Title',
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'modules',
        id: 'module-123',
        data: { title: 'Updated Title' },
      });
      expect(module.title).toBe('Updated Title');
    });
  });

  describe('deleteModule', () => {
    it('deletes module and returns true', async () => {
      mockPayload.delete.mockResolvedValue({});

      const result = await deleteModule('module-123');

      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'modules',
        id: 'module-123',
      });
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockPayload.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteModule('module-123');

      expect(result).toBe(false);
    });
  });

  describe('reorderModules', () => {
    it('updates positions for all modules', async () => {
      mockPayload.update
        .mockResolvedValueOnce({ ...mockModuleDoc, id: 'mod-1', position: 1 })
        .mockResolvedValueOnce({ ...mockModuleDoc, id: 'mod-2', position: 0 });

      const modules = await reorderModules('course-1', [
        { id: 'mod-1', position: 1 },
        { id: 'mod-2', position: 0 },
      ]);

      expect(mockPayload.update).toHaveBeenCalledTimes(2);
      expect(modules[0].position).toBe(0);
      expect(modules[1].position).toBe(1);
    });
  });
});
