// src/types/index.ts  
export * from './auth';
export * from './api';

// Re-export commonly used types for convenience
export type { User, AuthState, AuthResponse } from './auth';
export type { ApiResponse, ApiSuccess, ApiError } from './api';

// Export UserRole as both type and value (enum)
export { UserRole } from './auth';