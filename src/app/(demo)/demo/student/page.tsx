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
import { Progress } from '@/components/ui/progress';

export default function DemoStudentDashboard() {
  const {
    user,
    getEnrolledCourses,
    pointsData,
    earnedBadges,
    certificates,
  } = useDemo();

  const enrolledCourses = getEnrolledCourses();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Demo Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Demo Mode - Student View
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Exploring as: {user.name} ({user.email})
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">
          Continue your learning journey. You&apos;re doing great!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pointsData.totalPoints}</div>
            <p className="text-muted-foreground text-sm">Total Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pointsData.streak.current}</div>
            <p className="text-muted-foreground text-sm">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <p className="text-muted-foreground text-sm">Badges Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-muted-foreground text-sm">Certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Link href="/demo/student/courses">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{enrollment.course?.title}</CardTitle>
                <CardDescription>{enrollment.course?.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{enrollment.progressPercentage}%</span>
                  </div>
                  <Progress value={enrollment.progressPercentage} />
                  <div className="flex gap-2 pt-2">
                    <Link href={`/demo/student/courses/${enrollment.courseId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Badges Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Achievements</h2>
          <Link href="/demo/student/achievements">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {earnedBadges.slice(0, 6).map((earned) => (
            <Card key={earned.badge.id} className={earned.isNew ? 'ring-2 ring-yellow-400' : ''}>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl">
                  {earned.badge.rarity === 'legendary' && '!'}
                  {earned.badge.rarity === 'epic' && '*'}
                  {earned.badge.rarity === 'rare' && '+'}
                  {earned.badge.rarity === 'uncommon' && '-'}
                  {earned.badge.rarity === 'common' && '.'}
                </div>
                <p className="font-medium text-sm">{earned.badge.name}</p>
                {earned.isNew && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    New!
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/demo/student/achievements">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">Trophy</div>
              <p className="font-medium">Achievements</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/demo/student/notes">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">Notes</div>
              <p className="font-medium">My Notes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/demo/student/bookmarks">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">Bookmark</div>
              <p className="font-medium">Bookmarks</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/demo/student/certificates">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">Certificate</div>
              <p className="font-medium">Certificates</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
