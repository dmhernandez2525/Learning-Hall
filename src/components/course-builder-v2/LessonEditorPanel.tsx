'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BuilderLesson } from '@/lib/course-builder-v2';

interface LessonEditorPanelProps {
  lesson: BuilderLesson | null;
  disabled?: boolean;
  onUpdateLesson: (lessonId: string, updates: Partial<BuilderLesson>) => void;
}

export function LessonEditorPanel({
  lesson,
  disabled = false,
  onUpdateLesson,
}: LessonEditorPanelProps) {
  if (!lesson) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lesson Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a lesson from the tree to begin editing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lesson Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              value={lesson.title}
              onChange={(event) => onUpdateLesson(lesson.id, { title: event.target.value })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-1">
            <Label>Content Type</Label>
            <Select
              value={lesson.contentType}
              onValueChange={(value) =>
                disabled
                  ? undefined
                  : onUpdateLesson(lesson.id, {
                      contentType: value as BuilderLesson['contentType'],
                    })
              }
            >
              <SelectTrigger
                aria-disabled={disabled}
                className={disabled ? 'pointer-events-none opacity-50' : ''}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lesson.isPreview}
              onChange={(event) => onUpdateLesson(lesson.id, { isPreview: event.target.checked })}
              disabled={disabled}
            />
            Preview lesson
          </label>

          <div className="space-y-1">
            <Label htmlFor="lesson-content">Content</Label>
            <textarea
              id="lesson-content"
              value={lesson.contentText ?? ''}
              onChange={(event) => onUpdateLesson(lesson.id, { contentText: event.target.value })}
              disabled={disabled}
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium">{lesson.title || 'Untitled Lesson'}</h3>
          <p className="text-xs text-muted-foreground capitalize mb-3">
            {lesson.contentType} lesson
          </p>
          {lesson.contentText?.trim() ? (
            <pre className="whitespace-pre-wrap text-sm rounded-md bg-slate-50 border p-3">
              {lesson.contentText}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">Start typing to preview lesson content.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
