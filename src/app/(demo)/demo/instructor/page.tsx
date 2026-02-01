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
import { demoInstructor, demoEnrollments } from '@/lib/demo/data';

export default function DemoInstructorDashboard() {
  const { courses } = useDemo();

  // Filter courses by instructor
  const instructorCourses = courses.filter(
    (c) => c.instructor?.id === demoInstructor.id
  );

  // Calculate stats
  const totalEnrollments = demoEnrollments.filter((e) =>
    instructorCourses.some((c) => c.id === e.courseId)
  ).length;
  const completedEnrollments = demoEnrollments.filter(
    (e) =>
      instructorCourses.some((c) => c.id === e.courseId) &&
      e.status === 'completed'
  ).length;
  const publishedCourses = instructorCourses.filter(
    (c) => c.status === 'published'
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-800 dark:text-purple-200 font-medium">
              Demo Mode - Instructor View
            </p>
            <p className="text-purple-600 dark:text-purple-300 text-sm">
              Exploring as: {demoInstructor.name} ({demoInstructor.email})
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
        <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your courses, track student progress, and grow your teaching impact.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{instructorCourses.length}</div>
            <p className="text-muted-foreground text-sm">Total Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{publishedCourses}</div>
            <p className="text-muted-foreground text-sm">Published</p>
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
            <div className="text-2xl font-bold">{completedEnrollments}</div>
            <p className="text-muted-foreground text-sm">Course Completions</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview (Mock Data) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Revenue Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$4,850.00</div>
              <p className="text-muted-foreground text-sm">This Month</p>
              <p className="text-green-600 text-sm mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$28,420.00</div>
              <p className="text-muted-foreground text-sm">Total Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$2,150.00</div>
              <p className="text-muted-foreground text-sm">Pending Payout</p>
              <p className="text-blue-600 text-sm mt-1">Next payout: Feb 15</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Courses</h2>
          <Button>Create New Course</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructorCourses.map((course) => {
            const courseEnrollments = demoEnrollments.filter(
              (e) => e.courseId === course.id
            );
            const courseCompletions = courseEnrollments.filter(
              (e) => e.status === 'completed'
            ).length;

            return (
              <Card key={course.id} className="overflow-hidden">
                <div
                  className={`h-32 bg-gradient-to-r ${
                    course.status === 'published'
                      ? 'from-green-500 to-emerald-600'
                      : 'from-yellow-500 to-orange-600'
                  }`}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <CardDescription>{course.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Enrollments</p>
                      <p className="text-xl font-bold">{courseEnrollments.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completions</p>
                      <p className="text-xl font-bold">{courseCompletions}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">+</div>
            <p className="font-medium">Create Course</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">$</div>
            <p className="font-medium">Earnings</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">?</div>
            <p className="font-medium">Q&A</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">i</div>
            <p className="font-medium">Analytics</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
