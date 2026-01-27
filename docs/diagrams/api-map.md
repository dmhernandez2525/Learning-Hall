# API Endpoint Map

**Version:** 2.0.0
**Last Updated:** January 2026

---

## API Overview

All API endpoints are namespaced under `/api` and return JSON responses via Jbuilder templates.

**Base URL:** `https://learning-hall-api.onrender.com/api`
**Content-Type:** `application/json`

---

## Authentication Endpoints

| Method | Endpoint | Controller#Action | Description | Auth Required |
|--------|----------|-------------------|-------------|---------------|
| POST | `/api/sessions` | sessions#create | User login | No |
| DELETE | `/api/sessions` | sessions#destroy | User logout | Yes |

### POST /api/sessions (Login)

**Request:**
```json
{
  "user": {
    "username": "john_doe",
    "password": "secret123"
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "preferred_name": "John",
  "pronunciation": "jon",
  "user_role": "student"
}
```

**Response (401 Unauthorized):**
```json
["Invalid username or password"]
```

### DELETE /api/sessions (Logout)

**Response (200 OK):**
```json
{}
```

---

## User Endpoints

| Method | Endpoint | Controller#Action | Description | Auth Required |
|--------|----------|-------------------|-------------|---------------|
| POST | `/api/users` | users#create | User registration | No |
| PATCH | `/api/users/:id` | users#update | Update user profile | Yes |
| DELETE | `/api/users/:id` | users#destroy | Delete user account | Yes |

### POST /api/users (Register)

**Request:**
```json
{
  "user": {
    "username": "jane_doe",
    "email": "jane@example.com",
    "password": "password123",
    "preferred_name": "Jane",
    "pronunciation": "jayn",
    "user_role": "student"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "jane_doe",
  "email": "jane@example.com",
  "preferred_name": "Jane",
  "pronunciation": "jayn",
  "user_role": "student"
}
```

**Response (422 Unprocessable Entity):**
```json
["Username has already been taken", "Email has already been taken"]
```

---

## Course Endpoints

| Method | Endpoint | Controller#Action | Description | Auth Required |
|--------|----------|-------------------|-------------|---------------|
| GET | `/api/courses` | courses#index | List all courses | Yes |
| GET | `/api/courses/:id` | courses#show | Get course details | Yes |
| POST | `/api/courses` | courses#create | Create new course | Yes |
| PATCH | `/api/courses/:id` | courses#update | Update course | Yes |
| DELETE | `/api/courses/:id` | courses#destroy | Delete course | Yes |

### GET /api/courses (List Courses)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Web Development Fundamentals",
    "author_id": 1
  },
  {
    "id": 2,
    "name": "Advanced JavaScript",
    "author_id": 1
  }
]
```

### GET /api/courses/:id (Course Details)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Web Development Fundamentals",
  "author_id": 1
}
```

### POST /api/courses (Create Course)

**Request:**
```json
{
  "course": {
    "name": "React Mastery"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "React Mastery",
  "author_id": 1
}
```

---

## Subject Endpoints

| Method | Endpoint | Controller#Action | Description | Auth Required |
|--------|----------|-------------------|-------------|---------------|
| GET | `/api/subjects` | subjects#index | List all subjects | Yes |
| GET | `/api/subjects/:id` | subjects#show | Get subject details | Yes |
| POST | `/api/subjects` | subjects#create | Create new subject | Yes |
| PATCH | `/api/subjects/:id` | subjects#update | Update subject | Yes |
| DELETE | `/api/subjects/:id` | subjects#destroy | Delete subject | Yes |

### GET /api/subjects (List Subjects)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "HTML Basics",
    "authorId": 1,
    "courseId": 1
  },
  {
    "id": 2,
    "name": "CSS Fundamentals",
    "authorId": 1,
    "courseId": 1
  }
]
```

### POST /api/subjects (Create Subject)

**Request:**
```json
{
  "subject": {
    "name": "JavaScript Introduction",
    "courseId": 1
  }
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "JavaScript Introduction",
  "authorId": 1,
  "courseId": 1
}
```

---

## Task Endpoints

| Method | Endpoint | Controller#Action | Description | Auth Required |
|--------|----------|-------------------|-------------|---------------|
| GET | `/api/tasks` | tasks#index | List all tasks | Yes |
| GET | `/api/tasks/:id` | tasks#show | Get task details | Yes |
| POST | `/api/tasks` | tasks#create | Create new task | Yes |
| PATCH | `/api/tasks/:id` | tasks#update | Update task | Yes |
| DELETE | `/api/tasks/:id` | tasks#destroy | Delete task | Yes |

### GET /api/tasks (List Tasks)

**Note:** This endpoint has a 1-second artificial delay (debug code that should be removed).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Introduction to HTML",
    "body": "# HTML Basics\n\nHTML is the standard markup language...",
    "duration": 30,
    "completed": false,
    "author_id": 1,
    "subject_id": 1
  }
]
```

