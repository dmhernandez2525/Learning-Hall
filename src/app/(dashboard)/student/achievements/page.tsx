import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AchievementsDashboard } from '@/components/gamification/AchievementsDashboard';

export const metadata = {
  title: 'My Achievements',
  description: 'Track your learning progress, badges, and leaderboard ranking',
};

export default async function StudentAchievementsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track your learning progress, earn badges, and climb the leaderboard.
        </p>
      </div>
      <AchievementsDashboard />
    </div>
  );
}
