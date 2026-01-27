
import React from 'react';
import { getPayload } from 'payload';
import { notFound } from 'next/navigation';
import config from '@/payload.config';
import { getServerSideUser } from '@/lib/payload-utils';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function InstructorDashboardPage() {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);
  const payload = await getPayload({ config });

  if (!user || !user.roles.includes('instructor')) {
    return notFound();
  }

  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: {
      'tenant.id': {
        equals: user.tenant.id,
      },
    },
    depth: 2,
  });

  const { docs: enrollments } = await payload.find({
    collection: 'enrollments',
    where: {
      'course.tenant.id': {
        equals: user.tenant.id,
      },
    },
    depth: 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const courseEnrollments = enrollments.filter(
            (e) => e.course === course.id
          );
          const enrollmentCount = courseEnrollments.length;
          const completedCount = courseEnrollments.filter(e => e.status === 'completed').length;

          return (
            <div key={course.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-gray-600">Enrollments</p>
                    <p className="text-2xl font-bold">{enrollmentCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Completions</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
                <Link href={`/courses/${course.id}/edit`} className="text-blue-500 hover:underline mt-4 inline-block">
                    Edit Course
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InstructorDashboardPage;
