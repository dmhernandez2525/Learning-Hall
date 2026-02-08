'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  Menu,
  X,
  FolderOpen,
  Image,
  StickyNote,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const primaryNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/student', label: 'Courses', icon: <BookOpen className="h-5 w-5" /> },
];

const secondaryNavItems: NavItem[] = [
  { href: '/instructor', label: 'Instructor', icon: <GraduationCap className="h-5 w-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const menuNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/student', label: 'My Courses', icon: <BookOpen className="h-5 w-5" /> },
  { href: '/instructor', label: 'Instructor', icon: <GraduationCap className="h-5 w-5" /> },
  { href: '/dashboard/courses', label: 'All Courses', icon: <FolderOpen className="h-5 w-5" /> },
  { href: '/enrollments', label: 'Enrollments', icon: <ClipboardList className="h-5 w-5" /> },
  { href: '/dashboard/media', label: 'Media Library', icon: <Image className="h-5 w-5" /> },
  { href: '/student/notes', label: 'Notes', icon: <StickyNote className="h-5 w-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  { href: '/admin', label: 'Admin Panel', icon: <Shield className="h-5 w-5" /> },
];

export default function MobileBottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Sheet Overlay + Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-20 left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 pb-8 shadow-2xl animate-slide-up safe-area-pb"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <nav className="grid grid-cols-2 gap-3">
              {menuNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl p-3 transition-colors',
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Left tabs */}
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Center FAB */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center justify-center w-14 h-14 -mt-6 rounded-full border-4 border-background shadow-lg transition-colors',
              menuOpen
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
            )}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Right tabs */}
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
