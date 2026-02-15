import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  Users,
  Tenants,
  Courses,
  Modules,
  Lessons,
  Media,
  Enrollments,
  CourseProgress,
  Certificates,
  Quizzes,
  Questions,
  QuizAttempts,
  DiscussionThreads,
  DiscussionPosts,
  LessonNotes,
  CourseFavorites,
  LessonBookmarks,
  LessonActivity,
  LessonVideoMetadata,
  CourseReviews,
  Badges,
  UserBadges,
  UserPoints,
  Payments,
  SubscriptionPlans,
  Subscriptions,
  Coupons,
  CourseBundles,
  Affiliates,
  AffiliateReferrals,
  AffiliatePayouts,
  InstructorPayouts,
  LiveSessions,
  SessionAttendance,
  AIConversations,
  APIKeys,
  WebhookEndpoints,
  AnalyticsEvents,
  SCORMPackages,
  SCORMAttempts,
  XAPIConfig,
  ContentVersions,
  CourseTemplates,
  Translations,
  SearchIndex,
  SearchAnalytics,
} from './collections';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Only enable S3 storage when credentials are configured
const s3Enabled = Boolean(
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY
);

const plugins = s3Enabled
  ? [
      s3Storage({
        collections: {
          media: true,
        },
        bucket: process.env.S3_BUCKET!,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        },
      }),
    ]
  : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Learning Hall',
    },
  },
  collections: [
    Users,
    Tenants,
    Courses,
    Modules,
    Lessons,
    Media,
    Enrollments,
    CourseProgress,
    Certificates,
    Quizzes,
    Questions,
    QuizAttempts,
    DiscussionThreads,
    DiscussionPosts,
    LessonNotes,
    CourseFavorites,
    LessonBookmarks,
    LessonActivity,
    LessonVideoMetadata,
    CourseReviews,
    Badges,
    UserBadges,
    UserPoints,
    Payments,
    SubscriptionPlans,
    Subscriptions,
    Coupons,
    CourseBundles,
    Affiliates,
    AffiliateReferrals,
    AffiliatePayouts,
    InstructorPayouts,
    LiveSessions,
    SessionAttendance,
    AIConversations,
    APIKeys,
    WebhookEndpoints,
    AnalyticsEvents,
    SCORMPackages,
    SCORMAttempts,
    XAPIConfig,
    ContentVersions,
    CourseTemplates,
    Translations,
    SearchIndex,
    SearchAnalytics,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  plugins,
  serverURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  cors: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ],
});
