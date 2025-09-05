// src/app/questions/[id]/page.tsx  

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle,
  ArrowLeft,
  ChevronRight,
  Play,
  Lightbulb,
  FileText,
  ExternalLink,
  FolderOpen,
  Check,
  X,
} from 'lucide-react';
import { useQuestionById } from '@/hooks/useQuestionManagement';
import { useCategoryById } from '@/hooks/useCategoryManagement';
import { useQuestionProgress, useUpdateQuestionProgress } from '@/hooks/useUserProgress';
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import Image from 'next/image';

function QuestionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'submissions'>('description');

  // API calls
  const { data: questionDetail, isLoading: questionLoading } = useQuestionById(questionId);
  const question = questionDetail?.question;
  const solutions = questionDetail?.solutions || [];

  const { data: category } = useCategoryById(question?.categoryId || '');

  // REAL DATA: Get user's progress for this question
  const { data: questionProgress } = useQuestionProgress(questionId);
  const solved = questionProgress?.solved || false;
  const solvedAt = questionProgress?.solvedAt;

  // Mutation for updating progress
  const updateProgressMutation = useUpdateQuestionProgress();

  const handleToggleSolved = () => {
    if (updateProgressMutation.isPending) return;
    
    updateProgressMutation.mutate({
      questionId,
      solved: !solved
    });
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Question Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The question youre looking for doesnt exist.
          </p>
          <button
            onClick={() => router.push('/questions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  const levelColors = QUESTION_LEVEL_COLORS[question.level];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <button
                onClick={() => router.push('/questions')}
                className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Questions
              </button>
              {category && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => router.push(`/categories/${category.id}`)}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {category.name}
                  </button>
                </>
              )}
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium truncate">
                {question.title}
              </span>
            </div>

            {/* Question Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  {solved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {question.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                    {QUESTION_LEVEL_LABELS[question.level]}
                  </span>
                  
                  {category && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <FolderOpen className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 ml-4">
                {/* Solved Date Info */}
                {solved && solvedAt && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Solved on {dateUtils.formatDate(solvedAt)}</span>
                  </div>
                )}
                
                {/* Mark Solved/Unsolved Button */}
                <button
                  onClick={handleToggleSolved}
                  disabled={updateProgressMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    solved
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } ${
                    updateProgressMutation.isPending 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {updateProgressMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : solved ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {updateProgressMutation.isPending 
                      ? 'Updating...' 
                      : solved 
                        ? 'Mark Unsolved' 
                        : 'Mark Solved'
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'description', label: 'Description', icon: FileText },
                  { id: 'solutions', label: `Solutions (${solutions.length})`, icon: Lightbulb },
                  { id: 'submissions', label: 'My Submissions', icon: Play },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'description' | 'solutions' | 'submissions')}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Problem Description
                </h2>
                
                {/* Problem Statement */}
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {question.statement}
                  </div>
                </div>

                {/* Images */}
                {question.imageUrls && question.imageUrls.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Examples
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {question.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={imageUrl}
                            alt={`Example ${index + 1}`}
                            width={800}
                            height={400}
                            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                            style={{ width: 'auto', height: 'auto' }}
                            priority={index === 0} // Prioritize first image
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Snippets */}
                {question.codeSnippets && question.codeSnippets.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Code Templates
                    </h3>
                    <div className="space-y-4">
                      {question.codeSnippets.map((snippet, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {snippet.language}
                            </span>
                            {snippet.description && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {snippet.description}
                              </span>
                            )}
                          </div>
                          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto">
                            <code>{snippet.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solutions' && (
              <div className="space-y-6">
                {solutions.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Solutions Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Solutions will be available after you solve this problem.
                    </p>
                  </div>
                ) : (
                  solutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Official Solution
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            By {solution.createdByName} • {dateUtils.formatRelativeTime(solution.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {solution.content}
                        </div>
                      </div>

                      {/* Solution Links */}
                      <div className="flex items-center space-x-4 mt-4">
                        {solution.youtubeLink && (
                          <a
                            href={solution.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Play className="w-4 h-4" />
                            <span>Video Solution</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {solution.driveLink && (
                          <a
                            href={solution.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Notes</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Submissions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start solving this problem to see your submission history.
                </p>
                <button
                  onClick={() => router.push('/compiler')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Solving
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function QuestionDetailPage() {
  return (
    <ProtectedRoute>
      <QuestionDetailContent />
    </ProtectedRoute>
  );
}