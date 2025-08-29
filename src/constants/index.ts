// src/constants/index.ts  

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
} as const;

// User management endpoints
export const USER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/users`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  UPDATE_ROLE: (id: string) => `${API_BASE_URL}/users/${id}/role`,
  SEARCH: `${API_BASE_URL}/users/search`,
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

// CONSOLIDATED Query keys for all features
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
  },
  USERS: {
    LIST: ['users', 'list'] as const,
    SEARCH: (query: string) => ['users', 'search', query] as const,
    DETAIL: (id: string) => ['users', 'detail', id] as const,
    ROLE_HISTORY: ['users', 'role-history'] as const,
  },
} as const;