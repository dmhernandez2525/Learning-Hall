import React from 'react';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import config from '@/payload.config';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { listCertificatesForUser, Certificate } from '@/lib/certificates';
import { CertificateDisplay } from '@/components/courses/Certificate';

interface CourseData {
  id: string;
  title: string;
  description?: string;
  slug: string;
}

interface EnrollmentData {
  id: string;
  course: CourseData | string;
}

interface ProgressData {
  course: { id: string } | string;
  progressPercentage?: number;
}

async function StudentDashboardPage() {
  const user = await getSession();
  const payload = await getPayload({ config });

  if (!user) {
    redirect('/login');
  }

  let enrollments: EnrollmentData[] = [];
  let courseProgress: ProgressData[] = [];
  let certificates: Certificate[] = [];

  try {
    const enrollmentsResult = await payload.find({
      collection: 'enrollments',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 2,
    });
    enrollments = enrollmentsResult.docs as unknown as EnrollmentData[];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
  }

  try {
    const progressResult = await payload.find({
      collection: 'course-progress',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 2,
    });
    courseProgress = progressResult.docs as unknown as ProgressData[];
  } catch (error) {
    console.error('Error fetching course progress:', error);
  }

  try {
    certificates = await listCertificatesForUser(user.id);
  } catch (error) {
    console.error('Error fetching certificates:', error);
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Courses</h1>
      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => {
            const course = typeof enrollment.course === 'object' ? enrollment.course : null;
            if (!course) return null;

            const progress = courseProgress.find((p) => {
              const progressCourseId = typeof p.course === 'object' ? p.course.id : p.course;
              return progressCourseId === course.id;
            });

            return (
              <div key={enrollment.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4">{course.description || 'No description'}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress?.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{progress?.progressPercentage || 0}% Complete</p>
                  <Link href={`/courses/${course.slug}`} className="text-blue-500 hover:underline mt-4 inline-block">
                    View Course
                  </Link>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-md ml-4">
                    Resume
                  </button>
                  <Link
                    href={`/student/courses/${course.id}/lessons`}
                    className="text-sm text-blue-600 ml-4"
                  >
                    Lessons
                  </Link>
                  <Link
                    href={`/student/courses/${course.id}/quizzes`}
                    className="text-sm text-blue-600 ml-4"
                  >
                    Assessments
                  </Link>
                  <Link
                    href={`/student/courses/${course.id}/discussions`}
                    className="text-sm text-blue-600 ml-2"
                  >
                    Discussions
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold mt-12 mb-6">My Certificates</h1>
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((certificate) => (
            <CertificateDisplay key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You have not earned any certificates yet.</p>
      )}
    </div>
  );
}

export default StudentDashboardPage;
