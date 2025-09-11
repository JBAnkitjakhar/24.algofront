// src/hooks/useOptimizedCategories.ts  

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
 * Eliminates N+1 queries completely
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
    // Uses global defaults: staleTime: 0, refetchOnMount: true
  });
}

/**
 * Create category with comprehensive cache invalidation
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
      // AGGRESSIVE CACHE INVALIDATION for real-time updates
      
      // Invalidate categories
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // Invalidate questions since they show category names
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      
      // Invalidate admin stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ADMIN.STATS 
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
      
      // Invalidate all category queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // CRITICAL: Invalidate questions since category name changed
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
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
      
      // Remove all category queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.LIST 
      });
      
      // Remove specific category
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.DETAIL(categoryId) 
      });
      
      // CRITICAL: Invalidate questions since category deleted
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });
      
      // Invalidate user progress
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress'
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