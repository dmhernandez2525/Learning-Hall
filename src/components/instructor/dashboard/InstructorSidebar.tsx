'use client';

import Link from 'next/link';
import { Download, Filter, WandSparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DashboardQuickAction, DashboardRangeKey } from '@/lib/instructor-dashboard/types';

interface InstructorSidebarProps {
  selectedRange: DashboardRangeKey;
  quickActions: DashboardQuickAction[];
  isExporting: boolean;
  onRangeChange: (value: DashboardRangeKey) => void;
  onExport: () => void;
}

const rangeOptions: Array<{ value: DashboardRangeKey; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last 12 months' },
];

export function InstructorSidebar({
  selectedRange,
  quickActions,
  isExporting,
  onRangeChange,
  onExport,
}: InstructorSidebarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Date Range
          </CardTitle>
          <CardDescription>Filter all charts and metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedRange}
            onValueChange={(value) => onRangeChange(value as DashboardRangeKey)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {rangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <WandSparkles className="h-4 w-4" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used instructor workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => {
            if (action.type === 'export') {
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={onExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            }

            return (
              <Button
                asChild
                key={action.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
              >
                <Link href={action.href ?? '/dashboard'}>
                  <div className="text-left">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

