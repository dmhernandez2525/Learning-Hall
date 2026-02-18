import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LESSON_TEMPLATES,
  createDebouncedAutoSaveController,
  createHistoryState,
  getTemplateById,
  pushHistory,
  redoHistory,
  reorderLessons,
  reorderModules,
  undoHistory,
  validatePublishReadiness,
  type BuilderCourse,
  type BuilderLesson,
  type BuilderModule,
  type BuilderSnapshot,
} from '@/lib/course-builder-v2';
import {
  copyLessonToModule,
  createLessonFromTemplate,
  deleteLessonById,
  fetchCourseBuilderData,
  moveLessonToModule,
  reorderLessonsOnServer,
  reorderModulesOnServer,
  saveCourseStructureTemplate,
  saveLesson,
} from './api';
import {
  findLesson as lookupLesson,
  findModuleIdByLessonId as lookupLessonModuleId,
  withLessonUpdate,
  withModuleUpdate,
} from './state-utils';
import { useBuilderHotkeys } from './useBuilderHotkeys';

export type BuilderBulkAction = 'move' | 'copy' | 'delete';

export function useCourseBuilderState(courseId: string) {
  const autoSave = useRef(createDebouncedAutoSaveController(1500));
  const [course, setCourse] = useState<BuilderCourse | null>(null);
  const [modules, setModules] = useState<BuilderModule[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [moveTargetModuleId, setMoveTargetModuleId] = useState<string>('');
  const [, setHistory] = useState(createHistoryState({ modules: [], selectedLessonId: null }));
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveState, setAutoSaveState] = useState(autoSave.current.getState());

  const setSnapshot = useCallback((snapshot: BuilderSnapshot, recordHistory: boolean) => {
    setModules(snapshot.modules);
    setSelectedLessonId(snapshot.selectedLessonId);
    setHistory((current) => (recordHistory ? pushHistory(current, snapshot) : { ...current, present: snapshot }));
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const next = undoHistory(current);
      setModules(next.present.modules);
      setSelectedLessonId(next.present.selectedLessonId);
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const next = redoHistory(current);
      setModules(next.present.modules);
      setSelectedLessonId(next.present.selectedLessonId);
      return next;
    });
  }, []);

  const refreshBuilder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCourseBuilderData(courseId);
      const firstLessonId = result.modules[0]?.lessons[0]?.id ?? null;
      setCourse(result.course);
      setModules(result.modules);
      setSelectedLessonId(firstLessonId);
      setSelectedLessonIds(new Set());
      setMoveTargetModuleId(result.modules[0]?.id ?? '');
      setHistory(createHistoryState({ modules: result.modules, selectedLessonId: firstLessonId }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load course builder');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const autoSaveController = autoSave.current;
    void refreshBuilder();
    return () => autoSaveController.dispose();
  }, [refreshBuilder]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAutoSaveState(autoSave.current.getState());
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  const selectedLesson = useMemo(
    () => lookupLesson(modules, selectedLessonId ?? ''),
    [modules, selectedLessonId]
  );
  const warnings = useMemo(() => validatePublishReadiness(modules), [modules]);
  const moduleOptions = useMemo(
    () => modules.map((courseModule) => ({ id: courseModule.id, title: courseModule.title })),
    [modules]
  );

  const saveLessonNow = useCallback(async () => {
    if (!selectedLesson) {
      return;
    }
    try {
      await autoSave.current.flush(async () => saveLesson(selectedLesson));
      setAutoSaveState(autoSave.current.getState());
    } catch {
      setError('Failed to save lesson changes');
    }
  }, [selectedLesson]);

  const updateLesson = useCallback(
    (lessonId: string, updates: Partial<BuilderLesson>) => {
      const nextModules = withLessonUpdate(modules, lessonId, (lesson) => ({ ...lesson, ...updates }));
      setSnapshot({ modules: nextModules, selectedLessonId }, true);
      const changedLesson = lookupLesson(nextModules, lessonId);
      if (!changedLesson) {
        return;
      }
      autoSave.current.markUnsaved();
      autoSave.current.schedule(async () => saveLesson(changedLesson));
      setAutoSaveState(autoSave.current.getState());
    },
    [modules, selectedLessonId, setSnapshot]
  );

  const reorderModuleTree = useCallback(
    async (activeId: string, overId: string) => {
      const nextModules = reorderModules(modules, activeId, overId);
      setSnapshot({ modules: nextModules, selectedLessonId }, true);
      try {
        await reorderModulesOnServer(courseId, nextModules);
      } catch {
        setError('Failed to persist module reordering');
      }
    },
    [courseId, modules, selectedLessonId, setSnapshot]
  );

  const reorderLessonTree = useCallback(
    async (moduleId: string, activeId: string, overId: string) => {
      const nextModules = reorderLessons(modules, moduleId, activeId, overId);
      setSnapshot({ modules: nextModules, selectedLessonId }, true);
      const targetModule = nextModules.find((courseModule) => courseModule.id === moduleId);
      if (!targetModule) {
        return;
      }
      try {
        await reorderLessonsOnServer(moduleId, targetModule.lessons);
      } catch {
        setError('Failed to persist lesson reordering');
      }
    },
    [modules, selectedLessonId, setSnapshot]
  );

  const applyTemplateToModule = useCallback(
    async (templateId: string, moduleIdOverride?: string) => {
      const template = getTemplateById(templateId);
      if (!template) {
        return;
      }
      const moduleId = moduleIdOverride ?? lookupLessonModuleId(modules, selectedLessonId ?? '') ?? modules[0]?.id;
      if (!moduleId) {
        setError('Create a module before adding template lessons');
        return;
      }

      setIsBusy(true);
      try {
        await createLessonFromTemplate(moduleId, template);
        await refreshBuilder();
      } catch {
        setError('Failed to apply lesson template');
      } finally {
        setIsBusy(false);
      }
    },
    [modules, refreshBuilder, selectedLessonId]
  );

  const runBulkAction = useCallback(
    async (action: BuilderBulkAction) => {
      if (selectedLessonIds.size === 0) {
        return;
      }
      setIsBusy(true);
      setError(null);
      try {
        if (action === 'move') {
          await Promise.all([...selectedLessonIds].map((lessonId) => moveLessonToModule(lessonId, moveTargetModuleId)));
        } else if (action === 'copy') {
          const lessons = [...selectedLessonIds]
            .map((lessonId) => lookupLesson(modules, lessonId))
            .filter((lesson): lesson is BuilderLesson => lesson !== null);
          await Promise.all(lessons.map((lesson) => copyLessonToModule(lesson, moveTargetModuleId)));
        } else {
          await Promise.all([...selectedLessonIds].map((lessonId) => deleteLessonById(lessonId)));
        }
        setSelectedLessonIds(new Set());
        await refreshBuilder();
      } catch {
        setError(`Failed to ${action} selected lessons`);
      } finally {
        setIsBusy(false);
      }
    },
    [modules, moveTargetModuleId, refreshBuilder, selectedLessonIds]
  );

  const saveAsTemplate = useCallback(async () => {
    const name = window.prompt('Template name');
    if (!name || !course) {
      return;
    }
    setError(null);
    try {
      await saveCourseStructureTemplate(course.id, { name });
    } catch {
      setError('Failed to save course structure template');
    }
  }, [course]);

  useBuilderHotkeys({
    onSave: () => void saveLessonNow(),
    onUndo: undo,
    onRedo: redo,
  });

  return {
    courseTitle: course?.title ?? 'Course',
    modules,
    selectedLesson,
    selectedLessonId,
    selectedLessonIds,
    moveTargetModuleId,
    moduleOptions,
    warnings,
    isLoading,
    isBusy,
    error,
    autoSaveStatus: autoSaveState.status,
    lastSavedAt: autoSaveState.lastSavedAt,
    selectLesson: setSelectedLessonId,
    toggleLessonSelection: (lessonId: string) =>
      setSelectedLessonIds((current) => {
        const next = new Set(current);
        if (next.has(lessonId)) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        return next;
      }),
    clearSelections: () => setSelectedLessonIds(new Set()),
    setMoveTargetModuleId,
    toggleModuleCollapse: (moduleId: string) =>
      setSnapshot(
        {
          modules: withModuleUpdate(modules, moduleId, (courseModule) => ({
            ...courseModule,
            collapsed: !courseModule.collapsed,
          })),
          selectedLessonId,
        },
        false
      ),
    addStarterLesson: (moduleId: string) => applyTemplateToModule(LESSON_TEMPLATES[0].id, moduleId),
    applyTemplate: (templateId: string) => applyTemplateToModule(templateId),
    reorderModuleTree,
    reorderLessonTree,
    updateLesson,
    runBulkAction,
    refreshBuilder,
    undo,
    redo,
    saveLessonNow,
    saveAsTemplate,
  };
}
