// src/types/admin.ts  

import { UserRole } from "./auth";

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalSolutions: number;
  totalApproaches: number;
  totalCategories: number;
  totalProgress: number;
  totalSolved: number;
  avgProgressPerUser: number;
  avgSolvedPerUser: number;
  recentUsers: string;
  recentQuestions: string;
  recentSolutions: string;
  systemStatus: string;
  lastUpdated: number;
}

export interface SystemSettings {
  site: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maintenanceMode: boolean;
  };
  users: {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    maxUsersPerDay: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowOAuth: boolean;
    maxLoginAttempts: number;
  };
  api: {
    rateLimitPerHour: number;
    enableApiDocs: boolean;
    apiTimeout: number;
    maxFileSize: number;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    userWelcomeEmail: boolean;
    adminNotifications: boolean;
  };
  lastUpdated: number;
}

export interface SystemHealth {
  database: string;
  userCount?: number;
  databaseError?: string;
  timestamp: number;
  uptime: string;
}

export interface ApplicationMetrics {
  database: {
    totalUsers: number;
    totalQuestions: number;
    totalSolutions: number;
    totalApproaches: number;
    totalCategories: number;
  };
  performance: {
    avgResponseTime: string;
    requestsPerMinute: string;
    errorRate: string;
  };
  timestamp: number;
}

export interface GlobalProgress {
  totalUsers: number;
  totalQuestions: number;
  solvedQuestions: number;
  progressByLevel: {
    easy: { total: number; solved: number };
    medium: { total: number; solved: number };
    hard: { total: number; solved: number };
  };
  averageCompletion: number;
  activeUsers: number;
  timestamp: number;
}

// User Management Types (consolidated here instead of separate file)
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface RoleChangeRequest {
  userId: string;
  newRole: UserRole;
  reason?: string;
}

export interface RoleChangeHistory {
  id: string;
  userId: string;
  userName: string;
  oldRole: UserRole;
  newRole: UserRole;
  changedBy: string;
  changedByName: string;
  reason?: string;
  timestamp: string;
}

