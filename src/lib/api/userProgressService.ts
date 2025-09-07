// src/lib/api/userProgressService.ts  

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { 
  UserProgressDTO,
  UserProgressStats,
  CategoryProgressStats,
  GlobalProgressStats
} from '@/types';

class UserProgressApiService {
  /**
   * Get current user's progress statistics
   * Matches: GET /api/users/progress
   */
  async getCurrentUserProgressStats(): Promise<ApiResponse<UserProgressStats>> {
    return await apiClient.get<UserProgressStats>('/users/progress');
  }

  /**
   * Get current user's recent progress (last 10 solved questions)
   * Matches: GET /api/users/progress/recent
   */
  async getCurrentUserRecentProgress(): Promise<ApiResponse<UserProgressDTO[]>> {
    return await apiClient.get<UserProgressDTO[]>('/users/progress/recent');
  }

  /**
   * Get progress for specific question and current user
   * Matches: GET /api/questions/{questionId}/progress
   */
  async getQuestionProgress(questionId: string): Promise<ApiResponse<UserProgressDTO>> {
    return await apiClient.get<UserProgressDTO>(`/questions/${questionId}/progress`);
  }

  /**
   * Update progress for specific question
   * Matches: POST /api/questions/{questionId}/progress
   */
  async updateQuestionProgress(
    questionId: string, 
    solved: boolean
  ): Promise<ApiResponse<UserProgressDTO>> {
    return await apiClient.post<UserProgressDTO>(`/questions/${questionId}/progress`, {
      solved
    });
  }

  /**
   * Get progress for specific category and current user
   * Matches: GET /api/categories/{categoryId}/progress
   */
  async getCategoryProgress(categoryId: string): Promise<ApiResponse<CategoryProgressStats>> {
    return await apiClient.get<CategoryProgressStats>(`/categories/${categoryId}/progress`);
  }

  // ADMIN ENDPOINTS (for future use)

  /**
   * Get progress for specific user (Admin only)
   * Matches: GET /api/users/{userId}/progress
   */
  async getUserProgressStats(userId: string): Promise<ApiResponse<UserProgressStats>> {
    return await apiClient.get<UserProgressStats>(`/users/${userId}/progress`);
  }

  /**
   * Get all progress for a user (Admin only)
   * Matches: GET /api/users/{userId}/progress/all
   */
  async getAllUserProgress(userId: string): Promise<ApiResponse<UserProgressDTO[]>> {
    return await apiClient.get<UserProgressDTO[]>(`/users/${userId}/progress/all`);
  }

  /**
   * Get global progress statistics (Admin only)
   * Matches: GET /api/admin/progress/global
   */
  async getGlobalProgressStats(): Promise<ApiResponse<GlobalProgressStats>> {
    return await apiClient.get<GlobalProgressStats>('/admin/progress/global');
  }
}

export const userProgressApiService = new UserProgressApiService();