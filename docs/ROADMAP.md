# Learning Hall - Roadmap

**Version:** 3.0.0
**Last Updated:** January 2026
**Architecture:** Payload CMS v3 + Next.js 14 (Complete Rewrite)

---

## Current Status: Complete Rewrite in Progress

Learning Hall is being rebuilt from the ground up with a modern TypeScript-first stack. The previous Ruby on Rails + React application is being replaced with **Payload CMS v3 embedded in Next.js 14**.

### Why the Rewrite?

| Factor | Old Stack | New Stack |
|--------|-----------|-----------|
| Backend | Ruby on Rails 7.2 | Payload CMS v3 + Next.js |
| Frontend | React 16.9 + Redux | React 18 + Server Components |
| Database | PostgreSQL (basic) | PostgreSQL + RLS |
| Auth | BCrypt sessions | NextAuth.js v5 |
| Storage | AWS S3 only | **BYOS** (S3, R2, GCS, B2) |
| Deployment | Separate frontend/backend | Single monolith |
| Language | Ruby + TypeScript | TypeScript only |

---

## Implementation Phases

### Phase 1: Foundation (Months 1-3)

**Goal:** Core platform with basic course functionality and BYOS

| Feature | Priority | Status | PR |
|---------|----------|--------|-----|
| Next.js + Payload CMS Setup | P0 | Planned | - |
| PostgreSQL + RLS Multi-tenancy | P0 | Planned | - |
| NextAuth.js Authentication | P0 | Planned | - |
| Course Collection & CRUD | P0 | Planned | - |
| Module/Lesson Hierarchy | P0 | Planned | - |
| Course Builder UI | P0 | Planned | - |
| BYOS Storage Abstraction | P0 | Planned | - |
| AWS S3 Provider | P0 | Planned | - |
| Cloudflare R2 Provider | P1 | Planned | - |
| Video Upload to BYOS | P0 | Planned | - |
| HLS Transcoding Pipeline | P1 | Planned | - |
| Video Player Component | P0 | Planned | - |
| Stripe Checkout Integration | P0 | Planned | - |
| Webhook Handling | P0 | Planned | - |
| Docker Compose Deployment | P0 | Planned | - |
| Render Configuration | P0 | Planned | - |
| Marketing Website | P0 | Planned | - |

**Phase 1 Deliverables:**
- Instructors can create and publish courses
- Students can purchase and view video courses
- Content stored in creator's own S3/R2 bucket
- Deployed and running on Render

---

### Phase 2: Core Features (Months 4-6)

**Goal:** Complete LMS functionality with enrollments, progress, quizzes

| Feature | Priority | Status | PR |
|---------|----------|--------|-----|
| Enrollment System | P0 | Planned | - |
| Progress Tracking | P0 | Planned | - |
| Student Dashboard | P0 | Planned | - |
| Quiz System | P1 | Planned | - |
| Question Banks | P1 | Planned | - |
| Certificate Generation | P1 | Planned | - |
| Drip Content | P1 | Planned | - |
| Email Notifications | P1 | Planned | - |
| Creator Analytics | P1 | Planned | - |
| Custom Domain Support | P1 | Planned | - |

**Phase 2 Deliverables:**
- Full student learning experience
- Quizzes with auto-grading
- PDF certificates on completion
- Email notifications for key events
- Basic analytics dashboard

---

### Phase 3: Scale & Polish (Months 7-9)

**Goal:** Performance, monitoring, community features

| Feature | Priority | Status | PR |
|---------|----------|--------|-----|
| Redis Caching Layer | P1 | Planned | - |
| Query Optimization | P1 | Planned | - |
| Prometheus + Grafana | P2 | Planned | - |
| Full-Text Search | P1 | Planned | - |
| Discussion Forums | P2 | Planned | - |
| WCAG 2.1 AA Compliance | P1 | Planned | - |
| Webhook System | P2 | Planned | - |
| API Documentation | P2 | Planned | - |

**Phase 3 Deliverables:**
- Sub-200ms API response times
- Monitoring and alerting
- Community features
- Accessible to WCAG standards
- OpenAPI documentation

---

### Phase 4: Differentiation (Months 10-12)

**Goal:** AI features, mobile support, advanced capabilities

| Feature | Priority | Status | PR |
|---------|----------|--------|-----|
| AI Course Outline Generator | P2 | Planned | - |
| AI Quiz Generation | P2 | Planned | - |
| White-Label Customization UI | P1 | Planned | - |
| PWA Mobile Support | P2 | Planned | - |
| SCORM Import/Export | P2 | Planned | - |
| Affiliate Tracking | P2 | Planned | - |

**Phase 4 Deliverables:**
- AI-assisted course creation
- Complete white-label solution
- Mobile-friendly PWA
- SCORM compliance for enterprise

---

## First 10 Features (MVP Sprint)

These 10 features will be built first to establish a working MVP:

| # | Feature | Branch | Status |
|---|---------|--------|--------|
| 1 | Next.js + Payload Setup | `feat/F1.1.1-payload-setup` | Planned |
| 2 | PostgreSQL + Auth | `feat/F1.1.2-auth-database` | Planned |
| 3 | Course Collection | `feat/F1.2.1-course-crud` | Planned |
| 4 | Module/Lesson Hierarchy | `feat/F1.2.2-module-lesson` | Planned |
| 5 | Course Builder UI | `feat/F1.2.3-course-builder` | Planned |
| 6 | BYOS Storage | `feat/F1.3.1-byos-storage` | Planned |
| 7 | Video Upload | `feat/F1.4.1-video-upload` | Planned |
| 8 | Video Player | `feat/F1.4.3-video-player` | Planned |
| 9 | Stripe Payments | `feat/F1.5.1-stripe-checkout` | Planned |
| 10 | Render Deployment | `feat/F1.6.1-render-deploy` | Planned |

---

## Technology Stack

### Core
- **Framework:** Next.js 14 (App Router)
- **CMS:** Payload CMS v3
- **Database:** PostgreSQL 16 + Row-Level Security
- **Language:** TypeScript 5.x (strict mode)

### Frontend
- **UI:** React 18 + Server Components
- **Styling:** Tailwind CSS 4.x
- **Components:** shadcn/ui + Radix
- **Forms:** React Hook Form + Zod
- **Video:** Video.js with HLS

### Backend
- **Auth:** NextAuth.js v5
- **Payments:** Stripe Checkout
- **Storage:** AWS SDK v3 (S3-compatible)
- **Jobs:** BullMQ + Redis
- **Email:** Resend

### Infrastructure
- **Deploy:** Docker + Render
- **CDN:** Cloudflare
- **Testing:** Vitest + Playwright
- **CI/CD:** GitHub Actions

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] Working course creation flow
- [ ] Video upload to BYOS storage
- [ ] Stripe checkout completes successfully
- [ ] Page load time < 3 seconds
- [ ] Test coverage ≥ 80%
- [ ] Zero critical security vulnerabilities
- [ ] Deployed on Render

### Project Success Criteria
- [ ] 100+ GitHub stars
- [ ] Featured in "awesome self-hosted" lists
- [ ] Used by 50+ course creators
- [ ] < $30/month hosting for small deployments
- [ ] Complete white-label capability

---

## Links

- [Architecture Documentation](./ARCHITECTURE.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Phase 1 SDDs](./sdd/phase-1/)
- [Work Status](../roadmap/WORK_STATUS.md)
- [Compiled Research](../../_@agent-prompts/learning-hall/research/sessions/COMPILED_RESEARCH.md)

---

**Document Version:** 3.0.0
**Last Updated:** January 2026
