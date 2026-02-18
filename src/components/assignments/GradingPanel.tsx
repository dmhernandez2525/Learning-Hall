'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Assignment, AssignmentSubmission, RubricScore } from '@/types/assignments';

interface GradingPanelProps {
  assignment: Assignment;
}

function SubmissionRow({
  submission,
  assignment,
  onGraded,
}: {
  submission: AssignmentSubmission;
  assignment: Assignment;
  onGraded: () => void;
}) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  const handleGrade = useCallback(async () => {
    setIsGrading(true);
    try {
      const rubricScores: RubricScore[] = assignment.rubric.map((c) => ({
        criterionId: c.criterionId,
        score: scores[c.criterionId] ?? 0,
        comment: '',
      }));

      const response = await fetch(
        `/api/assignments/${assignment.id}/submissions/${submission.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: totalScore,
            feedback: feedback.trim(),
            rubricScores,
          }),
        }
      );

      if (response.ok) {
        onGraded();
      }
    } finally {
      setIsGrading(false);
    }
  }, [assignment, submission.id, scores, totalScore, feedback, onGraded]);

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Student: {submission.studentId.slice(0, 8)}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {submission.status === 'graded' ? `Score: ${submission.score}` : submission.status}
            {submission.isLate ? ' (Late)' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {submission.content ? (
          <div className="rounded bg-muted/30 p-2 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
            {submission.content}
          </div>
        ) : null}

        {submission.linkUrl ? (
          <a href={submission.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
            View submitted link
          </a>
        ) : null}

        {submission.status !== 'graded' && assignment.rubric.length > 0 ? (
          <div className="space-y-1.5">
            {assignment.rubric.map((criterion) => (
              <div key={criterion.criterionId} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{criterion.title} (max {criterion.maxPoints})</span>
                <input
                  type="number"
                  className="w-16 rounded-md border bg-background px-2 py-1 text-sm"
                  min={0}
                  max={criterion.maxPoints}
                  value={scores[criterion.criterionId] ?? ''}
                  onChange={(event) => setScores((prev) => ({
                    ...prev,
                    [criterion.criterionId]: Math.min(Number(event.target.value), criterion.maxPoints),
                  }))}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="flex-1 font-medium text-sm">Total: {totalScore}</span>
            </div>
          </div>
        ) : null}

        {submission.status !== 'graded' ? (
          <>
            <textarea
              className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              rows={2}
              placeholder="Feedback..."
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
            <Button size="sm" disabled={isGrading} onClick={() => void handleGrade()}>
              {isGrading ? 'Grading...' : 'Submit Grade'}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GradingPanel({ assignment }: GradingPanelProps) {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/submissions`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: AssignmentSubmission[] };
      setSubmissions(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [assignment.id]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading submissions...</p>;
  }

  const pending = submissions.filter((s) => s.status === 'submitted');
  const graded = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">
        Grading: {assignment.title} ({pending.length} pending, {graded.length} graded)
      </h4>

      {pending.length === 0 && graded.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : null}

      {pending.map((sub) => (
        <SubmissionRow
          key={sub.id}
          submission={sub}
          assignment={assignment}
          onGraded={() => void fetchSubmissions()}
        />
      ))}

      {graded.length > 0 ? (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Graded</h5>
          {graded.map((sub) => (
            <SubmissionRow
              key={sub.id}
              submission={sub}
              assignment={assignment}
              onGraded={() => void fetchSubmissions()}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
