import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedAutoSaveController } from '@/lib/course-builder-v2';

describe('course-builder-v2 autosave controller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces save execution and sets status to saved', async () => {
    const controller = createDebouncedAutoSaveController(100);
    const saveAction = vi.fn(async () => Promise.resolve());

    controller.markUnsaved();
    controller.schedule(saveAction);

    expect(controller.getState().status).toBe('unsaved');
    await vi.advanceTimersByTimeAsync(100);
    expect(saveAction).toHaveBeenCalledTimes(1);
    expect(controller.getState().status).toBe('saved');
  });

  it('flush runs save immediately', async () => {
    const controller = createDebouncedAutoSaveController(1000);
    const saveAction = vi.fn(async () => Promise.resolve());

    await controller.flush(saveAction);

    expect(saveAction).toHaveBeenCalledTimes(1);
    expect(controller.getState().status).toBe('saved');
    expect(controller.getState().lastSavedAt).not.toBeNull();
  });

  it('moves to error state when save fails', async () => {
    const controller = createDebouncedAutoSaveController(100);
    const saveAction = vi.fn(async () => {
      throw new Error('failed');
    });

    await expect(controller.flush(saveAction)).rejects.toThrow('Auto-save failed');
    expect(controller.getState().status).toBe('error');
  });
});
