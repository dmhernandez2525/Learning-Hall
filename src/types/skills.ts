export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  parentId: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'active' | 'deprecated';
  createdAt: string;
}

export interface CompetencyMapping {
  id: string;
  skillId: string;
  skillName: string;
  courseId: string;
  courseName: string;
  targetLevel: Skill['level'];
  weight: number;
  createdAt: string;
}

export interface UserSkillAssessment {
  id: string;
  userId: string;
  userName: string;
  skillId: string;
  skillName: string;
  currentLevel: Skill['level'];
  targetLevel: Skill['level'];
  assessedAt: string;
  source: 'manual' | 'course_completion' | 'quiz' | 'peer_review';
}

export interface SkillGapResult {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: Skill['level'];
  targetLevel: Skill['level'];
  gap: number;
  recommendedCourses: string[];
}

export interface SkillsAnalytics {
  totalSkills: number;
  totalMappings: number;
  totalAssessments: number;
  skillsByCategory: Record<string, number>;
  averageGap: number;
}
