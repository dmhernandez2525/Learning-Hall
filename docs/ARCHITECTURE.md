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

---

## Business Logic & Automation

- **Hooks**: Payload's hooks are used for automation. For example, a `beforeChange` hook on the `CourseProgress` collection calculates the `progressPercentage` whenever the `completedLessons` array is modified. This keeps the data consistent without requiring manual calculations on the client-side.

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
