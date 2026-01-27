# Learning Hall - Roadmap

**Version:** 2.0.0
**Last Updated:** January 2026

---

## Current Status: Frontend Modernization Required

The backend has been fully modernized (Ruby 3.3, Rails 7.2). Build tooling is modern (Vite, TypeScript, Tailwind). The remaining work is frontend modernization (React, Router, Redux).

---

## Completed Upgrades

| Task | Old | New | Status |
|------|-----|-----|--------|
| Ruby version | 2.5.x | 3.3 | Done |
| Rails version | 5.2.3 | 7.2.0 | Done |
| Node.js | 12.x | 18+ | Done |
| Build tool | Webpack 4 | Vite 7.3 | Done |
| Type system | JavaScript | TypeScript 5.9 | Done |
| Styling | SCSS | Tailwind 4.1 | Done |
| Testing | None | Vitest 4.0 | Done |
| Asset pipeline | Sprockets | Propshaft | Done |

---

## Pending Upgrades

### Phase 1: Critical Fixes (Next)
**Priority: P0 - Immediate**

| Task | Priority | Notes |
|------|----------|-------|
| Remove debug code | P0 | `sleep(1)` in tasks controller |
| Remove console logs | P0 | `p()` statements in controllers |
| Add frontend tests | P1 | Increase test coverage |

### Phase 2: React Modernization
**Priority: P1 - High**

| Task | Current | Target | Breaking Changes |
|------|---------|--------|------------------|
| React upgrade | 16.9.0 | 18.x | Yes - new root API |
| React DOM upgrade | 16.9.0 | 18.x | Yes - createRoot |
| Class to Hooks | Class components | Functional | Medium effort |

**Migration Steps:**
1. Update React and React DOM to 18.x
2. Update root rendering (`ReactDOM.render` -> `createRoot`)
3. Migrate class components to functional with hooks
4. Fix any breaking changes

### Phase 3: React Router Upgrade
**Priority: P1 - High**

| Task | Current | Target | Breaking Changes |
|------|---------|--------|------------------|
| React Router | 5.0.1 | 6.x | Yes - major API change |

**Migration Steps:**
```jsx
// OLD (v5)
import { Switch, Route } from 'react-router-dom';
<Switch>
  <Route path="/courses" component={Courses} />
</Switch>

// NEW (v6)
import { Routes, Route } from 'react-router-dom';
<Routes>
  <Route path="/courses" element={<Courses />} />
</Routes>
```

### Phase 4: API Client Modernization
**Priority: P2 - Medium**

| Task | Current | Target | Notes |
|------|---------|--------|-------|
| HTTP client | jQuery AJAX | Native fetch | Remove jQuery dependency |
| API types | Partial | Complete | Add full TypeScript types |

### Phase 5: State Management
**Priority: P2 - Medium**

| Task | Current | Target | Notes |
|------|---------|--------|-------|
| Redux | 4.0.4 (vanilla) | Redux Toolkit | Simpler patterns |
| Thunk | redux-thunk | createAsyncThunk | Built into RTK |

**Migration Example:**
```typescript
// OLD (vanilla Redux)
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
  }
};

// NEW (Redux Toolkit)
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

### Phase 6: Database Cleanup
**Priority: P3 - Low**

| Task | Notes |
|------|-------|
| Rename camelCase columns | `authorId` -> `author_id` |
| Add foreign key constraints | Database-level integrity |
| Uncomment model associations | Fix Task model |

### Phase 7: TypeScript Strictness
**Priority: P3 - Low**

| Setting | Current | Target |
|---------|---------|--------|
| `strictNullChecks` | false | true |
| `noImplicitAny` | false | true |

---

## Feature Backlog

### High Priority
- [ ] Enrollment system (users enroll in courses)
- [ ] Progress dashboard (visualize completion)
- [ ] Course search functionality

### Medium Priority
- [ ] Task ordering (drag and drop)
- [ ] Rich text editor for task content
- [ ] Admin dashboard

### Low Priority
- [ ] Email notifications
- [ ] Course analytics
- [ ] Social features (comments, discussions)

---

## Original Features (2020)

These features were completed in the original build:

- User authentication (registration, login, logout)
- Course browsing
- Subject/Task hierarchy
- Progress tracking (completion status)
- Markdown content rendering
- AWS S3 file uploads (user avatars)

---

## Success Criteria

- [ ] All Vitest tests passing
- [ ] All Rails tests passing
- [ ] No console warnings or errors
- [ ] React 18+ with functional components
- [ ] React Router 6+ with modern API
- [ ] No jQuery dependency
- [ ] TypeScript strict mode enabled
- [ ] 80%+ test coverage
