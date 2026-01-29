'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  debounceMs?: number;
  onSave: (content: unknown) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
}

export function useAutoSave<T>(
  content: T,
  options: AutoSaveOptions
): AutoSaveState & { forceSave: () => Promise<void> } {
  const {
    debounceMs = 3000,
    onSave,
    onError,
    enabled = true,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSavedAt: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');
  const isMountedRef = useRef(true);

  // Serialize content for comparison
  const contentString = JSON.stringify(content);

  // Check for changes
  useEffect(() => {
    if (lastContentRef.current !== contentString) {
      setState((prev) => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [contentString]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;

    // Don't save if content hasn't changed
    if (lastContentRef.current === contentString) {
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await onSave(content);

        if (isMountedRef.current) {
          lastContentRef.current = contentString;
          setState((prev) => ({
            ...prev,
            isSaving: false,
            lastSavedAt: new Date(),
            hasUnsavedChanges: false,
          }));
        }
      } catch (error) {
        if (isMountedRef.current) {
          const err = error instanceof Error ? error : new Error('Save failed');
          setState((prev) => ({
            ...prev,
            isSaving: false,
            error: err,
          }));
          onError?.(err);
        }
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [contentString, debounceMs, enabled, onSave, onError, content]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Force save function
  const forceSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSave(content);
      lastContentRef.current = contentString;
      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSavedAt: new Date(),
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: err,
      }));
      throw err;
    }
  }, [content, contentString, onSave]);

  return {
    ...state,
    forceSave,
  };
}

// Hook for unsaved changes warning
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean): void {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

export default useAutoSave;
