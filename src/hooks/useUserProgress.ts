// src/hooks/useUserProgress.ts - User progress management hooks (FIXED - No any types)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProgressApiService } from '@/lib/api/userProgressService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  UserProgressDTO,
  UserProgressStats,
  CategoryProgressStats
} from '@/types';

/**
 * Hook to get current user's progress statistics
 */
export function useCurrentUserProgressStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_STATS,
    queryFn: async (): Promise<UserProgressStats> => {
      const response = await userProgressApiService.getCurrentUserProgressStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch progress stats');
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get current user's recent progress
 */
export function useCurrentUserRecentProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_RECENT,
    queryFn: async (): Promise<UserProgressDTO[]> => {
      const response = await userProgressApiService.getCurrentUserRecentProgress();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch recent progress');
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get progress for specific question
 */
export function useQuestionProgress(questionId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.QUESTION_PROGRESS(questionId),
    queryFn: async (): Promise<UserProgressDTO | null> => {
      try {
        const response = await userProgressApiService.getQuestionProgress(questionId);
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        // Handle 404 gracefully - it means no progress record exists yet
        const errorMessage = error instanceof Error ? error.message : String(error);
        const axiosError = error as { response?: { status?: number } };
        
        if (axiosError.response?.status === 404 || errorMessage.includes('404')) {
          return null;
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: !!user && !!questionId,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (question not solved yet)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const axiosError = error as { response?: { status?: number } };
      
      if (axiosError.response?.status === 404 || errorMessage.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get category progress for current user
 */
export function useCategoryProgress(categoryId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CATEGORY_PROGRESS(categoryId),
    queryFn: async (): Promise<CategoryProgressStats> => {
      const response = await userProgressApiService.getCategoryProgress(categoryId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category progress');
    },
    enabled: !!user && !!categoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to update question progress (mark as solved/unsolved)
 */
export function useUpdateQuestionProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      solved 
    }: { 
      questionId: string; 
      solved: boolean; 
    }): Promise<UserProgressDTO> => {
      if (!user) {
        throw new Error('User must be authenticated to update progress');
      }

      const response = await userProgressApiService.updateQuestionProgress(questionId, solved);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question progress');
    },
    onSuccess: (updatedProgress, variables) => {
      const { questionId, solved } = variables;

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.USER_PROGRESS.QUESTION_PROGRESS(questionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_STATS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_RECENT 
      });
      
      // Invalidate question detail to update solved status
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) 
      });

      // Invalidate category progress if we have category info
      if (updatedProgress.questionId) {
        // We might need to get the category ID - for now invalidate all category progress
        queryClient.invalidateQueries({ 
          predicate: (query) => 
            query.queryKey[0] === 'userProgress' && 
            query.queryKey[1] === 'category'
        });
      }

      // Show success toast
      const action = solved ? 'marked as solved' : 'marked as unsolved';
      toast.success(`Question ${action} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update progress: ${error.message}`);
    },
  });
}

/**
 * Hook to check if a question is solved by current user
 * This is a derived hook that uses question progress
 */
export function useIsQuestionSolved(questionId: string) {
  const { data: questionProgress, isLoading } = useQuestionProgress(questionId);
  
  return {
    isSolved: questionProgress?.solved || false,
    solvedAt: questionProgress?.solvedAt,
    isLoading,
  };
}

/**
 * Hook to get multiple questions progress (for lists)
 * This fetches progress for multiple questions in parallel
 */
export function useMultipleQuestionProgress(questionIds: string[]) {
  const { user } = useAuth();

  const queries = useQuery({
    queryKey: ['userProgress', 'multiple', questionIds.sort()],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!user || questionIds.length === 0) {
        return {};
      }

      // Fetch progress for all questions in parallel
      const progressPromises = questionIds.map(async (questionId) => {
        try {
          const response = await userProgressApiService.getQuestionProgress(questionId);
          return {
            questionId,
            solved: response.success && response.data ? response.data.solved : false,
          };
        } catch (error) {
          // Handle 404s gracefully - means no progress record exists yet
          const errorMessage = error instanceof Error ? error.message : String(error);
          const axiosError = error as { response?: { status?: number } };
          
          if (axiosError.response?.status === 404 || errorMessage.includes('404')) {
            return { questionId, solved: false };
          }
          
          // For other errors, assume not solved to avoid breaking UI
          console.warn(`Failed to fetch progress for question ${questionId}:`, errorMessage);
          return { questionId, solved: false };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      
      // Convert to Record<questionId, isSolved>
      return progressResults.reduce((acc, { questionId, solved }) => {
        acc[questionId] = solved;
        return acc;
      }, {} as Record<string, boolean>);
    },
    enabled: !!user && questionIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false, // Don't retry since we handle errors gracefully
  });

  return queries;
}

// ADMIN HOOKS (for future use)

/**
 * Hook to get progress stats for any user (Admin only)
 */
export function useUserProgressStats(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.USER_STATS(userId),
    queryFn: async (): Promise<UserProgressStats> => {
      const response = await userProgressApiService.getUserProgressStats(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user progress stats');
    },
    enabled: isAdmin() && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all progress for any user (Admin only)
 */
export function useAllUserProgress(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.USER_ALL(userId),
    queryFn: async (): Promise<UserProgressDTO[]> => {
      const response = await userProgressApiService.getAllUserProgress(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch all user progress');
    },
    enabled: isAdmin() && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}