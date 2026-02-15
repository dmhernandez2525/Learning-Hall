'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LESSON_TEMPLATES } from '@/lib/course-builder-v2';
import { BuilderHeader } from './BuilderHeader';
import { BuilderTemplatePicker } from './BuilderTemplatePicker';
import { BuilderValidationWarnings } from './BuilderValidationWarnings';
import { BulkActionBar } from './BulkActionBar';
import { LessonEditorPanel } from './LessonEditorPanel';
import { SortableModuleTree } from './SortableModuleTree';
import { useCourseBuilderState } from './useCourseBuilderState';

interface CourseBuilderV2Props {
  courseId: string;
}

export function CourseBuilderV2({ courseId }: CourseBuilderV2Props) {
  const builder = useCourseBuilderState(courseId);

  if (builder.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading course builder...</p>;
  }

  return (
    <div className="space-y-4">
      <BuilderHeader
        courseId={courseId}
        courseTitle={builder.courseTitle}
        autosaveStatus={builder.autoSaveStatus}
        lastSavedAt={builder.lastSavedAt}
        onUndo={builder.undo}
        onRedo={builder.redo}
        onRefresh={() => void builder.refreshBuilder()}
        onSave={() => void builder.saveLessonNow()}
        onSaveTemplate={() => void builder.saveAsTemplate()}
      />

      {builder.error ? (
        <Card>
          <CardContent className="py-2 text-sm text-red-600">{builder.error}</CardContent>
        </Card>
      ) : null}

      <BulkActionBar
        selectedCount={builder.selectedLessonIds.size}
        moduleOptions={builder.moduleOptions}
        moveTargetModuleId={builder.moveTargetModuleId}
        disabled={builder.isBusy || !builder.moveTargetModuleId}
        onChangeMoveTarget={builder.setMoveTargetModuleId}
        onMove={() => void builder.runBulkAction('move')}
        onCopy={() => void builder.runBulkAction('copy')}
        onDelete={() => void builder.runBulkAction('delete')}
        onClear={builder.clearSelections}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SortableModuleTree
            modules={builder.modules}
            selectedLessonId={builder.selectedLessonId}
            selectedLessonIds={builder.selectedLessonIds}
            disabled={builder.isBusy}
            onSelectLesson={builder.selectLesson}
            onToggleLessonSelection={builder.toggleLessonSelection}
            onToggleModuleCollapse={builder.toggleModuleCollapse}
            onAddLesson={(moduleId) => void builder.addStarterLesson(moduleId)}
            onReorderModules={(activeId, overId) => void builder.reorderModuleTree(activeId, overId)}
            onReorderLessons={(moduleId, activeId, overId) =>
              void builder.reorderLessonTree(moduleId, activeId, overId)}
          />
        </div>

        <div className="space-y-4">
          <BuilderTemplatePicker
            templates={LESSON_TEMPLATES}
            disabled={builder.isBusy}
            onApplyTemplate={(templateId) => void builder.applyTemplate(templateId)}
          />
          <LessonEditorPanel
            lesson={builder.selectedLesson}
            disabled={builder.isBusy}
            onUpdateLesson={builder.updateLesson}
          />
          <BuilderValidationWarnings warnings={builder.warnings} />
        </div>
      </div>
    </div>
  );
}
