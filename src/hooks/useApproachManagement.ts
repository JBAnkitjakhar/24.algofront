// src/hooks/useApproachManagement.ts - FINAL CORRECTED VERSION

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approachService } from '@/lib/api/approachService';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'react-hot-toast';
import type { 
  CreateApproachRequest, 
  UpdateApproachRequest,
  ApproachLimitsResponse,
  ApproachDTO,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get size usage for current user on a specific question
 * FIXED: Critical for showing correct remaining space
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
    // FIXED: Very fresh data for accurate size display
    staleTime: 10 * 1000, // 10 seconds only
    gcTime: 60 * 1000, // 1 minute (short cache)
    refetchOnWindowFocus: true, // Refetch when user comes back
    refetchOnMount: true, // Always fresh on mount
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create new approach for a question
 * FIXED: Handle your service's nested response structure
 */
export const useCreateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: CreateApproachRequest }) => {
      const response = await approachService.createApproach(questionId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create approach');
      }
      return response.data; // This contains { success, data, message }
    },
    onSuccess: async (result, { questionId }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach created successfully!');
        
        // FIXED: Sequential cache invalidation for better reliability
        
        // 1. Invalidate approaches for this question
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(questionId),
        });
        
        // 2. CRITICAL: Invalidate size usage with immediate refetch
        queryClient.removeQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(questionId),
        });
        await queryClient.refetchQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(questionId),
        });
        
        // 3. Invalidate user's approach data
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
        });
        
        // 4. Invalidate and clear limits cache
        queryClient.removeQueries({
          queryKey: QUERY_KEYS.APPROACHES.LIMITS(questionId),
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
 * FIXED: Handle your service's nested response structure
 */
export const useUpdateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApproachRequest }) => {
      const response = await approachService.updateApproach(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update approach');
      }
      return response.data; // This contains { success, data, message }
    },
    onSuccess: async (result, { id }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach updated successfully!');
        
        const approach = result.data;
        
        // FIXED: Sequential invalidation
        
        // 1. Invalidate specific approach
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.DETAIL(id),
        });
        
        // 2. Invalidate approaches for this question
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(approach.questionId),
        });
        
        // 3. Force fresh size usage data
        queryClient.removeQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(approach.questionId),
        });
        await queryClient.refetchQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(approach.questionId),
        });
        
        // 4. Invalidate user data
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        
        // 5. Clear limits cache
        queryClient.removeQueries({
          queryKey: QUERY_KEYS.APPROACHES.LIMITS(approach.questionId),
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
 * FIXED: Better cache invalidation with questionId context and proper typing
 */
export const useDeleteApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, questionId }: { id: string; questionId: string }) => {
      const response = await approachService.deleteApproach(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete approach');
      }
      return { ...response.data, deletedId: id, questionId };
    },
    onSuccess: async (result) => {
      if (result?.success && result.questionId) {
        toast.success(result.message || 'Approach deleted successfully!');
        
        // FIXED: Specific cache invalidation with questionId and proper typing
        
        // 1. Immediately update approaches cache with proper typing
        queryClient.setQueryData(
          QUERY_KEYS.APPROACHES.BY_QUESTION(result.questionId),
          (oldApproaches: ApproachDTO[] | undefined) => {
            return oldApproaches?.filter(approach => approach.id !== result.deletedId) || [];
          }
        );
        
        // 2. Force fresh size usage data
        queryClient.removeQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(result.questionId),
        });
        await queryClient.refetchQueries({
          queryKey: QUERY_KEYS.APPROACHES.SIZE_USAGE(result.questionId),
        });
        
        // 3. Invalidate other related data
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
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
 * FIXED: Use POST method to match your service
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
 * FIXED: Proper dependency handling to avoid ESLint warnings
 */
export const useApproachLimitsQuery = (
  questionId: string,
  textContent: string,
  codeContent?: string,
  excludeApproachId?: string
) => {
  const [limitsData, setLimitsData] = React.useState<ApproachLimitsResponse>({
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
  });

  const checkLimitsMutation = useCheckApproachLimits();

  // FIXED: Use useRef to store the latest mutation function
  const mutationRef = React.useRef(checkLimitsMutation.mutate);
  mutationRef.current = checkLimitsMutation.mutate;

  // Debounced effect to avoid too many API calls
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (questionId && textContent.trim() && textContent.trim().length >= 10) {
        // Use the ref to access the latest mutation function
        mutationRef.current({
          questionId,
          textContent,
          codeContent,
          excludeApproachId,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [questionId, textContent, codeContent, excludeApproachId]); // No mutation dependency needed

  // Update limits data when mutation succeeds
  React.useEffect(() => {
    if (checkLimitsMutation.data) {
      setLimitsData(checkLimitsMutation.data);
    }
  }, [checkLimitsMutation.data]);

  // Return a query-like interface
  return {
    data: limitsData,
    isLoading: checkLimitsMutation.isPending,
    error: checkLimitsMutation.error,
  };
};