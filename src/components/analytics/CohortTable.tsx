'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Users, Calendar } from 'lucide-react';

interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
  avgCompletionRate: number;
  avgRevenue: number;
}

interface CohortTableProps {
  tenantId?: string;
  className?: string;
}

function getRetentionColor(rate: number): string {
  if (rate >= 80) return 'bg-green-500/80';
  if (rate >= 60) return 'bg-green-500/60';
  if (rate >= 40) return 'bg-yellow-500/60';
  if (rate >= 20) return 'bg-orange-500/60';
  return 'bg-red-500/40';
}

export function CohortTable({ tenantId, className }: CohortTableProps) {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState('6');

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ months });
      if (tenantId) params.set('tenantId', tenantId);

      const response = await fetch(`/api/analytics/cohort?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCohorts(data.cohorts || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId, months]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  const maxRetentionMonths = Math.max(...cohorts.map((c) => c.retention.length), 0);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cohort Analysis
            </CardTitle>
            <CardDescription>User retention by signup month</CardDescription>
          </div>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : cohorts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No cohort data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-sm">Cohort</th>
                  <th className="text-right py-2 px-2 font-medium text-sm">Size</th>
                  {Array.from({ length: maxRetentionMonths }).map((_, i) => (
                    <th
                      key={i}
                      className="text-center py-2 px-2 font-medium text-sm min-w-[60px]"
                    >
                      M{i}
                    </th>
                  ))}
                  <th className="text-right py-2 px-2 font-medium text-sm">Completion</th>
                  <th className="text-right py-2 px-2 font-medium text-sm">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium text-sm">{cohort.cohort}</td>
                    <td className="py-2 px-2 text-right text-sm text-muted-foreground">
                      {cohort.size.toLocaleString()}
                    </td>
                    {Array.from({ length: maxRetentionMonths }).map((_, i) => {
                      const rate = cohort.retention[i];
                      return (
                        <td key={i} className="py-2 px-2 text-center">
                          {rate !== undefined ? (
                            <div
                              className={cn(
                                'inline-block min-w-[50px] px-2 py-1 rounded text-xs font-medium',
                                getRetentionColor(rate)
                              )}
                            >
                              {rate}%
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2 px-2 text-right text-sm">
                      {cohort.avgCompletionRate}%
                    </td>
                    <td className="py-2 px-2 text-right text-sm">
                      ${cohort.avgRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {cohorts.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Retention Rate Legend:</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: '80%+', color: 'bg-green-500/80' },
                { label: '60-79%', color: 'bg-green-500/60' },
                { label: '40-59%', color: 'bg-yellow-500/60' },
                { label: '20-39%', color: 'bg-orange-500/60' },
                { label: '<20%', color: 'bg-red-500/40' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={cn('w-4 h-4 rounded', item.color)} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
