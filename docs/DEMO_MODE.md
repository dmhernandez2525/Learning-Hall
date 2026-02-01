# Demo Mode

Learning Hall supports an environment-based demo mode that allows visitors to explore the platform without requiring account creation.

## Overview

When demo mode is enabled, the authentication pages (`/login` and `/register`) display a role selector instead of the standard login/registration forms. Users can choose to explore the platform as:

- **Student**: Browse courses, track progress, earn achievements, and view certificates
- **Instructor**: Create and manage courses, view student analytics, track earnings
- **Admin**: Full platform access including user management, system settings, and analytics

## Configuration

Demo mode is controlled by the `NEXT_PUBLIC_DEMO_MODE` environment variable.

### Enable Demo Mode

Set the environment variable to `true`:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

### Disable Demo Mode

Remove the variable or set it to any value other than `true`:

```bash
NEXT_PUBLIC_DEMO_MODE=false
# or simply remove the variable
```

## Environment Configuration

### Local Development

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

### Render Deployment

The `render.yaml` file includes demo mode configuration by default:

```yaml
envVars:
  - key: NEXT_PUBLIC_DEMO_MODE
    value: "true"
```

To disable demo mode in production, either:
1. Remove the `NEXT_PUBLIC_DEMO_MODE` entry from `render.yaml`
2. Or update the value to `"false"` via the Render Dashboard

## Architecture

### Components

- **`DemoRoleSelector`** (`/src/components/auth/DemoRoleSelector.tsx`): The role selection UI shown on auth pages when demo mode is enabled
- **`isDemoMode()`**: Utility function to check if demo mode is active

### Demo Pages

Demo pages are located in the `(demo)` route group:

```
src/app/(demo)/
  layout.tsx          # Wraps children with DemoProvider
  demo/
    student/page.tsx  # Student demo dashboard
    instructor/page.tsx # Instructor demo dashboard
    admin/page.tsx    # Admin demo dashboard
```

### Demo Data

Demo data is managed in `/src/lib/demo/`:

- **`data.ts`**: Contains all mock data (courses, users, enrollments, progress, etc.)
- **`context.tsx`**: React context providing demo data and functions to components
- **`index.ts`**: Exports for easy importing

## How It Works

1. When a user visits `/login` or `/register`, the page checks `NEXT_PUBLIC_DEMO_MODE`
2. If `true`, the `DemoRoleSelector` component is rendered instead of the auth form
3. Users select a role (Student, Instructor, or Admin)
4. They are redirected to the corresponding demo dashboard (e.g., `/demo/student`)
5. The demo layout wraps pages with `DemoProvider`, providing access to mock data
6. Demo pages use the `useDemo()` hook to access mock data and functions

## Customization

### Adding Demo Data

Edit `/src/lib/demo/data.ts` to add or modify:

- Courses, modules, and lessons
- User progress and enrollments
- Badges and achievements
- Certificates
- Notes and bookmarks

### Adding Demo Pages

1. Create new pages under `/src/app/(demo)/demo/[role]/`
2. Use the `useDemo()` hook to access demo data
3. Include the demo banner to indicate demo mode

Example:

```tsx
'use client';

import { useDemo } from '@/lib/demo';

export default function MyDemoPage() {
  const { user, courses } = useDemo();

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>You have access to {courses.length} courses.</p>
    </div>
  );
}
```

## Security Considerations

- Demo mode is purely client-side and uses mock data
- No actual authentication occurs in demo mode
- API routes are not modified by demo mode
- Demo mode should typically be disabled in production environments where real user data is expected

## Switching Between Demo and Production

The same codebase supports both modes. Simply toggle the environment variable:

| Environment | `NEXT_PUBLIC_DEMO_MODE` | Behavior |
|-------------|-------------------------|----------|
| Demo Site   | `true`                  | Role selector on auth pages |
| Production  | `false` or unset        | Standard authentication |

This allows you to:
- Deploy a demo instance for marketing/sales
- Deploy a production instance for real users
- Test both modes in local development
