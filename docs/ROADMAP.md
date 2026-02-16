# Learning Hall - Roadmap

**Version:** 3.1.0
**Last Updated:** February 15, 2026

---

## Current Status: Phase 6 Development

The platform has been migrated from Ruby on Rails to a modern Next.js 14 + Payload CMS stack.

---

## Phase 6: Instructor Experience (In Progress)

| Status | Feature | Description |
|--------|---------|-------------|
| ✅ | F6.1 Enhanced Instructor Dashboard | Real-time enrollment notifications, date range filtering, CSV export, line/bar/pie visualizations, sortable course comparison table, and actionable insights |
| ✅ | F6.2 Course Builder V2 | Drag-and-drop module/lesson ordering, multi-select bulk lesson actions, template-driven lesson creation, debounced autosave with status, keyboard shortcuts, undo/redo history, live preview, validation warnings, and structure-to-template export API |
| ✅ | F6.3 Advanced Video Management | Video chapters, interactive hotspots, timed annotations, captions via VTT, quality switching, PiP, playback rate preferences, video bookmarks with notes, transcript management, and instructor analytics dashboard with SVG heatmap |
| ✅ | F6.4 Assignment System | Instructor-defined assignments with rubrics, student submissions (text/file/URL), rubric-based grading workflow, peer review support, late submission penalties, resubmission limits, and SVG analytics dashboard with score distribution and criteria performance |
| ✅ | F6.5 Learning Paths | Multi-course path sequencing with step prerequisites, enrollment tracking, progress visualization with locked/available/completed states, and path catalog |
| ✅ | F6.6 Cohort-Based Learning | Time-windowed cohorts with drip content scheduling, member management with max capacity, facilitator/student roles, ranked leaderboards, and cohort analytics dashboard with module unlock status tracking |
| ✅ | F6.7 Mentorship Program | Mentor profiles with expertise tags and availability slots, mentee-to-mentor match requests with capacity enforcement, session scheduling with duration options, session status tracking (scheduled/completed/cancelled/no-show), mentee ratings and feedback, SVG session breakdown analytics dashboard, and match lifecycle management (pending/active/completed/cancelled) |
| ✅ | F6.8 Content Marketplace | Instructor-to-instructor content marketplace with listing management, license types (single-use/unlimited/time-limited), purchase flow with self-purchase prevention, review system with automatic rating recalculation, category-based browsing with search, SVG analytics dashboard with category bar chart, and revenue tracking |

---

## Phase 7: Enterprise Features (In Progress)

| Status | Feature | Description |
|--------|---------|-------------|
| ✅ | F7.1 Organization Management | Multi-org hierarchy with parent references, nested department tree structure, org membership with role-based access (owner/admin/manager/member), bulk user provisioning with duplicate detection, and org analytics dashboard |
| ✅ | F7.2 Compliance Training | Compliance requirements with course/org relationships, bulk user assignment with duplicate detection, deadline tracking with overdue detection, assignment completion with automatic count sync, SVG donut chart compliance report dashboard, and per-user assignment tracker |
| ✅ | F7.3 Enterprise Reporting | Custom report builder with type selection (enrollment/completion/compliance/revenue/engagement/custom), column and filter configuration, scheduled exports (daily/weekly/monthly) with recipient management, execution history with status tracking, CSV/JSON/PDF export formats, and SVG bar chart analytics dashboard |
| ✅ | F7.4 Skills Framework | Hierarchical skill taxonomy with categories, competency mappings linking skills to courses with target levels and weights, user skill assessments from multiple sources (manual/course/quiz/peer), gap analysis with level difference calculation and course recommendations, and SVG bar chart analytics dashboard |
| ✅ | F7.5 Manager Dashboard | Training assignment creation with duplicate prevention, team progress table with enrolled/completed/overdue tracking, manager dashboard with SVG donut completion rate chart, and per-member progress aggregation |
| 📋 | F7.6 Content Library | Shared content repository, content versioning, approval workflows |
| 📋 | F7.7 Security & SSO | SAML/OIDC SSO, role-based access, IP restrictions |
| 📋 | F7.8 Audit Logs | Activity logging, data export, retention policies |
| 📋 | F7.9 User Management | Bulk import/export, user groups, custom fields |

