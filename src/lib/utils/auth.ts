// src/lib/utils/auth.ts - Auth-specific utilities
import Cookies from 'js-cookie';
import { User, UserRole } from '@/types';
import { STORAGE_KEYS, COOKIE_OPTIONS, USER_ROLE_LABELS } from '@/constants';

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

export const cookieManager = {
  // Token management
  setToken: (token: string) => {
    Cookies.set(STORAGE_KEYS.TOKEN, token, COOKIE_OPTIONS.TOKEN);
  },

  getToken: (): string | undefined => {
    return Cookies.get(STORAGE_KEYS.TOKEN);
  },

  setRefreshToken: (refreshToken: string) => {
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS.REFRESH_TOKEN);
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User management
  setUser: (user: User) => {
    Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS.USER);
  },

  getUser: (): User | null => {
    const userJson = Cookies.get(STORAGE_KEYS.USER);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Failed to parse user from cookie:', error);
      Cookies.remove(STORAGE_KEYS.USER);
      return null;
    }
  },

  // Clear all auth data
  clearAll: () => {
    Cookies.remove(STORAGE_KEYS.TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(STORAGE_KEYS.USER);
  },

  // Update all auth data at once
  setAuthData: (token: string, refreshToken: string, user: User) => {
    cookieManager.setToken(token);
    cookieManager.setRefreshToken(refreshToken);
    cookieManager.setUser(user);
  },
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

export const roleUtils = {
  // Check if user has admin privileges
  isAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;
  },

  // Check if user is super admin
  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.SUPERADMIN;
  },

  // Check if user has specific role
  hasRole: (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
  },

  // Check if user can access admin features
  canAccessAdmin: (user: User | null): boolean => {
    return roleUtils.isAdmin(user);
  },

  // Check if user has role or higher privileges
  hasRoleOrHigher: (user: User | null, minimumRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };

    return roleHierarchy[user.role] >= roleHierarchy[minimumRole];
  },

  // Format role for display
  formatRole: (role: UserRole): string => {
    return USER_ROLE_LABELS[role] || role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (user: User | null, roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  },
};