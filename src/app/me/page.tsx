// src/app/me/page.tsx

'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { roleUtils } from '@/lib/utils/auth';
import { dateUtils, stringUtils } from '@/lib/utils/common';
import { BookOpen, Code, TrendingUp, Award, Clock } from 'lucide-react';

function Content() {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  const stats = [
    {
      name: 'Problems Solved',
      value: '42',
      change: '+12%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: BookOpen,
    },
    {
      name: 'Code Solutions',
      value: '28',
      change: '+8%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: Code,
    },
    {
      name: 'Study Streak',
      value: '7 days',
      change: 'Current',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: TrendingUp,
    },
    {
      name: 'Total Hours',
      value: '124h',
      change: '+5h this week',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: Clock,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'problem_solved',
      title: 'Two Sum',
      category: 'Array',
      difficulty: 'Easy',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'solution_created',
      title: 'Binary Search Implementation',
      category: 'Search',
      difficulty: 'Medium',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'milestone_reached',
      title: 'Completed 40 problems',
      category: 'Achievement',
      difficulty: null,
      time: '1 day ago',
    },
  ];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {stringUtils.getInitials(user.name)}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Ready to tackle some coding challenges today?
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                <Award size={16} className="mr-2" />
                {roleUtils.formatRole(user.role)}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <span className={`font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600 dark:text-green-400' 
                          : stat.changeType === 'negative'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.change}
                      </span>
                      {stat.changeType !== 'neutral' && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          from last week
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            activity.type === 'problem_solved' ? 'bg-green-500' :
                            activity.type === 'solution_created' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                              {activity.time}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {activity.category}
                            </span>
                            {activity.difficulty && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                activity.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                                activity.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                              }`}>
                                {activity.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                      View all activity →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Browse Questions
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Code Editor
                      </span>
                    </div>
                    <span className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors group">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        View Progress
                      </span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>

              {/* User Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Info
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{roleUtils.formatRole(user.role)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{dateUtils.formatDate(user.createdAt)}</dd>
                  </div>
                  
                  {/* Admin page Link */}
                  {isAdmin() && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => window.location.href = '/admin'}
                        className="w-full flex items-center justify-center px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors font-medium"
                      >
                        Admin page →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}