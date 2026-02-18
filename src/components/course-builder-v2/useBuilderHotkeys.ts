import { useEffect } from 'react';

interface UseBuilderHotkeysOptions {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function useBuilderHotkeys({ onSave, onUndo, onRedo }: UseBuilderHotkeysOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcutPressed = event.metaKey || event.ctrlKey;
      if (!shortcutPressed) {
        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        onSave();
        return;
      }

      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }

      if (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault();
        onRedo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onRedo, onSave, onUndo]);
}
