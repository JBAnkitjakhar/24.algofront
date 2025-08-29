// src/hooks/useUserManagement.ts - User management hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApiService } from '@/lib/api/userService';
import { QUERY_KEYS } from '@/constants';
import { UserListItem, RoleChangeRequest } from '@/types';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function useUsers(params?: {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole;
}) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.LIST, params],
    queryFn: async () => {
      const response = await userApiService.getAllUsers(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch users');
    },
    enabled: isAdmin(), // Only fetch if user is admin
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserById(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USERS.DETAIL(userId),
    queryFn: async (): Promise<UserListItem> => {
      const response = await userApiService.getUserById(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user');
    },
    enabled: !!userId && isAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user, isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: RoleChangeRequest): Promise<UserListItem> => {
      // Validate permissions on frontend
      if (!isSuperAdmin()) {
        throw new Error('Only Super Admins can change user roles');
      }

      // Prevent self role change for SuperAdmin
      if (request.userId === user?.id) {
        throw new Error('You cannot change your own role');
      }

      const response = await userApiService.updateUserRole(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update user role');
    },
    onSuccess: (updatedUser, variables) => {
      // Update all relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.DETAIL(variables.userId) });
      
      toast.success(`Successfully updated ${updatedUser.name}'s role to ${updatedUser.role}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });
}

export function useSearchUsers(query: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USERS.SEARCH(query),
    queryFn: async (): Promise<UserListItem[]> => {
      const response = await userApiService.searchUsers(query);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to search users');
    },
    enabled: !!query.trim() && query.length >= 2 && isAdmin(),
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}