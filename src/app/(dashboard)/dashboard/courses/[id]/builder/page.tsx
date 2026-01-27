'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageProps = {
  params: Promise<{ id: string }>;
};

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  position: number;
  contentType: 'video' | 'text' | 'quiz' | 'assignment';
  isPreview?: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  position: number;
  lessons?: Lesson[];
}

interface QuizMetadata {
  questionCount?: number;
  averageScore?: number;
  attemptCount?: number;
  passRate?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  status: 'draft' | 'published';
  passingScore: number;
  timeLimit?: number;
  retakes: number;
  randomizeQuestions: boolean;
  shuffleAnswers: boolean;
  questionsPerAttempt?: number;
  showExplanations: boolean;
  allowReview: boolean;
  metadata?: QuizMetadata;
}

interface QuizQuestionOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
  match?: string;
}

interface QuizQuestion {
  id: string;
  quiz: string;
  questionText: string;
  questionType: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points: number;
  options?: QuizQuestionOption[];
  trueFalseAnswer?: 'true' | 'false';
  shortAnswer?: string;
  explanation?: string;
}

interface QuizAnalyticsQuestion {
  questionId: string;
  prompt: string;
  correctRate: number;
  averageScore: number;
}

interface QuizAnalytics {
  quizId: string;
  attemptCount: number;
  averageScore: number;
  passRate: number;
  averageDuration: number;
  questionStats: QuizAnalyticsQuestion[];
}

interface QuestionDraft {
  questionText: string;
  questionType: QuizQuestion['questionType'];
  difficulty: QuizQuestion['difficulty'];
  tags: string;
  points: number;
  options: QuizQuestionOption[];
  trueFalseAnswer?: 'true' | 'false';
  shortAnswer?: string;
  explanation?: string;
}

const createEmptyQuestionDraft = (): QuestionDraft => ({
  questionText: '',
  questionType: 'multipleChoice',
  difficulty: 'medium',
  tags: '',
  points: 1,
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  trueFalseAnswer: 'true',
  shortAnswer: '',
  explanation: '',
});

