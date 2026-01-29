// Content Duplication
import { getPayload } from 'payload';
import config from '@/payload.config';

export interface DuplicateOptions {
  newTitle?: string;
  userId: string;
  tenantId?: string;
  includeEnrollments?: boolean;
  includeReviews?: boolean;
  includeProgress?: boolean;
}

// Duplicate a lesson
export async function duplicateLesson(
  lessonId: string,
  options: DuplicateOptions
): Promise<string> {
  const payload = await getPayload({ config });

  const lesson = await payload.findByID({
    collection: 'lessons',
    id: lessonId,
    depth: 2,
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // Create duplicate
  const newLesson = await payload.create({
    collection: 'lessons',
    data: {
      title: options.newTitle || `${lesson.title} (Copy)`,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      type: lesson.type,
      order: lesson.order,
      status: 'draft', // Always start as draft
      tenant: options.tenantId || lesson.tenant,
      // Reset stats
      completions: 0,
    },
  });

  return String(newLesson.id);
}

// Duplicate a course (with all sections and lessons)
export async function duplicateCourse(
  courseId: string,
  options: DuplicateOptions
): Promise<string> {
  const payload = await getPayload({ config });

  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 3,
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Create lesson mapping for duplicated lessons
  const lessonMapping = new Map<string, string>();

  // Duplicate all sections
  const newSections: Array<{
    title: string;
    description?: string;
    lessons?: string[];
    order?: number;
  }> = [];

  if (course.sections && Array.isArray(course.sections)) {
    for (const section of course.sections) {
      const newLessons: string[] = [];

      // Duplicate lessons in this section
      if (section.lessons && Array.isArray(section.lessons)) {
        for (const lesson of section.lessons) {
          const lessonId = typeof lesson === 'object' ? String(lesson.id) : String(lesson);
          const newLessonId = await duplicateLesson(lessonId, {
            userId: options.userId,
            tenantId: options.tenantId,
          });
          lessonMapping.set(lessonId, newLessonId);
          newLessons.push(newLessonId);
        }
      }

      newSections.push({
        title: section.title,
        description: section.description,
        lessons: newLessons,
        order: section.order,
      });
    }
  }

  // Create the duplicated course
  const newCourse = await payload.create({
    collection: 'courses',
    data: {
      title: options.newTitle || `${course.title} (Copy)`,
      slug: `${course.slug}-copy-${Date.now()}`,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      price: course.price,
      currency: course.currency,
      level: course.level,
      category: course.category,
      sections: newSections,
      status: 'draft', // Always start as draft
      instructor: options.userId,
      tenant: options.tenantId || course.tenant,
      // Reset stats
      enrollmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
    },
  });

  return String(newCourse.id);
}

// Duplicate a quiz
export async function duplicateQuiz(
  quizId: string,
  options: DuplicateOptions
): Promise<string> {
  const payload = await getPayload({ config });

  const quiz = await payload.findByID({
    collection: 'quizzes',
    id: quizId,
    depth: 2,
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Create duplicate
  const newQuiz = await payload.create({
    collection: 'quizzes',
    data: {
      title: options.newTitle || `${quiz.title} (Copy)`,
      description: quiz.description,
      questions: quiz.questions,
      settings: quiz.settings,
      status: 'draft',
      tenant: options.tenantId || quiz.tenant,
      // Reset stats
      totalAttempts: 0,
      averageScore: 0,
    },
  });

  return String(newQuiz.id);
}

// Bulk duplicate multiple items
export async function bulkDuplicate(
  items: Array<{ id: string; type: 'lesson' | 'course' | 'quiz' }>,
  options: DuplicateOptions
): Promise<Array<{ originalId: string; newId: string; type: string }>> {
  const results: Array<{ originalId: string; newId: string; type: string }> = [];

  for (const item of items) {
    try {
      let newId: string;

      switch (item.type) {
        case 'lesson':
          newId = await duplicateLesson(item.id, options);
          break;
        case 'course':
          newId = await duplicateCourse(item.id, options);
          break;
        case 'quiz':
          newId = await duplicateQuiz(item.id, options);
          break;
        default:
          continue;
      }

      results.push({
        originalId: item.id,
        newId,
        type: item.type,
      });
    } catch (error) {
      console.error(`Failed to duplicate ${item.type} ${item.id}:`, error);
    }
  }

  return results;
}

// Import content from JSON
export async function importContentFromJson(
  jsonContent: {
    type: 'lesson' | 'course' | 'quiz';
    data: Record<string, unknown>;
  },
  options: DuplicateOptions
): Promise<string> {
  const payload = await getPayload({ config });

  const { type, data } = jsonContent;

  // Remove IDs and relations that shouldn't be imported
  const cleanData = { ...data };
  delete cleanData.id;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;

  // Add user and tenant
  cleanData.tenant = options.tenantId;

  let contentId: string;

  switch (type) {
    case 'lesson':
      const lesson = await payload.create({
        collection: 'lessons',
        data: {
          ...cleanData,
          status: 'draft',
        },
      });
      contentId = String(lesson.id);
      break;

    case 'course':
      cleanData.instructor = options.userId;
      cleanData.slug = `${cleanData.slug || 'imported'}-${Date.now()}`;
      const course = await payload.create({
        collection: 'courses',
        data: {
          ...cleanData,
          status: 'draft',
          enrollmentCount: 0,
          averageRating: 0,
          reviewCount: 0,
        },
      });
      contentId = String(course.id);
      break;

    case 'quiz':
      const quiz = await payload.create({
        collection: 'quizzes',
        data: {
          ...cleanData,
          status: 'draft',
          totalAttempts: 0,
          averageScore: 0,
        },
      });
      contentId = String(quiz.id);
      break;

    default:
      throw new Error(`Unsupported content type: ${type}`);
  }

  return contentId;
}

// Export content to JSON
export async function exportContentToJson(
  contentId: string,
  contentType: 'lesson' | 'course' | 'quiz'
): Promise<{ type: string; data: Record<string, unknown> }> {
  const payload = await getPayload({ config });

  let collection: 'lessons' | 'courses' | 'quizzes';
  switch (contentType) {
    case 'lesson':
      collection = 'lessons';
      break;
    case 'course':
      collection = 'courses';
      break;
    case 'quiz':
      collection = 'quizzes';
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }

  const content = await payload.findByID({
    collection,
    id: contentId,
    depth: 3,
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Remove sensitive/ephemeral data
  const exportData = { ...content } as Record<string, unknown>;
  delete exportData.id;
  delete exportData.createdAt;
  delete exportData.updatedAt;
  delete exportData.tenant;
  delete exportData.instructor;

  return {
    type: contentType,
    data: exportData,
  };
}
