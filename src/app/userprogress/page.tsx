// src/app/userprogress/page.tsx

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { TrendingUp, Target, Clock, Zap, BookOpen} from 'lucide-react';

function UserProgressContent() {
  // Placeholder progress data
  const progressData = {
    totalProblems: 237,
    solvedProblems: 67,
    currentStreak: 7,
    longestStreak: 15,
    totalHours: 124,
    averageTime: 45, // minutes per problem
    weeklyGoal: 5,
    weeklyCompleted: 3,
  };

  const categoryProgress = [
    { name: 'Arrays', solved: 12, total: 45, percentage: 27 },
    { name: 'Strings', solved: 8, total: 38, percentage: 21 },
    { name: 'Linked Lists', solved: 15, total: 25, percentage: 60 },
    { name: 'Trees', solved: 10, total: 30, percentage: 33 },
    { name: 'Graphs', solved: 5, total: 28, percentage: 18 },
    { name: 'Dynamic Programming', solved: 3, total: 35, percentage: 9 },
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Solved your first problem',
      icon: '🎯',
      date: '2 weeks ago',
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Array Master',
      description: 'Solved 10 array problems',
      icon: '📊',
      date: '1 week ago',
      rarity: 'uncommon'
    },
    {
      id: 3,
      title: 'Week Warrior',
      description: 'Maintained a 7-day solving streak',
      icon: '🔥',
      date: '2 days ago',
      rarity: 'rare'
    },
  ];

  const weeklyActivity = [
    { day: 'Mon', problems: 2 },
    { day: 'Tue', problems: 1 },
    { day: 'Wed', problems: 0 },
    { day: 'Thu', problems: 3 },
    { day: 'Fri', problems: 1 },
    { day: 'Sat', problems: 2 },
    { day: 'Sun', problems: 1 },
  ];

  const skillLevels = [
    { skill: 'Problem Solving', level: 65, maxLevel: 100 },
    { skill: 'Algorithms', level: 45, maxLevel: 100 },
    { skill: 'Data Structures', level: 55, maxLevel: 100 },
    { skill: 'Time Complexity', level: 40, maxLevel: 100 },
    { skill: 'Space Complexity', level: 35, maxLevel: 100 },
  ];

  const getProgressPercentage = () => {
    return Math.round((progressData.solvedProblems / progressData.totalProblems) * 100);
  };

  const getWeeklyProgressPercentage = () => {
    return Math.round((progressData.weeklyCompleted / progressData.weeklyGoal) * 100);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
      case 'uncommon': return 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
      case 'rare': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Progress
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Track your coding journey, monitor your improvement, and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.solvedProblems}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Problems Solved
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <Zap className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.currentStreak}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Streak
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Best: {progressData.longestStreak} days
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <Clock className="h-10 w-10 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.totalHours}h
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Time
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg: {progressData.averageTime}min per problem
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <Target className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.weeklyCompleted}/{progressData.weeklyGoal}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weekly Goal
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>This Week</span>
                  <span>{getWeeklyProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getWeeklyProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Progress */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Progress by Category
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {categoryProgress.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {category.solved}/{category.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-right">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Activity */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    This Weeks Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyActivity.map((day) => (
                      <div key={day.day} className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {day.day}
                        </div>
                        <div className="relative">
                          <div 
                            className={`w-full rounded ${
                              day.problems > 0 
                                ? 'bg-green-500' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ 
                              height: `${Math.max(day.problems * 20, 10)}px`,
                              minHeight: '10px'
                            }}
                          ></div>
                          <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                            {day.problems}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Achievements
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {achievement.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Levels */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Skill Levels
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {skillLevels.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {skill.skill}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {skill.level}/{skill.maxLevel}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function UserProgressPage() {
  return (
    <ProtectedRoute>
      <UserProgressContent />
    </ProtectedRoute>
  );
}