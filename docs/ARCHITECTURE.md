# Learning Hall - System Architecture

**Version:** 3.0.0
**Last Updated:** January 2026
**Architecture:** Payload CMS v3 + Next.js 14 (Modular Monolith)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Diagrams](#3-system-diagrams)
4. [Domain-Driven Design](#4-domain-driven-design)
5. [Database Design](#5-database-design)
6. [BYOS Storage Architecture](#6-byos-storage-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Video Processing Pipeline](#8-video-processing-pipeline)
9. [Payment Integration](#9-payment-integration)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Performance & Caching](#11-performance--caching)
12. [Security](#12-security)

---

## 1. Architecture Overview

### Architecture Style: Modular Monolith

Learning Hall uses a **modular monolith** architecture, not microservices.

**Rationale:**
- 85% of enterprises face unexpected microservices challenges
- Amazon Prime Video migrated back from microservices
- Monoliths are faster due to zero network latency
- Clear extraction path when scale demands (services can be split later)

**Benefits:**
- Fast development (single codebase)
- Simple deployment (one artifact)
- Clear module boundaries via DDD bounded contexts
- TypeScript end-to-end (shared types between frontend/backend)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEARNING HALL                                      │
│                     Next.js 14 + Payload CMS v3                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Marketing  │  │  Dashboard  │  │   Course    │  │   Admin    │ │   │
│  │  │   Pages     │  │   (Creator) │  │   Player    │  │  (Payload) │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                    APPLICATION LAYER                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Server    │  │    API      │  │   Payload   │  │  Background│ │   │
│  │  │   Actions   │  │   Routes    │  │    Local    │  │    Jobs    │ │   │
│  │  │             │  │             │  │    API      │  │  (BullMQ)  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                     DOMAIN LAYER (Bounded Contexts)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │  │ Identity │ │ Catalog  │ │ Learning │ │ Payments │ │  Media   │ │   │
│  │  │ & Access │ │ (Courses)│ │(Progress)│ │(Commerce)│ │ (Storage)│ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                  INFRASTRUCTURE LAYER                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │  │PostgreSQL│ │  Redis   │ │  BYOS    │ │  Stripe  │ │  Email   │ │   │
│  │  │   + RLS  │ │  Cache   │ │ Storage  │ │   API    │ │  (Resend)│ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Core

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack React framework |
| CMS | Payload CMS v3 | Headless CMS embedded in Next.js |
| Language | TypeScript 5.x (strict) | Type safety end-to-end |
| Database | PostgreSQL 16 | Primary data store with RLS |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18+ | UI framework |
| Tailwind CSS 4.x | Styling |
| shadcn/ui | Component library |
| Radix UI | Accessible primitives |
| React Hook Form | Form management |
| Zod | Schema validation |
| Video.js | Video player with HLS |
| TanStack Query | Server state (where needed) |

### Backend

| Technology | Purpose |
|------------|---------|
| Payload CMS v3 | Collections, admin, API |
| NextAuth.js v5 | Authentication |
| BullMQ | Background job processing |
| Redis | Caching + job queues |
| AWS SDK v3 | S3-compatible storage (BYOS) |
| Stripe | Payment processing |
| Resend/Postmark | Transactional email |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local/simple deployments |
| Coolify | Self-hosted PaaS option |
| Cloudflare | CDN, DNS, DDoS protection |
| FFmpeg | Video transcoding |

### Testing

| Technology | Purpose |
|------------|---------|
| Vitest | Unit/integration testing |
| Testing Library | Component testing |
| Playwright | E2E testing |
| MSW | API mocking |

---

## 3. System Diagrams

### Request Flow

```
┌────────┐     ┌─────────────────────────────────────────────────────────────┐
│ Client │────►│                      Next.js Server                          │
└────────┘     │  ┌─────────────────────────────────────────────────────────┐│
               │  │                     Middleware                           ││
               │  │  - Auth check (NextAuth.js)                             ││
               │  │  - Tenant context (from subdomain or header)            ││
               │  │  - Rate limiting                                        ││
               │  └──────────────────────────┬──────────────────────────────┘│
               │                             │                                │
               │  ┌──────────────────────────▼──────────────────────────────┐│
               │  │              Route Handler / Server Action              ││
               │  │  - Validate input (Zod)                                 ││
               │  │  - Call Payload Local API                               ││
               │  │  - Business logic                                        ││
               │  └──────────────────────────┬──────────────────────────────┘│
               │                             │                                │
               │  ┌──────────────────────────▼──────────────────────────────┐│
               │  │                   Payload CMS                           ││
               │  │  - Collection access control (RLS-style)                ││
               │  │  - Hooks (beforeChange, afterChange)                    ││
               │  │  - Database queries with tenant context                 ││
               │  └──────────────────────────┬──────────────────────────────┘│
               │                             │                                │
               │  ┌──────────────────────────▼──────────────────────────────┐│
               │  │                   PostgreSQL                             ││
               │  │  - Row-Level Security policies                          ││
               │  │  - Tenant isolation enforced at DB level                ││
               │  └─────────────────────────────────────────────────────────┘│
               └─────────────────────────────────────────────────────────────┘
```

### Video Upload Flow

```
┌────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ Creator│────►│  Next.js    │────►│   BullMQ    │────►│   FFmpeg        │
│ Upload │     │  API Route  │     │   Queue     │     │   Worker        │
└────────┘     └──────┬──────┘     └─────────────┘     └────────┬────────┘
                      │                                          │
                      │ 1. Validate                              │ 4. Transcode
                      │ 2. Store temp                            │    to HLS
                      │ 3. Queue job                             │
                      │                                          │
                      ▼                                          ▼
               ┌─────────────┐                          ┌─────────────────┐
               │   Redis     │                          │   Creator's     │
               │   (Queue)   │                          │   BYOS Storage  │
               └─────────────┘                          │   (S3/R2/GCS)   │
                                                        └─────────────────┘
                                                                 │
                                                                 │ 5. Store HLS
                                                                 │    segments
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │   master.m3u8   │
                                                        │   720p/         │
                                                        │   1080p/        │
                                                        │   480p/         │
                                                        └─────────────────┘
```

### Multi-Tenant Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
│                                                                              │
│   ┌──────────────┐                                                          │
│   │   Request    │  subdomain: acme.learninghall.com                       │
│   │              │  OR header: X-Tenant-ID: tenant_123                      │
│   └──────┬───────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │  Middleware  │  Extract tenant from subdomain/header                    │
│   │              │  Set tenant context in request                           │
│   └──────┬───────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │   Payload    │  Access control uses req.tenant                         │
│   │   Access     │  return { tenant: { equals: req.tenant.id } }           │
│   └──────┬───────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │  PostgreSQL  │  SET LOCAL app.current_tenant = 'tenant_123'            │
│   │     RLS      │  All queries filtered by tenant automatically           │
│   └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Domain-Driven Design

### Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEARNING HALL BOUNDED CONTEXTS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    IDENTITY     │  │     CATALOG     │  │     MEDIA       │             │
│  │    & ACCESS     │  │    (Courses)    │  │    (Content)    │             │
│  │                 │  │                 │  │                 │             │
│  │  - Users        │  │  - Courses      │  │  - Videos       │             │
│  │  - Tenants      │  │  - Modules      │  │  - Documents    │             │
│  │  - Roles        │  │  - Lessons      │  │  - Images       │             │
│  │  - Sessions     │  │  - Categories   │  │  - Storage      │             │
│  │  - Auth         │  │  - Tags         │  │    Configs      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    LEARNING     │  │   ASSESSMENTS   │  │    PAYMENTS     │             │
│  │   (Progress)    │  │    (Quizzes)    │  │   (Commerce)    │             │
│  │                 │  │                 │  │                 │             │
│  │  - Enrollments  │  │  - Quizzes      │  │  - Prices       │             │
│  │  - Progress     │  │  - Questions    │  │  - Orders       │             │
│  │  - Completions  │  │  - Attempts     │  │  - Subscriptions│             │
│  │  - Certificates │  │  - Results      │  │  - Refunds      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │ COMMUNICATIONS  │  │    ANALYTICS    │                                   │
│  │    (Email)      │  │   (Insights)    │                                   │
│  │                 │  │                 │                                   │
│  │  - Templates    │  │  - Events       │                                   │
│  │  - Notifications│  │  - Reports      │                                   │
│  │  - Preferences  │  │  - Dashboards   │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Domain Events

Key domain events that trigger side effects:

| Event | Triggers |
|-------|----------|
| `StudentEnrolled` | Send welcome email, update analytics |
| `LessonCompleted` | Update progress, check course completion |
| `CourseCompleted` | Issue certificate, send congratulations |
| `QuizAttempted` | Record score, update gradebook |
| `PaymentProcessed` | Grant access, send receipt |
| `CertificateIssued` | Generate PDF, send email |
| `VideoUploaded` | Queue transcoding job |

---

## 5. Database Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Tenants   │──────<│    Users    │>──────│  Courses    │
│             │  1:N  │             │  1:N  │             │
│  id         │       │  id         │       │  id         │
│  name       │       │  tenant_id  │       │  tenant_id  │
│  slug       │       │  email      │       │  instructor │
│  settings   │       │  role       │       │  title      │
│  storage_id │       │  name       │       │  slug       │
└─────────────┘       └─────────────┘       │  price      │
                                            │  status     │
                                            └──────┬──────┘
                                                   │ 1:N
                                            ┌──────▼──────┐
                                            │   Modules   │
                                            │             │
                                            │  id         │
                                            │  course_id  │
                                            │  title      │
                                            │  position   │
                                            └──────┬──────┘
                                                   │ 1:N
                                            ┌──────▼──────┐
                                            │   Lessons   │
                                            │             │
                                            │  id         │
                                            │  module_id  │
                                            │  title      │
                                            │  content    │
                                            │  position   │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Enrollments │──────<│  Progress   │       │ Certificates│
│             │  1:N  │             │       │             │
│  id         │       │  id         │       │  id         │
│  user_id    │       │enrollment_id│       │enrollment_id│
│  course_id  │       │  lesson_id  │       │  number     │
│  status     │       │  status     │       │  pdf_url    │
│  enrolled_at│       │  completed  │       │  issued_at  │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐
│StorageConfig│       │  Payments   │
│             │       │             │
│  id         │       │  id         │
│  tenant_id  │       │  tenant_id  │
│  provider   │       │  user_id    │
│  bucket     │       │  course_id  │
│  credentials│       │  stripe_id  │
│  (encrypted)│       │  amount     │
└─────────────┘       │  status     │
                      └─────────────┘
```

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create app role
CREATE ROLE app_user NOINHERIT LOGIN;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_users ON users
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_courses ON courses
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Usage in application:
-- await db.query("SET LOCAL app.current_tenant = $1", [tenantId]);
```

---

## 6. BYOS Storage Architecture

### Storage Provider Interface

```typescript
// src/lib/storage/types.ts
export interface StorageProvider {
  name: string;
  upload(file: Buffer, key: string, options?: UploadOptions): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
  list(prefix: string): Promise<string[]>;
}

export interface StorageConfig {
  provider: 's3' | 'r2' | 'gcs' | 'local';
  bucket: string;
  region?: string;
  endpoint?: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}
```

### Supported Providers

| Provider | Endpoint | Best For |
|----------|----------|----------|
| AWS S3 | Default AWS | Enterprise with existing AWS |
| Cloudflare R2 | `{accountId}.r2.cloudflarestorage.com` | **Default (zero egress)** |
| Google Cloud Storage | `storage.googleapis.com` | GCP users |
| Backblaze B2 | `s3.us-west-001.backblazeb2.com` | Budget option |
| MinIO | Custom | Self-hosted S3-compatible |
| Local | Filesystem | Development |

### Cost Comparison

| Provider | Storage/GB | Egress/GB | 5TB + 50TB egress |
|----------|-----------|-----------|-------------------|
| AWS S3 | $0.023 | $0.085 | **$4,615/mo** |
| Cloudflare R2 | $0.015 | **$0** | **$75/mo** |
| Backblaze B2 + CF | $0.006 | $0 | **$30/mo** |

---

## 7. Authentication & Authorization

### NextAuth.js Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────►│  NextAuth    │────►│   Payload    │────►│  PostgreSQL  │
│          │     │  Provider    │     │   Users      │     │              │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     │                  │
     │                  ▼
     │           ┌──────────────┐
     │           │    JWT       │
     │◄──────────│   Session    │
     │           └──────────────┘
```

### Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access, manage tenants |
| **Instructor** | Create/manage own courses |
| **Student** | Enroll, view purchased courses |

### Permission Matrix

| Action | Admin | Instructor | Student |
|--------|-------|------------|---------|
| Create Course | Yes | Yes | No |
| Edit Any Course | Yes | No | No |
| Edit Own Course | Yes | Yes | No |
| View Course | Yes | Yes | If enrolled |
| Enroll | Yes | Yes | Yes |
| Issue Certificate | System | No | No |

---

## 8. Video Processing Pipeline

### HLS Transcoding

```
Input (MP4) → FFmpeg → HLS Output
                │
                ├── master.m3u8
                ├── 1080p/
                │   ├── playlist.m3u8
                │   └── segment_*.ts
                ├── 720p/
                │   ├── playlist.m3u8
                │   └── segment_*.ts
                └── 480p/
                    ├── playlist.m3u8
                    └── segment_*.ts
```

### Bitrate Ladder

| Resolution | Video Bitrate | Audio | Use Case |
|------------|--------------|-------|----------|
| 1080p | 5 Mbps | 128k AAC | High quality |
| 720p | 2.5 Mbps | 96k AAC | Standard |
| 480p | 1 Mbps | 96k AAC | Mobile |
| 360p | 500 kbps | 64k AAC | Low bandwidth |

### Content Protection

1. **Signed URLs** - 60-second expiring tokens
2. **DRM (optional)** - Widevine/FairPlay for premium content
3. **Watermarking** - User-specific overlay

---

## 9. Payment Integration

### Stripe Checkout Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Student │────►│  Checkout    │────►│   Stripe     │────►│   Webhook    │
│  Click   │     │  Session     │     │   Hosted     │     │   Handler    │
│  "Buy"   │     │  Created     │     │   Page       │     │              │
└──────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                   │
                                             ┌─────────────────────┼─────────┐
                                             │                     ▼         │
                                             │              ┌──────────────┐ │
                                             │              │   Create     │ │
                                             │              │  Enrollment  │ │
                                             │              └──────────────┘ │
                                             │                               │
                                             │              ┌──────────────┐ │
                                             │              │   Send       │ │
                                             │              │   Email      │ │
                                             │              └──────────────┘ │
                                             └───────────────────────────────┘
```

---

## 10. Deployment Architecture

### Docker Compose (Self-Hosted)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/learninghall
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  worker:
    build: .
    command: npm run worker
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

### Cost Estimate

| Component | Provider | Monthly |
|-----------|----------|---------|
| App Server | Hetzner/DO | $6-12 |
| PostgreSQL | Managed | $0-15 |
| Redis | Same server | $0 |
| Storage 50GB | Cloudflare R2 | ~$1 |
| CDN | Cloudflare Free | $0 |
| **Total** | | **$7-28** |

---

## 11. Performance & Caching

### Caching Layers

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| CDN | Cloudflare | 1 year | Static assets, HLS |
| Redis | Redis | 5-15 min | Course catalog |
| Next.js | ISR | 5 min | Marketing pages |
| API | stale-while-revalidate | 60s | Dynamic content |

### Performance Targets

| Metric | Target |
|--------|--------|
| LCP | ≤2.5s |
| API p95 | ≤200ms |
| DB queries | ≤50ms |
| Cache hit | ≥85% |

---

## 12. Security

### Security Checklist

- [x] Authentication via NextAuth.js
- [x] Authorization via RLS + Payload access control
- [x] HTTPS enforced
- [x] CSRF protection (Server Actions)
- [x] XSS prevention (React escaping)
- [x] SQL injection prevention (Payload ORM)
- [x] Secrets in environment variables
- [x] BYOS credentials encrypted at rest
- [x] Rate limiting on API routes
- [x] Content Security Policy headers

### GDPR Compliance

- User data export endpoint
- Right to erasure (cascade delete)
- Consent management
- Data processing disclosure
- 7-year payment retention (tax compliance)

---

## See Also

- [ROADMAP.md](./ROADMAP.md) - Feature phases and timeline
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Development standards
- [Research](../_@agent-prompts/learning-hall/research/) - Competitor analysis

---

**Document Version:** 3.0.0
**Architecture Decision:** Payload CMS v3 + Next.js 14 (January 2026)
