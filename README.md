# Learning Hall

A Learning Management System (LMS) clone inspired by App Academy's online learning platform, enabling educators to create courses with structured lessons for students.

---

## Overview

Learning Hall provides a platform for educators to create and manage online courses. Students can browse courses, track their progress through lessons, and complete tasks.

### Key Features

- **User Authentication**: Secure login and registration with BCrypt
- **Course Management**: Create and organize courses with subjects and tasks
- **Progress Tracking**: Students can track completion status
- **Content Rendering**: Markdown-based lesson content
- **File Uploads**: AWS S3 integration for user avatars
- **Responsive Design**: Works on desktop and mobile

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend Framework** | Ruby on Rails | 7.2.0 |
| **Ruby Version** | Ruby | 3.3 |
| **Database** | PostgreSQL | 16 |
| **App Server** | Puma | 6.4 |
| **Frontend Framework** | React | 16.9.0 |
| **State Management** | Redux + Thunk | 4.0.4 |
| **Routing** | React Router | 5.0.1 |
| **Build Tool** | Vite | 7.3.1 |
| **Type System** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.1.18 |
| **Testing** | Vitest | 4.0.17 |
| **File Storage** | AWS S3 | - |
| **Hosting** | Render | - |

---

## Project Structure

```
Learning-Hall/
├── app/                       # Rails application
│   ├── controllers/api/       # JSON API controllers
│   ├── models/                # ActiveRecord models
│   └── views/api/             # Jbuilder JSON templates
├── frontend/                  # React application
│   ├── components/            # React components
│   ├── actions/               # Redux action creators
│   ├── reducers/              # Redux reducers
│   ├── store/                 # Redux store configuration
│   ├── types/                 # TypeScript type definitions
│   └── util/                  # API utilities
├── config/                    # Rails configuration
├── db/                        # Migrations and schema
├── docs/                      # Documentation
│   └── diagrams/              # Architecture diagrams
├── Gemfile                    # Ruby dependencies
├── package.json               # Node dependencies
├── vite.config.js             # Vite build configuration
└── render.yaml                # Render deployment config
```

---

## Getting Started

### Prerequisites

- Ruby 3.3 (use rbenv or asdf)
- Node.js 18+ (22 recommended)
- PostgreSQL 16+
- AWS S3 bucket (for file uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/dmhernandez2525/Learning-Hall.git
cd Learning-Hall

# Install Ruby dependencies
bundle install

# Install Node dependencies
npm install

# Set up database
rails db:create
rails db:migrate
rails db:seed
```

### Environment Configuration

Create a `.env` file or set environment variables:
```bash
RAILS_MASTER_KEY=your-master-key
DATABASE_URL=postgres://localhost/learning_hall_development
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

### Running the Application

```bash
# Option 1: Docker (recommended)
docker-compose up

# Option 2: Manual
rails server              # Start Rails (port 3000)
npm run dev               # Start Vite dev server (port 3001)
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Login user |
| DELETE | `/api/sessions` | Logout user |
| POST | `/api/users` | Register user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Subjects & Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List all subjects |
| GET | `/api/subjects/:id` | Get subject details |
| POST | `/api/subjects` | Create subject |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get task details |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |

---

## Testing

```bash
# Frontend tests (Vitest)
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # Coverage report

# Backend tests (Rails)
bundle exec rails test
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Analysis Report](./docs/ANALYSIS_REPORT.md) | Comprehensive codebase analysis |
| [Architecture](./docs/ARCHITECTURE.md) | System design and patterns |
| [Roadmap](./docs/ROADMAP.md) | Modernization backlog |
| [Coding Standards](./docs/CODING_STANDARDS.md) | Code style guidelines |
| [System Architecture](./docs/diagrams/system-architecture.md) | Architecture diagrams |
| [Database ERD](./docs/diagrams/database-erd.md) | Entity relationship diagram |
| [API Map](./docs/diagrams/api-map.md) | API endpoint documentation |
| [User Flows](./docs/diagrams/user-flows.md) | User journey diagrams |

---

## Modernization Status

| Component | Status |
|-----------|--------|
| Ruby 3.3 | Complete |
| Rails 7.2 | Complete |
| Vite Build | Complete |
| TypeScript | Complete |
| Tailwind CSS | Complete |
| Vitest Testing | Complete |
| React 18+ | **Pending** |
| React Router 6+ | **Pending** |
| Redux Toolkit | **Pending** |

See [ROADMAP.md](./docs/ROADMAP.md) for detailed modernization plan.

---

## Author

Daniel Hernandez - Backend, Frontend, UI/UX (Solo project)

---

## License

MIT License
