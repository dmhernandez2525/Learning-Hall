# System Architecture Diagram

**Version:** 2.0.0
**Last Updated:** January 2026

---

## High-Level Architecture

```
                                    ┌─────────────────────────────────────┐
                                    │           RENDER HOSTING            │
                                    └─────────────────────────────────────┘
                                                     │
         ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
         │                                           │                                           │
         ▼                                           ▼                                           ▼
┌─────────────────┐                       ┌─────────────────┐                       ┌─────────────────┐
│ learning-hall   │                       │ learning-hall   │                       │ learning-hall   │
│     -site       │◄─────────────────────►│     -api        │◄─────────────────────►│     -db         │
│  (Static Site)  │        REST API       │   (Web Server)  │        SQL            │  (PostgreSQL)   │
│                 │                       │                 │                       │                 │
│   React SPA     │                       │  Ruby on Rails  │                       │   256MB Basic   │
│   Vite Build    │                       │    Puma 6.4     │                       │                 │
└─────────────────┘                       └────────┬────────┘                       └─────────────────┘
                                                   │
                                                   │ ActiveStorage
                                                   ▼
                                          ┌─────────────────┐
                                          │    AWS S3       │
                                          │  (File Storage) │
                                          │  User Avatars   │
                                          └─────────────────┘
```

---

