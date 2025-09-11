// src/hooks/useOptimizedCategories.ts - ENHANCED WITH SMART CACHING

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApiService } from '@/lib/api/categoryService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  CategoryWithProgress,
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  Category
} from '@/types';

/**
 * OPTIMIZED: Single hook for categories with embedded progress
 * Features:
 * - Fresh data on page refresh (staleTime: 0)
 * - Auto-refresh every 30 minutes
 * - Smart caching to avoid unnecessary API calls
 * - Immediate refetch on window focus
 */
export function useCategoriesWithProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS,
    queryFn: async (): Promise<CategoryWithProgress[]> => {
      const response = await categoryApiService.getCategoriesWithProgress();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories with progress');
    },
    enabled: !!user, // Only fetch when authenticated
    
    // SMART CACHING STRATEGY:
    // - staleTime: 0 = Always refetch on mount (page refresh gets fresh data)
    // - gcTime: 30min = Keep in cache for 30 minutes
    // - refetchInterval: 30min = Auto-refresh stale data
    // Uses global defaults from queryClient.ts
    
    // Additional optimizations for categories page
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    notifyOnChangeProps: ['data', 'isLoading', 'error'], // Only trigger re-renders for these changes
  });
}

/**
 * Create category with comprehensive cache invalidation for real-time updates
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateCategoryRequest): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create categories');
      }

      const response = await categoryApiService.createCategory(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create category');
    },
    onSuccess: () => {
      // AGGRESSIVE CACHE INVALIDATION for real-time updates across all components
      
      // 1. Invalidate categories (forces refresh on categories page)
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // 2. Invalidate questions since they show category names in dropdowns
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 3. Invalidate admin stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ADMIN.STATS 
      });
      
      // 4. Force immediate refetch for active pages
      queryClient.refetchQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS,
        type: 'active' // Only refetch if query is currently active
      });
      
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

/**
 * Update category with comprehensive cache invalidation
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateCategoryRequest }): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update categories');
      }

      const response = await categoryApiService.updateCategory(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update category');
    },
    onSuccess: (updatedCategory) => {
      // AGGRESSIVE CACHE INVALIDATION
      
      // 1. Invalidate all category queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // 2. CRITICAL: Invalidate questions since category name changed
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 3. Force immediate refetch for real-time updates
      queryClient.refetchQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS,
        type: 'active'
      });
      
      toast.success(`Category "${updatedCategory.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
}

/**
 * Delete category with comprehensive cache invalidation
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; deletedQuestions: number }> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete categories');
      }

      const response = await categoryApiService.deleteCategory(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete category');
    },
    onSuccess: (result, categoryId) => {
      // AGGRESSIVE CACHE INVALIDATION
      
      // 1. Remove all category queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // 2. Remove specific category from cache completely
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.DETAIL(categoryId) 
      });
      
      // 3. CRITICAL: Invalidate questions since category deleted
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'questions' && query.queryKey.includes('summary')
      });
      
      // 4. Invalidate user progress since questions were deleted
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress'
      });
      
      // 5. Force immediate refetch for real-time updates
      queryClient.refetchQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS,
        type: 'active'
      });
      
      toast.success(
        result.deletedQuestions > 0
          ? `Category deleted successfully. ${result.deletedQuestions} questions were also removed.`
          : 'Category deleted successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
}