---

## Phase 8: Innovation Features (Planned)

| Status | Feature | Description |
|--------|---------|-------------|
| 📋 | F8.1 AI Content Assistant | AI-powered content suggestions, quiz generation, summary creation |
| 📋 | F8.2 Virtual Classrooms | Real-time video sessions, whiteboard, breakout rooms |
| 📋 | F8.3 Community Hub | User profiles, activity feeds, direct messaging |
| 📋 | F8.4 Accessibility Engine | WCAG compliance checker, screen reader optimization, keyboard navigation audit |
| 📋 | F8.5 Microlearning | Bite-sized lessons, spaced repetition, daily challenges |
| 📋 | F8.6 Notification Center | In-app notifications, email digests, push notifications |
| 📋 | F8.7 Advanced Search | Full-text search, filters, search analytics |
| 📋 | F8.8 Social Learning | Study groups, collaborative notes, peer teaching |

---

## Phase 1: Core Platform (Completed)

| Status | Feature | Description |
|--------|---------|-------------|
| ✅ | Next.js 14 Migration | Full-stack framework with App Router |
| ✅ | Payload CMS Integration | Headless CMS for content management |
| ✅ | PostgreSQL Database | Robust relational database |
| ✅ | User Authentication | JWT-based auth with session management |
| ✅ | Course/Module/Lesson Hierarchy | Full content structure |
| ✅ | Multi-tenant Support | Tenant isolation for organizations |
| ✅ | Media Library | File uploads with type validation |
| ✅ | Admin Panel | Payload admin UI at /admin |
| ✅ | Dashboard UI | Student-facing dashboard |

---

## Phase 2: Learning Features (In Progress)

| Status | Feature | PR | Description |
|--------|---------|-----|-------------|
| ✅ | User Enrollment System | #141 | Enrollment model, status tracking, API |
| ✅ | Course Progress Tracking | #142 | Lesson completion, progress percentage |
| ✅ | Student Dashboard | #143 | View enrolled courses, progress, resume |
| ✅ | Instructor Dashboard | #144 | Course analytics, enrollment counts |
| ✅ | Course Publishing Workflow | #145 | Draft/Published/Archived states, validation |
| ✅ | Media Upload to Cloud Storage | #146 | S3-compatible storage integration |
| ✅ | Video Thumbnail Generation | #147 | Auto-thumbnails, custom upload, placeholders |
| 📋 | Rich Text Content for Lessons | - | Lexical editor, embedded images |
| 📋 | Course Pricing & Access Control | - | Free/paid courses, enrollment gating |
| 📋 | Email Notifications | - | Welcome, enrollment, password reset |

---

## Phase 3: Engagement Features (In Progress)

| Status | Feature | Description |
|--------|---------|-------------|
| ✅ | Certificates | Auto-generated completion certificates with verification |
| ✅ | Quizzes & Assessments | Timed quizzes, question banks, analytics |
| ✅ | Discussion Forums | Per-course discussion boards |
| ✅ | Student Notes | Personal note-taking on lessons |
| 📋 | Bookmarks | Save lessons for later |
| 📋 | Course Reviews | Star ratings and written reviews |

---

## Phase 4: Business Features (Planned)

| Status | Feature | Description |
|--------|---------|-------------|
| 📋 | Stripe Integration | Payment processing for paid courses |
| 📋 | Subscription Plans | Monthly/yearly access plans |
| 📋 | Coupon Codes | Discount codes for courses |
| 📋 | Affiliate Program | Revenue sharing for referrals |
| 📋 | Analytics Dashboard | Revenue, engagement, retention metrics |
| 📋 | White-label Support | Custom branding per tenant |

---

## Technical Improvements (Ongoing)

| Status | Task | Priority |
|--------|------|----------|
| ✅ | TypeScript strict mode | P0 |
| ✅ | ESLint + Prettier | P0 |
| ✅ | CI/CD Pipeline | P0 |
| 📋 | E2E Testing (Playwright) | P1 |
| 📋 | API Documentation (OpenAPI) | P2 |
| 📋 | Performance Monitoring | P2 |
| 📋 | Error Tracking (Sentry) | P2 |

---

## Legend

- ✅ Completed
- 🔄 In Progress
- 📋 Planned
