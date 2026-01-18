# Learning Hall

A Learning Management System (LMS) clone inspired by App Academy's online learning platform, enabling educators to create courses with structured lessons for students.

---

## Overview

Learning Hall provides a platform for educators to create and manage online courses. Students can browse courses, track their progress through lessons, and complete tasks.

### Key Features

- **User Authentication**: Secure login and registration
- **Course Management**: Create and organize courses with subjects and tasks
- **Progress Tracking**: Students can track completion status
- **Content Rendering**: Markdown-based lesson content
- **File Uploads**: AWS S3 integration for media assets
- **Responsive Design**: Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 16, Redux, React Router |
| Backend | Ruby on Rails 5.2 |
| Database | PostgreSQL |
| Bundler | Webpack |
| Storage | AWS S3 |
| Styling | SCSS |

---

## Project Structure

```
Learning-Hall/
├── app/                       # Rails application
│   ├── controllers/           # API controllers
│   │   └── api/               # JSON API endpoints
│   ├── models/                # ActiveRecord models
│   ├── views/                 # Jbuilder JSON views
│   └── assets/                # Rails assets
├── frontend/                  # React application
│   ├── components/            # React components
│   ├── actions/               # Redux action creators
│   ├── reducers/              # Redux reducers
│   ├── store/                 # Redux store configuration
│   └── util/                  # API utilities
├── config/                    # Rails configuration
├── db/                        # Migrations and schema
├── docs/                      # Documentation
├── Gemfile                    # Ruby dependencies
├── package.json               # Node dependencies
└── webpack.config.js          # Webpack configuration
```

---

## Getting Started

### Prerequisites

- Ruby 2.5+ (recommend using rbenv or asdf)
- Node.js 12.x or higher
- PostgreSQL 10+
- AWS S3 bucket (for file uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Learning-Hall.git
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
# Start Rails server
rails server

# In another terminal, compile frontend (development)
npm run postinstall
```

Note: Frontend may require `NODE_OPTIONS=--openssl-legacy-provider` due to OpenSSL 3.0 compatibility.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Login user |
| DELETE | `/api/session` | Logout user |
| POST | `/api/users` | Register user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course (admin) |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Subjects & Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects/:id` | Get subject with tasks |
| POST | `/api/subjects` | Create subject |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id/complete` | Mark task complete |

---

## Data Models

### Course
- `title`: Course name
- `description`: Course overview
- `instructor_id`: Reference to user
- Has many subjects

### Subject
- `title`: Subject/module name
- `order`: Display order
- `course_id`: Reference to course
- Has many tasks

### Task
- `title`: Task/lesson name
- `content`: Markdown content
- `order`: Display order
- `subject_id`: Reference to subject

---

## Documentation

| Document | Description |
|----------|-------------|
| [Index](./docs/INDEX.md) | Documentation overview |
| [Architecture](./docs/ARCHITECTURE.md) | System design and patterns |
| [Roadmap](./docs/ROADMAP.md) | Modernization backlog |
| [Coding Standards](./docs/CODING_STANDARDS.md) | Code style guidelines |

---

## Status

**Current State**: Requires modernization

This project was built in 2019-2020. It requires:
- Ruby version manager setup (rbenv/asdf)
- Bundler version update
- PostgreSQL database setup
- Ruby upgrade (2.5 → 3.3)
- Rails upgrade (5.2 → 7.x)
- React modernization (16 → 18)

See [ROADMAP.md](./docs/ROADMAP.md) for detailed modernization plan.

---

## Author

Daniel Hernandez - Backend, Frontend, UI/UX (Solo project)

---

## License

MIT License
