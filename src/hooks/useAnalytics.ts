'use client';

import { useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TrackEventOptions {
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  metadata?: Record<string, unknown>;
  properties?: {
    duration?: number;
    progress?: number;
    score?: number;
    value?: number;
    query?: string;
    errorMessage?: string;
  };
}

// Session ID stored in sessionStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export function useAnalytics() {
  const sessionId = useRef<string>('');
  const pageViewTracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  const trackEvent = useCallback(
    async (eventType: string, options: TrackEventOptions = {}) => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            sessionId: sessionId.current,
            ...options,
          }),
        });
      } catch {
        // Silently fail - analytics should not block user experience
      }
    },
    []
  );

  // Page view tracking
  const trackPageView = useCallback(
    (url?: string) => {
      const pageUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '');
      if (!pageViewTracked.current.has(pageUrl)) {
        pageViewTracked.current.add(pageUrl);
        trackEvent('page.view', {
          metadata: { url: pageUrl },
        });
      }
    },
    [trackEvent]
  );

  // Course view tracking
  const trackCourseView = useCallback(
    (courseId: string) => {
      trackEvent('course.view', { courseId });
    },
    [trackEvent]
  );

  // Lesson tracking
  const trackLessonStart = useCallback(
    (lessonId: string, courseId?: string) => {
      trackEvent('lesson.start', { lessonId, courseId });
    },
    [trackEvent]
  );

  const trackLessonComplete = useCallback(
    (lessonId: string, courseId?: string, duration?: number) => {
      trackEvent('lesson.complete', {
        lessonId,
        courseId,
        properties: { duration },
      });
    },
    [trackEvent]
  );

  const trackLessonView = useCallback(
    (lessonId: string, courseId?: string) => {
      trackEvent('lesson.view', { lessonId, courseId });
    },
    [trackEvent]
  );

  // Video tracking
  const trackVideoPlay = useCallback(
    (lessonId: string, progress?: number) => {
      trackEvent('video.play', {
        lessonId,
        properties: { progress },
      });
    },
    [trackEvent]
  );

  const trackVideoPause = useCallback(
    (lessonId: string, progress?: number, duration?: number) => {
      trackEvent('video.pause', {
        lessonId,
        properties: { progress, duration },
      });
    },
    [trackEvent]
  );

  const trackVideoComplete = useCallback(
    (lessonId: string, duration?: number) => {
      trackEvent('video.complete', {
        lessonId,
        properties: { duration },
      });
    },
    [trackEvent]
  );

  const trackVideoSeek = useCallback(
    (lessonId: string, progress: number) => {
      trackEvent('video.seek', {
        lessonId,
        properties: { progress },
      });
    },
    [trackEvent]
  );

  // Quiz tracking
  const trackQuizStart = useCallback(
    (quizId: string, courseId?: string) => {
      trackEvent('quiz.start', { quizId, courseId });
    },
    [trackEvent]
  );

  const trackQuizSubmit = useCallback(
    (quizId: string, score: number, courseId?: string) => {
      trackEvent('quiz.submit', {
        quizId,
        courseId,
        properties: { score },
      });
    },
    [trackEvent]
  );

  const trackQuizComplete = useCallback(
    (quizId: string, score: number, courseId?: string) => {
      trackEvent('quiz.complete', {
        quizId,
        courseId,
        properties: { score },
      });
    },
    [trackEvent]
  );

  // Social/engagement tracking
  const trackDiscussionPost = useCallback(
    (courseId?: string, lessonId?: string) => {
      trackEvent('discussion.post', { courseId, lessonId });
    },
    [trackEvent]
  );

  const trackDiscussionReply = useCallback(
    (courseId?: string, lessonId?: string) => {
      trackEvent('discussion.reply', { courseId, lessonId });
    },
    [trackEvent]
  );

  const trackNoteCreate = useCallback(
    (lessonId: string, courseId?: string) => {
      trackEvent('note.create', { lessonId, courseId });
    },
    [trackEvent]
  );

  const trackBookmarkAdd = useCallback(
    (lessonId?: string, courseId?: string) => {
      trackEvent('bookmark.add', { lessonId, courseId });
    },
    [trackEvent]
  );

  // Commerce tracking
  const trackCheckoutStart = useCallback(
    (courseId: string, value: number) => {
      trackEvent('checkout.start', {
        courseId,
        properties: { value },
      });
    },
    [trackEvent]
  );

  const trackCheckoutComplete = useCallback(
    (courseId: string, value: number) => {
      trackEvent('checkout.complete', {
        courseId,
        properties: { value },
      });
    },
    [trackEvent]
  );

  const trackCheckoutAbandon = useCallback(
    (courseId: string, value?: number) => {
      trackEvent('checkout.abandon', {
        courseId,
        properties: { value },
      });
    },
    [trackEvent]
  );

  // Auth tracking
  const trackLogin = useCallback(() => {
    trackEvent('auth.login');
  }, [trackEvent]);

  const trackLogout = useCallback(() => {
    trackEvent('auth.logout');
  }, [trackEvent]);

  const trackRegister = useCallback(() => {
    trackEvent('auth.register');
  }, [trackEvent]);

  // Search tracking
  const trackSearch = useCallback(
    (query: string) => {
      trackEvent('search.query', {
        properties: { query },
      });
    },
    [trackEvent]
  );

  // Error tracking
  const trackError = useCallback(
    (errorMessage: string, metadata?: Record<string, unknown>) => {
      trackEvent('error.occurred', {
        metadata,
        properties: { errorMessage },
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackCourseView,
    trackLessonStart,
    trackLessonComplete,
    trackLessonView,
    trackVideoPlay,
    trackVideoPause,
    trackVideoComplete,
    trackVideoSeek,
    trackQuizStart,
    trackQuizSubmit,
    trackQuizComplete,
    trackDiscussionPost,
    trackDiscussionReply,
    trackNoteCreate,
    trackBookmarkAdd,
    trackCheckoutStart,
    trackCheckoutComplete,
    trackCheckoutAbandon,
    trackLogin,
    trackLogout,
    trackRegister,
    trackSearch,
    trackError,
  };
}
