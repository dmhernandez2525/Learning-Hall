# Software Design Document: Learning-Hall Modernization

**Version:** 1.0.0
**Author:** Daniel Hernandez
**Created:** January 2026
**Status:** Draft - Awaiting Review

---

## 1. Executive Summary

This document outlines the modernization strategy for Learning-Hall, a Ruby on Rails + React application. This project requires both backend (Rails) and frontend (React/Webpack) modernization with adoption of Tailwind v4 and Shadcn for styling.

### Current State
- **Ruby:** 2.5.x (EOL)
- **Rails:** 5.2.3 (Legacy)
- **Node.js:** 12.10.0 (EOL)
- **React:** 16.9.0 (Legacy)
- **Build Tool:** Webpack 4 (custom config)
- **Styling:** SCSS (sass-rails)
- **State Management:** Redux 4 + Thunk
- **Database:** PostgreSQL

### Target State
- **Ruby:** 3.3.x
- **Rails:** 7.2.x (or 8.x if stable)
- **Node.js:** 22.x LTS
- **React:** 19.x
- **Build Tool:** Vite 6.x (via vite-ruby)
- **Styling:** Tailwind CSS v4 + Shadcn
- **State Management:** Redux Toolkit or Zustand
- **Database:** PostgreSQL 16.x

---

## 2. Current Technology Audit

### Backend (Gemfile)

| Gem | Current | LTS/Latest | Action | Breaking Changes |
|-----|---------|------------|--------|------------------|
| ruby | 2.5.x | 3.3.x | **Upgrade** | Major - syntax, stdlib |
| rails | 5.2.3 | 7.2.x | **Upgrade** | Major - multiple |
| pg | >= 0.18 | ~> 1.5 | Upgrade | Minor |
| puma | ~> 3.11 | ~> 6.4 | **Upgrade** | Major - config changes |
| sass-rails | ~> 5.0 | Deprecated | **Replace** | Use cssbundling-rails |
| uglifier | >= 1.3.0 | Deprecated | **Remove** | Use jsbundling-rails |
| coffee-rails | ~> 4.2 | Deprecated | **Remove** | Convert to JS |
| jbuilder | ~> 2.5 | ~> 2.12 | Upgrade | Minor |
| bcrypt | ~> 3.1.7 | ~> 3.1.20 | Upgrade | None |
| bootsnap | >= 1.1.0 | ~> 1.18 | Upgrade | None |
| aws-sdk-s3 | unversioned | ~> 1.174 | Upgrade | Minor |
| jquery-rails | unversioned | Deprecated | **Remove** | Not needed with React |
| web-console | >= 3.3.0 | ~> 4.2 | Upgrade | None |
| listen | >= 3.0.5 | ~> 3.9 | Upgrade | None |
| capybara | >= 2.15 | ~> 3.40 | **Upgrade** | Major |
| selenium-webdriver | unversioned | ~> 4.25 | **Upgrade** | Major |
| chromedriver-helper | unversioned | Deprecated | **Replace** | Use webdrivers gem |
| faker | dev only | ~> 3.4 | Upgrade | Breaking API changes |

### Frontend (package.json)

| Package | Current | LTS/Latest | Action | Breaking Changes |
|---------|---------|------------|--------|------------------|
| Node.js | 12.10.0 | 22.x | **Upgrade** | Major |
| react | 16.9.0 | 19.x | **Upgrade** | Major |
| react-dom | 16.9.0 | 19.x | **Upgrade** | Major |
| react-router | 5.0.1 | 7.x | **Upgrade** | Major |
| react-router-dom | 5.0.1 | 7.x | **Upgrade** | Major |
| react-redux | 7.1.1 | 9.x | **Upgrade** | Major |
| redux | 4.0.4 | 5.x | Upgrade | Minor |
| redux-thunk | 2.3.0 | 3.x | Upgrade or **Replace** | Consider RTK |
| redux-logger | 3.0.6 | 3.0.6 | Keep | None |
| webpack | 4.39.3 | 5.x | **Replace** | Use Vite |
| webpack-cli | 3.3.7 | Deprecated | **Remove** | Use Vite |
| @babel/core | 7.5.5 | 7.26.x | Upgrade | Minor |
| babel-polyfill | 6.26.0 | Deprecated | **Remove** | Use core-js |
| markdown-to-jsx | 6.10.3 | 7.7.x | **Upgrade** | Major |
| marked | 0.3.5 | 15.x | **Upgrade** | Major - security |

