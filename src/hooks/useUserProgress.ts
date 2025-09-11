// src/hooks/useUserProgress.ts  

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
 * This is the main hook for the /me page
 */
export function useCurrentUserProgressStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_STATS,
    queryFn: async (): Promise<UserProgressStats> => {
      return await userProgressApiService.getCurrentUserProgressStats();
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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
      return await userProgressApiService.getCurrentUserRecentProgress();
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
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
      return await userProgressApiService.getQuestionProgress(questionId);
    },
    enabled: !!user && !!questionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry - 404s are expected for questions without progress
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
      return await userProgressApiService.getCategoryProgress(categoryId);
    },
    enabled: !!user && !!categoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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

      return await userProgressApiService.updateQuestionProgress(questionId, solved);
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

      // Invalidate category progress queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress' && 
          query.queryKey[1] === 'category'
      });

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
 * Hook to get multiple questions progress using the bulk endpoint
 * This is more efficient than making individual requests
 */
export function useMultipleQuestionProgress(questionIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userProgress', 'bulk', questionIds.sort()],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!user || questionIds.length === 0) {
        return {};
      }

      return await userProgressApiService.getBulkQuestionProgress(questionIds);
    },
    enabled: !!user && questionIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: false, // Don't retry since the bulk endpoint handles errors gracefully
  });
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
      return await userProgressApiService.getUserProgressStats(userId);
    },
    enabled: isAdmin() && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
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
      return await userProgressApiService.getAllUserProgress(userId);
    },
    enabled: isAdmin() && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}