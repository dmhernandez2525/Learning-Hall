import type { BuilderSnapshot } from './types';

export interface BuilderHistoryState {
  past: BuilderSnapshot[];
  present: BuilderSnapshot;
  future: BuilderSnapshot[];
}

function cloneSnapshot(snapshot: BuilderSnapshot): BuilderSnapshot {
  return {
    modules: snapshot.modules.map((courseModule) => ({
      ...courseModule,
      lessons: courseModule.lessons.map((lesson) => ({ ...lesson })),
    })),
    selectedLessonId: snapshot.selectedLessonId,
  };
}

function snapshotsEqual(left: BuilderSnapshot, right: BuilderSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function createHistoryState(initialSnapshot: BuilderSnapshot): BuilderHistoryState {
  return {
    past: [],
    present: cloneSnapshot(initialSnapshot),
    future: [],
  };
}

export function pushHistory(
  state: BuilderHistoryState,
  nextSnapshot: BuilderSnapshot,
  maxEntries = 50
): BuilderHistoryState {
  const next = cloneSnapshot(nextSnapshot);
  if (snapshotsEqual(state.present, next)) {
    return state;
  }

  const past = [...state.past, cloneSnapshot(state.present)];
  if (past.length > maxEntries) {
    past.shift();
  }

  return {
    past,
    present: next,
    future: [],
  };
}

export function undoHistory(state: BuilderHistoryState): BuilderHistoryState {
  if (state.past.length === 0) {
    return state;
  }

  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(state.present), ...state.future],
  };
}

export function redoHistory(state: BuilderHistoryState): BuilderHistoryState {
  if (state.future.length === 0) {
    return state;
  }

  const [next, ...future] = state.future;
  return {
    past: [...state.past, cloneSnapshot(state.present)],
    present: cloneSnapshot(next),
    future,
  };
}