## Frontend Architecture (React SPA)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React Application)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           PRESENTATION LAYER                                  │   │
│  │                                                                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   NavBar    │  │   Splash    │  │    Hall     │  │    Profile          │  │   │
│  │  │  Component  │  │   Page      │  │   (Main)    │  │    Page             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                                                                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   SignIn    │  │   SignUp    │  │   Course    │  │    Subject/Task     │  │   │
│  │  │    Form     │  │    Form     │  │   Forms     │  │    Components       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                          │
│                                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                            STATE MANAGEMENT (Redux)                           │   │
│  │                                                                               │   │
│  │  ┌────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                           Redux Store                                   │  │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────────┐   │  │   │
│  │  │  │   session    │  │   entities   │  │  errors   │  │     ui       │   │  │   │
│  │  │  │ {currentUser}│  │ {courses,    │  │ {session} │  │ {Pain:       │   │  │   │
│  │  │  │ {currentTask}│  │  subjects,   │  │           │  │  currentCourse│   │  │   │
│  │  │  │              │  │  tasks}      │  │           │  │  currentPain} │   │  │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────┘  └──────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                               │   │
│  │  Middleware: redux-thunk (async actions), redux-logger (dev debugging)        │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                          │
│                                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           DATA ACCESS LAYER                                   │   │
│  │                                                                               │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────────────────────┐ │   │
│  │  │           API Utilities              │  │        Action Creators         │ │   │
│  │  │  frontend/util/api.ts                │  │  frontend/actions/*.ts         │ │   │
│  │  │                                      │  │                                │ │   │
│  │  │  - login(user)                       │  │  - receiveCurrentUser()        │ │   │
│  │  │  - signup(user)                      │  │  - logoutCurrentUser()         │ │   │
│  │  │  - logout()                          │  │  - receiveAllCourses()         │ │   │
│  │  │  - fetchCourses()                    │  │  - receiveCourse()             │ │   │
│  │  │  - fetchSubjects()                   │  │  - receiveAllSubjects()        │ │   │
│  │  │  - fetchTasks()                      │  │  - receiveAllTasks()           │ │   │
│  │  │                                      │  │                                │ │   │
│  │  │  Uses: jQuery AJAX ($.ajax)          │  │  Uses: Redux Thunk             │ │   │
│  │  └─────────────────────────────────────┘  └────────────────────────────────┘ │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ROUTING (React Router 5 - HashRouter)                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  /                 → NavBar + (Splash or Hall based on auth)                  │  │
│  │  /signup           → SignUp (AuthRoute - redirects if logged in)              │  │
│  │  /signIn           → SignIn (AuthRoute - redirects if logged in)              │  │
│  │  /profile          → Profile (ProtectedRoute - requires auth)                 │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  BUILD TOOLS: Vite 7.3 | TypeScript 5.9 | Tailwind 4.1 | Vitest 4.0                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture (Rails API)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Ruby on Rails 7.2)                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           API CONTROLLERS                                     │   │
│  │                        app/controllers/api/                                   │   │
│  │                                                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │   │
│  │  │ SessionsController│ │ UsersController │  │ CoursesController│               │   │
│  │  │                  │  │                 │  │                  │               │   │
│  │  │ create (login)   │  │ create (signup) │  │ index, show      │               │   │
│  │  │ destroy (logout) │  │ update, destroy │  │ create, update   │               │   │
│  │  │                  │  │                 │  │ destroy          │               │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘               │   │
│  │                                                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                                    │   │
│  │  │SubjectsController│ │ TasksController │                                     │   │
│  │  │                  │  │                 │                                     │   │
│  │  │ index, show      │  │ index, show     │                                     │   │
│  │  │ create, update   │  │ create, update  │                                     │   │
│  │  │ destroy          │  │ destroy         │                                     │   │
│  │  └─────────────────┘  └─────────────────┘                                    │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                          │
│                                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                              MODELS (ActiveRecord)                            │   │
│  │                              app/models/                                      │   │
│  │                                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                                User                                      │ │   │
│  │  │  - username, email, password_digest, session_token                      │ │   │
│  │  │  - preferred_name, pronunciation, user_role                             │ │   │
│  │  │  - has_one_attached :photo (AWS S3)                                     │ │   │
│  │  │  - has_many :courses, :subjects                                         │ │   │
│  │  │  - BCrypt authentication (find_by_credentials, reset_session_token!)    │ │   │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │     Course      │  │    Subject      │  │          Task               │   │   │
│  │  │                 │  │                 │  │                             │   │   │
│  │  │ - name          │  │ - name          │  │ - name, body (markdown)     │   │   │
│  │  │ - author_id     │  │ - authorId      │  │ - duration, completed       │   │   │
│  │  │                 │  │ - courseId      │  │ - author_id, subject_id     │   │   │
│  │  │ belongs_to:     │  │                 │  │                             │   │   │
│  │  │   author (User) │  │ belongs_to:     │  │ (associations commented)    │   │   │
│  │  │ has_many:       │  │   author, course│  │                             │   │   │
│  │  │   subjects      │  │                 │  │                             │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘   │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                          │
│                                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           VIEWS (Jbuilder JSON)                               │   │
│  │                           app/views/api/                                      │   │
│  │                                                                               │   │
│  │  users/_user.json.jbuilder    → { id, username, email, preferred_name, ... } │   │
│  │  courses/index.json.jbuilder  → [{ id, name, author_id }, ...]               │   │
│  │  subjects/show.json.jbuilder  → { id, name, authorId, courseId }             │   │
│  │  tasks/index.json.jbuilder    → [{ id, name, body, duration, ... }, ...]     │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  MIDDLEWARE: ApplicationController (session management, current_user, logged_in?)   │
│  AUTH: BCrypt password hashing, session_token in users table                        │
│  SERVER: Puma 6.4 | PORT: 10000 (production) / 3000 (development)                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST/RESPONSE FLOW                                  │
└────────────────────────────────────────────────────────────────────────────────────┘

     User Action                        Frontend                          Backend
          │                                │                                 │
          │ 1. Click "Login"               │                                 │
          │─────────────────────────────►  │                                 │
          │                                │                                 │
          │                                │ 2. Dispatch login() action      │
          │                                │    (Redux Thunk)                │
          │                                │                                 │
          │                                │ 3. $.ajax POST /api/sessions    │
          │                                │─────────────────────────────►   │
          │                                │                                 │
          │                                │                  4. SessionsController#create
          │                                │                     - Find user by username
          │                                │                     - Verify password (BCrypt)
          │                                │                     - Reset session_token
          │                                │                     - Store in session[:session_token]
          │                                │                                 │
          │                                │ 5. JSON Response                │
          │                                │◄─────────────────────────────   │
          │                                │    { id, username, email, ... } │
          │                                │                                 │
          │                                │ 6. Dispatch RECEIVE_CURRENT_USER│
          │                                │    Update Redux store           │
          │                                │                                 │
          │ 7. Redirect to /               │                                 │
          │◄─────────────────────────────  │                                 │
          │    Render Hall component       │                                 │
          │                                │                                 │
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                RENDER DEPLOYMENT                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────────────┐
                              │        GitHub Repo          │
                              │    main branch trigger      │
                              └──────────────┬──────────────┘
                                             │
                           ┌─────────────────┼─────────────────┐
                           │                 │                 │
                           ▼                 ▼                 ▼
                 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                 │   Static Site   │ │   Web Service   │ │    Database     │
                 │                 │ │                 │ │                 │
                 │ learning-hall   │ │ learning-hall   │ │ learning-hall   │
                 │    -site        │ │    -api         │ │    -db          │
                 │                 │ │                 │ │                 │
                 │ BUILD:          │ │ BUILD:          │ │ PostgreSQL      │
                 │ npm ci &&       │ │ bundle install  │ │ 256MB Basic     │
                 │ npm run build   │ │ assets:precompile│ │                 │
                 │                 │ │                 │ │                 │
                 │ SERVE:          │ │ START:          │ │ Persistent      │
                 │ CDN-backed      │ │ puma -C config/ │ │ Storage         │
                 │ static files    │ │   puma.rb       │ │                 │
                 │                 │ │                 │ │                 │
                 │ PLAN: Free      │ │ PLAN: Free      │ │ PLAN: $7/mo     │
                 │ (spins down)    │ │ (spins down)    │ │                 │
                 └─────────────────┘ └─────────────────┘ └─────────────────┘
                         │                   │
                         │                   │
                         └───────┬───────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        AWS S3           │
                    │   (ActiveStorage)       │
                    │   User profile photos   │
                    └─────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | React | 16.9.0 |
| **State Management** | Redux + Thunk | 4.0.4 |
| **Routing** | React Router (HashRouter) | 5.0.1 |
| **Build Tool** | Vite | 7.3.1 |
| **Type System** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.1.18 |
| **Testing** | Vitest + Testing Library | 4.0.17 |
| **Backend Framework** | Ruby on Rails | 7.2.0 |
| **Ruby Version** | Ruby | 3.3 |
| **App Server** | Puma | 6.4 |
| **Database** | PostgreSQL | 16 |
| **File Storage** | AWS S3 (ActiveStorage) | - |
| **Containerization** | Docker | - |
| **Hosting** | Render | - |
