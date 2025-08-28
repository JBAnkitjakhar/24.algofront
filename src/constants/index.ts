// src/constants/index.ts - All constants in one place
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_BASE_URL}/oauth2/authorization/google`,
  GITHUB_LOGIN: `${API_BASE_URL}/oauth2/authorization/github`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  CALLBACK: '/auth/callback', 
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  QUESTIONS: '/questions',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'algoarena_token',
  REFRESH_TOKEN: 'algoarena_refresh_token',
  USER: 'algoarena_user',
} as const;

// Consistent cookie options
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

export const USER_ROLE_LABELS = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'Super Admin',
} as const;

// Query keys for consistent cache management
export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'] as const,
    REFRESH: ['auth', 'refresh'] as const,
  },
  // Add more feature query keys here as you expand
} as const;