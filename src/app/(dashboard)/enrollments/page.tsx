
import React from 'react';
import { getPayload } from 'payload';
import { notFound } from 'next/navigation';
import config from '@/payload.config';

async function EnrollmentsPage() {
  const payload = await getPayload({ config });

  const { docs: enrollments } = await payload.find({
    collection: 'enrollments',
    depth: 2,
  });

  if (!enrollments) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enrollments</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {typeof enrollment.user === 'object' && enrollment.user !== null ? enrollment.user.email : 'N/A'}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {typeof enrollment.course === 'object' && enrollment.course !== null ? enrollment.course.title : 'N/A'}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      enrollment.status === 'active' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        enrollment.status === 'active' ? 'bg-green-200' : 'bg-red-200'
                      } opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{enrollment.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EnrollmentsPage;
