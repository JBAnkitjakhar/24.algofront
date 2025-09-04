// src/lib/api/questionService.ts - UPDATED with sorting support

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { 
  Question, 
  QuestionDetail,
  QuestionPageResponse,
  QuestionStats,
  CreateQuestionRequest, 
  UpdateQuestionRequest 
} from '@/types';
import { QUESTION_ENDPOINTS } from '@/constants';

class QuestionApiService {
  /**
   * Get all questions with pagination, filters, and sorting
   * Matches: GET /api/questions?page=0&size=20&categoryId={id}&level={level}&search={term}&sort={field}&direction={asc|desc}
   */
  async getAllQuestions(params?: {
    page?: number;
    size?: number;
    categoryId?: string;
    level?: string;
    search?: string;
    sort?: string;        // NEW: Sort field
    direction?: string;   // NEW: Sort direction
  }): Promise<ApiResponse<QuestionPageResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    
    // ADD SORTING PARAMETERS
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = queryParams.toString() 
      ? `${QUESTION_ENDPOINTS.LIST}?${queryParams.toString()}`
      : QUESTION_ENDPOINTS.LIST;

    return await apiClient.get<QuestionPageResponse>(url);
  }

  /**
   * Get question details by ID (authenticated)
   * Matches: GET /api/questions/{id}
   */
  async getQuestionById(id: string): Promise<ApiResponse<QuestionDetail>> {
    return await apiClient.get<QuestionDetail>(QUESTION_ENDPOINTS.GET_BY_ID(id));
  }

  /**
   * Create new question (Admin/SuperAdmin only)
   * Matches: POST /api/questions
   */
  async createQuestion(request: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    return await apiClient.post<Question>(QUESTION_ENDPOINTS.CREATE, {
      title: request.title.trim(),
      statement: request.statement,
      imageUrls: request.imageUrls,
      codeSnippets: request.codeSnippets,
      categoryId: request.categoryId,
      level: request.level
    });
  }

  /**
   * Update question (Admin/SuperAdmin only)
   * Matches: PUT /api/questions/{id}
   */
  async updateQuestion(id: string, request: UpdateQuestionRequest): Promise<ApiResponse<Question>> {
    return await apiClient.put<Question>(QUESTION_ENDPOINTS.UPDATE(id), {
      title: request.title.trim(),
      statement: request.statement,
      imageUrls: request.imageUrls,
      codeSnippets: request.codeSnippets,
      categoryId: request.categoryId,
      level: request.level
    });
  }

  /**
   * Delete question (Admin/SuperAdmin only)
   * Matches: DELETE /api/questions/{id}
   * WARNING: This will also delete all solutions and user progress!
   */
  async deleteQuestion(id: string): Promise<ApiResponse<{ success: string }>> {
    return await apiClient.delete<{ success: string }>(QUESTION_ENDPOINTS.DELETE(id));
  }

  /**
   * Search questions
   * Matches: GET /api/questions/search?q={term}
   */
  async searchQuestions(query: string): Promise<ApiResponse<Question[]>> {
    return await apiClient.get<Question[]>(`${QUESTION_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get question statistics
   * Matches: GET /api/questions/stats
   */
  async getQuestionStats(): Promise<ApiResponse<QuestionStats>> {
    return await apiClient.get<QuestionStats>(QUESTION_ENDPOINTS.STATS);
  }
}

export const questionApiService = new QuestionApiService();