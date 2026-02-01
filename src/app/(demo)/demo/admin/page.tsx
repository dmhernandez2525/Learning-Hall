'use client';

import Link from 'next/link';
import { useDemo } from '@/lib/demo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { demoEnrollments } from '@/lib/demo/data';

export default function DemoAdminDashboard() {
  const { courses } = useDemo();

  // Calculate platform stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const totalEnrollments = demoEnrollments.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">
              Demo Mode - Admin View
            </p>
            <p className="text-red-600 dark:text-red-300 text-sm">
              Full platform access - Explore all administrative features
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Switch Role
            </Button>
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management tools.
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-muted-foreground text-sm">Total Users</p>
            <p className="text-green-600 text-sm mt-1">+23 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-muted-foreground text-sm">Total Courses</p>
            <p className="text-muted-foreground text-sm mt-1">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-muted-foreground text-sm">Total Enrollments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">$42,850</div>
            <p className="text-muted-foreground text-sm">Monthly Revenue</p>
            <p className="text-green-600 text-sm mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Course Sales</span>
                <span className="font-bold">$35,420</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Subscriptions</span>
                <span className="font-bold">$5,230</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Certificates</span>
                <span className="font-bold">$2,200</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>$42,850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Students</span>
                <span className="font-bold">+187</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Instructors</span>
                <span className="font-bold">+12</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Users (30d)</span>
                <span className="font-bold">892</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Retention Rate</span>
                <span className="font-bold text-green-600">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View All Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Manage Instructors
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Role Permissions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Review and manage courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Pending Reviews
              </Button>
              <Button variant="outline" className="w-full justify-start">
                All Courses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Categories
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                General Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Payment Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Email Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Platform Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                {
                  action: 'New user registered',
                  user: 'john.smith@email.com',
                  time: '5 minutes ago',
                },
                {
                  action: 'Course published',
                  user: 'Dr. Sarah Chen',
                  time: '1 hour ago',
                },
                {
                  action: 'Payment processed',
                  user: '$99.00 - Course purchase',
                  time: '2 hours ago',
                },
                {
                  action: 'Certificate issued',
                  user: 'UI/UX Design Fundamentals',
                  time: '3 hours ago',
                },
                {
                  action: 'New instructor application',
                  user: 'michael.wong@email.com',
                  time: '5 hours ago',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">Users</div>
            <p className="font-medium">User Management</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">$</div>
            <p className="font-medium">Financials</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">Charts</div>
            <p className="font-medium">Analytics</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">Settings</div>
            <p className="font-medium">Settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
