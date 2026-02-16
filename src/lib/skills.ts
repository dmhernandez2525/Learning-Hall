import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  Skill,
  CompetencyMapping,
  UserSkillAssessment,
  SkillGapResult,
  SkillsAnalytics,
} from '@/types/skills';

const LEVEL_ORDER: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

// --------------- Formatters ---------------

export function formatSkill(doc: Record<string, unknown>): Skill {
  const parent = doc.parent as string | Record<string, unknown> | null;
  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    description: String(doc.description ?? ''),
    category: String(doc.category ?? ''),
    parentId: parent
      ? (typeof parent === 'object' ? String(parent.id) : String(parent))
      : null,
    level: (doc.level as Skill['level']) ?? 'beginner',
    status: (doc.status as Skill['status']) ?? 'active',
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatMapping(doc: Record<string, unknown>): CompetencyMapping {
  const skill = doc.skill as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    skillId: typeof skill === 'object' ? String(skill.id) : String(skill ?? ''),
    skillName: typeof skill === 'object' ? String((skill as Record<string, unknown>).name ?? '') : '',
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    courseName: typeof course === 'object' ? String((course as Record<string, unknown>).title ?? '') : '',
    targetLevel: (doc.targetLevel as CompetencyMapping['targetLevel']) ?? 'intermediate',
    weight: Number(doc.weight ?? 1),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatAssessment(doc: Record<string, unknown>): UserSkillAssessment {
  const user = doc.user as string | Record<string, unknown>;
  const skill = doc.skill as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    skillId: typeof skill === 'object' ? String(skill.id) : String(skill ?? ''),
    skillName: typeof skill === 'object' ? String((skill as Record<string, unknown>).name ?? '') : '',
    currentLevel: (doc.currentLevel as UserSkillAssessment['currentLevel']) ?? 'beginner',
    targetLevel: (doc.targetLevel as UserSkillAssessment['targetLevel']) ?? 'intermediate',
    assessedAt: String(doc.assessedAt ?? ''),
    source: (doc.source as UserSkillAssessment['source']) ?? 'manual',
  };
}

// --------------- Skills CRUD ---------------

export async function listSkills(category?: string): Promise<Skill[]> {
  const payload = await getPayloadClient();
  const where: Where = category ? { category: { equals: category } } : {};
  const result = await payload.find({
    collection: 'skills',
    where,
    sort: 'name',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatSkill(doc as Record<string, unknown>));
}

export async function getSkill(id: string): Promise<Skill | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'skills', id, depth: 0 });
    if (!doc) return null;
    return formatSkill(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateSkillInput {
  name: string;
  description?: string;
  category: string;
  parentId?: string;
  level?: Skill['level'];
}

export async function createSkill(input: CreateSkillInput, user: User): Promise<Skill> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'skills',
    data: {
      name: input.name,
      description: input.description ?? '',
      category: input.category,
      parent: input.parentId ?? null,
      level: input.level ?? 'beginner',
      status: 'active',
      tenant: user.tenant,
    },
  });
  return formatSkill(doc as Record<string, unknown>);
}

// --------------- Competency Mappings ---------------

export async function listMappings(skillId?: string, courseId?: string): Promise<CompetencyMapping[]> {
  const payload = await getPayloadClient();
  const conditions: Where[] = [];
  if (skillId) conditions.push({ skill: { equals: skillId } });
  if (courseId) conditions.push({ course: { equals: courseId } });
  const where: Where = conditions.length > 0 ? { and: conditions } : {};
  const result = await payload.find({
    collection: 'competency-mappings',
    where,
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatMapping(doc as Record<string, unknown>));
}

interface CreateMappingInput {
  skillId: string;
  courseId: string;
  targetLevel: CompetencyMapping['targetLevel'];
  weight?: number;
}

export async function createMapping(input: CreateMappingInput, user: User): Promise<CompetencyMapping> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'competency-mappings',
    data: {
      skill: input.skillId,
      course: input.courseId,
      targetLevel: input.targetLevel,
      weight: input.weight ?? 1,
      tenant: user.tenant,
    },
  });
  return formatMapping(doc as Record<string, unknown>);
}

// --------------- Assessments ---------------

