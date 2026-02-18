export type AutoSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface AutoSaveState {
  status: AutoSaveStatus;
  lastSavedAt: string | null;
}

export interface DebouncedAutoSaveController {
  markUnsaved: () => void;
  schedule: (saveAction: () => Promise<void>) => void;
  flush: (saveAction: () => Promise<void>) => Promise<void>;
  getState: () => AutoSaveState;
  dispose: () => void;
}

export function createDebouncedAutoSaveController(
  debounceMs = 1200
): DebouncedAutoSaveController {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let state: AutoSaveState = {
    status: 'saved',
    lastSavedAt: null,
  };

  async function runSave(saveAction: () => Promise<void>): Promise<void> {
    state = { ...state, status: 'saving' };
    try {
      await saveAction();
      state = {
        status: 'saved',
        lastSavedAt: new Date().toISOString(),
      };
    } catch {
      state = { ...state, status: 'error' };
      throw new Error('Auto-save failed');
    }
  }

  return {
    markUnsaved() {
      state = { ...state, status: 'unsaved' };
    },
    schedule(saveAction) {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        void runSave(saveAction).catch(() => {
          // State is already set to `error` inside runSave.
        });
      }, debounceMs);
    },
    async flush(saveAction) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      await runSave(saveAction);
    },
    getState() {
      return state;
    },
    dispose() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
