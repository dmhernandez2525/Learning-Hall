'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BuilderTemplate } from '@/lib/course-builder-v2';

interface BuilderTemplatePickerProps {
  templates: BuilderTemplate[];
  disabled: boolean;
  onApplyTemplate: (templateId: string) => void;
}

export function BuilderTemplatePicker({
  templates,
  disabled,
  onApplyTemplate,
}: BuilderTemplatePickerProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lesson Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {templates.map((template) => (
          <div key={template.id} className="rounded-md border p-3">
            <p className="text-sm font-medium">{template.label}</p>
            <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onApplyTemplate(template.id)}
            >
              Use Template
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

