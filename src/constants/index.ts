// src/constants/index.ts - Updated to include solution constants

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_BASE_URL}/oauth2/authorization/google`,
  GITHUB_LOGIN: `${API_BASE_URL}/oauth2/authorization/github`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
} as const;

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  STATS: `${API_BASE_URL}/admin/stats`,
  SETTINGS: `${API_BASE_URL}/admin/settings`,
  PROGRESS: `${API_BASE_URL}/admin/progress`,
  HEALTH: `${API_BASE_URL}/admin/health`,
  METRICS: `${API_BASE_URL}/admin/metrics`,
  // User management endpoints
  USERS: `${API_BASE_URL}/admin/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
  USERS_BY_ROLE: (role: string) => `${API_BASE_URL}/admin/users/role/${role}`,
  UPDATE_USER_ROLE: (id: string) => `${API_BASE_URL}/admin/users/${id}/role`,
  USER_PERMISSIONS: `${API_BASE_URL}/admin/users/permissions`,
} as const;

// Category management endpoints
export const CATEGORY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/categories`,
  CREATE: `${API_BASE_URL}/categories`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/categories/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  GET_STATS: (id: string) => `${API_BASE_URL}/categories/${id}/stats`,
} as const;

// Question management endpoints
export const QUESTION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/questions`,
  CREATE: `${API_BASE_URL}/questions`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/questions/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  SEARCH: `${API_BASE_URL}/questions/search`,
  STATS: `${API_BASE_URL}/questions/stats`,
} as const;

