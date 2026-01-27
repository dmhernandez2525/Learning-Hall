# Learning Hall - Architecture

**Version:** 2.0.0
**Last Updated:** January 2026

---

## System Overview

Learning Hall is a full-stack Learning Management System (LMS) with a Ruby on Rails API backend serving a React single-page application (SPA) frontend.

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   React     │  │    Redux     │  │       Vite              │ │
│  │   Router    │  │    Thunk     │  │       Bundler           │ │
│  │   (v5)      │  │              │  │       TypeScript        │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────────┘ │
│         │                │                                       │
│         └────────────────┼───────────────────────────────────────┤
│                          │                                       │
│                    JSON API (AJAX)                               │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│               BACKEND (Ruby on Rails 7.2)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Controllers │  │    Models    │  │    Jbuilder Views       │ │
│  │   (API)     │  │ (ActiveRecord)│  │    (JSON responses)    │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────────┘ │
│         │                │                                       │
└─────────┼────────────────┼───────────────────────────────────────┘
          │                │
   ┌──────┴────────────────┴──────┐
   │        PostgreSQL 16         │
   │     (ActiveStorage blobs)    │
   └──────────────────────────────┘
                │
         ┌──────┴──────┐
         │   AWS S3    │
         │ (user files)│
         └─────────────┘
```

---

## Directory Structure

```
Learning-Hall/
├── app/                       # Rails application
│   ├── controllers/           # API controllers
│   │   └── api/               # Namespaced JSON API
│   ├── models/                # ActiveRecord models
│   └── views/                 # Jbuilder JSON templates
├── frontend/                  # React application
│   ├── components/            # React components
│   │   ├── session/           # Auth components
│   │   ├── Hall/              # Main content area
│   │   ├── course/            # Course components
│   │   ├── subject/           # Subject components
│   │   ├── task/              # Task components
│   │   └── toast/             # Toast notifications
│   ├── actions/               # Redux action creators
│   ├── reducers/              # Redux reducers
│   ├── store/                 # Redux store config
│   ├── types/                 # TypeScript types
│   └── util/                  # API utilities
├── config/                    # Rails configuration
├── db/                        # Migrations and schema
├── docs/                      # Documentation
│   └── diagrams/              # Architecture diagrams
├── test/                      # Rails tests
├── frontend/__tests__/        # Vitest tests
├── Gemfile                    # Ruby dependencies
├── package.json               # Node dependencies
├── vite.config.js             # Vite build config
└── render.yaml                # Render deployment
```

---

## Data Models

### User
```ruby
class User < ApplicationRecord
  validates :username, :email, :session_token, :password_digest, :user_role, presence: true
  validates :username, :email, uniqueness: true
  validates :password, length: { minimum: 6 }, allow_nil: true

  has_one_attached :photo  # AWS S3
  has_many :courses
  has_many :subjects

  # Authentication methods
  def self.find_by_credentials(username, password)
  def password=(password)  # BCrypt
  def is_password?(password)
  def reset_session_token!
end
```

### Course
```ruby
class Course < ApplicationRecord
  validates :name, :author_id, presence: true
  validates :name, uniqueness: true

  belongs_to :author, class_name: :User, foreign_key: :author_id
  has_many :subjects
end
```

### Subject
```ruby
class Subject < ApplicationRecord
  validates :name, :courseId, :authorId, presence: true
  validates :name, uniqueness: true

  belongs_to :author, class_name: :User, foreign_key: :authorId
  belongs_to :course, class_name: :Course, foreign_key: :courseId
end
```

### Task
```ruby
class Task < ApplicationRecord
  validates :name, :subject_id, :author_id, :completed, :duration, :body, presence: true
  validates :name, uniqueness: true
end
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/sessions` | Login | No |
| DELETE | `/api/sessions` | Logout | Yes |
| POST | `/api/users` | Register | No |
| GET | `/api/courses` | List courses | Yes |
| GET | `/api/courses/:id` | Course details | Yes |
| POST | `/api/courses` | Create course | Yes |
| PATCH | `/api/courses/:id` | Update course | Yes |
| DELETE | `/api/courses/:id` | Delete course | Yes |
| GET | `/api/subjects` | List subjects | Yes |
| GET | `/api/subjects/:id` | Subject details | Yes |
| POST | `/api/subjects` | Create subject | Yes |
| PATCH | `/api/subjects/:id` | Update subject | Yes |
| DELETE | `/api/subjects/:id` | Delete subject | Yes |
| GET | `/api/tasks` | List tasks | Yes |
| GET | `/api/tasks/:id` | Task details | Yes |
| POST | `/api/tasks` | Create task | Yes |
| PATCH | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

---

## Frontend Architecture

### State Management (Redux)

```typescript
interface RootState {
  session: {
    currentUser: User | null;
    currentTask: string;
  };
  errors: {
    session: string[];
  };
  entities: {
    courses: { [id: number]: Course };
    subject: { [id: number]: Subject };
    task: { [id: number]: Task };
  };
  ui: {
    Pain: {
      currentPain: string;
      currentCourse: number;
    };
  };
}
```

### Routing (React Router 5)

```typescript
<HashRouter>
  <Route path="/" component={NavBar} />
  <AuthRoute path="/signup" component={SignUp} />     // Unauthenticated only
  <AuthRoute path="/signIn" component={SignIn} />     // Unauthenticated only
  <ProtectedRoute path="/profile" component={Profile} /> // Authenticated only
  <ProtectedRoute path="/" component={Hall} />        // Authenticated only
</HashRouter>
```

---

## Authentication Flow

1. User submits login credentials to `POST /api/sessions`
2. Server validates credentials via `User.find_by_credentials`
3. Server resets session token and stores in `session[:session_token]`
4. Server returns user JSON
5. Frontend dispatches `RECEIVE_CURRENT_USER`
6. Frontend stores user in Redux and redirects to Hall

---

## Deployment Architecture (Render)

```
┌─────────────────────────────────────────────────────────────┐
│                      Render Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ learning-hall  │  │ learning-hall  │  │ learning-hall  │ │
│  │    -site       │  │    -api        │  │    -db         │ │
│  │ (Static Site)  │  │ (Web Service)  │  │ (PostgreSQL)   │ │
│  │                │  │                │  │                │ │
│  │ React SPA      │  │ Rails + Puma   │  │ 256MB Basic    │ │
│  │ Free Plan      │  │ Free Plan      │  │ $7/month       │ │
│  └────────┬───────┘  └────────┬───────┘  └────────────────┘ │
│           │                   │                              │
│           └─────────┬─────────┘                              │
│                     │                                        │
│             ┌───────┴───────┐                                │
│             │    AWS S3     │                                │
│             │ (File Storage)│                                │
│             └───────────────┘                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend Framework | Ruby on Rails | 7.2.0 |
| Ruby | Ruby | 3.3 |
| Database | PostgreSQL | 16 |
| App Server | Puma | 6.4 |
| Frontend Framework | React | 16.9.0 |
| State Management | Redux + Thunk | 4.0.4 |
| Routing | React Router | 5.0.1 |
| Build Tool | Vite | 7.3.1 |
| Type System | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.1.18 |
| Testing | Vitest | 4.0.17 |
| File Storage | AWS S3 | - |

---

## See Also

- [System Architecture Diagram](./diagrams/system-architecture.md)
- [Database ERD](./diagrams/database-erd.md)
- [API Map](./diagrams/api-map.md)
- [User Flows](./diagrams/user-flows.md)
- [Analysis Report](./ANALYSIS_REPORT.md)
