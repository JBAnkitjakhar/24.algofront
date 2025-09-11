// src/hooks/useOptimizedQuestions.ts 

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
 * Eliminates N+1 queries completely
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
    // Uses global defaults: staleTime: 0, refetchOnMount: true
  });
}

/**
 * Create question with comprehensive cache invalidation
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
      
      // Invalidate ALL question-related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      
      // Invalidate categories since question count changed
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      
      // Invalidate admin stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ADMIN.STATS 
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
      
      // Invalidate ALL question queries for real-time updates
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      
      // Invalidate specific question detail
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(variables.id) 
      });
      
      // Invalidate categories (category name might have changed)
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
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
      
      // Remove from all question queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      
      // Remove specific question
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) 
      });
      
      // Update categories since question count decreased
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      
      // Invalidate user progress since question no longer exists
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress'
      });
      
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}
