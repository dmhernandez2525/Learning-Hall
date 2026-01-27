# Learning Hall - Architecture

**Version:** 2.0.0
**Last Updated:** January 2026

---

## System Overview

Learning Hall uses a modern, monolithic architecture with Next.js 14 as the full-stack framework and Payload as a headless CMS integrated directly into the application.

```
┌──────────────────────────────────────────────────────────┐
│                      User / Browser                      │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                  Next.js Application                     │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                  App Router (Server)                 │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ │ │
│ │ │ Marketing UI │ │ Dashboard UI │ │  API Routes   │ │ │
│ │ └───────┬──────┘ └───────┬──────┘ └────────┬──────┘ │ │
│ └─────────│────────────────│─────────────────│────────┘ │
│           │                │                 │           │
│ ┌─────────▼────────────────▼─────────────────▼────────┐ │
│ │                   Payload CMS                      │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│ │ │ Auth         │ │ REST & GraphQL │ │ Collections  │ │ │
│ │ │              │ │ API            │ │ (Data Models)│ │ │
│ │ └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ │ │
│ └─────────│────────────────│─────────────────│────────┘ │
└───────────│────────────────│─────────────────│──────────┘
            │                │                 │
┌───────────▼────────────────▼─────────────────▼────────┐
│                      PostgreSQL                      │
│             (with Row-Level Security)                │
└──────────────────────────────────────────────────────┘
```

---

## Directory Structure

The project follows a standard Next.js App Router structure with Payload-specific directories integrated within `src`.

```
Learning-Hall/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/            # Payload Admin Panel UI
│   │   ├── (app)/              # Core application (dashboards, courses)
│   │   ├── (marketing)/        # Public-facing pages (landing, pricing)
│   │   └── api/                # Next.js API routes (e.g., for webhooks)
│   ├── collections/            # Payload CMS collection definitions
│   │   ├── Users.ts
│   │   ├── Courses.ts
│   │   ├── Enrollments.ts
│   │   ├── CourseProgress.ts   # (New) Tracks lesson completion
│   │   └── ...
│   ├── components/             # Shared React components (UI, layout, quiz runner)
│   ├── lib/                    # Core libraries, utilities, and services
│   ├── payload.config.ts       # Main Payload CMS configuration
│   └── middleware.ts           # Next.js middleware for route protection
├── docs/                       # Project documentation
├── public/                     # Static assets
├── render.yaml                 # Deployment configuration for Render
└── tsconfig.json               # TypeScript configuration
```

---

## Data Models (Payload Collections)

Data modeling is handled through Payload's collection configuration files.

### Key Collections

#### `Users`
- Manages user identity, authentication, and roles (admin, instructor, student).

#### `Tenants`
- Represents an organization or workspace in the multi-tenant system.

#### `Courses`, `Modules`, & `Lessons`
- Form the hierarchical structure of the educational content.

#### `Enrollments`
- Connects a `User` to a `Course`, creating an enrollment record.

#### `CourseProgress` (New in F2.2)
- Stores the progress of a specific `User` in a specific `Course`.
- This collection holds a list of completed `Lessons`.
- `fields`:
    - `user` (relationship to `Users`)
    - `course` (relationship to `Courses`)
    - `completedLessons` (relationship to `Lessons`, hasMany)
    - `progressPercentage` (number, calculated via hook)

#### `Quizzes`
- Represents a reusable assessment for a course.
- Contains configuration for passing score, timers, retake limits, question pool size, and analytics metadata.
- Linked to `Lessons` via the new `quizContent.mode` and `quizContent.quiz` fields when instructors embed assessments in the curriculum.

#### `Questions`
- Holds the course-specific question bank with support for multiple choice, true/false, short answer, and matching types.
- Stores metadata such as difficulty, topic tags, point value, and explanations that can be revealed after submission.

#### `QuizAttempts`
- Persists every learner attempt, including the randomized question snapshot, responses, score, and timing data.
- Drives analytics (average score, pass rate, question difficulty) surfaced to instructors in the dashboard and API.

---

## Business Logic & Automation

- **Hooks**: Payload's hooks are used for automation. For example, a `beforeChange` hook on the `CourseProgress` collection calculates the `progressPercentage` whenever the `completedLessons` array is modified. This keeps the data consistent without requiring manual calculations on the client-side.
- **Assessment Engine**: Attempt creation copies the randomized question set—including shuffled choices—into `QuizAttempts` so grading is deterministic even when the bank changes. Submission grading awards partial credit for matching questions and updates quiz metadata (average score, question count, pass rate) in the background.
- **Access Control**: Quiz/question APIs enforce instructor-only management and ensure students can only start attempts for courses they are enrolled in. Attempt responses are masked server-side until instructors allow review/explanations.

---

## Assessment Engine Flow

1. **Instructor Workflow**
   - Manage quizzes from the course builder under the "Quizzes & Assessments" tab.
   - Create question banks per quiz with difficulty, topics, explanations, and matching pairs.
   - Link an advanced quiz to a lesson by setting `quizContent.mode = 'engine'`.
   - Review analytics via `/api/quizzes/:id/analytics` or the builder modal (attempt count, average score, pass rate, question stats).

2. **Learner Workflow**
   - Navigate to `/student/courses/{courseId}/quizzes` to see all published assessments with retake availability and last score.
   - Start/resume attempts at `/student/courses/{courseId}/quizzes/{quizId}`. The client fetches `/api/quizzes/:id/attempts` to resume and `/api/quizzes/:id/attempts/:attemptId` to submit.
   - Timers run client-side, but the server enforces time limits and retake counts before grading.
   - After submission, explanations/correct answers are only returned when `showExplanations` and `allowReview` are enabled.

3. **Analytics**
   - `QuizAttempts` updates trigger metadata refresh on the parent `Quiz` so instructors can see cumulative stats in the builder and via API.
   - Question-level accuracy and average points feed the instructor analytics modal and JSON responses, enabling quick identification of tricky items.

---

## Authentication & Authorization

- **Authentication**: Handled by Payload Auth (JWT-based).
- **Authorization**:
    - **Route Protection**: Next.js middleware protects routes.
    - **Data Access**: Payload access control functions and PostgreSQL RLS enforce multi-tenancy and role-based permissions.

---

## Deployment & Hosting

- **Provider**: Render.com
- **Configuration**: The `render.yaml` file defines a multi-service deployment.
- **CI/CD**: Render automatically builds and deploys on pushes to `main`.
