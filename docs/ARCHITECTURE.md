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

## Advanced Video Management (F6.3)

Advanced Video Management adds rich video interaction features on top of the base `VideoPlayer`.

- **Collection**: `LessonVideoMetadata` stores chapters, hotspots, annotations, VTT transcript, and quality options per lesson (unique on lesson).
- **API routes** (all under `/api/lessons/[id]/`):
  - `video-metadata` (GET/PATCH): read/upsert metadata (instructor/admin only for writes)
  - `video-analytics` (GET): heatmap, completion rate, drop-off points (instructor/admin only)
  - `bookmarks` (GET/POST): list/create timestamped bookmarks with optional notes
  - `bookmarks/[bookmarkId]` (DELETE): remove a bookmark
  - `activity` (GET): retrieve lesson activity for a user
- **Components** (`src/components/video/advanced/`):
  - `AdvancedVideoPlayer`: main player with captions track, quality switching, PiP, playback rate control, progress reporting with 90% completion detection
  - `VideoControlsBar`: speed, quality, PiP, time display controls
  - `VideoOverlays`: timed annotation and hotspot overlays
  - `ChaptersList`: chapter navigation buttons
  - `VideoBookmarksPanel`: create/list/delete timestamped bookmarks via API
  - `TranscriptPanel`: view parsed VTT cues, instructor edit mode for VTT content
  - `VideoAnalyticsDashboard`: SVG heatmap, stat cards (total views, completion rate, avg watch position), drop-off points list
- **Services** (`src/lib/`):
  - `video-metadata.ts`: safe Payload doc mappers, `getVideoMetadataByLesson`, `upsertVideoMetadata`
  - `video-analytics.ts`: heatmap bin generation, drop-off detection, `getLessonVideoAnalytics`
- **User preferences**: `videoPlaybackRate` field on Users collection, persisted via `/api/users/me` PATCH

---

## Manager Dashboard (F7.5)

The Manager Dashboard provides team progress views, training assignment management, and completion oversight.

### Collections
- **TrainingAssignments** (`training-assignments`): Manager-assigned training with user/course references, due dates, status (assigned/in_progress/completed/overdue), progress percentage, and manager/user-scoped read access.

### Service Layer (`src/lib/manager.ts`)
- `formatAssignment()`: Safe doc-to-type mapper
- `createAssignment()`: Creates training assignment with duplicate prevention per manager/user/course
- `updateAssignmentStatus()`: Updates status and auto-sets completedAt on completion
- `getTeamProgress(managerId)`: Aggregates per-member stats (enrolled, completed, overdue, average progress)
- `getManagerDashboard(managerId)`: Full dashboard with team size, assignment counts, completion rate, and team members

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/manager/assignments` | List/create training assignments |
| PATCH | `/api/manager/assignments/[id]` | Update assignment status/progress |
| GET | `/api/manager/team` | Team member progress |
| GET | `/api/manager/dashboard` | Full manager dashboard |

### UI Components
- **TeamProgressView**: Table with member names, enrolled/completed counts, average progress, overdue badges
- **AssignmentManager**: Assignment cards with course name, assignee, status badges, due date, progress
- **ManagerDashboardView**: Stat cards and SVG donut chart for completion rate

---

## Skills Framework (F7.4)

The Skills Framework provides a skill taxonomy, competency mapping to courses, user assessments, and gap analysis.

### Collections
- **Skills** (`skills`): Hierarchical skill definitions with category, level (beginner/intermediate/advanced/expert), parent self-reference, and status (active/deprecated).
- **CompetencyMappings** (`competency-mappings`): Links skills to courses with target levels and weights (0-10).
- **UserSkillAssessments** (`user-skill-assessments`): Per-user skill assessments with current/target levels, source tracking (manual/course_completion/quiz/peer_review), and user-scoped read access.

### Service Layer (`src/lib/skills.ts`)
- `formatSkill()` / `formatMapping()` / `formatAssessment()`: Safe doc-to-type mappers
- `createSkill()`: Creates skills in the taxonomy
- `createMapping()`: Links skills to courses with target levels
- `createAssessment()`: Records user skill assessments
- `getGapAnalysis(userId)`: Calculates level gaps for each assessed skill, recommends courses via competency mappings, sorted by largest gap
- `getSkillsAnalytics()`: Aggregates skill counts by category and average gap score

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/skills` | List/create skills (with category filter) |
| GET | `/api/skills/[id]` | Read a single skill |
| GET/POST | `/api/skills/mappings` | List/create competency mappings |
| GET/POST | `/api/skills/assessments` | List/create assessments |
| GET | `/api/skills/gap-analysis` | Gap analysis for a user |
| GET | `/api/skills/analytics` | Skills analytics dashboard |

