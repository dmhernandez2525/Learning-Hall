# Learning Hall - Architecture

**Version:** 1.0.0
**Last Updated:** January 2026

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   React     │  │    Redux     │  │      Webpack        │ │
│  │   Router    │  │    Thunk     │  │      Bundler        │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
│         └────────────────┼───────────────────────────────────┤
│                          │                                   │
│                    JSON API (Rails)                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│               BACKEND (Ruby on Rails)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │Controllers  │  │   Models     │  │    Jbuilder Views   │ │
│  │             │  │              │  │                     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
└─────────┼────────────────┼───────────────────────────────────┘
          │                │
   ┌──────┴────────────────┴──────┐
   │        PostgreSQL            │
   └──────────────────────────────┘
```

---

## Directory Structure

```
Learning-Hall/
├── app/                    # Rails application
│   ├── controllers/        # API controllers
│   ├── models/             # ActiveRecord models
│   ├── views/              # Jbuilder JSON views
│   └── assets/
├── frontend/               # React application
│   ├── components/         # React components
│   ├── actions/            # Redux actions
│   ├── reducers/           # Redux reducers
│   ├── store/              # Redux store
│   └── util/               # API utilities
├── config/                 # Rails configuration
├── db/                     # Migrations and schema
├── docs/                   # Documentation
├── Gemfile                 # Ruby dependencies
├── package.json            # Node dependencies
└── webpack.config.js       # Webpack config
```

---

## Data Models

### Course
```ruby
class Course
  has_many :subjects
  has_many :enrollments
  has_many :users, through: :enrollments

  validates :title, :description, presence: true
end
```

### Subject
```ruby
class Subject
  belongs_to :course
  has_many :tasks

  validates :title, :order, presence: true
end
```

### Task
```ruby
class Task
  belongs_to :subject
  has_many :completions

  validates :title, :content, presence: true
end
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/session` | Login |
| DELETE | `/api/session` | Logout |
| POST | `/api/users` | Register |
