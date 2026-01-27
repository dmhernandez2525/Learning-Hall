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

export default function CourseBuilderPage({ params }: PageProps) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

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
      const [courseRes, modulesRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/modules?courseId=${id}`),
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
        // Expand all modules by default
        setExpandedModules(new Set(modulesData.docs.map((m: Module) => m.id)));
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
          <Button onClick={handleAddModule}>Add Module</Button>
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
