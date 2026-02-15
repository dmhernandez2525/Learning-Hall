'use client';

import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BuilderLesson, BuilderModule } from '@/lib/course-builder-v2';

interface SortableModuleTreeProps {
  modules: BuilderModule[];
  selectedLessonId: string | null;
  selectedLessonIds: Set<string>;
  disabled?: boolean;
  onSelectLesson: (lessonId: string) => void;
  onToggleLessonSelection: (lessonId: string) => void;
  onToggleModuleCollapse: (moduleId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onReorderModules: (activeId: string, overId: string) => void;
  onReorderLessons: (moduleId: string, activeId: string, overId: string) => void;
}

interface SortableLessonRowProps {
  lesson: BuilderLesson;
  isSelected: boolean;
  isChecked: boolean;
  disabled: boolean;
  onSelect: (lessonId: string) => void;
  onToggleChecked: (lessonId: string) => void;
}

function SortableLessonRow({
  lesson,
  isSelected,
  isChecked,
  disabled,
  onSelect,
  onToggleChecked,
}: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lesson.id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-md border px-2 py-1.5 text-sm ${
        isSelected ? 'border-blue-300 bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleChecked(lesson.id)}
          aria-label={`Select ${lesson.title}`}
        />
        <button
          type="button"
          className="text-left flex-1"
          onClick={() => onSelect(lesson.id)}
        >
          <p className="font-medium">{lesson.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{lesson.contentType}</p>
        </button>
      </div>
    </li>
  );
}

interface SortableModuleRowProps {
  module: BuilderModule;
  selectedLessonId: string | null;
  selectedLessonIds: Set<string>;
  disabled: boolean;
  onSelectLesson: (lessonId: string) => void;
  onToggleLessonSelection: (lessonId: string) => void;
  onToggleCollapse: (moduleId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onReorderLessons: (moduleId: string, activeId: string, overId: string) => void;
}

function SortableModuleRow({
  module,
  selectedLessonId,
  selectedLessonIds,
  disabled,
  onSelectLesson,
  onToggleLessonSelection,
  onToggleCollapse,
  onAddLesson,
  onReorderLessons,
}: SortableModuleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: module.id,
    disabled,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleLessonDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) {
      return;
    }

    onReorderLessons(module.id, String(event.active.id), String(event.over.id));
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-md border bg-slate-50"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <button type="button" {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button type="button" onClick={() => onToggleCollapse(module.id)}>
          {module.collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <div className="flex-1">
          <p className="font-medium text-sm">{module.title}</p>
          <p className="text-xs text-muted-foreground">{module.lessons.length} lessons</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddLesson(module.id)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Lesson
        </Button>
      </div>

      {!module.collapsed && (
        <div className="p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={module.lessons.map((lesson) => lesson.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {module.lessons.map((lesson) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={selectedLessonId === lesson.id}
                    isChecked={selectedLessonIds.has(lesson.id)}
                    disabled={disabled}
                    onSelect={onSelectLesson}
                    onToggleChecked={onToggleLessonSelection}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </li>
  );
}

export function SortableModuleTree({
  modules,
  selectedLessonId,
  selectedLessonIds,
  disabled = false,
  onSelectLesson,
  onToggleLessonSelection,
  onToggleModuleCollapse,
  onAddLesson,
  onReorderModules,
  onReorderLessons,
}: SortableModuleTreeProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) {
      return;
    }
    onReorderModules(String(event.active.id), String(event.over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map((courseModule) => courseModule.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {modules.map((courseModule) => (
            <SortableModuleRow
              key={courseModule.id}
              module={courseModule}
              selectedLessonId={selectedLessonId}
              selectedLessonIds={selectedLessonIds}
              disabled={disabled}
              onSelectLesson={onSelectLesson}
              onToggleLessonSelection={onToggleLessonSelection}
              onToggleCollapse={onToggleModuleCollapse}
              onAddLesson={onAddLesson}
              onReorderLessons={onReorderLessons}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

