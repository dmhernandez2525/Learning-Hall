# Learning Hall - Roadmap

**Version:** 1.0.0
**Last Updated:** January 2026

---

## Current Status: Major Modernization Required

This project was built in 2019-2020 with Ruby 2.5 and Rails 5.2. Significant updates are needed.

---

## Decision Point

### Option A: Modernize Rails Stack
- Upgrade Ruby (2.5 → 3.3)
- Upgrade Rails (5.2 → 7.x)
- Keep PostgreSQL
- Modernize frontend

### Option B: Migrate to Node.js
- Replace Rails with Express/NestJS
- Keep React frontend
- Migrate to Prisma ORM
- Simpler deployment

---

## Phase 1: Critical Updates (Either Path)

| Status | Task | Priority |
|--------|------|----------|
| 📋 | Install Ruby version manager (rbenv/asdf) | P0 |
| 📋 | Fix Bundler compatibility | P0 |
| 📋 | Set up PostgreSQL locally | P0 |
| 📋 | Fix Webpack/OpenSSL issues | P0 |

## Phase 2: Rails Path

| Status | Task | Priority |
|--------|------|----------|
| 📋 | Upgrade Ruby to 3.x | P1 |
| 📋 | Upgrade Rails to 7.x | P1 |
| 📋 | Update all gems | P1 |
| 📋 | Migrate to Propshaft/ImportMaps | P2 |

## Phase 3: Frontend Modernization

| Status | Task | Priority |
|--------|------|----------|
| 📋 | Upgrade React (16 → 18) | P1 |
| 📋 | Add TypeScript | P1 |
| 📋 | Replace Webpack with Vite | P2 |
| 📋 | Add Tailwind CSS | P2 |

---

## Original Features (2020)

- ✅ User authentication
- ✅ Course browsing
- ✅ Subject/Task hierarchy
- ✅ Progress tracking
- ✅ Markdown content rendering
- ✅ AWS S3 file uploads
