/**
 * Demo data for showcasing the Learning Hall platform
 * This data simulates a fully populated learning platform
 */

import type { Course } from '@/lib/courses';
import type { User } from '@/lib/auth';

// Demo User
export const demoUser: User = {
  id: 'demo-user-001',
  email: 'demo@learninghall.io',
  name: 'Alex Johnson',
  role: 'student',
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
  updatedAt: new Date().toISOString(),
};

export const demoInstructor: User = {
  id: 'demo-instructor-001',
  email: 'instructor@learninghall.io',
  name: 'Dr. Sarah Chen',
  role: 'instructor',
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo Courses
export const demoCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Complete Web Development Bootcamp',
    slug: 'complete-web-development-bootcamp',
    description:
      'Master HTML, CSS, JavaScript, React, and Node.js in this comprehensive bootcamp. Build real-world projects and launch your career as a full-stack developer.',
    shortDescription:
      'Learn full-stack web development from scratch with hands-on projects.',
    thumbnail: {
      id: 'thumb-001',
      url: '/api/placeholder/800/450',
      alt: 'Web Development Course',
    },
    instructor: {
      id: 'demo-instructor-001',
      name: 'Dr. Sarah Chen',
      email: 'instructor@learninghall.io',
    },
    status: 'published',
    price: {
      amount: 9900,
      currency: 'USD',
    },
    modules: ['mod-001', 'mod-002', 'mod-003', 'mod-004', 'mod-005'],
    settings: {
      allowPreview: true,
      requireSequentialProgress: false,
      certificateEnabled: true,
    },
    publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-002',
    title: 'Data Science with Python',
    slug: 'data-science-python',
    description:
      'Learn data analysis, visualization, and machine learning with Python. Work with real datasets and build predictive models.',
    shortDescription:
      'Master data science fundamentals using Python and popular libraries.',
    thumbnail: {
      id: 'thumb-002',
      url: '/api/placeholder/800/450',
      alt: 'Data Science Course',
    },
    instructor: {
      id: 'demo-instructor-002',
      name: 'Prof. Michael Torres',
      email: 'mtorres@learninghall.io',
    },
    status: 'published',
    price: {
      amount: 14900,
      currency: 'USD',
    },
    modules: ['mod-006', 'mod-007', 'mod-008', 'mod-009'],
    settings: {
      allowPreview: true,
      requireSequentialProgress: true,
      certificateEnabled: true,
    },
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-003',
    title: 'UI/UX Design Fundamentals',
    slug: 'ui-ux-design-fundamentals',
    description:
      'Master the principles of user interface and user experience design. Learn to create intuitive, beautiful, and accessible digital products.',
    shortDescription: 'Create stunning user experiences with modern design principles.',
    thumbnail: {
      id: 'thumb-003',
      url: '/api/placeholder/800/450',
      alt: 'UI/UX Design Course',
    },
    instructor: {
      id: 'demo-instructor-003',
      name: 'Emma Rodriguez',
      email: 'emma@learninghall.io',
    },
    status: 'published',
    price: {
      amount: 7900,
      currency: 'USD',
    },
    modules: ['mod-010', 'mod-011', 'mod-012'],
    settings: {
      allowPreview: true,
      requireSequentialProgress: false,
      certificateEnabled: true,
    },
    publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-004',
    title: 'Cloud Architecture with AWS',
    slug: 'cloud-architecture-aws',
    description:
      'Design and deploy scalable cloud solutions on Amazon Web Services. Prepare for AWS certification exams.',
    shortDescription: 'Build enterprise-grade cloud solutions on AWS.',
    thumbnail: {
      id: 'thumb-004',
      url: '/api/placeholder/800/450',
      alt: 'AWS Cloud Course',
    },
    instructor: {
      id: 'demo-instructor-001',
      name: 'Dr. Sarah Chen',
      email: 'instructor@learninghall.io',
    },
    status: 'published',
    price: {
      amount: 19900,
      currency: 'USD',
    },
    modules: ['mod-013', 'mod-014', 'mod-015', 'mod-016'],
    settings: {
      allowPreview: true,
      requireSequentialProgress: true,
      certificateEnabled: true,
    },
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-005',
    title: 'Mobile App Development with React Native',
    slug: 'mobile-app-react-native',
    description:
      'Build cross-platform mobile apps for iOS and Android using React Native. Deploy to app stores.',
    shortDescription: 'Create native mobile apps with JavaScript and React Native.',
    thumbnail: {
      id: 'thumb-005',
      url: '/api/placeholder/800/450',
      alt: 'React Native Course',
    },
    instructor: {
      id: 'demo-instructor-001',
      name: 'Dr. Sarah Chen',
      email: 'instructor@learninghall.io',
    },
    status: 'draft',
    price: {
      amount: 12900,
      currency: 'USD',
    },
    modules: ['mod-017', 'mod-018'],
    settings: {
      allowPreview: false,
      requireSequentialProgress: false,
      certificateEnabled: true,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Demo Modules
export interface DemoModule {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  lessons: string[];
}

export const demoModules: DemoModule[] = [
  // Web Development Course Modules
  {
    id: 'mod-001',
    title: 'Getting Started with HTML',
    description: 'Learn the building blocks of web pages',
    courseId: 'course-001',
    order: 1,
    lessons: ['lesson-001', 'lesson-002', 'lesson-003'],
  },
  {
    id: 'mod-002',
    title: 'CSS Styling & Layout',
    description: 'Make your websites beautiful and responsive',
    courseId: 'course-001',
    order: 2,
    lessons: ['lesson-004', 'lesson-005', 'lesson-006'],
  },
  {
    id: 'mod-003',
    title: 'JavaScript Fundamentals',
    description: 'Add interactivity to your web pages',
    courseId: 'course-001',
    order: 3,
    lessons: ['lesson-007', 'lesson-008', 'lesson-009', 'lesson-010'],
  },
  {
    id: 'mod-004',
    title: 'React Development',
    description: 'Build modern UI with React',
    courseId: 'course-001',
    order: 4,
    lessons: ['lesson-011', 'lesson-012', 'lesson-013'],
  },
  {
    id: 'mod-005',
    title: 'Node.js & Backend',
    description: 'Create server-side applications',
    courseId: 'course-001',
    order: 5,
    lessons: ['lesson-014', 'lesson-015', 'lesson-016'],
  },
  // Data Science Course Modules
  {
    id: 'mod-006',
    title: 'Python Basics for Data Science',
    description: 'Python programming fundamentals',
    courseId: 'course-002',
    order: 1,
    lessons: ['lesson-017', 'lesson-018', 'lesson-019'],
  },
  {
    id: 'mod-007',
    title: 'Data Analysis with Pandas',
    description: 'Manipulate and analyze data',
    courseId: 'course-002',
    order: 2,
    lessons: ['lesson-020', 'lesson-021', 'lesson-022'],
  },
  {
    id: 'mod-008',
    title: 'Data Visualization',
    description: 'Create compelling visualizations',
    courseId: 'course-002',
    order: 3,
    lessons: ['lesson-023', 'lesson-024'],
  },
  {
    id: 'mod-009',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML algorithms',
    courseId: 'course-002',
    order: 4,
    lessons: ['lesson-025', 'lesson-026', 'lesson-027'],
  },
  // UI/UX Course Modules
  {
    id: 'mod-010',
    title: 'Design Principles',
    description: 'Core concepts of visual design',
    courseId: 'course-003',
    order: 1,
    lessons: ['lesson-028', 'lesson-029'],
  },
  {
    id: 'mod-011',
    title: 'User Research',
    description: 'Understanding your users',
    courseId: 'course-003',
    order: 2,
    lessons: ['lesson-030', 'lesson-031'],
  },
  {
    id: 'mod-012',
    title: 'Prototyping & Testing',
    description: 'From wireframes to final design',
    courseId: 'course-003',
    order: 3,
    lessons: ['lesson-032', 'lesson-033', 'lesson-034'],
  },
];

// Demo Lessons
export interface DemoLesson {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  courseId: string;
  order: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number; // in minutes
  videoUrl?: string;
  content?: string;
}

export const demoLessons: DemoLesson[] = [
  // HTML Module Lessons
  {
    id: 'lesson-001',
    title: 'Introduction to HTML',
    description: 'What is HTML and how does it work?',
    moduleId: 'mod-001',
    courseId: 'course-001',
    order: 1,
    type: 'video',
    duration: 12,
  },
  {
    id: 'lesson-002',
    title: 'HTML Tags & Elements',
    description: 'Learn the most common HTML tags',
    moduleId: 'mod-001',
    courseId: 'course-001',
    order: 2,
    type: 'video',
    duration: 18,
  },
  {
    id: 'lesson-003',
    title: 'Building Your First Page',
    description: 'Hands-on: Create a complete HTML page',
    moduleId: 'mod-001',
    courseId: 'course-001',
    order: 3,
    type: 'assignment',
    duration: 30,
  },
  // CSS Module Lessons
  {
    id: 'lesson-004',
    title: 'CSS Fundamentals',
    description: 'Selectors, properties, and values',
    moduleId: 'mod-002',
    courseId: 'course-001',
    order: 1,
    type: 'video',
    duration: 15,
  },
  {
    id: 'lesson-005',
    title: 'Flexbox Layout',
    description: 'Modern CSS layout with Flexbox',
    moduleId: 'mod-002',
    courseId: 'course-001',
    order: 2,
    type: 'video',
    duration: 22,
  },
  {
    id: 'lesson-006',
    title: 'Responsive Design',
    description: 'Make websites work on all devices',
    moduleId: 'mod-002',
    courseId: 'course-001',
    order: 3,
    type: 'video',
    duration: 20,
  },
  // JavaScript Module Lessons
  {
    id: 'lesson-007',
    title: 'JavaScript Variables & Types',
    description: 'Understanding data in JavaScript',
    moduleId: 'mod-003',
    courseId: 'course-001',
    order: 1,
    type: 'video',
    duration: 16,
  },
  {
    id: 'lesson-008',
    title: 'Functions & Scope',
    description: 'Writing reusable code',
    moduleId: 'mod-003',
    courseId: 'course-001',
    order: 2,
    type: 'video',
    duration: 20,
  },
  {
    id: 'lesson-009',
    title: 'DOM Manipulation',
    description: 'Interacting with web pages',
    moduleId: 'mod-003',
    courseId: 'course-001',
    order: 3,
    type: 'video',
    duration: 25,
  },
  {
    id: 'lesson-010',
    title: 'JavaScript Quiz',
    description: 'Test your JavaScript knowledge',
    moduleId: 'mod-003',
    courseId: 'course-001',
    order: 4,
    type: 'quiz',
    duration: 15,
  },
  // React Module Lessons
  {
    id: 'lesson-011',
    title: 'Introduction to React',
    description: 'Why React and how it works',
    moduleId: 'mod-004',
    courseId: 'course-001',
    order: 1,
    type: 'video',
    duration: 18,
  },
  {
    id: 'lesson-012',
    title: 'Components & Props',
    description: 'Building UI with components',
    moduleId: 'mod-004',
    courseId: 'course-001',
    order: 2,
    type: 'video',
    duration: 24,
  },
  {
    id: 'lesson-013',
    title: 'State & Hooks',
    description: 'Managing data in React',
    moduleId: 'mod-004',
    courseId: 'course-001',
    order: 3,
    type: 'video',
    duration: 28,
  },
  // Node.js Module Lessons
  {
    id: 'lesson-014',
    title: 'Node.js Basics',
    description: 'Server-side JavaScript',
    moduleId: 'mod-005',
    courseId: 'course-001',
    order: 1,
    type: 'video',
    duration: 20,
  },
  {
    id: 'lesson-015',
    title: 'Express.js Framework',
    description: 'Building APIs with Express',
    moduleId: 'mod-005',
    courseId: 'course-001',
    order: 2,
    type: 'video',
    duration: 25,
  },
  {
    id: 'lesson-016',
    title: 'Database Integration',
    description: 'Connecting to databases',
    moduleId: 'mod-005',
    courseId: 'course-001',
    order: 3,
    type: 'video',
    duration: 30,
  },
  // Data Science Lessons (abbreviated)
  {
    id: 'lesson-017',
    title: 'Python Setup & Environment',
    description: 'Setting up your data science environment',
    moduleId: 'mod-006',
    courseId: 'course-002',
    order: 1,
    type: 'video',
    duration: 15,
  },
  {
    id: 'lesson-018',
    title: 'Python Data Structures',
    description: 'Lists, dictionaries, and more',
    moduleId: 'mod-006',
    courseId: 'course-002',
    order: 2,
    type: 'video',
    duration: 22,
  },
  {
    id: 'lesson-019',
    title: 'Working with NumPy',
    description: 'Numerical computing in Python',
    moduleId: 'mod-006',
    courseId: 'course-002',
    order: 3,
    type: 'video',
    duration: 20,
  },
  {
    id: 'lesson-020',
    title: 'Introduction to Pandas',
    description: 'DataFrames and Series',
    moduleId: 'mod-007',
    courseId: 'course-002',
    order: 1,
    type: 'video',
    duration: 25,
  },
  {
    id: 'lesson-021',
    title: 'Data Cleaning',
    description: 'Handling missing data and outliers',
    moduleId: 'mod-007',
    courseId: 'course-002',
    order: 2,
    type: 'video',
    duration: 28,
  },
  {
    id: 'lesson-022',
    title: 'Data Aggregation',
    description: 'Grouping and summarizing data',
    moduleId: 'mod-007',
    courseId: 'course-002',
    order: 3,
    type: 'video',
    duration: 22,
  },
  {
    id: 'lesson-023',
    title: 'Matplotlib Fundamentals',
    description: 'Creating basic plots',
    moduleId: 'mod-008',
    courseId: 'course-002',
    order: 1,
    type: 'video',
    duration: 20,
  },
  {
    id: 'lesson-024',
    title: 'Advanced Visualization with Seaborn',
    description: 'Statistical visualizations',
    moduleId: 'mod-008',
    courseId: 'course-002',
    order: 2,
    type: 'video',
    duration: 25,
  },
  {
    id: 'lesson-025',
    title: 'Introduction to Machine Learning',
    description: 'ML concepts and terminology',
    moduleId: 'mod-009',
    courseId: 'course-002',
    order: 1,
    type: 'video',
    duration: 30,
  },
  {
    id: 'lesson-026',
    title: 'Regression Models',
    description: 'Predicting continuous values',
    moduleId: 'mod-009',
    courseId: 'course-002',
    order: 2,
    type: 'video',
    duration: 35,
  },
  {
    id: 'lesson-027',
    title: 'Classification Models',
    description: 'Predicting categories',
    moduleId: 'mod-009',
    courseId: 'course-002',
    order: 3,
    type: 'video',
    duration: 35,
  },
  // UI/UX Lessons (abbreviated)
  {
    id: 'lesson-028',
    title: 'Visual Hierarchy',
    description: 'Guiding user attention',
    moduleId: 'mod-010',
    courseId: 'course-003',
    order: 1,
    type: 'video',
    duration: 18,
  },
  {
    id: 'lesson-029',
    title: 'Color Theory for UI',
    description: 'Using color effectively',
    moduleId: 'mod-010',
    courseId: 'course-003',
    order: 2,
    type: 'video',
    duration: 22,
  },
  {
    id: 'lesson-030',
    title: 'User Interviews',
    description: 'Gathering user insights',
    moduleId: 'mod-011',
    courseId: 'course-003',
    order: 1,
    type: 'video',
    duration: 20,
  },
  {
    id: 'lesson-031',
    title: 'Creating User Personas',
    description: 'Representing your users',
    moduleId: 'mod-011',
    courseId: 'course-003',
    order: 2,
    type: 'video',
    duration: 16,
  },
  {
    id: 'lesson-032',
    title: 'Wireframing Basics',
    description: 'Low-fidelity design',
    moduleId: 'mod-012',
    courseId: 'course-003',
    order: 1,
    type: 'video',
    duration: 18,
  },
  {
    id: 'lesson-033',
    title: 'High-Fidelity Prototypes',
    description: 'Interactive prototypes',
    moduleId: 'mod-012',
    courseId: 'course-003',
    order: 2,
    type: 'video',
    duration: 25,
  },
  {
    id: 'lesson-034',
    title: 'Usability Testing',
    description: 'Validating your designs',
    moduleId: 'mod-012',
    courseId: 'course-003',
    order: 3,
    type: 'video',
    duration: 22,
  },
];

// Demo Enrollments and Progress
export interface DemoEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'paused';
}

export const demoEnrollments: DemoEnrollment[] = [
  {
    id: 'enroll-001',
    courseId: 'course-001',
    userId: 'demo-user-001',
    enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'enroll-002',
    courseId: 'course-002',
    userId: 'demo-user-001',
    enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'enroll-003',
    courseId: 'course-003',
    userId: 'demo-user-001',
    enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
];

export interface DemoProgress {
  id: string;
  lessonId: string;
  courseId: string;
  userId: string;
  completedAt?: string;
  watchedSeconds?: number;
}

// Progress for enrolled courses
export const demoProgress: DemoProgress[] = [
  // Web Development Course - 65% complete
  {
    id: 'prog-001',
    lessonId: 'lesson-001',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-002',
    lessonId: 'lesson-002',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-003',
    lessonId: 'lesson-003',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-004',
    lessonId: 'lesson-004',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-005',
    lessonId: 'lesson-005',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-006',
    lessonId: 'lesson-006',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-007',
    lessonId: 'lesson-007',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-008',
    lessonId: 'lesson-008',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-009',
    lessonId: 'lesson-009',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-010',
    lessonId: 'lesson-010',
    courseId: 'course-001',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Data Science Course - 35% complete
  {
    id: 'prog-011',
    lessonId: 'lesson-017',
    courseId: 'course-002',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-012',
    lessonId: 'lesson-018',
    courseId: 'course-002',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-013',
    lessonId: 'lesson-019',
    courseId: 'course-002',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prog-014',
    lessonId: 'lesson-020',
    courseId: 'course-002',
    userId: 'demo-user-001',
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // UI/UX Course - 100% complete
  ...demoLessons
    .filter((l) => l.courseId === 'course-003')
    .map((lesson, index) => ({
      id: `prog-uiux-${index}`,
      lessonId: lesson.id,
      courseId: 'course-003',
      userId: 'demo-user-001',
      completedAt: new Date(
        Date.now() - (60 - index * 5) * 24 * 60 * 60 * 1000
      ).toISOString(),
    })),
];

// Demo Achievements / Gamification
export interface DemoBadge {
  id: string;
  name: string;
  slug: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  category: string;
}

export const demoBadges: DemoBadge[] = [
  {
    id: 'badge-001',
    name: 'First Steps',
    slug: 'first-steps',
    description: 'Complete your first lesson',
    rarity: 'common',
    points: 10,
    category: 'learning',
  },
  {
    id: 'badge-002',
    name: 'Week Warrior',
    slug: 'week-warrior',
    description: 'Maintain a 7-day learning streak',
    rarity: 'uncommon',
    points: 50,
    category: 'streaks',
  },
  {
    id: 'badge-003',
    name: 'Course Completer',
    slug: 'course-completer',
    description: 'Complete your first course',
    rarity: 'rare',
    points: 100,
    category: 'learning',
  },
  {
    id: 'badge-004',
    name: 'Quiz Master',
    slug: 'quiz-master',
    description: 'Score 100% on any quiz',
    rarity: 'uncommon',
    points: 30,
    category: 'assessments',
  },
  {
    id: 'badge-005',
    name: 'Night Owl',
    slug: 'night-owl',
    description: 'Complete a lesson after midnight',
    rarity: 'common',
    points: 15,
    category: 'special',
  },
  {
    id: 'badge-006',
    name: 'Month Master',
    slug: 'month-master',
    description: 'Maintain a 30-day learning streak',
    rarity: 'epic',
    points: 200,
    category: 'streaks',
  },
  {
    id: 'badge-007',
    name: 'Speed Learner',
    slug: 'speed-learner',
    description: 'Complete 5 lessons in a single day',
    rarity: 'rare',
    points: 75,
    category: 'learning',
  },
  {
    id: 'badge-008',
    name: 'Triple Threat',
    slug: 'triple-threat',
    description: 'Enroll in 3 different courses',
    rarity: 'uncommon',
    points: 40,
    category: 'learning',
  },
];

export interface DemoEarnedBadge {
  badge: DemoBadge;
  awardedAt: string;
  isNew: boolean;
}

export const demoEarnedBadges: DemoEarnedBadge[] = [
  {
    badge: demoBadges[0], // First Steps
    awardedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    badge: demoBadges[1], // Week Warrior
    awardedAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    badge: demoBadges[2], // Course Completer
    awardedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    badge: demoBadges[3], // Quiz Master
    awardedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    badge: demoBadges[4], // Night Owl
    awardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    badge: demoBadges[7], // Triple Threat
    awardedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
];

export interface DemoInProgressBadge {
  badge: DemoBadge;
  current: number;
  required: number;
}

export const demoInProgressBadges: DemoInProgressBadge[] = [
  {
    badge: demoBadges[5], // Month Master
    current: 18,
    required: 30,
  },
  {
    badge: demoBadges[6], // Speed Learner
    current: 3,
    required: 5,
  },
];

// Demo Points/XP Data
export const demoPointsData = {
  totalPoints: 2450,
  level: 5,
  title: 'Knowledge Seeker',
  pointsToNextLevel: 150,
  streak: {
    current: 18,
    longest: 23,
    lastActivityDate: new Date().toISOString(),
  },
  stats: {
    coursesCompleted: 1,
    lessonsCompleted: 21,
    quizzesPassed: 3,
    badgesEarned: 6,
  },
  recentHistory: [
    {
      amount: 25,
      reason: 'Completed lesson: Data Aggregation',
      source: 'lesson-completion',
      earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      amount: 40,
      reason: 'Earned badge: Triple Threat',
      source: 'badge',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      amount: 25,
      reason: 'Completed lesson: Introduction to Pandas',
      source: 'lesson-completion',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      amount: 10,
      reason: 'Daily streak bonus (Day 15)',
      source: 'streak',
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Demo Certificates
export interface DemoCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  issuedAt: string;
  verificationUrl: string;
}

export const demoCertificates: DemoCertificate[] = [
  {
    id: 'cert-001',
    courseId: 'course-003',
    courseTitle: 'UI/UX Design Fundamentals',
    userId: 'demo-user-001',
    userName: 'Alex Johnson',
    issuedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    verificationUrl: '/verify/cert-001',
  },
];

// Demo Notes
export interface DemoNote {
  id: string;
  lessonId: string;
  courseId: string;
  userId: string;
  content: string;
  timestamp?: number; // video timestamp in seconds
  createdAt: string;
  updatedAt: string;
}

export const demoNotes: DemoNote[] = [
  {
    id: 'note-001',
    lessonId: 'lesson-005',
    courseId: 'course-001',
    userId: 'demo-user-001',
    content:
      'Flexbox tip: Use justify-content for main axis, align-items for cross axis. Remember: flex-direction changes which axis is main!',
    timestamp: 342,
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-002',
    lessonId: 'lesson-008',
    courseId: 'course-001',
    userId: 'demo-user-001',
    content:
      'Closures: A function that has access to variables from its outer scope even after that scope has finished executing. Useful for data privacy and factory functions.',
    timestamp: 890,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-003',
    lessonId: 'lesson-020',
    courseId: 'course-002',
    userId: 'demo-user-001',
    content:
      "DataFrame is like a spreadsheet in Python. Use df.head() to preview, df.describe() for stats, df.info() for column types. Remember: axis=0 is rows, axis=1 is columns.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo Bookmarks
export interface DemoBookmark {
  id: string;
  lessonId: string;
  courseId: string;
  userId: string;
  timestamp?: number;
  note?: string;
  createdAt: string;
}

export const demoBookmarks: DemoBookmark[] = [
  {
    id: 'bookmark-001',
    lessonId: 'lesson-009',
    courseId: 'course-001',
    userId: 'demo-user-001',
    timestamp: 445,
    note: 'Great explanation of event delegation',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bookmark-002',
    lessonId: 'lesson-012',
    courseId: 'course-001',
    userId: 'demo-user-001',
    note: 'Review this before starting the project',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bookmark-003',
    lessonId: 'lesson-021',
    courseId: 'course-002',
    userId: 'demo-user-001',
    timestamp: 780,
    note: 'Important: handling NaN values',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper functions to calculate progress
export function calculateCourseProgress(courseId: string): number {
  const courseLessons = demoLessons.filter((l) => l.courseId === courseId);
  const completedLessons = demoProgress.filter(
    (p) => p.courseId === courseId && p.completedAt
  );
  if (courseLessons.length === 0) return 0;
  return Math.round((completedLessons.length / courseLessons.length) * 100);
}

export function getEnrolledCourses() {
  return demoEnrollments.map((enrollment) => {
    const course = demoCourses.find((c) => c.id === enrollment.courseId);
    const progress = calculateCourseProgress(enrollment.courseId);
    return {
      ...enrollment,
      course,
      progressPercentage: progress,
    };
  });
}

export function getCourseWithModulesAndLessons(courseId: string) {
  const course = demoCourses.find((c) => c.id === courseId);
  if (!course) return null;

  const modules = demoModules
    .filter((m) => m.courseId === courseId)
    .map((module) => ({
      ...module,
      lessons: demoLessons
        .filter((l) => l.moduleId === module.id)
        .sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.order - b.order);

  return {
    ...course,
    modulesData: modules,
  };
}
