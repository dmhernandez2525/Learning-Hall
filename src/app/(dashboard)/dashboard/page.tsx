import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { href: '/dashboard/courses/new', label: 'Create Course', description: 'Start building a new course' },
    { href: '/dashboard/media', label: 'Upload Media', description: 'Add videos and files' },
    { href: '/dashboard/settings/storage', label: 'Configure Storage', description: 'Set up your storage provider' },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h4 className="font-semibold">{action.label}</h4>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
            No recent activity yet. Start by creating your first course!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GettingStarted() {
  const steps = [
    { title: 'Configure Storage', description: 'Set up your preferred storage provider (S3, R2, GCS)', completed: false },
    { title: 'Create Your First Course', description: 'Build a course with modules and lessons', completed: false },
    { title: 'Upload Content', description: 'Add videos, documents, and other media', completed: false },
    { title: 'Publish & Share', description: 'Make your course available to learners', completed: false },
  ];

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>Complete these steps to launch your first course</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to Learning Hall. Manage your courses and content.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/courses/new">Create Course</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Courses" value={0} description="Published and draft courses" />
        <StatsCard title="Total Lessons" value={0} description="Across all courses" />
        <StatsCard title="Media Files" value={0} description="Videos, images, and documents" />
        <StatsCard title="Storage Used" value="0 GB" description="Of your storage quota" />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentActivity />
        <GettingStarted />
      </div>
    </div>
  );
}
