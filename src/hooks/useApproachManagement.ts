// src/hooks/useApproachManagement.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approachService } from '@/lib/api/approachService';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'react-hot-toast';
import type { 
  CreateApproachRequest, 
  UpdateApproachRequest,
  ApproachLimitsResponse,
} from '@/types';

// ==================== QUERY HOOKS ====================

/**
 * Get approach by ID (only if user owns it)
 */
export const useApproachById = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.DETAIL(id),
    queryFn: async () => {
      const response = await approachService.getApproachById(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approach');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Get all approaches for a question by current user
 */
export const useApproachesByQuestion = (questionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(questionId),
    queryFn: async () => {
      const response = await approachService.getApproachesByQuestion(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approaches');
      }
      return response.data || [];
    },
    enabled: !!questionId,
  });
};

/**
 * Get all approaches by current user
 */
export const useMyApproaches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
    queryFn: async () => {
      const response = await approachService.getMyApproaches();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approaches');
      }
      return response.data || [];
    },
  });
};

/**
 * Get recent approaches by current user
 */
export const useMyRecentApproaches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
    queryFn: async () => {
      const response = await approachService.getMyRecentApproaches();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch recent approaches');
      }
      return response.data || [];
    },
  });
};

/**
 * Get approach statistics for current user
 */
export const useMyApproachStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
    queryFn: async () => {
      const response = await approachService.getMyApproachStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approach stats');
      }
      return response.data;
    },
  });
};

/**
 * Get size usage for current user on a specific question
 */
export const useQuestionSizeUsage = (questionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(questionId),
    queryFn: async () => {
      const response = await approachService.getQuestionSizeUsage(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch size usage');
      }
      return response.data;
    },
    enabled: !!questionId,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create new approach for a question
 */
export const useCreateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: CreateApproachRequest }) => {
      const response = await approachService.createApproach(questionId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create approach');
      }
      return response.data;
    },
    onSuccess: (result, { questionId }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach created successfully!');
        
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(questionId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(questionId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create approach');
    },
  });
};

/**
 * Update approach (only if user owns it)
 */
export const useUpdateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApproachRequest }) => {
      const response = await approachService.updateApproach(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update approach');
      }
      return response.data;
    },
    onSuccess: (result, { id }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach updated successfully!');
        
        const approach = result.data;
        
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.DETAIL(id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(approach.questionId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(approach.questionId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update approach');
    },
  });
};

/**
 * Delete approach (only if user owns it)
 */
export const useDeleteApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await approachService.deleteApproach(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete approach');
      }
      return response.data;
    },
    onSuccess: (result) => {
      if (result?.success) {
        toast.success(result.message || 'Approach deleted successfully!');
        
        // Invalidate all approach-related queries
        queryClient.invalidateQueries({
          queryKey: ['approaches'],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete approach');
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Check approach limits before creating/updating
 */
export const useCheckApproachLimits = () => {
  return useMutation({
    mutationFn: async ({
      questionId,
      textContent,
      codeContent,
      excludeApproachId,
    }: {
      questionId: string;
      textContent: string;
      codeContent?: string;
      excludeApproachId?: string;
    }) => {
      const response = await approachService.checkApproachLimits(
        questionId,
        textContent,
        codeContent,
        excludeApproachId
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to check limits');
      }
      return response.data;
    },
  });
};

/**
 * Real-time approach limits checker (for form validation)
 */
export const useApproachLimitsQuery = (
  questionId: string,
  textContent: string,
  codeContent?: string,
  excludeApproachId?: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.LIMITS(questionId),
    queryFn: async () => {
      if (!textContent.trim()) {
        // Return default limits if no content
        return {
          canAdd: true,
          canAddCount: true,
          canAddSize: true,
          currentCount: 0,
          maxCount: 3,
          remainingCount: 3,
          currentSize: 0,
          newSize: 0,
          totalSizeAfterUpdate: 0,
          maxAllowedSize: 15360, // 15KB
          remainingBytes: 15360,
        } as ApproachLimitsResponse;
      }

      const response = await approachService.checkApproachLimits(
        questionId,
        textContent,
        codeContent,
        excludeApproachId
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to check limits');
      }
      return response.data;
    },
    enabled: !!questionId && !!textContent.trim(),
    refetchInterval: false, // Don't auto-refetch
    staleTime: 0, // Always consider stale for real-time checking
  });
};