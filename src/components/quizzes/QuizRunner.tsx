'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Quiz } from '@/lib/quizzes';
import type { QuizAttempt } from '@/lib/quizAttempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface QuizRunnerProps {
  quiz: Quiz;
  attempts: QuizAttempt[];
}

type ViewState = 'intro' | 'in-progress' | 'results';

type ResponseState = Record<string, unknown>;

function formatDuration(seconds: number | null) {
  if (seconds === null) return '—';
  const clamped = Math.max(seconds, 0);
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>{current} of {total} answered</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function QuizRunner({ quiz, attempts }: QuizRunnerProps) {
  const [attemptHistory, setAttemptHistory] = useState<QuizAttempt[]>(attempts);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(
    attempts.find((attempt) => attempt.status === 'inProgress') || null
  );
  const [view, setView] = useState<ViewState>(currentAttempt ? 'in-progress' : 'intro');
  const [responses, setResponses] = useState<ResponseState>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const completedAttempts = useMemo(
    () => attemptHistory.filter((attempt) => attempt.status !== 'inProgress').length,
    [attemptHistory]
  );
  const retakesAvailable =
    quiz.retakes < 0 || completedAttempts < quiz.retakes || Boolean(currentAttempt);

  useEffect(() => {
    if (!currentAttempt) {
      setResponses({});
      setTimeLeft(null);
      return;
    }

    const initial = currentAttempt.questions.reduce<ResponseState>((acc, question) => {
      if (question.response !== undefined && question.response !== null) {
        acc[question.questionId] = question.response;
      }
      return acc;
    }, {});
    setResponses(initial);

    if (!quiz.timeLimit || currentAttempt.status !== 'inProgress') {
      setTimeLeft(null);
      return;
    }

    const totalSeconds = quiz.timeLimit * 60;
    const startedAt = new Date(currentAttempt.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    setTimeLeft(Math.max(totalSeconds - elapsed, 0));

    const interval = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = totalSeconds - secondsElapsed;
      setTimeLeft(Math.max(remaining, 0));
      if (remaining <= 0 && !autoSubmitting) {
        setAutoSubmitting(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentAttempt, quiz.timeLimit, autoSubmitting]);

  const startAttempt = async () => {
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'Unable to start quiz');
        return;
      }
      setCurrentAttempt(data.doc);
      setView('in-progress');
    } catch (error) {
      console.error(error);
      setErrorMessage('Unable to start quiz');
    } finally {
      setIsStarting(false);
      setAutoSubmitting(false);
    }
  };

  const updateResponse = (questionId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Auto-save functionality - debounced save when responses change
  const saveProgress = useCallback(async () => {
    if (!currentAttempt || currentAttempt.status !== 'inProgress' || Object.keys(responses).length === 0) return;

    setIsSaving(true);
    try {
      // Save progress to localStorage to preserve answers across page refreshes
      if (typeof window !== 'undefined') {
        localStorage.setItem(`quiz-progress-${currentAttempt.id}`, JSON.stringify({
          responses,
          timestamp: new Date().toISOString(),
        }));
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentAttempt, responses]);

  // Debounced auto-save when responses change
  useEffect(() => {
    if (!currentAttempt || currentAttempt.status !== 'inProgress') return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000); // Save 2 seconds after last change

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [responses, currentAttempt, saveProgress]);

  // Load saved progress on mount
  const currentAttemptId = currentAttempt?.id;
  const currentAttemptStatus = currentAttempt?.status;

  useEffect(() => {
    if (!currentAttemptId || currentAttemptStatus !== 'inProgress') return;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`quiz-progress-${currentAttemptId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.responses && Object.keys(parsed.responses).length > 0) {
            setResponses((prev) => ({ ...prev, ...parsed.responses }));
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [currentAttemptId, currentAttemptStatus]);

  // Clean up saved progress after submission
  useEffect(() => {
    if (currentAttemptId && currentAttemptStatus !== 'inProgress' && typeof window !== 'undefined') {
      localStorage.removeItem(`quiz-progress-${currentAttemptId}`);
    }
  }, [currentAttemptId, currentAttemptStatus]);

  // Scroll to question when navigating
  const scrollToQuestion = (index: number) => {
    setActiveQuestionIndex(index);
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Calculate answered questions count
  const answeredCount = useMemo(() => {
    if (!currentAttempt) return 0;
    return currentAttempt.questions.filter((q) => {
      const response = responses[q.questionId];
      if (response === null || response === undefined) return false;
      if (typeof response === 'string' && response.trim() === '') return false;
      if (typeof response === 'object' && Object.keys(response as object).length === 0) return false;
      return true;
    }).length;
  }, [currentAttempt, responses]);

  const handleSubmit = useCallback(
    async () => {
      if (!currentAttempt) return;
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const answers = currentAttempt.questions.map((question) => ({
          questionId: question.questionId,
          response: responses[question.questionId] ?? (question.questionType === 'matching' ? {} : null),
        }));

        const response = await fetch(`/api/quizzes/${quiz.id}/attempts/${currentAttempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });
        const data = await response.json();
        if (!response.ok) {
          setErrorMessage(data.error || 'Failed to submit quiz');
          return;
        }

        setCurrentAttempt(data.doc);
        setAttemptHistory((prev) => [data.doc, ...prev.filter((attempt) => attempt.id !== data.doc.id)]);
        setView('results');
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to submit quiz');
      } finally {
        setIsSubmitting(false);
        setAutoSubmitting(false);
      }
    },
    [currentAttempt, quiz.id, responses]
  );

  useEffect(() => {
    if (autoSubmitting && currentAttempt && !isSubmitting) {
      void handleSubmit();
    }
  }, [autoSubmitting, currentAttempt, isSubmitting, handleSubmit]);

  const restart = () => {
    setCurrentAttempt(null);
    setView('intro');
    setResponses({});
  };

  const renderQuestionInput = (question: QuizAttempt['questions'][number]) => {
    const value = responses[question.questionId];
    switch (question.questionType) {
      case 'multipleChoice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={question.questionId}
                  value={option.id}
                  checked={value === option.id}
                  onChange={(event) => updateResponse(question.questionId, event.target.value)}
                  disabled={view !== 'in-progress'}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        );
      case 'trueFalse':
        return (
          <div className="flex gap-4">
            {(['true', 'false'] as const).map((choice) => (
              <label key={choice} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={question.questionId}
                  value={choice}
                  checked={value === choice}
                  onChange={(event) => updateResponse(question.questionId, event.target.value)}
                  disabled={view !== 'in-progress'}
                />
                {choice === 'true' ? 'True' : 'False'}
              </label>
            ))}
          </div>
        );
      case 'shortAnswer':
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => updateResponse(question.questionId, event.target.value)}
            disabled={view !== 'in-progress'}
          />
        );
      case 'matching': {
        const existing = (value as Record<string, string>) || {};
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const optionId = option.id || `${question.questionId}-${index}`;
              return (
                <div key={optionId} className="grid gap-2 md:grid-cols-2">
                  <div className="text-sm font-medium">{option.text}</div>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={existing[optionId] || ''}
                    onChange={(event) =>
                      updateResponse(question.questionId, {
                        ...existing,
                        [optionId]: event.target.value,
                      })
                    }
                    disabled={view !== 'in-progress'}
                  >
                    <option value="">Select match</option>
                    {question.matchOptions?.map((choice) => (
                      <option key={`${option.id}-${choice}`} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!currentAttempt) return null;
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-6 grid gap-4 md:grid-cols-3 text-center">
            <div>
              <p className="text-muted-foreground text-sm">Score</p>
              <p className="text-3xl font-bold">{currentAttempt.percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Status</p>
              <p className={`text-2xl font-bold ${currentAttempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentAttempt.passed ? 'Passed' : 'Not Passed'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Time Spent</p>
              <p className="text-2xl font-bold">
                {currentAttempt.durationSeconds ? `${Math.round(currentAttempt.durationSeconds / 60)} min` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {currentAttempt.questions.map((question, index) => (
            <Card key={question.questionId}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Question {index + 1}</p>
                    <p className="font-medium">{question.prompt}</p>
                  </div>
                  {question.isCorrect ? (
                    <span className="text-emerald-600 text-sm font-semibold">Correct</span>
                  ) : (
                    <span className="text-red-500 text-sm font-semibold">Incorrect</span>
                  )}
                </div>
                {question.correctAnswer !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Correct answer: {JSON.stringify(question.correctAnswer)}
                  </p>
                )}
                {question.explanation && (
                  <p className="text-sm">{question.explanation}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderIntro = () => (
    <Card>
      <CardContent className="py-6 space-y-4">
        {quiz.instructions && <p className="text-sm text-muted-foreground">{quiz.instructions}</p>}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Passing Score</p>
            <p className="text-2xl font-semibold">{quiz.passingScore}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time Limit</p>
            <p className="text-2xl font-semibold">{quiz.timeLimit ? `${quiz.timeLimit} min` : 'Untimed'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attempts</p>
            <p className="text-2xl font-semibold">
              {quiz.retakes < 0 ? 'Unlimited' : `${completedAttempts}/${quiz.retakes}`}
            </p>
          </div>
        </div>
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {!retakesAvailable && quiz.retakes >= 0 && (
          <p className="text-sm text-red-500">
            You have reached the maximum number of attempts allowed for this quiz.
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={startAttempt} disabled={isStarting || (!retakesAvailable && !currentAttempt)}>
            {currentAttempt ? 'Resume Attempt' : 'Start Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderInProgress = () => {
    if (!currentAttempt) return null;
    const totalQuestions = currentAttempt.questions.length;

    return (
      <div className="space-y-4">
        {/* Header with timer and progress */}
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Time Remaining</span>
                  </div>
                  <p className={`text-2xl font-bold ${timeLeft !== null && timeLeft < 300 ? 'text-red-500' : ''}`}>
                    {formatDuration(timeLeft)}
                  </p>
                </div>
                {/* Auto-save indicator */}
                <div className="text-sm text-muted-foreground">
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-pulse">Saving...</span>
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>Progress saved</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <Button variant="destructive" onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
            {/* Progress bar */}
            <ProgressBar current={answeredCount} total={totalQuestions} />
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">Questions:</span>
              {currentAttempt.questions.map((question, index) => {
                const response = responses[question.questionId];
                const isAnswered = response !== null && response !== undefined &&
                  !(typeof response === 'string' && response.trim() === '') &&
                  !(typeof response === 'object' && Object.keys(response as object).length === 0);

                return (
                  <button
                    key={question.questionId}
                    type="button"
                    onClick={() => scrollToQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
                      activeQuestionIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isAnswered ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        {/* Questions */}
        {currentAttempt.questions.map((question, index) => (
          <Card
            key={question.questionId}
            ref={(el) => { questionRefs.current[index] = el; }}
            className={activeQuestionIndex === index ? 'ring-2 ring-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm">
                  {index + 1}
                </span>
                {question.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderQuestionInput(question)}</CardContent>
          </Card>
        ))}

        {/* Bottom navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => scrollToQuestion(Math.max(0, activeQuestionIndex - 1))}
            disabled={activeQuestionIndex === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {activeQuestionIndex + 1} of {totalQuestions}
          </span>
          {activeQuestionIndex < totalQuestions - 1 ? (
            <Button
              variant="outline"
              onClick={() => scrollToQuestion(activeQuestionIndex + 1)}
            >
              Next
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => void handleSubmit()} disabled={isSubmitting}>
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {view === 'intro' && renderIntro()}
      {view === 'in-progress' && renderInProgress()}
      {view === 'results' && renderResults()}

      <div id="history" className="space-y-3">
        <h2 className="text-xl font-semibold">Attempt History</h2>
        {attemptHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have not taken this quiz yet.</p>
        ) : (
          attemptHistory.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {attempt.status === 'inProgress'
                      ? 'In progress'
                      : `${attempt.percentage.toFixed(1)}% · ${attempt.passed ? 'Passed' : 'Not Passed'}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(attempt.startedAt).toLocaleString()}
                  </p>
                </div>
                {attempt.status === 'completed' && quiz.allowReview && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setCurrentAttempt(attempt);
                    setView('results');
                  }}>
                    Review
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {view === 'results' && retakesAvailable && (
        <div className="flex gap-2">
          <Button onClick={startAttempt} disabled={isStarting}>
            Retake Quiz
          </Button>
          <Button variant="outline" onClick={restart}>
            Back to Overview
          </Button>
        </div>
      )}
    </div>
  );
}