### POST /api/tasks (Create Task)

**Request:**
```json
{
  "task": {
    "name": "Setting Up Your Environment",
    "body": "# Environment Setup\n\nBefore we begin...",
    "duration": 15,
    "completed": false,
    "subject_id": 1
  }
}
```

### PATCH /api/tasks/:id (Update Task)

**Request (Mark Complete):**
```json
{
  "task": {
    "completed": true
  }
}
```

---

## Health Check Endpoints

| Method | Endpoint | Controller#Action | Description |
|--------|----------|-------------------|-------------|
| GET | `/up` | rails/health#show | Rails health check |
| GET | `/health` | rails/health#show | Render health check |

**Response (200 OK):**
```html
<!DOCTYPE html>
<html>
<body style="background-color: green"></body>
</html>
```

---

## Error Responses

### 401 Unauthorized
```json
["You must be logged in to perform this action"]
```

### 404 Not Found
```json
["Resource not found"]
```

### 422 Unprocessable Entity
```json
["Name can't be blank", "Name has already been taken"]
```

---

## API Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINT MAP                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                /api
                                  │
          ┌───────────────────────┼───────────────────────┬─────────────────────┐
          │                       │                       │                     │
          ▼                       ▼                       ▼                     ▼
    /sessions               /users                  /courses              /subjects
          │                       │                       │                     │
     ┌────┴────┐            ┌─────┴─────┐          ┌─────┴─────┐         ┌─────┴─────┐
     │         │            │     │     │          │     │     │         │     │     │
   POST    DELETE        POST  PATCH DELETE      GET   GET   POST      GET   GET   POST
  create  destroy       create update destroy  index  show  create   index  show  create
  (login) (logout)     (signup)                  │     │               │     │
                                                 │     │               │     │
                                              ┌──┴─────┴──┐         ┌──┴─────┴──┐
                                              │           │         │           │
                                           PATCH      DELETE     PATCH      DELETE
                                           update     destroy    update     destroy


                                                  /tasks
                                                    │
                                        ┌───────────┼───────────┐
                                        │           │           │
                                      GET         GET         POST
                                     index       show       create
                                        │           │
                                     ┌──┴───────────┴──┐
                                     │                 │
                                  PATCH             DELETE
                                  update            destroy
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION MECHANISM                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

  1. User submits login credentials
     ┌────────────────────────────────────────────────────────────────────────────┐
     │  POST /api/sessions                                                        │
     │  { "user": { "username": "...", "password": "..." } }                     │
     └────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  2. Server validates credentials
     ┌────────────────────────────────────────────────────────────────────────────┐
     │  User.find_by_credentials(username, password)                             │
     │    - Find user by username                                                 │
     │    - Verify password with BCrypt                                           │
     │    - Reset session_token                                                   │
     │    - Store session_token in session[:session_token]                        │
     └────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  3. Server returns user data + sets session cookie
     ┌────────────────────────────────────────────────────────────────────────────┐
     │  Response: { id, username, email, ... }                                   │
     │  Cookie: _learning_hall_session (encrypted)                               │
     └────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  4. Subsequent requests include session cookie
     ┌────────────────────────────────────────────────────────────────────────────┐
     │  ApplicationController#current_user                                        │
     │    - Read session[:session_token]                                          │
     │    - Find user by session_token                                            │
     │    - Return user or nil                                                    │
     └────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  5. Protected routes check authentication
     ┌────────────────────────────────────────────────────────────────────────────┐
     │  before_action :require_logged_in                                          │
     │    - If !logged_in?, render 401 Unauthorized                               │
     └────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend API Integration

All API calls are made via `frontend/util/api.ts` using jQuery AJAX:

```typescript
// Login
export const login = (user: LoginCredentials) => $.ajax({
  method: 'POST',
  url: '/api/sessions',
  data: { user }
});

// Signup
export const signup = (user: SignupCredentials) => $.ajax({
  method: 'POST',
  url: '/api/users',
  data: { user }
});

// Logout
export const logout = () => $.ajax({
  method: 'DELETE',
  url: '/api/sessions'
});

// Fetch courses
export const fetchCourses = () => $.ajax({
  method: 'GET',
  url: '/api/courses'
});

// Fetch subjects
export const fetchSubjects = () => $.ajax({
  method: 'GET',
  url: '/api/subjects'
});

// Fetch tasks
export const fetchTasks = () => $.ajax({
  method: 'GET',
  url: '/api/tasks'
});
```

**Note:** Consider migrating from jQuery AJAX to native `fetch()` or `axios` for modern browser support and smaller bundle size.