### UI Components
- **SkillTaxonomy**: Skill list with category filter dropdown, level/status badges
- **GapAnalysis**: SVG bar chart of skill gaps with level transition labels and recommended course counts
- **SkillsAnalyticsDashboard**: Stat cards and SVG horizontal bar chart for skills by category

---

## Enterprise Reporting (F7.3)

Enterprise Reporting provides a custom report builder with scheduled exports and analytics for organizations.

### Collections
- **ReportDefinitions** (`report-definitions`): Report templates with column/filter/schedule configuration. Supports enrollment, completion, compliance, revenue, engagement, and custom types.
- **ReportExecutions** (`report-executions`): Execution records tracking status (pending/running/completed/failed), row counts, and export format (CSV/JSON/PDF).

### Service Layer (`src/lib/reporting.ts`)
- `formatDefinition()` / `formatExecution()`: Safe doc-to-type mappers
- `createReportDefinition()`: Creates report templates with column and filter configuration
- `executeReport()`: Runs a report, collects data from the target collection, and records execution metadata
- `getScheduledReports()`: Returns active reports with schedule configuration
- `getReportingAnalytics()`: Aggregates report counts, execution totals, and per-type breakdowns

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/reports/definitions` | List/create report definitions |
| GET/PATCH | `/api/reports/definitions/[id]` | Read/update a definition |
| POST | `/api/reports/definitions/[id]/execute` | Execute a report |
| GET | `/api/reports/executions` | List executions (optionally by reportId) |
| GET | `/api/reports/executions/[id]` | Read a single execution |
| GET | `/api/reports/scheduled` | List scheduled reports (admin only) |
| GET | `/api/reports/analytics` | Reporting analytics dashboard |

### UI Components
- **ReportBuilder**: Report list with inline creation form, type/status badges, column/filter/schedule metadata
- **ExecutionHistory**: Table of executions with status badges, row counts, timestamps, and run button
- **ReportingAnalyticsDashboard**: Stat cards and SVG horizontal bar chart for reports by type

---

## Compliance Training (F7.2)

Compliance Training provides mandatory training assignments with deadline tracking and completion reporting.

- **Collections**:
  - `ComplianceRequirements`: training requirements with course/org relationships, due dates, isRequired flag, assignee/completion counts
  - `ComplianceAssignments`: per-user assignments with status lifecycle (pending/in_progress/completed/overdue), progress tracking
- **API routes**:
  - `/api/compliance/requirements` (GET/POST): list/create requirements with org filter
  - `/api/compliance/requirements/[id]` (GET/PATCH): read/update requirement
  - `/api/compliance/requirements/[id]/assign` (POST): bulk assign to users (up to 500)
  - `/api/compliance/requirements/[id]/assignments` (GET): list assignments for requirement
  - `/api/compliance/assignments` (GET): list current user assignments
  - `/api/compliance/assignments/[id]/complete` (POST): mark assignment complete
  - `/api/compliance/report` (GET): aggregate compliance report
- **Components** (`src/components/compliance/`):
  - `RequirementList`: requirement cards with status badges, progress bars, overdue detection
  - `AssignmentTracker`: per-user assignment list with complete actions
  - `ComplianceReportDashboard`: SVG donut charts for completion and overdue rates, stat cards
- **Service** (`src/lib/compliance.ts`):
  - `assignRequirement`: bulk creates assignments with duplicate skip, auto-increments assignee count
  - `completeAssignment`: updates status, sets completedAt, increments completion count
  - `checkOverdueAssignments`: finds past-due pending/in_progress and marks overdue
  - `getComplianceReport`: aggregates all assignment statuses into summary with rates

---

## Organization Management (F7.1)

Organization Management provides multi-org hierarchy, department structure, and bulk user provisioning.

- **Collections**:
  - `Organizations`: org data with parent self-reference for hierarchy, tenant relationship, slug, status (active/inactive), member count
  - `Departments`: nested department structure with organization and parent department relationships, manager assignment
  - `OrgMemberships`: user-to-org assignments with role (owner/admin/manager/member) and optional department
- **API routes**:
  - `/api/organizations` (GET/POST): list tenant orgs, create org (admin only)
  - `/api/organizations/[id]/departments` (GET/POST): list/create departments
  - `/api/organizations/[id]/members` (GET/POST): list/add org members
  - `/api/organizations/[id]/bulk-provision` (POST): bulk create users and assign memberships (admin only, up to 500)
  - `/api/organizations/[id]/analytics` (GET): org analytics with member count, department count, avg course progress
- **Components** (`src/components/organizations/`):
  - `OrgList`: org cards with status badges and member counts
  - `DepartmentTree`: hierarchical tree rendering with nested indentation via `buildTree` algorithm
  - `MemberTable`: sortable member table with role badges and join dates
- **Service** (`src/lib/organizations.ts`):
  - `bulkProvisionUsers`: creates or finds users by email, checks for existing memberships, returns created/skipped/errors summary
  - `addMember`: creates membership and atomically increments org member count

---

## Content Marketplace (F6.8)

Content Marketplace enables instructor-to-instructor content sharing with licensing and purchase tracking.

- **Collections**:
  - `MarketplaceListings`: listing data with seller/course relationships, pricing, license types (single-use/unlimited/time-limited), categories, tags (JSON), rating, review count, purchase count
  - `MarketplacePurchases`: purchase records with buyer/seller, license type, expiration tracking, status (pending/completed/refunded)
  - `MarketplaceReviews`: rating (1-5) and comment per listing with automatic rating recalculation
- **API routes**:
  - `/api/marketplace/listings` (GET/POST): browse active listings with search/category filters, create new listing
  - `/api/marketplace/listings/[id]` (GET/PATCH): read/update listing details and status
  - `/api/marketplace/listings/[id]/reviews` (GET/POST): list and add reviews with rating recalculation
  - `/api/marketplace/purchases` (GET/POST): list user purchases, complete a purchase with license expiry calculation
  - `/api/marketplace/analytics` (GET): seller analytics with revenue, purchase counts, category breakdown
- **Components** (`src/components/marketplace/`):
  - `ListingCatalog`: browsable grid with search, category filters, price display, license badges, and purchase buttons
  - `ListingDetail`: full listing view with description, tags, reviews list, and purchase action
  - `MarketplaceAnalyticsDashboard`: stat cards for listings/purchases/revenue, SVG horizontal bar chart for top categories
- **Service** (`src/lib/marketplace.ts`):
  - `purchaseListing`: self-purchase prevention, time-limited license expiry calculation, atomic purchase count increment
  - `addReview`: creates review and triggers `recalculateListingRating` for weighted average update
  - `getMarketplaceAnalytics`: aggregates listings, purchases, and revenue with category distribution

---

## Mentorship Program (F6.7)

Mentorship Program enables mentor-mentee matching, session scheduling, and progress tracking with analytics.

- **Collections**:
  - `MentorProfiles`: mentor data with expertise tags (JSON), availability slots (JSON), max mentee capacity, active mentee count, and status (active/paused/inactive)
  - `MentorshipMatches`: mentor-mentee pairings with course relationship, status lifecycle (pending/active/completed/cancelled), and timestamp tracking
  - `MentorshipSessions`: scheduled sessions with match relationship, duration, status (scheduled/completed/cancelled/no-show), mentee rating (1-5), and feedback
- **API routes**:
  - `/api/mentors` (GET/POST): list active mentors with expertise filtering, create mentor profile
  - `/api/mentors/[id]` (GET/PATCH): read/update mentor profile, availability, and status
  - `/api/mentorship/matches` (GET/POST): list user matches, request new match with capacity check
  - `/api/mentorship/matches/[id]` (PATCH): update match status (accept/complete/cancel)
  - `/api/mentorship/sessions` (GET/POST): list sessions by match, schedule new session
  - `/api/mentorship/sessions/[id]` (PATCH): update session status, add notes/rating/feedback
  - `/api/mentorship/analytics` (GET): mentor analytics with match counts, session breakdown, and average rating
- **Components** (`src/components/mentorship/`):
  - `MentorList`: mentor cards with expertise badges, availability spots, and match request button
  - `MentorScheduler`: session scheduling with datetime picker and duration selector, session history list
  - `SessionTracker`: match lifecycle management with accept/decline/complete actions
  - `MentorshipAnalyticsDashboard`: stat cards and SVG stacked bar chart for session status breakdown
- **Service** (`src/lib/mentorship.ts`):
  - `requestMatch`: validates capacity, prevents self-mentorship, creates pending match
  - `updateMatchStatus`: manages match lifecycle with automatic mentee count increment/decrement
  - `getMentorAnalytics`: aggregates match and session data with average rating calculation

---

## Cohort-Based Learning (F6.6)

Cohort-Based Learning provides time-windowed cohorts with drip content scheduling and analytics.

- **Collection**: `Cohorts` stores cohort definitions with course relationship, drip schedule array (moduleId + unlockDate), and embedded members array with user relationship, role (student/facilitator), and enrollment timestamp
- **API routes**:
  - `/api/courses/[id]/cohorts` (GET/POST): list cohorts for a course, create new cohort
  - `/api/cohorts/[id]` (GET/PATCH): read/update cohort details, status, and drip schedule
  - `/api/cohorts/[id]/join` (POST): join a cohort (enforces max capacity)
  - `/api/cohorts/[id]/analytics` (GET): cohort analytics with member progress and module unlock status (instructor/admin only)
  - `/api/cohorts/[id]/leaderboard` (GET): ranked member leaderboard by course completion
- **Components** (`src/components/cohorts/`):
  - `CohortList`: course cohort cards with status badges, member counts, and scheduled module counts
  - `CohortDripSchedule`: visual timeline of module unlock dates with locked/unlocked indicators
  - `CohortLeaderboard`: ranked member list with progress bars and completion percentages
  - `CohortAnalyticsDashboard`: stat cards for total members, active count, average progress, completion rate, and module unlock status list
- **Service** (`src/lib/cohorts.ts`):
  - `getUnlockedModules`: date-based module unlock resolution for drip scheduling
  - `sortAndRankLeaderboard`: deterministic sorting and ranking of cohort members
  - CRUD operations for cohorts, member join with capacity enforcement, analytics aggregation, and leaderboard generation

---

## Learning Paths (F6.5)

Learning Paths provide multi-course sequencing with prerequisite enforcement.

- **Collections**:
  - `LearningPaths`: path definitions with ordered steps array, prerequisite references, and enrollment counts
  - `LearningPathProgress`: per-user progress with step status tracking (locked/available/in_progress/completed)
- **API routes**:
  - `/api/learning-paths` (GET/POST): list published paths, create new paths
  - `/api/learning-paths/[id]` (GET/PATCH): read/update path details and steps
  - `/api/learning-paths/[id]/enroll` (POST): enroll in a path
  - `/api/learning-paths/[id]/progress` (GET): get user progress for a path
- **Components** (`src/components/learning-paths/`):
  - `PathCatalog`: grid of path cards with step count, estimated hours, and enrollment count
  - `PathProgressView`: step-by-step progress display with prerequisite-based status resolution, progress bar, and action buttons
- **Service** (`src/lib/learning-paths.ts`):
  - `resolveStepStatuses`: prerequisite resolution algorithm that determines locked/available/completed for each step
  - CRUD operations for paths, enrollment, and progress tracking

---

## Assignment System (F6.4)

The Assignment System provides a full grading workflow with rubrics, submissions, and analytics.

- **Collections**:
  - `Assignments`: assignment definitions with rubric criteria array, due dates, late policies, submission types (text/file/URL), and peer review settings
  - `AssignmentSubmissions`: student submissions with rubric scores array, peer reviews array, versioning, and grade tracking
- **API routes**:
  - `/api/courses/[id]/assignments` (GET/POST): list/create assignments for a course
  - `/api/assignments/[id]` (GET/PATCH/DELETE): CRUD on individual assignments
  - `/api/assignments/[id]/submissions` (GET/POST): list/create submissions
  - `/api/assignments/[id]/submissions/[submissionId]` (PATCH): grade a submission with rubric scores
  - `/api/assignments/[id]/analytics` (GET): score distribution, criteria averages, late/on-time counts
- **Components** (`src/components/assignments/`):
  - `AssignmentList`: course assignment cards with status badges and due dates
  - `SubmissionForm`: student submission with late penalty warnings and type-specific inputs
  - `GradingPanel`: instructor grading interface with per-criterion scoring
  - `AssignmentAnalytics`: SVG score distribution chart, stat cards, and rubric criteria performance
- **Services** (`src/lib/`):
  - `assignments.ts`: CRUD operations with safe Payload doc mapping
  - `assignment-grading.ts`: submission management, grading, and analytics with score distribution and criteria averages

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