// ADDED: Solution management endpoints
export const SOLUTION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/solutions`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  BY_QUESTION: (questionId: string) => `${API_BASE_URL}/solutions/question/${questionId}`,
  CREATE_FOR_QUESTION: (questionId: string) => `${API_BASE_URL}/solutions/question/${questionId}`,
  UPDATE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  STATS: `${API_BASE_URL}/solutions/stats`,
  WITH_IMAGES: `${API_BASE_URL}/solutions/with-images`,
  WITH_VISUALIZERS: `${API_BASE_URL}/solutions/with-visualizers`,
  WITH_YOUTUBE: `${API_BASE_URL}/solutions/with-youtube`,
  BY_CREATOR: (creatorId: string) => `${API_BASE_URL}/solutions/creator/${creatorId}`,
  // Link validation
  VALIDATE_YOUTUBE: `${API_BASE_URL}/solutions/validate-youtube`,
  VALIDATE_DRIVE: `${API_BASE_URL}/solutions/validate-drive`,
  // Image management
  ADD_IMAGE: (id: string) => `${API_BASE_URL}/solutions/${id}/images`,
  REMOVE_IMAGE: (id: string) => `${API_BASE_URL}/solutions/${id}/images`,
  // Visualizer management
  ADD_VISUALIZER: (id: string) => `${API_BASE_URL}/solutions/${id}/visualizers`,
  REMOVE_VISUALIZER: (id: string) => `${API_BASE_URL}/solutions/${id}/visualizers`,
} as const;

// File upload endpoints
export const FILE_ENDPOINTS = {
  CONFIG: `${API_BASE_URL}/files/config`,
  UPLOAD_QUESTION_IMAGE: `${API_BASE_URL}/files/images/questions`,
  UPLOAD_SOLUTION_IMAGE: `${API_BASE_URL}/files/images/solutions`,
  DELETE_IMAGE: `${API_BASE_URL}/files/images`,
  HEALTH_CHECK: `${API_BASE_URL}/files/health/cloudinary`,
  // ADDED: Visualizer endpoints
  UPLOAD_VISUALIZER: (solutionId: string) => `${API_BASE_URL}/files/visualizers/${solutionId}`,
  GET_VISUALIZER: (fileId: string) => `${API_BASE_URL}/files/visualizers/${fileId}`,
  DELETE_VISUALIZER: (fileId: string) => `${API_BASE_URL}/files/visualizers/${fileId}`,
  VISUALIZERS_BY_SOLUTION: (solutionId: string) => `${API_BASE_URL}/files/solutions/${solutionId}/visualizers`,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  CALLBACK: '/auth/callback', 
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  QUESTIONS: '/questions',
  PROFILE: '/profile',
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  QUESTIONS: '/admin/questions',
  SOLUTIONS: '/admin/solutions',
  USERS: '/admin/users',
  CATEGORIES: '/admin/categories',
  SETTINGS: '/admin/settings',
  ANALYTICS: '/admin/analytics',
} as const;

// Storage and cookies
export const STORAGE_KEYS = {
  TOKEN: 'algoarena_token',
  REFRESH_TOKEN: 'algoarena_refresh_token',
  USER: 'algoarena_user',
} as const;

export const COOKIE_OPTIONS = {
  TOKEN: { 
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const 
  },
  REFRESH_TOKEN: { 
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const 
  },
  USER: { 
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const 
  },
} as const;

// Labels and display
export const USER_ROLE_LABELS = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'Super Admin',
} as const;

// Query keys for all features
export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'] as const,
    REFRESH: ['auth', 'refresh'] as const,
  },
  ADMIN: {
    STATS: ['admin', 'stats'] as const,
    SETTINGS: ['admin', 'settings'] as const,
    PROGRESS: ['admin', 'progress'] as const,
    HEALTH: ['admin', 'health'] as const,
    METRICS: ['admin', 'metrics'] as const,
    USERS: ['admin', 'users'] as const,
    USER_PERMISSIONS: ['admin', 'users', 'permissions'] as const,
  },
  USERS: {
    LIST: ['users', 'list'] as const,
    BY_ROLE: (role: string) => ['users', 'role', role] as const,
    DETAIL: (id: string) => ['users', 'detail', id] as const,
  },
  CATEGORIES: {
    LIST: ['categories', 'list'] as const,
    DETAIL: (id: string) => ['categories', 'detail', id] as const,
    STATS: (id: string) => ['categories', 'stats', id] as const,
  },
  QUESTIONS: {
    LIST: ['questions', 'list'] as const,
    DETAIL: (id: string) => ['questions', 'detail', id] as const,
    STATS: ['questions', 'stats'] as const,
    SEARCH: (query: string) => ['questions', 'search', query] as const,
    BY_CATEGORY: (categoryId: string) => ['questions', 'category', categoryId] as const,
  },
  // ADDED: Solution query keys
  SOLUTIONS: {
    LIST: ['solutions', 'list'] as const,
    DETAIL: (id: string) => ['solutions', 'detail', id] as const,
    BY_QUESTION: (questionId: string) => ['solutions', 'question', questionId] as const,
    BY_CREATOR: (creatorId: string) => ['solutions', 'creator', creatorId] as const,
    STATS: ['solutions', 'stats'] as const,
    VISUALIZERS: (solutionId?: string) => solutionId ? ['solutions', 'visualizers', solutionId] as const : ['solutions', 'visualizers'] as const,
  },
  FILES: {
    CONFIG: ['files', 'config'] as const,
    UPLOAD: ['files', 'upload'] as const,
  },
} as const;

// Question validation constants
export const QUESTION_VALIDATION = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  STATEMENT_MIN_LENGTH: 20,
  STATEMENT_MAX_LENGTH: 10000,
  MAX_IMAGES_PER_QUESTION: 5,
  MAX_CODE_SNIPPETS: 10,
} as const;

// ADDED: Solution validation constants
export const SOLUTION_VALIDATION = {
  CONTENT_MIN_LENGTH: 20,
  CONTENT_MAX_LENGTH: 15000,
  MAX_IMAGES_PER_SOLUTION: 10,
  MAX_VISUALIZERS_PER_SOLUTION: 2,
  CODE_MAX_LENGTH: 10000,
  DESCRIPTION_MAX_LENGTH: 200,
} as const;

// Question level display labels
export const QUESTION_LEVEL_LABELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
} as const;

// Question level colors for UI
export const QUESTION_LEVEL_COLORS = {
  EASY: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  MEDIUM: {
    bg: 'bg-yellow-50', 
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  HARD: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
} as const;

// Category validation constants
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;