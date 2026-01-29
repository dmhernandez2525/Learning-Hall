'use client';

import { XpProgress } from './XpProgress';
import { StreakDisplay } from './StreakDisplay';
import { BadgeGrid } from './BadgeGrid';
import { Leaderboard } from './Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, Flame } from 'lucide-react';

export function AchievementsDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <XpProgress variant="card" showHistory />
        <StreakDisplay variant="card" showWeek />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Rankings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <BadgeGrid showTabs />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Stats Cards */}
            <StatCard
              title="Learning Streak"
              icon={Flame}
              iconColor="text-orange-500"
              bgColor="bg-orange-50"
            >
              <StreakDisplay variant="compact" />
            </StatCard>
            <StatCard
              title="Experience Points"
              icon={Trophy}
              iconColor="text-amber-500"
              bgColor="bg-amber-50"
            >
              <XpProgress variant="compact" />
            </StatCard>
            <StatCard
              title="Badges In Progress"
              icon={Target}
              iconColor="text-blue-500"
              bgColor="bg-blue-50"
            >
              <BadgeGrid showTabs={false} limit={3} />
            </StatCard>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Leaderboard showTimePeriod showPagination />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  children: React.ReactNode;
}

function StatCard({ title, icon: Icon, iconColor, bgColor, children }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
