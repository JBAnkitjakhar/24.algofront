// src/app/questions/page.tsx

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { BookOpen, Search, Filter, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestionManagement';
import { useCategories } from '@/hooks/useCategoryManagement';
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { QuestionLevel } from '@/types';

function QuestionsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // API calls
  const { data: categories = [] } = useCategories();
  
  const questionParams = useMemo(() => ({
    page,
    size: pageSize,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    level: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
    search: searchTerm.trim() || undefined,
    // ADD SORTING: Sort by creation date ascending (oldest first)
    sort: 'createdAt',
    direction: 'asc'
  }), [page, selectedCategory, selectedDifficulty, searchTerm]);

  const { 
    data: questionsData, 
    isLoading: questionsLoading,
    error: questionsError 
  } = useQuestions(questionParams);

  // Rest of the component stays exactly the same...
  const questions = questionsData?.content || [];
  const totalPages = questionsData?.totalPages || 0;
  const totalElements = questionsData?.totalElements || 0;

  const statuses = ['Solved', 'Attempted', 'Not Started'];

  const getDifficultyColor = (difficulty: QuestionLevel) => {
    return QUESTION_LEVEL_COLORS[difficulty];
  };

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(0); // Reset to first page
  };

  // Mock function for solved status - replace with real user progress data
  const getQuestionStatus = (questionId: string) => {
    // Mock some solved/attempted status based on question ID
    const hash = questionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    if (hash % 4 === 0) return { solved: true, attempted: false };
    if (hash % 3 === 0) return { solved: false, attempted: true };
    return { solved: false, attempted: false };
  };

  // Filter questions by status (client-side filtering for mock data)
  const filteredQuestions = questions.filter((question) => {
    if (selectedStatus === 'all') return true;
    
    const status = getQuestionStatus(question.id);
    if (selectedStatus === 'Solved') return status.solved;
    if (selectedStatus === 'Attempted') return status.attempted && !status.solved;
    if (selectedStatus === 'Not Started') return !status.solved && !status.attempted;
    
    return true;
  });

  if (questionsLoading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Questions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load questions. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Practice Questions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Challenge yourself with coding problems ranging from easy to hard. Track your progress
                and improve your problem-solving skills.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {filteredQuestions.length} of {totalElements} questions</span>
              <span className="text-xs italic">Sorted by creation date (oldest first)</span>
            </div>
          </div>

          {/* Questions List - SIMPLIFIED */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const levelColors = getDifficultyColor(question.level);
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionClick(question.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* SIMPLIFIED: Just title and difficulty badge */}
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {question.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                            {QUESTION_LEVEL_LABELS[question.level]}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {question.statement.length > 150 
                            ? question.statement.substring(0, 150).trim() + '...'
                            : question.statement}
                        </p>

                        {/* SIMPLIFIED: Only category and creation date */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Filter className="w-4 h-4" />
                            <span>{question.categoryName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Created {dateUtils.formatRelativeTime(question.createdAt)}</span>
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
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of{' '}
                {totalElements} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || questionsLoading}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || questionsLoading}
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

export default function QuestionsPage() {
  return (
    <ProtectedRoute>
      <QuestionsContent />
    </ProtectedRoute>
  );
}