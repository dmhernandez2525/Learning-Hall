# Phase 1: Foundation - Overview

**Version:** 1.0.0
**Timeline:** Months 1-3 (12-16 weeks)
**Goal:** Core platform setup with basic course functionality and BYOS

---

## Phase Objectives

1. **Project Scaffold** - Set up Next.js 14 + Payload CMS v3 monorepo
2. **Database Design** - PostgreSQL with Row-Level Security for multi-tenancy
3. **Authentication** - NextAuth.js v5 integration
4. **Course Management** - Full CRUD for courses, modules, lessons
5. **BYOS Storage** - Bring Your Own Storage with S3/R2 support
6. **Video Support** - Upload, transcode (HLS), playback
7. **Payments** - Stripe Checkout integration
8. **Deployment** - Docker + Render configuration

---

## Feature List

| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| F1.1.1 | Next.js + Payload CMS Setup | P0 | Medium | Planned |
| F1.1.2 | PostgreSQL + RLS Multi-tenancy | P0 | Medium | Planned |
| F1.1.3 | NextAuth.js Authentication | P0 | Medium | Planned |
| F1.2.1 | Course Collection & CRUD | P0 | Medium | Planned |
| F1.2.2 | Module/Lesson Hierarchy | P0 | Medium | Planned |
| F1.2.3 | Course Builder UI | P0 | High | Planned |
| F1.3.1 | BYOS Storage Abstraction | P0 | High | Planned |
| F1.3.2 | AWS S3 Provider | P0 | Medium | Planned |
| F1.3.3 | Cloudflare R2 Provider | P1 | Low | Planned |
| F1.4.1 | Video Upload to BYOS | P0 | High | Planned |
| F1.4.2 | HLS Transcoding Pipeline | P1 | High | Planned |
| F1.4.3 | Video Player Component | P0 | Medium | Planned |
| F1.5.1 | Stripe Checkout Integration | P0 | Medium | Planned |
| F1.5.2 | Webhook Handling | P0 | Medium | Planned |
| F1.6.1 | Docker Compose Deployment | P0 | Medium | Planned |
| F1.6.2 | Render Configuration | P0 | Low | Planned |
| F1.7.1 | Marketing Website | P0 | Medium | Planned |

---

## Dependencies

```
F1.1.1 (Payload Setup)
   │
   ├──► F1.1.2 (PostgreSQL + RLS)
   │       │
   │       └──► F1.1.3 (NextAuth)
   │               │
   │               ├──► F1.2.1 (Course CRUD)
   │               │       │
   │               │       └──► F1.2.2 (Module/Lesson)
   │               │               │
   │               │               └──► F1.2.3 (Course Builder UI)
   │               │
   │               └──► F1.3.1 (BYOS Abstraction)
   │                       │
   │                       ├──► F1.3.2 (S3 Provider)
   │                       │       │
   │                       │       └──► F1.4.1 (Video Upload)
   │                       │               │
   │                       │               └──► F1.4.2 (HLS Transcoding)
   │                       │
   │                       └──► F1.5.1 (Stripe Checkout)
   │
   └──► F1.6.1 (Docker Compose)
           │
           └──► F1.6.2 (Render Config)
```

---

## Technical Requirements

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/learninghall

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Payload
PAYLOAD_SECRET=your-payload-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Storage Encryption
STORAGE_ENCRYPTION_KEY=32-byte-hex-key

# Optional: Default storage for development
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET=...
AWS_REGION=us-east-1
```

### Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "payload": "^3.0.0",
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "next-auth": "^5.0.0",
    "@auth/core": "^0.30.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "@aws-sdk/s3-request-presigner": "^3.500.0",
    "stripe": "^14.0.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.0",
    "zod": "^3.22.0",
    "tailwindcss": "^4.0.0",
    "video.js": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0"
  }
}
```

---

## Success Criteria

### Functional Requirements

- [ ] Users can register and log in
- [ ] Instructors can create courses with modules and lessons
- [ ] Courses support video, text, and quiz content types
- [ ] Users can configure their own S3/R2 storage
- [ ] Videos upload to user's BYOS and transcode to HLS
- [ ] Students can purchase courses via Stripe
- [ ] Application deploys via Docker Compose
- [ ] Application deploys to Render via render.yaml

### Non-Functional Requirements

- [ ] Page load time < 3 seconds (LCP)
- [ ] API response time < 200ms (p95)
- [ ] Test coverage ≥ 80%
- [ ] Zero critical security vulnerabilities
- [ ] WCAG 2.1 AA accessibility compliance

---

## SDDs in This Phase

| SDD | Feature | Status |
|-----|---------|--------|
| [F1.1.1](./F1.1.1-payload-cms-setup.md) | Payload CMS Setup | Planned |
| [F1.1.2](./F1.1.2-postgresql-rls.md) | PostgreSQL + RLS | Planned |
| [F1.1.3](./F1.1.3-nextauth-authentication.md) | NextAuth Authentication | Planned |
| [F1.2.1](./F1.2.1-course-crud.md) | Course CRUD | Planned |
| [F1.2.2](./F1.2.2-module-lesson-hierarchy.md) | Module/Lesson Hierarchy | Planned |
| [F1.2.3](./F1.2.3-course-builder-ui.md) | Course Builder UI | Planned |
| [F1.3.1](./F1.3.1-byos-storage-abstraction.md) | BYOS Storage Abstraction | Planned |
| [F1.4.1](./F1.4.1-video-upload.md) | Video Upload | Planned |
| [F1.5.1](./F1.5.1-stripe-checkout.md) | Stripe Checkout | Planned |
| [F1.6.1](./F1.6.1-docker-deployment.md) | Docker Deployment | Planned |

---

**Document Version:** 1.0.0
**Last Updated:** January 2026
