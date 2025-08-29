// src/lib/api/categoryService.ts - Category management API service

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { 
  Category, 
  CategoryStats, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  DeleteCategoryResponse 
} from '@/types';
import { CATEGORY_ENDPOINTS } from '@/constants';

class CategoryApiService {
  /**
   * Get all categories
   * Matches: GET /api/categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.LIST);
  }

  /**
   * Get category by ID
   * Matches: GET /api/categories/{id}
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return await apiClient.get<Category>(CATEGORY_ENDPOINTS.GET_BY_ID(id));
  }

  /**
   * Create new category (Admin/SuperAdmin only)
   * Matches: POST /api/categories with { "name": "string" }
   */
  async createCategory(request: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return await apiClient.post<Category>(CATEGORY_ENDPOINTS.CREATE, {
      name: request.name.trim()
    });
  }

  /**
   * Update category (Admin/SuperAdmin only)
   * Matches: PUT /api/categories/{id} with { "name": "string" }
   */
  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return await apiClient.put<Category>(CATEGORY_ENDPOINTS.UPDATE(id), {
      name: request.name.trim()
    });
  }

  /**
   * Delete category (Admin/SuperAdmin only)
   * Matches: DELETE /api/categories/{id}
   * WARNING: This will also delete all questions in the category!
   */
  async deleteCategory(id: string): Promise<ApiResponse<DeleteCategoryResponse>> {
    return await apiClient.delete<DeleteCategoryResponse>(CATEGORY_ENDPOINTS.DELETE(id));
  }

  /**
   * Get category statistics
   * Matches: GET /api/categories/{id}/stats
   */
  async getCategoryStats(id: string): Promise<ApiResponse<CategoryStats>> {
    return await apiClient.get<CategoryStats>(CATEGORY_ENDPOINTS.GET_STATS(id));
  }
}

export const categoryApiService = new CategoryApiService();