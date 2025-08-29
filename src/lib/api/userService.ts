// // src/lib/api/userService.ts - User management service

// import { apiClient } from './client';
// import type { ApiResponse } from '@/types/api';
// import type { UserListItem, RoleChangeRequest } from '@/types';
// import { UserRole } from '@/types';

// class UserApiService {
//   /**
//    * Get all users with pagination (Admin/SuperAdmin only)
//    */
//   async getAllUsers(params?: {
//     page?: number;
//     size?: number;
//     search?: string;
//     role?: UserRole;
//   }): Promise<ApiResponse<{
//     content: UserListItem[];
//     totalElements: number;
//     totalPages: number;
//     currentPage: number;
//     size: number;
//   }>> {
//     const queryParams = new URLSearchParams();
//     if (params?.page !== undefined) queryParams.append('page', params.page.toString());
//     if (params?.size !== undefined) queryParams.append('size', params.size.toString());
//     if (params?.search) queryParams.append('search', params.search);
//     if (params?.role) queryParams.append('role', params.role);

//     return await apiClient.get(`/users?${queryParams.toString()}`);
//   }

//   /**
//    * Update user role (SuperAdmin only)
//    */
//   async updateUserRole(request: RoleChangeRequest): Promise<ApiResponse<UserListItem>> {
//     return await apiClient.put(`/users/${request.userId}/role`, {
//       role: request.newRole,
//       reason: request.reason
//     });
//   }

//   /**
//    * Get user by ID (Admin/SuperAdmin only)
//    */
//   async getUserById(userId: string): Promise<ApiResponse<UserListItem>> {
//     return await apiClient.get(`/users/${userId}`);
//   }

//   /**
//    * Search users by name or email
//    */
//   async searchUsers(query: string): Promise<ApiResponse<UserListItem[]>> {
//     return await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
//   }
// }

// export const userApiService = new UserApiService();

// src/lib/api/userService.ts - UPDATED to match backend endpoints exactly

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { UserListItem, RoleChangeRequest, UserPageResponse, RoleUpdateResponse } from '@/types';
import { UserRole } from '@/types';
import { ADMIN_ENDPOINTS } from '@/constants';

class UserApiService {
  /**
   * Get all users with pagination (Admin/SuperAdmin only)
   * Matches: GET /api/admin/users?page=0&size=20
   */
  async getAllUsers(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<UserPageResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const url = queryParams.toString() 
      ? `${ADMIN_ENDPOINTS.USERS}?${queryParams.toString()}`
      : ADMIN_ENDPOINTS.USERS;

    return await apiClient.get<UserPageResponse>(url);
  }

  /**
   * Get users by role with pagination
   * Matches: GET /api/admin/users/role/{role}?page=0&size=20
   */
  async getUsersByRole(role: UserRole, params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<UserPageResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const baseUrl = ADMIN_ENDPOINTS.USERS_BY_ROLE(role.toLowerCase());
    const url = queryParams.toString() 
      ? `${baseUrl}?${queryParams.toString()}`
      : baseUrl;

    return await apiClient.get<UserPageResponse>(url);
  }

  /**
   * Get user by ID (Admin/SuperAdmin only)
   * Matches: GET /api/admin/users/{userId}
   */
  async getUserById(userId: string): Promise<ApiResponse<UserListItem>> {
    return await apiClient.get<UserListItem>(ADMIN_ENDPOINTS.USER_BY_ID(userId));
  }

  /**
   * Update user role (SuperAdmin only)
   * Matches: PUT /api/admin/users/{userId}/role with body { "role": "ADMIN" }
   */
  async updateUserRole(request: RoleChangeRequest): Promise<ApiResponse<RoleUpdateResponse>> {
    return await apiClient.put<RoleUpdateResponse>(
      ADMIN_ENDPOINTS.UPDATE_USER_ROLE(request.userId), 
      {
        role: request.newRole,
        // Note: Backend doesn't currently support reason field, but keeping for future
      }
    );
  }

  /**
   * Get role permissions matrix
   * Matches: GET /api/admin/users/permissions
   */
  async getRolePermissions(): Promise<ApiResponse<{
    success: boolean;
    permissions: Record<string, Record<string, boolean>>;
    hierarchy: string[];
  }>> {
    return await apiClient.get(ADMIN_ENDPOINTS.USER_PERMISSIONS);
  }
}

export const userApiService = new UserApiService();