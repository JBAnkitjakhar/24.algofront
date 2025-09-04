// src/app/categories/[id]/page.tsx - COMPLETE with real user progress data

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { 
  FolderOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  Circle,
  BookOpen,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useCategoryById, useCategoryStats } from '@/hooks/useCategoryManagement';
import { useCategoryProgress, useMultipleQuestionProgress } from '@/hooks/useUserProgress';
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { QuestionLevel } from '@/types';
import { useQuestions } from '@/hooks/useQuestionManagement';

function CategoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [searchInput, setSearchInput] = useState(''); // For immediate UI updates
  const [searchTerm, setSearchTerm] = useState(''); // For API calls with debounce
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(0); // Reset to first page when search changes
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // API calls
  const { data: category, isLoading: categoryLoading } = useCategoryById(categoryId);
  const { data: categoryStats } = useCategoryStats(categoryId);
  
  // REAL DATA: Get user's actual progress for this category
  const { data: userCategoryProgress } = useCategoryProgress(categoryId);
  
  const questionParams = useMemo(() => ({
    page,
    size: pageSize,
    categoryId, // Pass categoryId to filter by this category
    level: selectedLevel === 'all' ? undefined : selectedLevel,
    // Updated to only search in title, not description/statement
    search: searchTerm.trim() || undefined,
  }), [page, selectedLevel, searchTerm, categoryId]);

  const { 
    data: questionsData, 
    isLoading: questionsLoading 
  } = useQuestions(questionParams);

  const questions = questionsData?.content || [];
  const totalPages = questionsData?.totalPages || 0;

  // REAL DATA: Get solved status for all questions in this page
  const questionIds = questions.map(q => q.id);
  const { data: questionsProgress } = useMultipleQuestionProgress(questionIds);

  const getDifficultyColor = (difficulty: QuestionLevel) => {
    return QUESTION_LEVEL_COLORS[difficulty];
  };

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`);
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Category Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The category youre looking for doesnt exist.
          </p>
          <button
            onClick={() => router.push('/categories')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = categoryStats?.totalQuestions || 0;
  const questionsByLevel = categoryStats?.questionsByLevel || { easy: 0, medium: 0, hard: 0 };
  
  // REAL DATA: Use actual user progress instead of mock data
  const solvedQuestions = userCategoryProgress?.solvedInCategory || 0;
  const progressPercentage = userCategoryProgress?.categoryProgressPercentage || 0;
  const solvedByLevel = userCategoryProgress?.solvedByLevel || { easy: 0, medium: 0, hard: 0 };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <button
                onClick={() => router.push('/categories')}
                className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Categories
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Master {category.name.toLowerCase()} problems step by step
              </p>

              {/* REAL DATA: Updated Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Problems</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {solvedQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Solved</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* REAL DATA: Difficulty Breakdown with solved counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {questionsByLevel.easy}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {solvedByLevel.easy}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Perfect for getting started
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medium</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {questionsByLevel.medium}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {solvedByLevel.medium}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intermediate challenges
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hard</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {questionsByLevel.hard}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {solvedByLevel.hard}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced problem solving
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Updated Search with debounce */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          {questionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedLevel !== 'all' 
                  ? 'Try adjusting your search criteria or filters.' 
                  : 'No questions available in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const levelColors = getDifficultyColor(question.level);
                // REAL DATA: Get solved status from API response
                const isSolved = questionsProgress?.[question.id] || false;
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionClick(question.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Status Icon - REAL DATA */}
                        <div className="flex-shrink-0 pt-1">
                          {isSolved ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        {/* Question Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {page * pageSize + index + 1}. {question.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                              {QUESTION_LEVEL_LABELS[question.level]}
                            </span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {question.statement.length > 150 
                              ? question.statement.substring(0, 150) + '...' 
                              : question.statement}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Created {dateUtils.formatRelativeTime(question.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, questionsData?.totalElements || 0)} of{' '}
                {questionsData?.totalElements || 0} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default function CategoryDetailPage() {
  return (
    <ProtectedRoute>
      <CategoryDetailContent />
    </ProtectedRoute>
  );
}