export default function CourseBuilderPage({ params }: PageProps) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes'>('modules');

  // Quiz management state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizFormError, setQuizFormError] = useState<string | null>(null);
  const [questionManagerQuiz, setQuestionManagerQuiz] = useState<Quiz | null>(null);
  const [questionBank, setQuestionBank] = useState<Record<string, QuizQuestion[]>>({});
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [questionFormState, setQuestionFormState] = useState<{
    quizId: string;
    question: QuizQuestion | null;
  } | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>(createEmptyQuestionDraft());
  const [questionFormError, setQuestionFormError] = useState<string | null>(null);
  const [analyticsQuiz, setAnalyticsQuiz] = useState<Quiz | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Record<string, QuizAnalytics | null>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Modal states
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson | null;
    moduleId: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, modulesRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/modules?courseId=${id}`),
        fetch(`/api/quizzes?courseId=${id}`),
      ]);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData.doc);
      } else {
        setError('Course not found');
        return;
      }

      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.docs || []);
        setExpandedModules(new Set(modulesData.docs.map((m: Module) => m.id)));
      }
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData.docs || []);
      }
    } catch {
      setError('Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!questionFormState) {
      setQuestionDraft(createEmptyQuestionDraft());
      return;
    }

    const question = questionFormState.question;
    if (!question) {
      setQuestionDraft(createEmptyQuestionDraft());
      return;
    }

    const mappedOptions =
      question.options && question.options.length > 0
        ? question.options.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
            match: option.match,
          }))
        : createEmptyQuestionDraft().options;

    setQuestionDraft({
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
      tags: question.tags?.join(', ') || '',
      points: question.points,
      options: mappedOptions,
      trueFalseAnswer: question.trueFalseAnswer,
      shortAnswer: question.shortAnswer,
      explanation: question.explanation,
    });
  }, [questionFormState]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) {
      return;
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete module');
      }
    } catch {
      setError('Failed to delete module');
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setEditingLesson({ lesson: null, moduleId });
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons?.filter((l) => l.id !== lessonId) }
              : m
          )
        );
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete lesson');
      }
    } catch {
      setError('Failed to delete lesson');
    }
  };

  const handleModuleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    try {
      if (editingModule) {
        const response = await fetch(`/api/modules/${editingModule.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });

        if (response.ok) {
          const data = await response.json();
          setModules((prev) =>
            prev.map((m) => (m.id === editingModule.id ? data.doc : m))
          );
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to update module');
          return;
        }
      } else {
        const response = await fetch('/api/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, courseId: id }),
        });

        if (response.ok) {
          const data = await response.json();
          setModules((prev) => [...prev, data.doc]);
          setExpandedModules((prev) => new Set([...prev, data.doc.id]));
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to create module');
          return;
        }
      }

      setShowModuleForm(false);
      setEditingModule(null);
    } catch {
      setError('Failed to save module');
    }
  };

  const handleLessonSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingLesson) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const contentType = formData.get('contentType') as Lesson['contentType'];
    const isPreview = formData.get('isPreview') === 'on';

    try {
      if (editingLesson.lesson) {
        const response = await fetch(`/api/lessons/${editingLesson.lesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, contentType, isPreview }),
        });

        if (response.ok) {
          const data = await response.json();
          setModules((prev) =>
            prev.map((m) =>
              m.id === editingLesson.moduleId
                ? {
                    ...m,
                    lessons: m.lessons?.map((l) =>
                      l.id === editingLesson.lesson?.id ? data.doc : l
                    ),
                  }
                : m
            )
          );
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to update lesson');
          return;
        }
      } else {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            contentType,
            isPreview,
            moduleId: editingLesson.moduleId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setModules((prev) =>
            prev.map((m) =>
              m.id === editingLesson.moduleId
                ? { ...m, lessons: [...(m.lessons || []), data.doc] }
                : m
            )
          );
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to create lesson');
          return;
        }
      }

      setShowLessonForm(false);
      setEditingLesson(null);
    } catch {
      setError('Failed to save lesson');
    }
  };

  const openQuizForm = (quiz?: Quiz) => {
    setEditingQuiz(quiz ?? null);
    setQuizFormError(null);
    setShowQuizForm(true);
  };

  const handleQuizSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get('title') || ''),
      description: (formData.get('description') as string) || undefined,
      instructions: (formData.get('instructions') as string) || undefined,
      status: (formData.get('status') as 'draft' | 'published') || 'draft',
      passingScore: Number(formData.get('passingScore') || 70),
      timeLimit: formData.get('timeLimit') ? Number(formData.get('timeLimit')) : undefined,
      retakes: formData.get('retakes') ? Number(formData.get('retakes')) : -1,
      randomizeQuestions: formData.get('randomizeQuestions') === 'on',
      shuffleAnswers: formData.get('shuffleAnswers') === 'on',
      questionsPerAttempt: formData.get('questionsPerAttempt')
        ? Number(formData.get('questionsPerAttempt'))
        : undefined,
      showExplanations: formData.get('showExplanations') === 'on',
      allowReview: formData.get('allowReview') === 'on',
    };

    const body = editingQuiz
      ? payload
      : {
          ...payload,
          courseId: id,
        };

    try {
      const response = await fetch(editingQuiz ? `/api/quizzes/${editingQuiz.id}` : '/api/quizzes', {
        method: editingQuiz ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setQuizFormError(data.error || 'Failed to save quiz');
        return;
      }

      const data = await response.json();
      const savedQuiz = data.doc as Quiz;
      setQuizzes((prev) =>
        editingQuiz
          ? prev.map((quiz) => (quiz.id === savedQuiz.id ? savedQuiz : quiz))
          : [...prev, savedQuiz]
      );
      setShowQuizForm(false);
      setEditingQuiz(null);
      setQuizFormError(null);
      event.currentTarget.reset();
    } catch {
      setQuizFormError('Failed to save quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz? Learners will no longer be able to take it.')) return;

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete quiz');
        return;
      }

      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
    } catch {
      setError('Failed to delete quiz');
    }
  };

  const loadQuestions = async (quizId: string) => {
    setIsQuestionsLoading(true);
    setQuestionFormError(null);
    try {
      const response = await fetch(`/api/questions?quizId=${quizId}`);
      if (!response.ok) {
        const data = await response.json();
        setQuestionFormError(data.error || 'Failed to load questions');
        return;
      }
      const data = await response.json();
      setQuestionBank((prev) => ({ ...prev, [quizId]: data.docs }));
    } catch {
      setQuestionFormError('Failed to load questions');
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const openQuestionManager = (quiz: Quiz) => {
    setQuestionManagerQuiz(quiz);
    setQuestionFormState(null);
    loadQuestions(quiz.id);
  };

  const openQuestionForm = (quizId: string, question?: QuizQuestion) => {
    setQuestionFormState({ quizId, question: question ?? null });
    setQuestionFormError(null);
  };

  const handleQuestionDraftChange = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) => {
    setQuestionDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleQuestionTypeChange = (type: QuizQuestion['questionType']) => {
    setQuestionDraft((prev) => ({
      ...prev,
      questionType: type,
      options:
        type === 'multipleChoice' || type === 'matching'
          ? prev.options.length > 0
            ? prev.options
            : createEmptyQuestionDraft().options
          : [],
      trueFalseAnswer: type === 'trueFalse' ? prev.trueFalseAnswer || 'true' : undefined,
      shortAnswer: type === 'shortAnswer' ? prev.shortAnswer || '' : undefined,
    }));
  };

  const updateQuestionOption = (index: number, updates: Partial<QuizQuestionOption>) => {
    setQuestionDraft((prev) => {
      const options = prev.options.map((option, idx) => (idx === index ? { ...option, ...updates } : option));
      return { ...prev, options };
    });
  };

  const addQuestionOption = () => {
    setQuestionDraft((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const removeQuestionOption = (index: number) => {
    setQuestionDraft((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }));
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionFormState) return;

    const tags = questionDraft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      quiz: questionFormState.quizId,
      questionText: questionDraft.questionText,
      questionType: questionDraft.questionType,
      difficulty: questionDraft.difficulty,
      tags: tags.length ? tags : undefined,
      points: questionDraft.points,
      options:
        questionDraft.questionType === 'multipleChoice' || questionDraft.questionType === 'matching'
          ? questionDraft.options.filter((option) => option.text.trim().length > 0)
          : undefined,
      trueFalseAnswer: questionDraft.questionType === 'trueFalse' ? questionDraft.trueFalseAnswer : undefined,
      shortAnswer: questionDraft.questionType === 'shortAnswer' ? questionDraft.shortAnswer : undefined,
      explanation: questionDraft.explanation,
    };

    try {
      const response = await fetch(
        questionFormState.question ? `/api/questions/${questionFormState.question.id}` : '/api/questions',
        {
          method: questionFormState.question ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setQuestionFormError(data.error || 'Failed to save question');
        return;
      }

      const data = await response.json();
      const savedQuestion = data.doc as QuizQuestion;
      setQuestionBank((prev) => {
        const current = prev[questionFormState.quizId] || [];
        const next = questionFormState.question
          ? current.map((question) => (question.id === savedQuestion.id ? savedQuestion : question))
          : [...current, savedQuestion];
        return { ...prev, [questionFormState.quizId]: next };
      });
      setQuestionFormState(null);
      setQuestionFormError(null);
    } catch {
      setQuestionFormError('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (question: QuizQuestion) => {
    if (!confirm('Delete this question?')) return;
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setQuestionFormError(data.error || 'Failed to delete question');
        return;
      }

      setQuestionBank((prev) => {
        const current = prev[question.quiz] || [];
        return { ...prev, [question.quiz]: current.filter((item) => item.id !== question.id) };
      });
    } catch {
      setQuestionFormError('Failed to delete question');
    }
  };

  const openAnalyticsModal = async (quiz: Quiz) => {
    setAnalyticsQuiz(quiz);
    setAnalyticsError(null);

    if (analyticsData[quiz.id]) {
      return;
    }

    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/analytics`);
      if (!response.ok) {
        const data = await response.json();
        setAnalyticsError(data.error || 'Failed to load analytics');
        return;
      }
      const data = await response.json();
      setAnalyticsData((prev) => ({ ...prev, [quiz.id]: data.doc }));
    } catch {
      setAnalyticsError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getContentTypeIcon = (type: Lesson['contentType']) => {
    const icons = {
      video: '🎬',
      text: '📝',
      quiz: '❓',
      assignment: '📋',
    };
    return icons[type] || '📄';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Builder</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Builder</h1>
          <p className="text-red-500">{error}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Builder</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${id}`}>Back to Course</Link>
          </Button>
          {activeTab === 'modules' ? (
            <Button onClick={handleAddModule}>Add Module</Button>
          ) : (
            <Button onClick={() => openQuizForm()}>Create Quiz</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex gap-3 border-b pb-2">
        {(['modules', 'quizzes'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'modules' ? 'Modules & Lessons' : 'Quizzes & Assessments'}
          </button>
        ))}
      </div>

      {activeTab === 'modules' ? (
        <div className="space-y-4">
          {modules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  No modules yet. Add your first module to get started.
                </p>
                <Button onClick={handleAddModule}>Add First Module</Button>
              </CardContent>
            </Card>
          ) : (
            modules
              .sort((a, b) => a.position - b.position)
              .map((module) => (
                <Card key={module.id}>
                  <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {expandedModules.has(module.id) ? '▼' : '▶'}
                        </span>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditModule(module)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedModules.has(module.id) && (
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons && module.lessons.length > 0 ? (
                          module.lessons
                            .sort((a, b) => a.position - b.position)
                            .map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <span>{getContentTypeIcon(lesson.contentType)}</span>
                                  <span>{lesson.title}</span>
                                  {lesson.isPreview && (
                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLesson(lesson, module.id)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">
                            No lessons in this module yet.
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleAddLesson(module.id)}
                        >
                          Add Lesson
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-muted-foreground">
                  No quizzes yet. Create a quiz to add timed assessments with question banks.
                </p>
                <Button onClick={() => openQuizForm()}>Create First Quiz</Button>
              </CardContent>
            </Card>
          ) : (
            quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        quiz.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {quiz.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Passing Score</p>
                      <p className="text-lg font-semibold">{quiz.passingScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Limit</p>
                      <p className="text-lg font-semibold">{quiz.timeLimit ? `${quiz.timeLimit} min` : 'Untimed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Retakes</p>
                      <p className="text-lg font-semibold">
                        {quiz.retakes < 0 ? 'Unlimited' : quiz.retakes}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Question Pool</p>
                      <p className="font-medium">
                        {quiz.questionsPerAttempt || quiz.metadata?.questionCount || 'All'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Question Bank</p>
                      <p className="font-medium">{quiz.metadata?.questionCount ?? 0} questions</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Score</p>
                      <p className="font-medium">
                        {quiz.metadata?.averageScore ? `${quiz.metadata.averageScore.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pass Rate</p>
                      <p className="font-medium">
                        {quiz.metadata?.passRate ? `${quiz.metadata.passRate.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openQuestionManager(quiz)}>
                      Manage Questions
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openAnalyticsModal(quiz)}>
                      View Analytics
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openQuizForm(quiz)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {showQuizForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
            </h2>
            {quizFormError && (
              <p className="text-sm text-red-500 mb-3">{quizFormError}</p>
            )}
            <form onSubmit={handleQuizSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Title</Label>
                  <Input
                    id="quiz-title"
                    name="title"
                    defaultValue={editingQuiz?.title || ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-status">Status</Label>
                  <select
                    id="quiz-status"
                    name="status"
                    defaultValue={editingQuiz?.status || 'draft'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-description">Description</Label>
                <textarea
                  id="quiz-description"
                  name="description"
                  defaultValue={editingQuiz?.description || ''}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-instructions">Learner Instructions</Label>
                <textarea
                  id="quiz-instructions"
                  name="instructions"
                  defaultValue={editingQuiz?.instructions || ''}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    name="passingScore"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={editingQuiz?.passingScore ?? 70}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    name="timeLimit"
                    type="number"
                    min={0}
                    defaultValue={editingQuiz?.timeLimit ?? ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retakes">Retakes (-1 for unlimited)</Label>
                  <Input
                    id="retakes"
                    name="retakes"
                    type="number"
                    defaultValue={editingQuiz?.retakes ?? -1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionsPerAttempt">Questions Per Attempt</Label>
                  <Input
                    id="questionsPerAttempt"
                    name="questionsPerAttempt"
                    type="number"
                    min={1}
                    defaultValue={editingQuiz?.questionsPerAttempt ?? ''}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="randomizeQuestions"
                    defaultChecked={editingQuiz?.randomizeQuestions ?? true}
                    className="rounded border-input"
                  />
                  Randomize questions order
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="shuffleAnswers"
                    defaultChecked={editingQuiz?.shuffleAnswers ?? true}
                    className="rounded border-input"
                  />
                  Shuffle choices inside questions
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="showExplanations"
                    defaultChecked={editingQuiz?.showExplanations ?? true}
                    className="rounded border-input"
                  />
                  Show explanations after submission
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="allowReview"
                    defaultChecked={editingQuiz?.allowReview ?? true}
                    className="rounded border-input"
                  />
                  Allow learners to review answers
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowQuizForm(false);
                    setEditingQuiz(null);
                    setQuizFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingQuiz ? 'Save Changes' : 'Create Quiz'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {questionManagerQuiz && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Question Bank</h2>
                <p className="text-sm text-muted-foreground">
                  {questionManagerQuiz.title}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setQuestionManagerQuiz(null);
                  setQuestionFormState(null);
                  setQuestionFormError(null);
                }}
              >
                Close
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Manage reusable questions for randomized quizzes.
              </p>
              <Button size="sm" onClick={() => openQuestionForm(questionManagerQuiz.id)}>
                Add Question
              </Button>
            </div>
            {questionFormError && (
              <p className="text-sm text-red-500">{questionFormError}</p>
            )}
            {isQuestionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading questions...</p>
            ) : (
              <div className="space-y-3">
                {(questionBank[questionManagerQuiz.id] || []).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No questions yet. Add your first question to build the bank.
                    </CardContent>
                  </Card>
                ) : (
                  (questionBank[questionManagerQuiz.id] || []).map((question) => (
                    <Card key={question.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{question.questionText}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {question.questionType.replace(/([A-Z])/g, ' $1').trim()} · {question.difficulty}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.points} point{question.points !== 1 ? 's' : ''}
                              {question.tags && question.tags.length > 0 && ` · Tags: ${question.tags.join(', ')}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openQuestionForm(question.quiz, question)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {questionFormState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {questionFormState.question ? 'Edit Question' : 'Add Question'}
            </h2>
            {questionFormError && (
              <p className="text-sm text-red-500 mb-3">{questionFormError}</p>
            )}
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Prompt</Label>
                <textarea
                  id="questionText"
                  value={questionDraft.questionText}
                  onChange={(event) => handleQuestionDraftChange('questionText', event.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Type</Label>
                  <select
                    id="questionType"
                    value={questionDraft.questionType}
                    onChange={(event) => handleQuestionTypeChange(event.target.value as QuizQuestion['questionType'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="trueFalse">True / False</option>
                    <option value="shortAnswer">Short Answer</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionDifficulty">Difficulty</Label>
                  <select
                    id="questionDifficulty"
                    value={questionDraft.difficulty}
                    onChange={(event) => handleQuestionDraftChange('difficulty', event.target.value as QuestionDraft['difficulty'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionPoints">Points</Label>
                  <Input
                    id="questionPoints"
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={questionDraft.points}
                    onChange={(event) => handleQuestionDraftChange('points', Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionTags">Tags (comma separated)</Label>
                <Input
                  id="questionTags"
                  value={questionDraft.tags}
                  onChange={(event) => handleQuestionDraftChange('tags', event.target.value)}
                />
              </div>

              {(questionDraft.questionType === 'multipleChoice' || questionDraft.questionType === 'matching') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestionOption}>
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {questionDraft.options.map((option, index) => (
                      <div key={index} className="grid gap-3 md:grid-cols-[1fr,auto]">
                        <div className="space-y-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(event) => updateQuestionOption(index, { text: event.target.value })}
                          />
                          {questionDraft.questionType === 'matching' && (
                            <Input
                              placeholder="Match value"
                              value={option.match || ''}
                              onChange={(event) => updateQuestionOption(index, { match: event.target.value })}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {questionDraft.questionType === 'multipleChoice' && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={option.isCorrect || false}
                                onChange={(event) => updateQuestionOption(index, { isCorrect: event.target.checked })}
                                className="rounded border-input"
                              />
                              Correct
                            </label>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => removeQuestionOption(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {questionDraft.questionType === 'trueFalse' && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <div className="flex gap-4">
                    {(['true', 'false'] as const).map((value) => (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          value={value}
                          checked={questionDraft.trueFalseAnswer === value}
                          onChange={(event) => handleQuestionDraftChange('trueFalseAnswer', event.target.value as 'true' | 'false')}
                        />
                        {value === 'true' ? 'True' : 'False'}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {questionDraft.questionType === 'shortAnswer' && (
                <div className="space-y-2">
                  <Label htmlFor="shortAnswer">Reference Answer</Label>
                  <Input
                    id="shortAnswer"
                    value={questionDraft.shortAnswer || ''}
                    onChange={(event) => handleQuestionDraftChange('shortAnswer', event.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (optional)</Label>
                <textarea
                  id="explanation"
                  value={questionDraft.explanation || ''}
                  onChange={(event) => handleQuestionDraftChange('explanation', event.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setQuestionFormState(null);
                    setQuestionFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{questionFormState.question ? 'Save Question' : 'Add Question'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {analyticsQuiz && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Quiz Analytics</h2>
                <p className="text-sm text-muted-foreground">{analyticsQuiz.title}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setAnalyticsQuiz(null);
                  setAnalyticsError(null);
                }}
              >
                Close
              </Button>
            </div>
            {analyticsError && <p className="text-sm text-red-500">{analyticsError}</p>}
            {analyticsLoading && !analyticsData[analyticsQuiz.id] ? (
              <p className="text-sm text-muted-foreground">Loading analytics...</p>
            ) : (
              (() => {
                const stats = analyticsData[analyticsQuiz.id];
                if (!stats) {
                  return <p className="text-sm text-muted-foreground">No analytics available yet.</p>;
                }
                const avgMinutes = stats.averageDuration ? (stats.averageDuration / 60).toFixed(1) : '0';
                return (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4 text-center">
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">Attempts</p>
                        <p className="text-2xl font-semibold">{stats.attemptCount}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">Avg. Score</p>
                        <p className="text-2xl font-semibold">{stats.averageScore.toFixed(1)}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">Pass Rate</p>
                        <p className="text-2xl font-semibold">{stats.passRate.toFixed(1)}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">Avg. Time</p>
                        <p className="text-2xl font-semibold">{avgMinutes} min</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Question Performance</h3>
                      {stats.questionStats.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No question-level analytics yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.questionStats.map((question) => (
                            <div key={question.questionId} className="border rounded-lg p-3">
                              <p className="font-medium">{question.prompt}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Correct rate: {question.correctRate.toFixed(1)}% · Avg. score:{' '}
                                {question.averageScore.toFixed(2)} pts
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingModule ? 'Edit Module' : 'Add Module'}
            </h2>
            <form onSubmit={handleModuleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingModule?.title || ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingModule?.description || ''}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingModule ? 'Save Changes' : 'Add Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLesson.lesson ? 'Edit Lesson' : 'Add Lesson'}
            </h2>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingLesson.lesson?.title || ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <select
                  id="contentType"
                  name="contentType"
                  defaultValue={editingLesson.lesson?.contentType || 'video'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPreview"
                  defaultChecked={editingLesson.lesson?.isPreview || false}
                  className="rounded border-input"
                />
                <span className="text-sm">Free preview (visible to non-enrolled users)</span>
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLessonForm(false);
                    setEditingLesson(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLesson.lesson ? 'Save Changes' : 'Add Lesson'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
