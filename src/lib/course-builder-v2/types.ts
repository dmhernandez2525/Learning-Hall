export type BuilderContentType = 'video' | 'text' | 'quiz' | 'assignment';

export interface BuilderCourse {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
}

export interface BuilderLesson {
  id: string;
  title: string;
  position: number;
  contentType: BuilderContentType;
  isPreview: boolean;
  contentText?: string;
}

export interface BuilderModule {
  id: string;
  title: string;
  description?: string;
  position: number;
  lessons: BuilderLesson[];
  collapsed?: boolean;
}

export interface BuilderTemplate {
  id: string;
  label: string;
  description: string;
  contentType: BuilderContentType;
  defaultContentText: string;
}

export interface BuilderPublishWarning {
  id: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface BuilderSnapshot {
  modules: BuilderModule[];
  selectedLessonId: string | null;
}

