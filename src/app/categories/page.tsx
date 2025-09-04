// src/app/categories/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { FolderOpen, ArrowRight, Star, Clock, Search } from 'lucide-react';
import { useCategories } from '@/hooks/useCategoryManagement';
import { useCategoryStats } from '@/hooks/useCategoryManagement';
import { dateUtils } from '@/lib/utils/common';

interface CategoryWithStats {
  id: string;
  name: string;
  createdByName: string;
  createdAt: string;
  totalQuestions: number;
  questionsByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalSolutions: number;
}

function CategoryCard({ category, onClick }: { 
  category: CategoryWithStats; 
  onClick: () => void;
}) {
  const totalQuestions = category.totalQuestions;
  const { easy, medium, hard } = category.questionsByLevel;
  
  // Mock user progress - replace with real data when user progress is implemented
  const completedProblems = Math.floor(totalQuestions * (0.2 + Math.random() * 0.3)); // 20-50% completed
  const progressPercentage = totalQuestions > 0 ? Math.round((completedProblems / totalQuestions) * 100) : 0;

  // Color schemes for categories
  const colorSchemes = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-emerald-500',
  ];
  const colorIndex = Math.abs(category.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colorSchemes.length;
  const bgColor = colorSchemes[colorIndex];

  // Generate icon based on category name
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('array')) return '📊';
    if (lowerName.includes('string')) return '🔤';
    if (lowerName.includes('tree') || lowerName.includes('graph')) return '🌳';
    if (lowerName.includes('dynamic') || lowerName.includes('dp')) return '🧠';
    if (lowerName.includes('sort') || lowerName.includes('search')) return '🔍';
    if (lowerName.includes('math') || lowerName.includes('logic')) return '🧮';
    if (lowerName.includes('linked') || lowerName.includes('list')) return '🔗';
    if (lowerName.includes('stack') || lowerName.includes('queue')) return '📚';
    if (lowerName.includes('hash') || lowerName.includes('map')) return '🗺️';
    if (lowerName.includes('bit') || lowerName.includes('manipulation')) return '⚙️';
    return '📁';
  };

  const getDifficultyLabel = () => {
    const hasEasy = easy > 0;
    const hasMedium = medium > 0;
    const hasHard = hard > 0;
    
    if (hasEasy && hasMedium && hasHard) return 'Easy to Hard';
    if (hasEasy && hasMedium) return 'Easy to Medium';
    if (hasMedium && hasHard) return 'Medium to Hard';
    if (hasEasy) return 'Easy';
    if (hasMedium) return 'Medium';
    if (hasHard) return 'Hard';
    return 'Mixed';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Category Header */}
      <div className={`${bgColor} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-2 right-2 text-4xl opacity-20">
          {getIcon(category.name)}
        </div>
        <h3 className="text-xl font-bold mb-2">{category.name}</h3>
        <p className="text-sm opacity-90">
          Explore {totalQuestions} problem{totalQuestions !== 1 ? 's' : ''} in this category
        </p>
      </div>

      {/* Category Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalQuestions > 0 ? totalQuestions : '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedProblems}
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

        {/* Difficulty Breakdown */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            {totalQuestions === 0 ? (
              <span className="text-xs italic">Stats will load when you explore</span>
            ) : (
              <>
                {easy > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{easy}</span>
                  </span>
                )}
                {medium > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{medium}</span>
                  </span>
                )}
                {hard > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{hard}</span>
                  </span>
                )}
              </>
            )}
          </div>
          <span className="text-xs">
            {category.totalSolutions > 0 
              ? `${category.totalSolutions} solution${category.totalSolutions !== 1 ? 's' : ''}` 
              : '—'
            }
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${bgColor} transition-all duration-300`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getDifficultyLabel()}
            </span>
          </div>
          <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group-hover:translate-x-1 transition-all duration-200">
            <span className="text-sm">Explore</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Created info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>By {category.createdByName}</span>
            <span>{dateUtils.formatRelativeTime(category.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryStats {
  totalQuestions: number;
  totalSolved: number;
  categoriesMastered: number;
  overallProgress: number;
}

function CategoryStatsCard({ stats }: { stats: CategoryStats }) {
  return (
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
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalSolved}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Out of {stats.totalQuestions} problems
          </p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Categories Mastered
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.categoriesMastered}
          </p>
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
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.overallProgress}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Keep up the great work!
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoriesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Fetch stats for each category and combine with category data
  const categoriesWithStats: CategoryWithStats[] = categories.map(category => {
    // Use the actual category stats hook for each category
    const { data: categoryStats } = useCategoryStats(category.id);
    
    return {
      ...category,
      totalQuestions: categoryStats?.totalQuestions || 0,
      questionsByLevel: categoryStats?.questionsByLevel || { easy: 0, medium: 0, hard: 0 },
      totalSolutions: categoryStats?.totalSolutions || 0,
    };
  });

  // Filter categories based on search
  const filteredCategories = categoriesWithStats.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Calculate real aggregate stats from API data
  const totalQuestions = categoriesWithStats.reduce((sum, cat) => sum + cat.totalQuestions, 0);
  const stats: CategoryStats = {
    totalQuestions,
    totalSolved: 0, // TODO: Get from user progress API
    categoriesMastered: 0, // TODO: Calculate from user progress
    overallProgress: 0, // TODO: Calculate from user progress
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

        {/* Search and Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          {categories.length > 6 && (
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No categories found' : 'No categories available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Categories will appear here once they are created by administrators.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {filteredCategories.length > 0 && <CategoryStatsCard stats={stats} />}
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