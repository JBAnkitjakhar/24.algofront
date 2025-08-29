// src/hooks/useCategoryManagement.ts - Category management hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApiService } from '@/lib/api/categoryService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  Category, 
  CategoryStats, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@/types';

/**
 * Hook to get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.LIST,
    queryFn: async (): Promise<Category[]> => {
      const response = await categoryApiService.getAllCategories();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  });
}

/**
 * Hook to get category by ID
 */
export function useCategoryById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.DETAIL(id),
    queryFn: async (): Promise<Category> => {
      const response = await categoryApiService.getCategoryById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get category statistics
 */
export function useCategoryStats(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.STATS(id),
    queryFn: async (): Promise<CategoryStats> => {
      const response = await categoryApiService.getCategoryStats(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category stats');
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to create category (Admin/SuperAdmin only)
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateCategoryRequest): Promise<Category> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create categories');
      }

      if (!request.name.trim()) {
        throw new Error('Category name is required');
      }

      if (request.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters long');
      }

      if (request.name.trim().length > 50) {
        throw new Error('Category name must be less than 50 characters');
      }

      const response = await categoryApiService.createCategory(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create category');
    },
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      toast.success(`Category "${newCategory.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

/**
 * Hook to update category (Admin/SuperAdmin only)
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateCategoryRequest }): Promise<Category> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update categories');
      }

      if (!request.name.trim()) {
        throw new Error('Category name is required');
      }

      if (request.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters long');
      }

      if (request.name.trim().length > 50) {
        throw new Error('Category name must be less than 50 characters');
      }

      const response = await categoryApiService.updateCategory(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update category');
    },
    onSuccess: (updatedCategory, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(variables.id) });
      
      toast.success(`Category "${updatedCategory.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
}

/**
 * Hook to delete category (Admin/SuperAdmin only)
 * WARNING: This will also delete all questions in the category!
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; deletedQuestions: number }> => {
      // Frontend validation
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
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.DETAIL(categoryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(categoryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });

      // Success message with warning about deleted questions
      if (result.deletedQuestions > 0) {
        toast.success(
          `Category deleted successfully. ${result.deletedQuestions} questions were also removed.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Category deleted successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
}