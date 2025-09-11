// src/hooks/useOptimizedQuestions.ts - ENHANCED WITH SMART CACHING

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApiService } from '@/lib/api/questionService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  QuestionSummaryPageResponse,
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  Question
} from '@/types';

/**
 * OPTIMIZED: Single hook for questions with embedded user progress
 * Features:
 * - Fresh data on page refresh (staleTime: 0)
 * - Auto-refresh every 30 minutes
 * - Smart caching to avoid unnecessary API calls
 * - Immediate refetch on window focus
 */
export function useQuestionSummaries(params?: {
  page?: number;
  size?: number;
  categoryId?: string;
  level?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.QUESTIONS.LIST, 'summary', params],
    queryFn: async (): Promise<QuestionSummaryPageResponse> => {
      return await questionApiService.getQuestionSummaries(params);
    },
    enabled: !!user, // Only fetch when authenticated
    
    // SMART CACHING STRATEGY:
    // - staleTime: 0 = Always refetch on mount (page refresh gets fresh data)
    // - gcTime: 30min = Keep in cache for 30 minutes
    // - refetchInterval: 30min = Auto-refresh stale data
    // Uses global defaults from queryClient.ts
    
    // Additional optimizations for questions page
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    notifyOnChangeProps: ['data', 'isLoading', 'error'], // Only trigger re-renders for these changes
  });
}

/**
 * Create question with comprehensive cache invalidation for real-time updates
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateQuestionRequest): Promise<Question> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create questions');
      }

      const response = await questionApiService.createQuestion(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create question');
    },
    onSuccess: () => {
      // AGGRESSIVE CACHE INVALIDATION for real-time updates
      
      // 1. Invalidate ALL question-related queries (forces refresh on questions page)
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 2. Invalidate categories since question count changed
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      
      // 3. Invalidate admin stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ADMIN.STATS 
      });
      
      // 4. Force immediate refetch for active pages
      queryClient.refetchQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && 
          query.queryKey.includes('summary') &&
          query.state.status === 'success', // Only refetch successful queries
        type: 'active' // Only refetch if query is currently active
      });
      
      toast.success('Question created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

/**
 * Update question with comprehensive cache invalidation
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateQuestionRequest }): Promise<Question> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update questions');
      }

      const response = await questionApiService.updateQuestion(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question');
    },
    onSuccess: (updatedQuestion, variables) => {
      // AGGRESSIVE CACHE INVALIDATION
      
      // 1. Invalidate ALL question queries for real-time updates
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 2. Invalidate specific question detail
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(variables.id) 
      });
      
      // 3. Invalidate categories (category name might have changed)
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      
      // 4. Force immediate refetch for real-time updates
      queryClient.refetchQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && 
          query.queryKey.includes('summary') &&
          query.state.status === 'success',
        type: 'active'
      });
      
      toast.success(`Question "${updatedQuestion.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

/**
 * Delete question with comprehensive cache invalidation
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete questions');
      }

      const response = await questionApiService.deleteQuestion(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete question');
    },
    onSuccess: (result, questionId) => {
      // AGGRESSIVE CACHE INVALIDATION
      
      // 1. Remove from all question queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 2. Remove specific question from cache completely
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) 
      });
      
      // 3. Update categories since question count decreased
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      
      // 4. Invalidate user progress since question no longer exists
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress'
      });
      
      // 5. Force immediate refetch for real-time updates
      queryClient.refetchQueries({
        predicate: (query) => 
          (query.queryKey[0] === 'questions' && query.queryKey.includes('summary')) ||
          (query.queryKey[0] === 'categories' && query.queryKey.includes('with-progress')) &&
          query.state.status === 'success',
        type: 'active'
      });
      
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}