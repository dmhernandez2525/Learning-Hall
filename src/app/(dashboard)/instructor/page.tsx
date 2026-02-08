import React from 'react';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import config from '@/payload.config';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

async function InstructorDashboardPage() {
  const user = await getSession();
  const payload = await getPayload({ config });

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    redirect('/login');
  }

  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: {
      instructor: {
        equals: user.id,
      },
    },
    depth: 2,
  });

  const courseIds = courses.map((c) => c.id);

  const { docs: enrollments } = await payload.find({
    collection: 'enrollments',
    where: {
      course: {
        in: courseIds,
      },
    },
    depth: 0,
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Instructor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 sm:mb-8">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">{courses.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Enrollments</h3>
          <p className="text-3xl font-bold mt-2">{enrollments.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Completions</h3>
          <p className="text-3xl font-bold mt-2">
            {enrollments.filter((e) => e.status === 'completed').length}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const courseEnrollments = enrollments.filter(
            (e) => e.course === course.id || (typeof e.course === 'object' && e.course?.id === course.id)
          );
          const enrollmentCount = courseEnrollments.length;
          const completedCount = courseEnrollments.filter(
            (e) => e.status === 'completed'
          ).length;

          return (
            <div
              key={course.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : course.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.status}
                </span>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-gray-600 text-sm">Enrollments</p>
                    <p className="text-2xl font-bold">{enrollmentCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Completions</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/admin/collections/courses/${course.id}`}
                    className="text-gray-500 hover:underline text-sm"
                  >
                    Edit in Admin
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven&apos;t created any courses yet.</p>
          <Link
            href="/admin/collections/courses/create"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Your First Course
          </Link>
        </div>
      )}
    </div>
  );
}

export default InstructorDashboardPage;
