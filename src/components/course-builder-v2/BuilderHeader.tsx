'use client';

import Link from 'next/link';
import { ArrowLeft, History, Redo2, RefreshCcw, SaveAll, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuilderAutosaveBadge } from './BuilderAutosaveBadge';

interface BuilderHeaderProps {
  courseId: string;
  courseTitle: string;
  autosaveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSavedAt: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onRefresh: () => void;
  onSave: () => void;
  onSaveTemplate: () => void;
}

export function BuilderHeader({
  courseId,
  courseTitle,
  autosaveStatus,
  lastSavedAt,
  onUndo,
  onRedo,
  onRefresh,
  onSave,
  onSaveTemplate,
}: BuilderHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Course Builder V2</h1>
        <p className="text-sm text-muted-foreground">{courseTitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BuilderAutosaveBadge status={autosaveStatus} lastSavedAt={lastSavedAt} />
        <Button variant="outline" onClick={onUndo}>
          <Undo2 className="mr-1 h-4 w-4" />
          Undo
        </Button>
        <Button variant="outline" onClick={onRedo}>
          <Redo2 className="mr-1 h-4 w-4" />
          Redo
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCcw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" onClick={onSave}>
          <SaveAll className="mr-1 h-4 w-4" />
          Save
        </Button>
        <Button onClick={onSaveTemplate}>
          <History className="mr-1 h-4 w-4" />
          Save Template
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${courseId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
      </div>
    </div>
  );
}
