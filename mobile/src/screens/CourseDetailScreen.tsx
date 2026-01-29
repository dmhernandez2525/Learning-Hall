import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { coursesApi } from '../services/api';

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    duration?: number;
    order: number;
    isFree?: boolean;
  }>;
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: { url: string } | null;
  pricing: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  stats: {
    enrollments: number;
    avgRating: number;
    reviewCount: number;
    totalDuration: number;
    lessonCount: number;
    moduleCount: number;
  };
  instructor?: {
    id: string;
    name?: string;
    avatar?: string;
  } | null;
  level?: string;
  category?: string;
  modules: Module[];
  isEnrolled: boolean;
  progress?: {
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    lastLessonId?: string;
  } | null;
}

interface RouteParams {
  id: string;
}

export function CourseDetailScreen({
  route,
  navigation,
}: {
  route: { params: RouteParams };
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void; goBack: () => void };
}) {
  const { id } = route.params;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const data = await coursesApi.getById(id);
      setCourse(data);
      // Expand first module by default
      if (data.modules.length > 0) {
        setExpandedModule(data.modules[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Course not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        {course.thumbnail?.url ? (
          <Image source={{ uri: course.thumbnail.url }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}

        {/* Course Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{course.title}</Text>

          {/* Instructor */}
          {course.instructor && (
            <View style={styles.instructor}>
              <View style={styles.instructorAvatar}>
                {course.instructor.avatar ? (
                  <Image
                    source={{ uri: course.instructor.avatar }}
                    style={styles.instructorImage}
                  />
                ) : (
                  <Text style={styles.instructorInitial}>
                    {course.instructor.name?.charAt(0) || 'I'}
                  </Text>
                )}
              </View>
              <Text style={styles.instructorName}>{course.instructor.name}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {course.stats.avgRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>({course.stats.reviewCount} reviews)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.stats.enrollments}</Text>
              <Text style={styles.statLabel}>students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(course.stats.totalDuration)}</Text>
              <Text style={styles.statLabel}>total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.stats.lessonCount}</Text>
              <Text style={styles.statLabel}>lessons</Text>
            </View>
          </View>

          {/* Description */}
          {course.shortDescription && (
            <Text style={styles.description}>{course.shortDescription}</Text>
          )}

          {/* Progress */}
          {course.isEnrolled && course.progress && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${course.progress.percentComplete}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {course.progress.completedLessons} of {course.progress.totalLessons} lessons
                completed ({course.progress.percentComplete}%)
              </Text>
            </View>
          )}

          {/* Course Content */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            <Text style={styles.contentMeta}>
              {course.stats.moduleCount} modules • {course.stats.lessonCount} lessons •{' '}
              {formatDuration(course.stats.totalDuration)}
            </Text>

            {course.modules.map((module) => (
              <View key={module.id} style={styles.module}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(module.id)}
                >
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleMeta}>
                      {module.lessons.length} lessons
                    </Text>
                  </View>
                  <Text style={styles.moduleArrow}>
                    {expandedModule === module.id ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {expandedModule === module.id && (
                  <View style={styles.lessonList}>
                    {module.lessons.map((lesson) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => {
                          if (course.isEnrolled || lesson.isFree) {
                            navigation.navigate('Lesson', { id: lesson.id });
                          }
                        }}
                        disabled={!course.isEnrolled && !lesson.isFree}
                      >
                        <View style={styles.lessonIcon}>
                          <Text>
                            {lesson.type === 'video' ? '▶️' : '📄'}
                          </Text>
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text
                            style={[
                              styles.lessonTitle,
                              !course.isEnrolled && !lesson.isFree && styles.lessonLocked,
                            ]}
                          >
                            {lesson.title}
                          </Text>
                          <Text style={styles.lessonDuration}>
                            {formatDuration(lesson.duration)}
                            {lesson.isFree && (
                              <Text style={styles.freeTag}> • Free Preview</Text>
                            )}
                          </Text>
                        </View>
                        {!course.isEnrolled && !lesson.isFree && (
                          <Text style={styles.lockIcon}>🔒</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {course.pricing.isFree
              ? 'Free'
              : `$${(course.pricing.amount / 100).toFixed(2)}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            if (course.isEnrolled && course.progress?.lastLessonId) {
              navigation.navigate('Lesson', { id: course.progress.lastLessonId });
            } else {
              // Handle enrollment
            }
          }}
        >
          <Text style={styles.ctaText}>
            {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#14b8a6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  instructorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  instructorInitial: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  instructorName: {
    fontSize: 14,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 16,
    lineHeight: 22,
  },
  progressSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  contentSection: {
    marginTop: 24,
  },
  contentMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  module: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  moduleMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  moduleArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  lessonList: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lessonIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#1f2937',
  },
  lessonLocked: {
    color: '#9ca3af',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  freeTag: {
    color: '#14b8a6',
  },
  lockIcon: {
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  priceContainer: {
    marginRight: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
