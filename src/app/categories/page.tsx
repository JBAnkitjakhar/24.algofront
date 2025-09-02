// src/app/categories/page.tsx

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { FolderOpen, ArrowRight, Star, Clock } from 'lucide-react';

function CategoriesContent() {
  // Placeholder data for categories
  const categories = [
    {
      id: 1,
      name: 'Arrays',
      description: 'Learn array manipulation techniques and algorithms',
      problemCount: 45,
      difficulty: 'Easy to Hard',
      completedProblems: 12,
      color: 'bg-blue-500',
      icon: '📊',
    },
    {
      id: 2,
      name: 'Strings',
      description: 'String processing and pattern matching problems',
      problemCount: 38,
      difficulty: 'Easy to Hard',
      completedProblems: 8,
      color: 'bg-green-500',
      icon: '🔤',
    },
    {
      id: 3,
      name: 'Dynamic Programming',
      description: 'Master the art of breaking down complex problems',
      problemCount: 52,
      difficulty: 'Medium to Hard',
      completedProblems: 5,
      color: 'bg-purple-500',
      icon: '🧠',
    },
    {
      id: 4,
      name: 'Trees & Graphs',
      description: 'Explore tree traversals and graph algorithms',
      problemCount: 41,
      difficulty: 'Medium to Hard',
      completedProblems: 15,
      color: 'bg-orange-500',
      icon: '🌳',
    },
    {
      id: 5,
      name: 'Sorting & Searching',
      description: 'Master fundamental sorting and searching techniques',
      problemCount: 28,
      difficulty: 'Easy to Medium',
      completedProblems: 20,
      color: 'bg-red-500',
      icon: '🔍',
    },
    {
      id: 6,
      name: 'Math & Logic',
      description: 'Mathematical problems and logical reasoning',
      problemCount: 33,
      difficulty: 'Easy to Hard',
      completedProblems: 7,
      color: 'bg-indigo-500',
      icon: '🧮',
    },
  ];

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Problem Categories
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore different categories of coding problems. Each category contains carefully curated 
                problems to help you master specific algorithms and data structures.
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const progressPercentage = getProgressPercentage(category.completedProblems, category.problemCount);
              
              return (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  {/* Category Header */}
                  <div className={`${category.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 text-4xl opacity-20">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>

                  {/* Category Content */}
                  <div className="p-6">
                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {category.problemCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Problems</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {category.completedProblems}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Solved</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {progressPercentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color} transition-all duration-300`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Difficulty & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.difficulty}
                        </span>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group-hover:translate-x-1 transition-all duration-200">
                        <span className="text-sm">Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Your Learning Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Total Problems Solved
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">67</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Out of 237 problems
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Categories Mastered
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">2</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  80%+ completion rate
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Overall Progress
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">28%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  );
}