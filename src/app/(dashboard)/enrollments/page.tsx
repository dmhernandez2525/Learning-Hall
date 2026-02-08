import React from 'react';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

interface Enrollment {
  id: string | number;
  user: { email?: string } | string | number | null;
  course: { title?: string } | string | number | null;
  status: string;
}

async function EnrollmentsPage() {
  let enrollments: Enrollment[] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'enrollments',
      depth: 2,
    });
    enrollments = result.docs as unknown as Enrollment[];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    // Continue with empty enrollments - table might not exist yet
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Enrollments</h1>

      {enrollments.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-500">No enrollments found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Enrollments will appear here once users start enrolling in courses.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
                    <p className="text-gray-900 whitespace-nowrap">
                      {typeof enrollment.user === 'object' && enrollment.user !== null
                        ? enrollment.user.email
                        : 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-nowrap">
                      {typeof enrollment.course === 'object' && enrollment.course !== null
                        ? enrollment.course.title
                        : 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        enrollment.status === 'active'
                          ? 'text-green-900'
                          : enrollment.status === 'completed'
                            ? 'text-blue-900'
                            : 'text-red-900'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-0 ${
                          enrollment.status === 'active'
                            ? 'bg-green-200'
                            : enrollment.status === 'completed'
                              ? 'bg-blue-200'
                              : 'bg-red-200'
                        } opacity-50 rounded-full`}
                      ></span>
                      <span className="relative capitalize">{enrollment.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EnrollmentsPage;
