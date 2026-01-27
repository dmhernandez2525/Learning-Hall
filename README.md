# Learning Hall

A modern Learning Management System (LMS) built with Next.js 14 and Payload CMS, featuring Bring Your Own Storage (BYOS) capabilities for video content.

---

## Overview

Learning Hall is a full-featured LMS platform that enables educators to create courses with structured modules and lessons. The standout feature is BYOS (Bring Your Own Storage), allowing users to connect their own cloud storage (AWS S3, Cloudflare R2, or Google Cloud Storage) for storing video content. Learners access interactive assessments from `/student/courses/{courseId}/quizzes`, launch timed attempts, and review detailed feedback when instructors enable it. Each course also includes a `/student/courses/{courseId}/discussions` hub for threaded conversations, instructor-verified answers, and community voting.

### Key Features

- **BYOS (Bring Your Own Storage)**: Use your own S3, R2, or GCS for media storage
- **Course Builder**: Visual course creation with modules and lessons
- **Video Streaming**: HLS adaptive bitrate streaming for videos
- **Multi-Tenant**: Support for multiple organizations
- **Role-Based Access**: Admin, instructor, and student roles
- **Progress Tracking**: Track student progress through courses
- **Quiz Engine**: Timed assessments with randomized question banks and analytics
- **Discussion Forums**: Threaded course discussions with instructor badges, pinning, and voting
- **Responsive Design**: Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| CMS | Payload CMS 3.0 |
| Database | PostgreSQL 16 with Row-Level Security |
| Authentication | Payload Auth + NextAuth.js |
| Styling | Tailwind CSS 4.x + shadcn/ui |
| Testing | Vitest + Testing Library |
| Deployment | Docker + Render.com |
| Storage | S3 / R2 / GCS (BYOS) |

---

## Project Structure

```
Learning-Hall/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/            # Payload admin panel
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (dashboard)/        # Dashboard pages
│   │   ├── (marketing)/        # Public pages
│   │   └── api/                # API routes
│   ├── collections/            # Payload CMS collections
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility functions
│   └── test/                   # Test setup
├── docs/                       # Documentation
├── docker-compose.yml          # Docker configuration
├── render.yaml                 # Render deployment config
└── package.json                # Dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional, for local development)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/dmhernandez2525/Learning-Hall.git
cd Learning-Hall

# Start development services (Postgres + Redis)
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run payload:migrate

# Start development server
npm run dev
```

### Manual Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and storage credentials

# Start development server
npm run dev
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learning_hall

# Payload CMS
PAYLOAD_SECRET=your-secret-key

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## API Endpoints

Payload CMS provides a complete REST API at `/api`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | Login user |
| POST | `/api/users/logout` | Logout user |
| POST | `/api/users` | Register user |
| GET | `/api/users/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Quizzes & Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes?courseId={id}` | List quizzes for a course |
| POST | `/api/quizzes` | Create quiz (instructors/admins) |
| PATCH | `/api/quizzes/:id` | Update quiz configuration |
| DELETE | `/api/quizzes/:id` | Remove quiz |
| GET | `/api/questions?quizId={id}` | List questions in a bank |
| POST | `/api/questions` | Create question |
| PATCH | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Remove question |

### Quiz Attempts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/:id/attempts` | Start or resume an attempt |
| GET | `/api/quizzes/:id/attempts` | List attempts (student/instructor views) |
| GET | `/api/quizzes/:id/attempts/:attemptId` | Fetch attempt details |
| PATCH | `/api/quizzes/:id/attempts/:attemptId` | Submit answers |
| GET | `/api/quizzes/:id/analytics` | Instructor analytics dashboard |

### Discussions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discussions?courseId={id}` | List threads for a course |
| POST | `/api/discussions` | Create a new thread |
| GET | `/api/discussions/:id` | Thread detail with nested replies |
| PATCH | `/api/discussions/:id` | Update thread status or pin |
| POST | `/api/discussions/:id/replies` | Add a reply (supports nested parentId) |
| POST | `/api/discussions/:id/vote` | Upvote/downvote a thread |
| POST | `/api/discussions/:id/replies/:replyId/vote` | Vote on a reply |
| PATCH | `/api/discussions/:id/replies/:replyId` | Mark/unmark reply as the answer |

### Modules & Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules` | List all modules |
| GET | `/api/lessons` | List all lessons |
| POST | `/api/modules` | Create module |
| POST | `/api/lessons` | Create lesson |

### Course Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/course-progress` | List all progress records |
| GET | `/api/course-progress/:id` | Get progress details |
| POST | `/api/course-progress` | Create a progress record |
| PATCH | `/api/course-progress/:id` | Update a progress record |
| DELETE | `/api/course-progress/:id` | Delete a progress record |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Index](./docs/INDEX.md) | Documentation overview |
| [Architecture](./docs/ARCHITECTURE.md) | System design and patterns |
| [Roadmap](./docs/ROADMAP.md) | Feature development plan |

---

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## Deployment

### Render.com

The project includes `render.yaml` for easy deployment to Render:

1. Connect your GitHub repository to Render
2. Deploy using the Blueprint feature
3. Configure environment variables in the Render dashboard

### Docker

```bash
# Build production image
docker build -t learning-hall .

# Run with docker-compose
docker-compose up -d
```

---

## Author

Daniel Hernandez

---

## License

MIT License
