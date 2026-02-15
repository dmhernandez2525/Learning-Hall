'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Assignment } from '@/types/assignments';

interface SubmissionFormProps {
  assignment: Assignment;
  onSubmitted?: () => void;
}

export function SubmissionForm({ assignment, onSubmitted }: SubmissionFormProps) {
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to submit');
        return;
      }

      setSuccess(true);
      setContent('');
      setLinkUrl('');
      onSubmitted?.();
    } catch {
      setError('Network error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  }, [assignment.id, content, linkUrl, onSubmitted]);

  const isPastDue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
  const canSubmitLate = assignment.allowLateSubmission;

  return (
    <div className="rounded-md border p-4 space-y-3">
      <h4 className="text-sm font-medium">Submit Assignment</h4>

      {isPastDue && !canSubmitLate ? (
        <p className="text-sm text-destructive">This assignment is past due and late submissions are not accepted.</p>
      ) : (
        <>
          {isPastDue && canSubmitLate ? (
            <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
              This assignment is past due. A {assignment.latePenaltyPercent}% late penalty will apply.
            </p>
          ) : null}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {success ? <p className="text-xs text-green-600">Assignment submitted successfully.</p> : null}

          {assignment.submissionTypes.includes('text') ? (
            <div>
              <label className="text-xs text-muted-foreground">Response</label>
              <textarea
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your response..."
              />
            </div>
          ) : null}

          {assignment.submissionTypes.includes('url') ? (
            <div>
              <label className="text-xs text-muted-foreground">Link URL</label>
              <input
                type="url"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          ) : null}

          <Button
            size="sm"
            disabled={isSubmitting || (!content.trim() && !linkUrl.trim())}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      )}
    </div>
  );
}
