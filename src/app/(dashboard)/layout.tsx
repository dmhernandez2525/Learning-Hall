import Link from 'next/link';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard - Learning Hall',
  description: 'Manage your courses and content',
};

async function DashboardNav() {
  const user = await getSession();

  const navItems = [
    { href: '/dashboard', label: 'Overview', visible: true },
    { href: '/student', label: 'My Courses', visible: !!user },
    { href: '/instructor', label: 'Instructor', visible: user?.role === 'instructor' || user?.role === 'admin' },
    { href: '/dashboard/courses', label: 'All Courses', visible: true },
    { href: '/enrollments', label: 'Enrollments', visible: true },
    { href: '/dashboard/media', label: 'Media Library', visible: true },
    { href: '/dashboard/settings', label: 'Settings', visible: true },
    { href: '/student/notes', label: 'Notes', visible: !!user },
  ];

  return (
    <nav className="flex items-center space-x-6 text-sm">
      {navItems.map((item) =>
        item.visible ? (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.label}
          </Link>
        ) : null
      )}
    </nav>
  );
}

async function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Learning Hall</span>
          </Link>
          <DashboardNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
