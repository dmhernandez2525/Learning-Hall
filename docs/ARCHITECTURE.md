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
│   │   ├── Enrollments.ts      # (New) Handles user-course relationships
│   │   └── ...
│   ├── components/             # Shared React components (UI, layout)
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
- `fields`: `email`, `password`, `roles`, `tenant`

#### `Tenants`
- Represents an organization or workspace in the multi-tenant system.
- `fields`: `name`, `domains`

#### `Courses`
- The central collection for educational content.
- `fields`: `title`, `description`, `published`, `tenant`

#### `Modules` & `Lessons`
- Provide structure to courses. A `Course` has many `Modules`, which have many `Lessons`.
- `fields`: `title`, `content`, `course` (relation)

#### `Enrollments` (New in F2.1)
- Connects a `User` to a `Course`, creating an enrollment record.
- This is the cornerstone of tracking access and progress.
- `fields`:
    - `user` (relationship to `Users`)
    - `course` (relationship to `Courses`)
    - `status` (select: `active`, `completed`, `expired`)

---

## Authentication & Authorization

- **Authentication**: Handled by Payload Auth, which provides JWT-based authentication. The session is managed on the client via a secure, HTTP-only cookie.
- **Authorization**:
    - **Route Protection**: Next.js middleware checks for a valid JWT and redirects unauthenticated users from protected routes.
    - **Data Access**: Payload's access control functions, combined with PostgreSQL Row-Level Security (RLS) policies, enforce multi-tenancy and role-based permissions at the database level. Each API request is scoped to the user's `tenant`.

---

## Deployment & Hosting

- **Provider**: Render.com
- **Configuration**: The `render.yaml` file defines a multi-service deployment:
    1.  **Web Service**: Runs the Next.js/Payload application.
    2.  **PostgreSQL Service**: Managed PostgreSQL database.
    3.  **Redis Service**: (Optional) For caching or background jobs.
- **CI/CD**: Render automatically builds and deploys the application upon pushes to the `main` branch.
