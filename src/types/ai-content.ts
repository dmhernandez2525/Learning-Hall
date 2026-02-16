export interface ContentSuggestion {
  id: string;
  courseId: string;
  lessonId: string;
  type: 'topic' | 'example' | 'exercise' | 'explanation';
  title: string;
  content: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdBy: string;
  createdAt: string;
}

export interface GeneratedQuiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ContentSummary {
  id: string;
  courseId: string;
  lessonId: string;
  originalLength: number;
  summaryLength: number;
  summary: string;
  keyPoints: string[];
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: string;
}

export interface AIContentAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  totalQuizzes: number;
  publishedQuizzes: number;
  totalSummaries: number;
  suggestionsByType: Record<string, number>;
}
