export interface MicroLesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  durationMinutes: number;
  order: number;
  status: 'draft' | 'published';
}

export interface SpacedRepetitionCard {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  interval: number;
  nextReviewAt: string;
  easeFactor: number;
  repetitions: number;
}

export interface ChallengeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  questions: ChallengeQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  activeDate: string;
  status: 'active' | 'completed';
}

export interface MicrolearningAnalytics {
  totalMicroLessons: number;
  publishedLessons: number;
  totalCards: number;
  dueCards: number;
  totalChallenges: number;
  challengesByDifficulty: Record<string, number>;
}