### New Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.x | Styling |
| @shadcn/ui | latest | Component library |
| vite | 6.x | Build tool |
| vite-ruby | latest | Rails + Vite integration |
| @vitejs/plugin-react | 5.x | React plugin |
| typescript | 5.9.x | Type safety |
| vitest | 2.x | JS Testing |
| @testing-library/react | 16.x | Component testing |

### Rails Gems to Add

| Gem | Version | Purpose |
|-----|---------|---------|
| vite_rails | latest | Vite integration |
| tailwindcss-rails | latest | Tailwind integration |
| cssbundling-rails | latest | CSS processing |
| propshaft | latest | Modern asset pipeline |

---

## 3. Migration Strategy

### Phase 1: Ruby & Rails Core Upgrade (PR #1)
**Scope:** Ruby 3.3, Rails 7.2, database adapter
**Breaking Changes:** Significant - requires careful testing

#### Steps:
1. Update `.ruby-version` to 3.3.x
2. Update Gemfile Rails version incrementally:
   - 5.2 → 6.0 → 6.1 → 7.0 → 7.1 → 7.2
3. Run `rails app:update` at each major version
4. Fix deprecation warnings at each step
5. Update PostgreSQL adapter
6. Update Puma configuration
7. Remove deprecated gems (coffee-rails, uglifier)

#### Rails 7 Migration Notes:
```ruby
# config/application.rb changes
# Rails 7 defaults
config.load_defaults 7.2

# Active Record encryption (new in 7.0)
config.active_record.encryption.primary_key = ENV['RAILS_ENCRYPTION_KEY']
```

---

### Phase 2: Asset Pipeline Modernization (PR #2)
**Scope:** Replace Sprockets + Webpack with Vite
**Breaking Changes:** Build system only

#### Steps:
1. Add `vite_rails` gem
2. Run `bundle exec vite install`
3. Move JS entrypoints to `app/frontend`
4. Configure vite.config.ts
5. Remove Webpacker/Webpack configuration
6. Update asset helpers in views
7. Remove sass-rails, use cssbundling-rails

#### Vite Configuration:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import RubyPlugin from 'vite-plugin-ruby';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [RubyPlugin(), react()],
});
```

---

### Phase 3: React & Router Upgrade (PR #3)
**Scope:** React 19, React Router 7
**Breaking Changes:** Component patterns, routing API

#### Steps:
1. Upgrade React and React DOM to 19.x
2. Migrate class components to functional (if any)
3. Upgrade React Router to 7.x
4. Update routing patterns

#### React Router 7 Migration:
```jsx
// OLD (v5)
import { Switch, Route } from 'react-router-dom';
<Switch>
  <Route path="/courses" component={Courses} />
</Switch>

// NEW (v7)
import { Routes, Route } from 'react-router-dom';
<Routes>
  <Route path="/courses" element={<Courses />} />
</Routes>
```

---

### Phase 4: State Management (PR #4)
**Scope:** Migrate Redux to Redux Toolkit
**Breaking Changes:** Store configuration, action patterns

#### Steps:
1. Install @reduxjs/toolkit
2. Convert reducers to slices
3. Migrate thunks to createAsyncThunk
4. Update store configuration
5. Remove redux-thunk (included in RTK)

#### Migration Example:
```typescript
// OLD
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
  }
};

