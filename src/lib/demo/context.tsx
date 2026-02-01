'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User } from '@/lib/auth';
import type { Course } from '@/lib/courses';
import {
  demoUser,
  demoCourses,
  demoModules,
  demoLessons,
  demoEnrollments,
  demoProgress,
  demoPointsData,
  demoEarnedBadges,
  demoInProgressBadges,
  demoCertificates,
  demoNotes,
  demoBookmarks,
  calculateCourseProgress,
  getEnrolledCourses,
  getCourseWithModulesAndLessons,
  type DemoModule,
  type DemoLesson,
  type DemoEnrollment,
  type DemoProgress,
  type DemoEarnedBadge,
  type DemoInProgressBadge,
  type DemoCertificate,
  type DemoNote,
  type DemoBookmark,
} from './data';

interface DemoContextType {
  // State
  isDemo: boolean;
  user: User;

  // Courses
  courses: Course[];
  getPublishedCourses: () => Course[];
  getCourseById: (id: string) => Course | undefined;
  getCourseBySlug: (slug: string) => Course | undefined;

  // Modules & Lessons
  modules: DemoModule[];
  lessons: DemoLesson[];
  getModulesForCourse: (courseId: string) => DemoModule[];
  getLessonsForModule: (moduleId: string) => DemoLesson[];
  getLessonById: (id: string) => DemoLesson | undefined;
  getCourseWithDetails: (courseId: string) => ReturnType<typeof getCourseWithModulesAndLessons>;

  // Enrollments & Progress
  enrollments: DemoEnrollment[];
  progress: DemoProgress[];
  getEnrolledCourses: () => ReturnType<typeof getEnrolledCourses>;
  getCourseProgress: (courseId: string) => number;
  isLessonCompleted: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => void;

  // Gamification
  pointsData: typeof demoPointsData;
  earnedBadges: DemoEarnedBadge[];
  inProgressBadges: DemoInProgressBadge[];

  // Certificates
  certificates: DemoCertificate[];

  // Notes & Bookmarks
  notes: DemoNote[];
  bookmarks: DemoBookmark[];
  addNote: (note: Omit<DemoNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addBookmark: (bookmark: Omit<DemoBookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // Mutable state for interactive demo features
  const [progress, setProgress] = useState<DemoProgress[]>(demoProgress);
  const [notes, setNotes] = useState<DemoNote[]>(demoNotes);
  const [bookmarks, setBookmarks] = useState<DemoBookmark[]>(demoBookmarks);

  // Course helpers
  const getPublishedCourses = useCallback(() => {
    return demoCourses.filter((c) => c.status === 'published');
  }, []);

  const getCourseById = useCallback((id: string) => {
    return demoCourses.find((c) => c.id === id);
  }, []);

  const getCourseBySlug = useCallback((slug: string) => {
    return demoCourses.find((c) => c.slug === slug);
  }, []);

  // Module & Lesson helpers
  const getModulesForCourse = useCallback((courseId: string) => {
    return demoModules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }, []);

  const getLessonsForModule = useCallback((moduleId: string) => {
    return demoLessons
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }, []);

  const getLessonById = useCallback((id: string) => {
    return demoLessons.find((l) => l.id === id);
  }, []);

  const getCourseWithDetails = useCallback((courseId: string) => {
    return getCourseWithModulesAndLessons(courseId);
  }, []);

  // Progress helpers
  const getCourseProgress = useCallback(
    (courseId: string) => {
      const courseLessons = demoLessons.filter((l) => l.courseId === courseId);
      const completedLessons = progress.filter(
        (p) => p.courseId === courseId && p.completedAt
      );
      if (courseLessons.length === 0) return 0;
      return Math.round((completedLessons.length / courseLessons.length) * 100);
    },
    [progress]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return progress.some((p) => p.lessonId === lessonId && p.completedAt);
    },
    [progress]
  );

  const completeLesson = useCallback((lessonId: string) => {
    const lesson = demoLessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    setProgress((prev) => {
      // Check if already completed
      if (prev.some((p) => p.lessonId === lessonId && p.completedAt)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: `prog-new-${Date.now()}`,
          lessonId,
          courseId: lesson.courseId,
          userId: demoUser.id,
          completedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  // Enrolled courses with progress
  const getEnrolledCoursesWithProgress = useCallback(() => {
    return demoEnrollments.map((enrollment) => {
      const course = demoCourses.find((c) => c.id === enrollment.courseId);
      const progressPercent = getCourseProgress(enrollment.courseId);
      return {
        ...enrollment,
        course,
        progressPercentage: progressPercent,
      };
    });
  }, [getCourseProgress]);

  // Notes helpers
  const addNote = useCallback(
    (note: Omit<DemoNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      setNotes((prev) => [
        ...prev,
        {
          ...note,
          id: `note-new-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    },
    []
  );

  // Bookmark helpers
  const addBookmark = useCallback(
    (bookmark: Omit<DemoBookmark, 'id' | 'createdAt'>) => {
      setBookmarks((prev) => [
        ...prev,
        {
          ...bookmark,
          id: `bookmark-new-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, []);

  const value = useMemo<DemoContextType>(
    () => ({
      isDemo: true,
      user: demoUser,

      courses: demoCourses,
      getPublishedCourses,
      getCourseById,
      getCourseBySlug,

      modules: demoModules,
      lessons: demoLessons,
      getModulesForCourse,
      getLessonsForModule,
      getLessonById,
      getCourseWithDetails,

      enrollments: demoEnrollments,
      progress,
      getEnrolledCourses: getEnrolledCoursesWithProgress,
      getCourseProgress,
      isLessonCompleted,
      completeLesson,

      pointsData: demoPointsData,
      earnedBadges: demoEarnedBadges,
      inProgressBadges: demoInProgressBadges,

      certificates: demoCertificates,

      notes,
      bookmarks,
      addNote,
      addBookmark,
      removeBookmark,
    }),
    [
      progress,
      notes,
      bookmarks,
      getPublishedCourses,
      getCourseById,
      getCourseBySlug,
      getModulesForCourse,
      getLessonsForModule,
      getLessonById,
      getCourseWithDetails,
      getEnrolledCoursesWithProgress,
      getCourseProgress,
      isLessonCompleted,
      completeLesson,
      addNote,
      addBookmark,
      removeBookmark,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export function useDemoOptional() {
  return useContext(DemoContext);
}
