// src/lib/api/userService.ts - User management service

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { UserListItem, RoleChangeRequest } from '@/types';
import { UserRole } from '@/types';

class UserApiService {
  /**
   * Get all users with pagination (Admin/SuperAdmin only)
   */
  async getAllUsers(params?: {
    page?: number;
    size?: number;
    search?: string;
    role?: UserRole;
  }): Promise<ApiResponse<{
    content: UserListItem[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    return await apiClient.get(`/users?${queryParams.toString()}`);
  }

  /**
   * Update user role (SuperAdmin only)
   */
  async updateUserRole(request: RoleChangeRequest): Promise<ApiResponse<UserListItem>> {
    return await apiClient.put(`/users/${request.userId}/role`, {
      role: request.newRole,
      reason: request.reason
    });
  }

  /**
   * Get user by ID (Admin/SuperAdmin only)
   */
  async getUserById(userId: string): Promise<ApiResponse<UserListItem>> {
    return await apiClient.get(`/users/${userId}`);
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<ApiResponse<UserListItem[]>> {
    return await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  }
}

export const userApiService = new UserApiService();