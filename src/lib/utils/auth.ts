// src/lib/utils/auth.ts 
 
import Cookies from 'js-cookie';
import { User, UserRole, UserListItem } from '@/types';
import { STORAGE_KEYS, COOKIE_OPTIONS, USER_ROLE_LABELS } from '@/constants';
 
// COOKIE MANAGEMENT 
 
export const cookieManager = {
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
  clearAll: () => {
    Cookies.remove(STORAGE_KEYS.TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(STORAGE_KEYS.USER);
  },
  setAuthData: (token: string, refreshToken: string, user: User) => {
    cookieManager.setToken(token);
    cookieManager.setRefreshToken(refreshToken);
    cookieManager.setUser(user);
  },
};

// ROLE UTILITIES  

export const roleUtils = {
  // Basic role checks (existing)
  isAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;
  },
  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.SUPERADMIN;
  },
  hasRole: (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
  },
  canAccessAdmin: (user: User | null): boolean => {
    return roleUtils.isAdmin(user);
  },
  hasRoleOrHigher: (user: User | null, minimumRole: UserRole): boolean => {
    if (!user) return false;
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[user.role] >= roleHierarchy[minimumRole];
  },
  formatRole: (role: UserRole): string => {
    return USER_ROLE_LABELS[role] || role;
  },
  hasAnyRole: (user: User | null, roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  },

  // ROLE VALIDATION ( 
  canChangeRole: (currentUser: User | null, targetUser: UserListItem): boolean => {
    if (!currentUser) return false;
    if (currentUser.role !== UserRole.SUPERADMIN) return false;
    if (currentUser.id === targetUser.id) return false;
    if (targetUser.role === UserRole.SUPERADMIN) return false;
    return true;
  },
  getAvailableRoles: (currentUser: User | null, targetUser: UserListItem): UserRole[] => {
    if (!roleUtils.canChangeRole(currentUser, targetUser)) return [];
    return [UserRole.USER, UserRole.ADMIN];
  },
  validateRoleChange: (
    currentUser: User | null, 
    targetUser: UserListItem, 
    newRole: UserRole
  ): { isValid: boolean; error?: string } => {
    if (!currentUser) {
      return { isValid: false, error: 'User not authenticated' };
    }
    if (!roleUtils.canChangeRole(currentUser, targetUser)) {
      return { isValid: false, error: 'You do not have permission to change this user\'s role' };
    }
    const availableRoles = roleUtils.getAvailableRoles(currentUser, targetUser);
    if (!availableRoles.includes(newRole)) {
      return { isValid: false, error: `You cannot assign the role ${newRole}` };
    }
    if (targetUser.role === newRole) {
      return { isValid: false, error: 'User already has this role' };
    }
    return { isValid: true };
  },
  getRoleChangeDescription: (oldRole: UserRole, newRole: UserRole): string => {
    const roleNames = {
      [UserRole.USER]: 'User',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SUPERADMIN]: 'Super Admin'
    };
    return `Change from ${roleNames[oldRole]} to ${roleNames[newRole]}`;
  },
  isPromotion: (oldRole: UserRole, newRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[newRole] > roleHierarchy[oldRole];
  },
  isDemotion: (oldRole: UserRole, newRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[newRole] < roleHierarchy[oldRole];
  },
  getRoleChangeImpact: (oldRole: UserRole, newRole: UserRole): string => {
    if (roleUtils.isPromotion(oldRole, newRole)) {
      if (oldRole === UserRole.USER && newRole === UserRole.ADMIN) {
        return 'This user will gain access to admin features including question management, solution creation, and analytics dashboard.';
      }
    }
    if (roleUtils.isDemotion(oldRole, newRole)) {
      if (oldRole === UserRole.ADMIN && newRole === UserRole.USER) {
        return 'This user will lose admin privileges and will only have access to basic user features.';
      }
    }
    return 'Role change will update user permissions accordingly.';
  },
  getRolePermissions: (role: UserRole): string[] => {
    switch (role) {
      case UserRole.USER:
        return [
          'View and solve questions',
          'Create personal approaches',
          'Track personal progress',
          'Access solutions after solving',
        ];
      case UserRole.ADMIN:
        return [
          'All user permissions',
          'Create and manage questions',
          'Create official solutions',
          'View analytics dashboard',
          'Manage categories',
          'View user progress data',
        ];
      case UserRole.SUPERADMIN:
        return [
          'All admin permissions',
          'Manage user roles',
          'Access system settings',
          'View system health metrics',
          'Manage admin accounts',
          'Full platform control',
        ];
      default:
        return [];
    }
  }
};