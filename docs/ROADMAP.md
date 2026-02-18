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
| 📋 | F6.3 Advanced Video Management | Chapters, hotspots, playback preferences, analytics |
| 📋 | F6.4 Assignment System | Rubrics, submissions, grading workflow, analytics |
| 📋 | F6.5 Learning Paths | Multi-course path sequencing with prerequisites |
| 📋 | F6.6 Cohort-Based Learning | Time-windowed cohorts, drip scheduling, cohort analytics |
| 📋 | F6.7 Mentorship Program | Mentor matching, scheduling, session tracking |
| 📋 | F6.8 Content Marketplace | Instructor-to-instructor marketplace with licensing |

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
