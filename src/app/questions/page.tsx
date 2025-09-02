// src/app/questions/page.tsx

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { BookOpen, Search, Filter, Clock, Star, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

function QuestionsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Placeholder data for questions
  const questions = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      solved: true,
      attempts: 3,
      timeSpent: '45 min',
      tags: ['Array', 'Hash Table'],
      acceptance: 85,
    },
    {
      id: 2,
      title: 'Add Two Numbers',
      difficulty: 'Medium',
      category: 'Linked List',
      description: 'You are given two non-empty linked lists representing two non-negative integers.',
      solved: true,
      attempts: 2,
      timeSpent: '1h 20min',
      tags: ['Linked List', 'Math', 'Recursion'],
      acceptance: 67,
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      category: 'String',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      solved: false,
      attempts: 1,
      timeSpent: '30 min',
      tags: ['Hash Table', 'String', 'Sliding Window'],
      acceptance: 73,
    },
    {
      id: 4,
      title: 'Median of Two Sorted Arrays',
      difficulty: 'Hard',
      category: 'Array',
      description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median.',
      solved: false,
      attempts: 0,
      timeSpent: '0 min',
      tags: ['Array', 'Binary Search', 'Divide and Conquer'],
      acceptance: 45,
    },
    {
      id: 5,
      title: 'Longest Palindromic Substring',
      difficulty: 'Medium',
      category: 'String',
      description: 'Given a string s, return the longest palindromic substring in s.',
      solved: true,
      attempts: 4,
      timeSpent: '2h 15min',
      tags: ['String', 'Dynamic Programming'],
      acceptance: 52,
    },
    {
      id: 6,
      title: 'ZigZag Conversion',
      difficulty: 'Medium',
      category: 'String',
      description: 'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows.',
      solved: false,
      attempts: 2,
      timeSpent: '1h 5min',
      tags: ['String'],
      acceptance: 69,
    },
  ];

  const categories = ['Array', 'String', 'Linked List', 'Tree', 'Dynamic Programming', 'Graph'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statuses = ['Solved', 'Attempted', 'Not Started'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'Hard':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAcceptanceColor = (acceptance: number) => {
    if (acceptance >= 70) return 'text-green-600 dark:text-green-400';
    if (acceptance >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'Solved' && question.solved) ||
                         (selectedStatus === 'Attempted' && !question.solved && question.attempts > 0) ||
                         (selectedStatus === 'Not Started' && question.attempts === 0);

    return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
  });

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
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
              <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Solved: {questions.filter(q => q.solved).length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className="w-4 h-4 text-gray-400" />
                  <span>Remaining: {questions.filter(q => !q.solved).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {question.solved ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : question.attempts > 0 ? (
                        <Circle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {question.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {question.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Filter className="w-4 h-4" />
                        <span>{question.category}</span>
                      </div>
                      {question.attempts > 0 && (
                        <>
                          <div className="flex items-center space-x-1">
                            <span>Attempts: {question.attempts}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{question.timeSpent}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span className={getAcceptanceColor(question.acceptance)}>
                          {question.acceptance}% acceptance
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                      {question.solved ? 'Review' : question.attempts > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
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