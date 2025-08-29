// src/types/index.ts - UPDATED centralized exports
export * from './auth';
export * from './api';
export * from './admin'; // This now includes user management types too

// Re-export commonly used types for convenience
export type { User, AuthState, AuthResponse} from './auth';
export type { ApiResponse, ApiSuccess, ApiError } from './api';
export type { 
  AdminStats, 
  SystemSettings, 
  SystemHealth, 
  ApplicationMetrics, 
  GlobalProgress,
  UserListItem,
  RoleChangeRequest,
  RoleChangeHistory 
} from './admin';

// Export UserRole as both type and value (enum)
export { UserRole } from './auth';