export async function listAssessments(userId?: string, skillId?: string): Promise<UserSkillAssessment[]> {
  const payload = await getPayloadClient();
  const conditions: Where[] = [];
  if (userId) conditions.push({ user: { equals: userId } });
  if (skillId) conditions.push({ skill: { equals: skillId } });
  const where: Where = conditions.length > 0 ? { and: conditions } : {};
  const result = await payload.find({
    collection: 'user-skill-assessments',
    where,
    sort: '-assessedAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatAssessment(doc as Record<string, unknown>));
}

interface CreateAssessmentInput {
  userId: string;
  skillId: string;
  currentLevel: UserSkillAssessment['currentLevel'];
  targetLevel: UserSkillAssessment['targetLevel'];
  source?: UserSkillAssessment['source'];
}

export async function createAssessment(input: CreateAssessmentInput, user: User): Promise<UserSkillAssessment> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'user-skill-assessments',
    data: {
      user: input.userId,
      skill: input.skillId,
      currentLevel: input.currentLevel,
      targetLevel: input.targetLevel,
      assessedAt: new Date().toISOString(),
      source: input.source ?? 'manual',
      tenant: user.tenant,
    },
  });
  return formatAssessment(doc as Record<string, unknown>);
}

// --------------- Gap Analysis ---------------

export async function getGapAnalysis(userId: string): Promise<SkillGapResult[]> {
  const payload = await getPayloadClient();

  const assessments = await payload.find({
    collection: 'user-skill-assessments',
    where: { user: { equals: userId } },
    limit: 200,
    depth: 1,
  });

  const gaps: SkillGapResult[] = [];

  for (const doc of assessments.docs) {
    const raw = doc as Record<string, unknown>;
    const currentLevel = String(raw.currentLevel ?? 'beginner');
    const targetLevel = String(raw.targetLevel ?? 'intermediate');
    const gap = (LEVEL_ORDER[targetLevel] ?? 0) - (LEVEL_ORDER[currentLevel] ?? 0);

    if (gap <= 0) continue;

    const skill = raw.skill as Record<string, unknown> | string;
    const skillId = typeof skill === 'object' ? String(skill.id) : String(skill ?? '');
    const skillName = typeof skill === 'object' ? String(skill.name ?? '') : '';
    const category = typeof skill === 'object' ? String(skill.category ?? '') : '';

    const mappings = await payload.find({
      collection: 'competency-mappings',
      where: { skill: { equals: skillId } },
      limit: 10,
      depth: 0,
    });

    const recommendedCourses = mappings.docs.map((m) =>
      String((m as Record<string, unknown>).course ?? '')
    );

    gaps.push({
      skillId,
      skillName,
      category,
      currentLevel: currentLevel as Skill['level'],
      targetLevel: targetLevel as Skill['level'],
      gap,
      recommendedCourses,
    });
  }

  return gaps.sort((a, b) => b.gap - a.gap);
}

// --------------- Analytics ---------------

export async function getSkillsAnalytics(): Promise<SkillsAnalytics> {
  const payload = await getPayloadClient();

  const skills = await payload.find({ collection: 'skills', limit: 500, depth: 0 });
  const mappings = await payload.find({ collection: 'competency-mappings', limit: 1, depth: 0 });
  const assessments = await payload.find({ collection: 'user-skill-assessments', limit: 500, depth: 0 });

  const skillsByCategory: Record<string, number> = {};
  for (const doc of skills.docs) {
    const cat = String((doc as Record<string, unknown>).category ?? 'Uncategorized');
    skillsByCategory[cat] = (skillsByCategory[cat] ?? 0) + 1;
  }

  let totalGap = 0;
  let gapCount = 0;
  for (const doc of assessments.docs) {
    const raw = doc as Record<string, unknown>;
    const cur = LEVEL_ORDER[String(raw.currentLevel ?? 'beginner')] ?? 0;
    const tgt = LEVEL_ORDER[String(raw.targetLevel ?? 'intermediate')] ?? 0;
    const diff = tgt - cur;
    if (diff > 0) {
      totalGap += diff;
      gapCount += 1;
    }
  }

  return {
    totalSkills: skills.totalDocs,
    totalMappings: mappings.totalDocs,
    totalAssessments: assessments.totalDocs,
    skillsByCategory,
    averageGap: gapCount > 0 ? Math.round((totalGap / gapCount) * 10) / 10 : 0,
  };
}
