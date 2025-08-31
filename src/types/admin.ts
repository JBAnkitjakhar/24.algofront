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
  // User role breakdown from backend
  userRoles?: {
    totalUsers: number;
    users: number;
    admins: number;
    superAdmins: number;
  };
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
  uptime?: string;
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

// UPDATED: User Management Types to match backend UserDTO exactly
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string; // ISO string from LocalDateTime
  updatedAt: string; // ISO string from LocalDateTime  
  primarySuperAdmin: boolean; // matches backend field name
}

export interface RoleChangeRequest {
  userId: string;
  newRole: UserRole;
  reason?: string;
}

// Paginated response structure matching Spring Boot Page
export interface UserPageResponse {
  content: UserListItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Role update API response from backend
export interface RoleUpdateResponse {
  success: boolean;
  message: string;
  user: UserListItem;
}

// ADDED: Category Management Types
export interface Category {
  id: string;
  name: string;
  createdByName: string;
  createdById: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CategoryStats {
  totalQuestions: number;
  questionsByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalSolutions: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface DeleteCategoryResponse {
  success: boolean;
  deletedQuestions: number;
}

// ADDED: Question Management Types
export enum QuestionLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface CodeSnippet {
  language: string;
  code: string;
  description: string;
}

export interface Question {
  id: string;
  title: string;
  statement: string;
  imageUrls?: string[];
  imageFolderUrl?: string; // Backward compatibility
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  categoryName: string;
  level: QuestionLevel;
  createdByName: string;
  createdById: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface QuestionDetail {
  question: Question;
  solutions: Solution[];
  solved: boolean;
  solvedAt?: string; // ISO string
}

export interface CreateQuestionRequest {
  title: string;
  statement: string;
  imageUrls?: string[];
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  level: QuestionLevel;
}

export interface UpdateQuestionRequest {
  title: string;
  statement: string;
  imageUrls?: string[];
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  level: QuestionLevel;
}

// Paginated Question Response (matches Spring Boot Page)
export interface QuestionPageResponse {
  content: Question[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface QuestionFilters {
  categoryId?: string;
  level?: QuestionLevel;
  search?: string;
}

export interface QuestionStats {
  total: number;
  byLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  byCategory: Record<string, {
    name: string;
    count: number;
  }>;
}

// Image Upload Response (matches CloudinaryService response)
export interface ImageUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export interface FileUploadResponse {
  success: boolean;
  data: ImageUploadResponse;
  message: string;
}

// Solution interface (referenced in QuestionDetail)
export interface Solution {
  id: string;
  questionId: string;
  questionTitle: string;
  content: string;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  youtubeEmbedUrl?: string;
  youtubeVideoId?: string;
}

// ==================== SOLUTION TYPES ====================

export interface Solution {
  id: string;
  questionId: string;
  questionTitle: string;
  content: string;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  youtubeEmbedUrl?: string;
  youtubeVideoId?: string;
}

export interface SolutionDetail extends Solution {
  question: Question;
}

export interface CreateSolutionRequest {
  content: string;
  codeSnippet?: CodeSnippet;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
}

export interface UpdateSolutionRequest {
  content: string;
  codeSnippet?: CodeSnippet;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
}

// Paginated Solution Response (matches Spring Boot Page)
export interface SolutionPageResponse {
  content: Solution[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SolutionFilters {
  questionId?: string;
  creatorId?: string;
  hasImages?: boolean;
  hasVisualizers?: boolean;
  hasYoutubeLink?: boolean;
  hasDriveLink?: boolean;
}

export interface SolutionStats {
  totalSolutions: number;
  solutionsWithImages: number;
  solutionsWithVisualizers: number;
  solutionsWithYoutubeVideos: number;
  solutionsWithDriveLinks: number;
  solutionsWithBothLinks: number;
}

export interface LinkValidationResponse {
  valid: boolean;
  error?: string;
  videoId?: string; // For YouTube links
  embedUrl?: string; // For YouTube links
  originalUrl?: string;
}

// ==================== VISUALIZER FILE TYPES ====================

export interface VisualizerFile {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  uploadDate: string;
  solutionId: string;
}

export interface VisualizerUploadResponse {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  solutionId: string;
  uploadedAt: number;
}

export interface VisualizerFilesResponse {
  success: boolean;
  data: VisualizerFile[];
  count: number;
  solutionId: string;
}