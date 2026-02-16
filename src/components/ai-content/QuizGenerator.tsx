'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GeneratedQuiz } from '@/types/ai-content';

const difficultyColors: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export function QuizGenerator() {
  const [quizzes, setQuizzes] = useState<GeneratedQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/ai-content/quizzes');
    if (res.ok) {
      const data = await res.json();
      setQuizzes(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchQuizzes();
  }, [fetchQuizzes]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading quizzes...</p>;

  if (quizzes.length === 0) {
    return <p className="text-sm text-muted-foreground">No generated quizzes yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Generated Quizzes</h2>
      <div className="space-y-2">
        {quizzes.map((q) => (
          <div key={q.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{q.title}</h3>
              <p className="text-xs text-muted-foreground">
                {q.questions.length} questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: difficultyColors[q.difficulty] ?? '#6b7280' }}
              >
                {q.difficulty}
              </span>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs">{q.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
