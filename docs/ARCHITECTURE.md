# Learning Hall - Architecture

**Version:** 2.1.0
**Last Updated:** February 15, 2026

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
│   ├── components/             # Shared React components (UI, layout, quiz runner, discussions)
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

#### `DiscussionThreads`
- Stores per-course root threads with title, body, status (open/answered/closed), pin state, vote totals, and subscriber relationships for notifications.
- Each thread automatically tracks `replyCount` and `lastActivityAt` to keep the board sorted by recent conversations.

#### `DiscussionPosts`
- Represents individual replies (and nested comments) under a thread.
- Maintains a `parent` relationship for threading, vote history, and `isAnswer` flag that instructors can toggle when verifying solutions.

#### `LessonNotes`
- Personal notes created by learners per lesson.
- Stores sanitized HTML content, extracted plain text for search, optional video timestamp metadata, and relationships back to the course/lesson.
- Notes are private to the author but still accessible to administrators for support purposes.

---

## Business Logic & Automation

- **Hooks**: Payload's hooks are used for automation. For example, a `beforeChange` hook on the `CourseProgress` collection calculates the `progressPercentage` whenever the `completedLessons` array is modified. This keeps the data consistent without requiring manual calculations on the client-side.
- **Assessment Engine**: Attempt creation copies the randomized question set, including shuffled choices, into `QuizAttempts` so grading is deterministic even when the bank changes. Submission grading awards partial credit for matching questions and updates quiz metadata (average score, question count, pass rate) in the background.
- **Access Control**: Quiz/question APIs enforce instructor-only management and ensure students can only start attempts for courses they are enrolled in. Attempt responses are masked server-side until instructors allow review/explanations.
- **Community Notifications**: Discussion replies automatically bump `replyCount`, subscribe the author, and trigger the `discussion-reply` email template for thread subscribers and instructors, ensuring learners stay informed about new activity.
- **Lesson Notes**: Notes sanitize user-provided HTML both client- and server-side, mirror plain text for search queries, and update metadata (e.g., timestamps) whenever learners edit or export their content.

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

## Discussion Boards Flow

1. **Thread Lifecycle**
   - Students and instructors create new topics from `/student/courses/{courseId}/discussions` which calls `POST /api/discussions` and subscribes authors + instructors automatically.
   - Moderators can pin/close threads via `PATCH /api/discussions/:id` keeping the most important conversations surfaced.

2. **Replies & Voting**
   - Replies (and nested replies) use `POST /api/discussions/:id/replies` with optional `parentId`. Vote APIs keep per-user scores up to date for both threads and replies.
   - The UI consumes `GET /api/discussions/:id` for thread detail plus `GET /api/discussions/:id/replies` to hydrate the tree on demand.

3. **Verification & Notifications**
   - Instructors mark helpful replies as the verified answer (`PATCH /api/discussions/:id/replies/:replyId`) which flips the thread status to answered and highlights the response for students.
   - Each reply updates `replyCount`, `lastActivityAt`, subscribes the author, and triggers the `discussion-reply` email template so participants know when someone responds.

---

## Lesson Notes Flow

1. **Note Creation**
   - Learners open `/student/courses/{courseId}/lessons/{lessonId}` and type into a rich text composer that sanitizes HTML before `POST /api/notes`.
   - The UI can capture the current video timestamp to store alongside the note for quick jumping later.

2. **Storage & Search**
   - `LessonNotes` keeps the sanitized HTML plus extracted plain text, making `/api/notes?search=ai` fast for global queries.
   - Notes record relationships back to course + lesson so the `NotesDashboard` can link directly to the original context.

3. **Exports & Review**
   - From either the lesson view or `/student/notes`, learners export notes as Markdown or PDF using `jspdf` and downloadable blobs.
   - Jump buttons call the `VideoPlayer`'s `seekTimestamp` prop so clicking a note replays the captured moment.

---

## Instructor Analytics Dashboard (F6.1)

The instructor dashboard at `/instructor` now uses a dedicated analytics domain module.

- **Server data layer**: `src/lib/instructor-dashboard/`
  - `service.ts` gathers instructor-specific datasets (courses, enrollments, reviews, quiz attempts, lesson activity, and revenue events)
  - `aggregation.ts`, `timeline.ts`, and `insights.ts` compute summary metrics, trends, and recommendations
  - `csv.ts` builds downloadable exports for all dashboard sections
- **API endpoint**: `GET /api/instructor/dashboard`
  - supports `range=7d|30d|90d|365d`
  - supports `format=csv` for exports
  - supports `notificationsOnly=true&since={iso}` for polling-based real-time enrollment alerts
- **Client UI composition**: `src/components/instructor/dashboard/`
  - collapsible sidebar with range filters and quick actions
  - line chart (enrollment trend), bar chart (completion comparison), pie chart (revenue mix)
  - sortable course performance table and actionable insights panel
  - notifications panel with unread state and polling refresh

---

## Course Builder V2 (F6.2)

Course Builder V2 introduces a dedicated instructor editing surface while preserving the legacy builder route.

- **Route**: `/dashboard/courses/{courseId}/builder-v2`
- **Entry points**:
  - `src/app/(dashboard)/dashboard/courses/[id]/builder-v2/page.tsx`
  - linked from course detail at `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`
- **Client module**: `src/components/course-builder-v2/`
  - `CourseBuilderV2.tsx` renders the V2 workspace
  - `useCourseBuilderState.ts` manages fetch, autosave, undo/redo, bulk actions, and drag-drop persistence
  - `SortableModuleTree.tsx` provides nested drag-drop behavior with `@dnd-kit`
  - `LessonEditorPanel.tsx` provides side-by-side edit + live preview
- **Domain utilities**: `src/lib/course-builder-v2/`
  - `reorder.ts`, `history.ts`, `autosave.ts`, `validation.ts`, `template-payload.ts`, `templates.ts`
- **API extension**:
  - `POST /api/courses/{id}/template`
  - builds a reusable structure payload from current modules/lessons and persists to `course-templates`
- **Behavior highlights**:
  - drag-and-drop module/lesson ordering with server sync
  - bulk lesson move/copy/delete
  - template-based lesson insertion
  - debounced autosave states (`saved`, `saving`, `unsaved`, `error`)
  - undo/redo history and keyboard shortcuts (`Ctrl/Cmd+S`, `Ctrl/Cmd+Z`, `Ctrl/Cmd+Y`, `Shift+Ctrl/Cmd+Z`)
  - validation warnings prior to publish readiness checks

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
