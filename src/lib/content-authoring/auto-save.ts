// Auto-save functionality
import { createVersion } from './version-control';

export interface AutoSaveConfig {
  debounceMs: number;
  minChangeThreshold: number;
  maxVersionsPerHour: number;
}

export const defaultAutoSaveConfig: AutoSaveConfig = {
  debounceMs: 3000, // 3 seconds debounce
  minChangeThreshold: 10, // Minimum characters changed
  maxVersionsPerHour: 20, // Max auto-saves per hour
};

// Track auto-save state per content
const autoSaveState = new Map<
  string,
  {
    timer: NodeJS.Timeout | null;
    lastContent: string;
    lastSaveTime: number;
    saveCount: number;
    hourStart: number;
  }
>();

// Initialize auto-save for content
export function initAutoSave(contentId: string): void {
  if (!autoSaveState.has(contentId)) {
    autoSaveState.set(contentId, {
      timer: null,
      lastContent: '',
      lastSaveTime: 0,
      saveCount: 0,
      hourStart: Date.now(),
    });
  }
}

// Clean up auto-save for content
export function cleanupAutoSave(contentId: string): void {
  const state = autoSaveState.get(contentId);
  if (state?.timer) {
    clearTimeout(state.timer);
  }
  autoSaveState.delete(contentId);
}

// Trigger auto-save
export async function triggerAutoSave(
  contentId: string,
  contentType: 'lesson' | 'course' | 'section' | 'quiz',
  content: unknown,
  authorId: string,
  config: AutoSaveConfig = defaultAutoSaveConfig
): Promise<boolean> {
  let state = autoSaveState.get(contentId);

  if (!state) {
    initAutoSave(contentId);
    state = autoSaveState.get(contentId)!;
  }

  // Clear existing timer
  if (state.timer) {
    clearTimeout(state.timer);
  }

  // Check hourly limit
  const now = Date.now();
  if (now - state.hourStart > 3600000) {
    // Reset hourly counter
    state.hourStart = now;
    state.saveCount = 0;
  }

  if (state.saveCount >= config.maxVersionsPerHour) {
    return false; // Rate limited
  }

  // Check change threshold
  const contentString = JSON.stringify(content);
  const changeSize = Math.abs(contentString.length - state.lastContent.length);

  if (changeSize < config.minChangeThreshold && state.lastContent !== '') {
    return false; // Not enough change
  }

  // Set debounced save
  return new Promise((resolve) => {
    state!.timer = setTimeout(async () => {
      try {
        await createVersion(contentId, contentType, content, {
          changeType: 'autosave',
          changeDescription: 'Auto-saved',
          authorId,
        });

        state!.lastContent = contentString;
        state!.lastSaveTime = Date.now();
        state!.saveCount++;

        resolve(true);
      } catch (error) {
        console.error('Auto-save failed:', error);
        resolve(false);
      }
    }, config.debounceMs);
  });
}

// Get auto-save status
export function getAutoSaveStatus(contentId: string): {
  lastSaveTime: number;
  saveCount: number;
  isLimited: boolean;
} {
  const state = autoSaveState.get(contentId);

  if (!state) {
    return {
      lastSaveTime: 0,
      saveCount: 0,
      isLimited: false,
    };
  }

  const now = Date.now();
  const isLimited = state.saveCount >= defaultAutoSaveConfig.maxVersionsPerHour &&
    now - state.hourStart < 3600000;

  return {
    lastSaveTime: state.lastSaveTime,
    saveCount: state.saveCount,
    isLimited,
  };
}

// Force immediate save (bypass debounce)
export async function forceSave(
  contentId: string,
  contentType: 'lesson' | 'course' | 'section' | 'quiz',
  content: unknown,
  authorId: string,
  changeDescription?: string
): Promise<string> {
  const state = autoSaveState.get(contentId);

  // Clear any pending auto-save
  if (state?.timer) {
    clearTimeout(state.timer);
  }

  // Create version immediately
  const versionId = await createVersion(contentId, contentType, content, {
    changeType: 'manual',
    changeDescription: changeDescription || 'Manual save',
    authorId,
  });

  // Update state
  if (state) {
    state.lastContent = JSON.stringify(content);
    state.lastSaveTime = Date.now();
  }

  return versionId;
}
