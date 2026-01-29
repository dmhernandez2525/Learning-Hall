'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  FileQuestion,
  Clock,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface ModuleCompletion {
  moduleId: string;
  title: string;
  completionRate: number;
}

interface QuizPerformance {
  quizId: string;
  title: string;
  avgScore: number;
  passRate: number;
  attempts: number;
}

interface TimeToComplete {
  courseId: string;
  title: string;
  avgDays: number;
  medianDays: number;
}

interface DropoffPoint {
  lessonId: string;
  title: string;
  dropoffRate: number;
  position: number;
}

interface LearningAnalytics {
  completionsByModule: ModuleCompletion[];
  quizPerformance: QuizPerformance[];
  timeToComplete: TimeToComplete[];
  dropoffPoints: DropoffPoint[];
}

interface LearningMetricsProps {
  tenantId?: string;
  courseId?: string;
  className?: string;
}

function getScoreBadge(score: number) {
  if (score >= 90) {
    return (
      <Badge variant="default" className="bg-green-500">
        Excellent
      </Badge>
    );
  }
  if (score >= 70) {
    return <Badge variant="secondary">Good</Badge>;
  }
  if (score >= 50) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        Needs Work
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">Low</Badge>
  );
}

export function LearningMetrics({
  tenantId,
  courseId,
  className,
}: LearningMetricsProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tenantId) params.set('tenantId', tenantId);
      if (courseId) params.set('courseId', courseId);

      const response = await fetch(`/api/analytics/learning?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId, courseId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Module Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Module Completion Rates
          </CardTitle>
          <CardDescription>Completion percentage by module</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : analytics?.completionsByModule &&
            analytics.completionsByModule.length > 0 ? (
            <div className="space-y-4">
              {analytics.completionsByModule.map((module) => (
                <div key={module.moduleId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate flex-1 mr-4">
                      {module.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {module.completionRate}%
                    </span>
                  </div>
                  <Progress value={module.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No module data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Quiz Performance
          </CardTitle>
          <CardDescription>Average scores and pass rates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : analytics?.quizPerformance && analytics.quizPerformance.length > 0 ? (
            <div className="space-y-3">
              {analytics.quizPerformance.map((quiz) => (
                <div
                  key={quiz.quizId}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{quiz.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {quiz.passRate >= 70 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        {quiz.passRate}% pass rate
                      </span>
                      <span>{quiz.attempts} attempts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{quiz.avgScore}%</p>
                    {getScoreBadge(quiz.avgScore)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No quiz data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Time to Complete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time to Complete
          </CardTitle>
          <CardDescription>Average days to complete courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : analytics?.timeToComplete && analytics.timeToComplete.length > 0 ? (
            <div className="space-y-3">
              {analytics.timeToComplete.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="font-medium truncate flex-1 mr-4">
                    {course.title}
                  </span>
                  <div className="text-right">
                    <p className="font-bold">{course.avgDays} days avg</p>
                    <p className="text-xs text-muted-foreground">
                      {course.medianDays} days median
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No completion data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dropoff Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Dropoff Points
          </CardTitle>
          <CardDescription>Lessons with highest abandonment rates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : analytics?.dropoffPoints && analytics.dropoffPoints.length > 0 ? (
            <div className="space-y-2">
              {analytics.dropoffPoints.map((point) => (
                <div
                  key={point.lessonId}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{point.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Position: #{point.position}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">{point.dropoffRate}% dropoff</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No dropoff data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
