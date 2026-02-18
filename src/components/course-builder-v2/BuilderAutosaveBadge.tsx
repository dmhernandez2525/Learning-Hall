'use client';

import { CheckCircle2, Loader2, Save, TriangleAlert } from 'lucide-react';
import type { AutoSaveStatus } from '@/lib/course-builder-v2/autosave';

interface BuilderAutosaveBadgeProps {
  status: AutoSaveStatus;
  lastSavedAt: string | null;
}

function getStatusCopy(status: AutoSaveStatus): string {
  if (status === 'saving') return 'Saving...';
  if (status === 'unsaved') return 'Unsaved changes';
  if (status === 'error') return 'Save failed';
  return 'Saved';
}

function StatusIcon({ status }: { status: AutoSaveStatus }) {
  if (status === 'saving') return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
  if (status === 'unsaved') return <Save className="h-4 w-4 text-amber-600" />;
  if (status === 'error') return <TriangleAlert className="h-4 w-4 text-red-600" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
}

export function BuilderAutosaveBadge({ status, lastSavedAt }: BuilderAutosaveBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-1 text-xs">
      <StatusIcon status={status} />
      <span>{getStatusCopy(status)}</span>
      {lastSavedAt && status === 'saved' && (
        <span className="text-muted-foreground">
          {new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(lastSavedAt))}
        </span>
      )}
    </div>
  );
}

