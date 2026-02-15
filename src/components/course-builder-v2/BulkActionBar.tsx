'use client';

import { Copy, MoveRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModuleOption {
  id: string;
  title: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  moduleOptions: ModuleOption[];
  moveTargetModuleId: string;
  disabled: boolean;
  onChangeMoveTarget: (moduleId: string) => void;
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  moduleOptions,
  moveTargetModuleId,
  disabled,
  onChangeMoveTarget,
  onMove,
  onCopy,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="rounded-md border bg-slate-50 px-3 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">{selectedCount} lessons selected</p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={moveTargetModuleId} onValueChange={onChangeMoveTarget}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Move to module" />
          </SelectTrigger>
          <SelectContent>
            {moduleOptions.map((moduleOption) => (
              <SelectItem key={moduleOption.id} value={moduleOption.id}>
                {moduleOption.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" disabled={disabled} onClick={onMove}>
          <MoveRight className="h-4 w-4 mr-1" />
          Move
        </Button>
        <Button size="sm" variant="outline" disabled={disabled} onClick={onCopy}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button size="sm" variant="destructive" disabled={disabled} onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

