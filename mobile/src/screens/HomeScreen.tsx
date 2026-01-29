import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { coursesApi, progressApi, Course } from '../services/api';

interface ProgressOverview {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCompletedLessons: number;
  totalWatchTime: number;
}

export function HomeScreen({ navigation }: { navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void } }) {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch enrolled courses
      const enrolledResult = await coursesApi.list({ enrolled: true, limit: 5 });
      setEnrolledCourses(enrolledResult.courses);

      // Fetch featured courses
      const featuredResult = await coursesApi.list({ limit: 6 });
      setFeaturedCourses(featuredResult.courses);

      // Fetch progress
      const progressResult = await progressApi.get();
      setProgress(progressResult.overview);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Learner'}</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          {user?.avatar?.url ? (
            <Image source={{ uri: user.avatar.url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Stats */}
      {progress && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{progress.totalCourses}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{progress.totalCompletedLessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatWatchTime(progress.totalWatchTime)}</Text>
            <Text style={styles.statLabel}>Watch Time</Text>
          </View>
        </View>
      )}

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {enrolledCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.enrolledCard}
                onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
              >
                {course.thumbnail?.url ? (
                  <Image
                    source={{ uri: course.thumbnail.url }}
                    style={styles.enrolledImage}
                  />
                ) : (
                  <View style={[styles.enrolledImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>📚</Text>
                  </View>
                )}
                <Text style={styles.enrolledTitle} numberOfLines={2}>
                  {course.title}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '45%' }]} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Courses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.courseGrid}>
          {featuredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
            >
              {course.thumbnail?.url ? (
                <Image
                  source={{ uri: course.thumbnail.url }}
                  style={styles.courseImage}
                />
              ) : (
                <View style={[styles.courseImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>📚</Text>
                </View>
              )}
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </Text>
                <Text style={styles.courseInstructor}>
                  {course.instructor?.name || 'Instructor'}
                </Text>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseRating}>
                    ⭐ {course.stats.avgRating.toFixed(1)}
                  </Text>
                  <Text style={styles.coursePrice}>
                    {course.pricing.isFree
                      ? 'Free'
                      : `$${(course.pricing.amount / 100).toFixed(2)}`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#14b8a6',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginTop: -20,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#14b8a6',
  },
  enrolledCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  enrolledImage: {
    width: '100%',
    height: 100,
  },
  enrolledTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    padding: 12,
    paddingBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 2,
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  courseCard: {
    width: '50%',
    padding: 6,
  },
  courseImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  courseInfo: {
    padding: 8,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  courseInstructor: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  courseRating: {
    fontSize: 12,
    color: '#6b7280',
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
});
