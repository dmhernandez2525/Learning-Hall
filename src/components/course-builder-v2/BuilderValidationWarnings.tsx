'use client';

import { AlertCircle, CircleCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BuilderPublishWarning } from '@/lib/course-builder-v2';

interface BuilderValidationWarningsProps {
  warnings: BuilderPublishWarning[];
}

export function BuilderValidationWarnings({ warnings }: BuilderValidationWarningsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Publish Validation</CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CircleCheck className="h-4 w-4" />
            No blocking issues found.
          </div>
        ) : (
          <ul className="space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning.id}
                className={`rounded-md border p-2 text-sm ${
                  warning.severity === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {warning.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