// NEW (RTK)
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
  },
});
```

---

### Phase 5: Styling Migration (PR #5)
**Scope:** Replace SCSS with Tailwind v4 + Shadcn
**Breaking Changes:** All component styles

#### Steps:
1. Add tailwindcss-rails gem
2. Configure Tailwind v4
3. Initialize Shadcn
4. Create base component library
5. Migrate components one by one
6. Remove SCSS files

#### Rails + Tailwind Setup:
```bash
# Add to Gemfile
gem 'tailwindcss-rails'

# Install
rails tailwindcss:install
```

---

### Phase 6: Markdown Library Upgrade (PR #6)
**Scope:** Upgrade markdown processing (security critical)
**Breaking Changes:** Markdown rendering API

#### Steps:
1. Upgrade `marked` from 0.3.5 to 15.x (critical security fix)
2. Upgrade `markdown-to-jsx` to 7.x
3. Update rendering components
4. Sanitize user content properly

#### Security Note:
The current `marked` version (0.3.5) has known XSS vulnerabilities. This upgrade is **critical**.

---

### Phase 7: Testing Infrastructure (PR #7)
**Scope:** Update Rails tests, add Vitest for JS
**Breaking Changes:** Test configuration

#### Steps:
1. Replace chromedriver-helper with webdrivers
2. Upgrade Capybara to 3.x
3. Upgrade Selenium WebDriver to 4.x
4. Add Vitest for JavaScript testing
5. Add React Testing Library

---

## 4. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Rails upgrade breaks ActiveRecord | High | High | Incremental upgrades with tests |
| Ruby 3 syntax incompatibilities | High | Medium | Run ruby-next or manual fixes |
| Asset pipeline migration issues | Medium | Medium | Keep fallback during transition |
| React Router API changes | Medium | High | Incremental migration |
| Markdown security vulnerabilities | High | Current | Prioritize marked upgrade |
| Database schema incompatibilities | Medium | Low | Test with production data copy |

---

## 5. Dependencies & Prerequisites

### Development Environment
- Ruby 3.3.x installed (via rbenv/rvm)
- Node.js 22.x LTS installed
- PostgreSQL 16.x available
- Bundler 2.x

### External Dependencies
- AWS S3 for ActiveStorage (existing)
- PostgreSQL database (existing)

---

## 6. Success Criteria

- [ ] All RSpec tests passing
- [ ] All JavaScript tests passing
- [ ] No Rails deprecation warnings
- [ ] No security vulnerabilities (bundle audit)
- [ ] Lighthouse performance score > 90
- [ ] 85% test coverage
- [ ] All features functional
- [ ] ActiveStorage working with S3

---

## 7. Rollback Plan

Each PR can be reverted independently. If critical issues arise:
1. Revert the specific PR
2. Document the issue
3. Fix in a new branch
4. Re-attempt migration

**Special Note:** Rails upgrades should be done incrementally. If reverting a Rails upgrade, ensure database migrations are reversible.

---

## 8. Timeline Estimate

| Phase | Estimated Effort |
|-------|------------------|
| Phase 1: Ruby/Rails | 8-12 hours |
| Phase 2: Asset Pipeline | 6-8 hours |
| Phase 3: React/Router | 4-6 hours |
| Phase 4: State Management | 4-6 hours |
| Phase 5: Styling | 8-12 hours |
| Phase 6: Markdown | 2-3 hours |
| Phase 7: Testing | 4-6 hours |
| **Total** | **36-53 hours** |

---

## 9. Open Questions for Review

1. **Rails Version:** Target Rails 7.2 or wait for Rails 8 stable?
2. **Ruby Version:** 3.2 (stable) or 3.3 (latest)?
3. **State Management:** Redux Toolkit or migrate to Zustand?
4. **TypeScript:** Full TypeScript conversion or gradual?
5. **Deployment:** Update Heroku stack or migrate to Render/Railway?
