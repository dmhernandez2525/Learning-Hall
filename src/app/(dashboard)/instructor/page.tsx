import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getInstructorDashboardData } from '@/lib/instructor-dashboard';
import { InstructorDashboardClient } from '@/components/instructor/dashboard';

export default async function InstructorDashboardPage() {
  const user = await getSession();

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    redirect('/login');
  }

  const initialData = await getInstructorDashboardData({
    instructorId: user.id,
    rangeKey: '30d',
  });

  return <InstructorDashboardClient initialData={initialData} />;
}
