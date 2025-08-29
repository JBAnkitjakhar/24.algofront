// // src/hooks/useQuestionManagement.ts - Question management hooks

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { questionApiService } from '@/lib/api/questionService';
// import { fileUploadApiService } from '@/lib/api/fileUploadService';
// import { QUERY_KEYS, QUESTION_VALIDATION } from '@/constants';
// import { useAuth } from '@/hooks/useAuth';
// import toast from 'react-hot-toast';
// import type { 
//   Question, 
//   QuestionDetail,
//   QuestionPageResponse,
//   QuestionStats,
//   CreateQuestionRequest, 
//   UpdateQuestionRequest,
//   ImageUploadResponse
// } from '@/types';

// /**
//  * Hook to get all questions with pagination and filters
//  */
// export function useQuestions(params?: {
//   page?: number;
//   size?: number;
//   categoryId?: string;
//   level?: string;
//   search?: string;
// }) {
//   return useQuery({
//     queryKey: [...QUERY_KEYS.QUESTIONS.LIST, params],
//     queryFn: async (): Promise<QuestionPageResponse> => {
//       const response = await questionApiService.getAllQuestions(params);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to fetch questions');
//     },
//     staleTime: 2 * 60 * 1000, // 2 minutes
//     refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
//   });
// }

// /**
//  * Hook to get question by ID
//  */
// export function useQuestionById(id: string) {
//   const { user } = useAuth();

//   return useQuery({
//     queryKey: QUERY_KEYS.QUESTIONS.DETAIL(id),
//     queryFn: async (): Promise<QuestionDetail> => {
//       const response = await questionApiService.getQuestionById(id);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to fetch question');
//     },
//     enabled: !!id && !!user, // Only fetch if user is authenticated
//     staleTime: 3 * 60 * 1000, // 3 minutes
//   });
// }

// /**
//  * Hook to get question statistics
//  */
// export function useQuestionStats() {
//   const { isAdmin } = useAuth();

//   return useQuery({
//     queryKey: QUERY_KEYS.QUESTIONS.STATS,
//     queryFn: async (): Promise<QuestionStats> => {
//       const response = await questionApiService.getQuestionStats();
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to fetch question stats');
//     },
//     enabled: isAdmin(), // Only admins can see stats
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// }

// /**
//  * Hook to search questions
//  */
// export function useSearchQuestions(query: string) {
//   return useQuery({
//     queryKey: QUERY_KEYS.QUESTIONS.SEARCH(query),
//     queryFn: async (): Promise<Question[]> => {
//       const response = await questionApiService.searchQuestions(query);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to search questions');
//     },
//     enabled: !!query.trim() && query.length >= 2, // Only search if query has at least 2 characters
//     staleTime: 30 * 1000, // 30 seconds for search results
//   });
// }

// /**
//  * Hook to create question (Admin/SuperAdmin only)
//  */
// export function useCreateQuestion() {
//   const queryClient = useQueryClient();
//   const { isAdmin } = useAuth();

//   return useMutation({
//     mutationFn: async (request: CreateQuestionRequest): Promise<Question> => {
//       // Frontend validation
//       if (!isAdmin()) {
//         throw new Error('Only Admins and Super Admins can create questions');
//       }

//       // Validate title
//       if (!request.title.trim()) {
//         throw new Error('Question title is required');
//       }
//       if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
//         throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
//       }
//       if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
//         throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
//       }

//       // Validate statement
//       if (!request.statement.trim()) {
//         throw new Error('Question statement is required');
//       }
//       if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
//         throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
//       }
//       if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
//         throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
//       }

//       // Validate category
//       if (!request.categoryId) {
//         throw new Error('Category is required');
//       }

//       // Validate level
//       if (!request.level) {
//         throw new Error('Difficulty level is required');
//       }

//       // Validate images
//       if (request.imageUrls && request.imageUrls.length > QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION) {
//         throw new Error(`Maximum ${QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION} images allowed per question`);
//       }

//       const response = await questionApiService.createQuestion(request);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to create question');
//     },
//     onSuccess: (newQuestion) => {
//       // Invalidate and refetch questions list and stats
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(newQuestion.categoryId) });
      
//       toast.success(`Question "${newQuestion.title}" created successfully`);
//     },
//     onError: (error: Error) => {
//       toast.error(`Failed to create question: ${error.message}`);
//     },
//   });
// }

// /**
//  * Hook to update question (Admin/SuperAdmin only)
//  */
// export function useUpdateQuestion() {
//   const queryClient = useQueryClient();
//   const { isAdmin } = useAuth();

//   return useMutation({
//     mutationFn: async ({ id, request }: { id: string; request: UpdateQuestionRequest }): Promise<Question> => {
//       // Frontend validation (same as create)
//       if (!isAdmin()) {
//         throw new Error('Only Admins and Super Admins can update questions');
//       }

//       // Validate title
//       if (!request.title.trim()) {
//         throw new Error('Question title is required');
//       }
//       if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
//         throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
//       }
//       if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
//         throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
//       }

//       // Validate statement
//       if (!request.statement.trim()) {
//         throw new Error('Question statement is required');
//       }
//       if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
//         throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
//       }
//       if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
//         throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
//       }

//       const response = await questionApiService.updateQuestion(id, request);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to update question');
//     },
//     onSuccess: (updatedQuestion, variables) => {
//       // Invalidate related queries
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(variables.id) });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
//       toast.success(`Question "${updatedQuestion.title}" updated successfully`);
//     },
//     onError: (error: Error) => {
//       toast.error(`Failed to update question: ${error.message}`);
//     },
//   });
// }

// /**
//  * Hook to delete question (Admin/SuperAdmin only)
//  * WARNING: This will also delete all solutions and user progress!
//  */
// export function useDeleteQuestion() {
//   const queryClient = useQueryClient();
//   const { isAdmin } = useAuth();

//   return useMutation({
//     mutationFn: async (id: string): Promise<{ success: string }> => {
//       // Frontend validation
//       if (!isAdmin()) {
//         throw new Error('Only Admins and Super Admins can delete questions');
//       }

//       const response = await questionApiService.deleteQuestion(id);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to delete question');
//     },
//     onSuccess: (result, questionId) => {
//       // Invalidate all related queries
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });

//       toast.success('Question deleted successfully. All related solutions and progress have been removed.');
//     },
//     onError: (error: Error) => {
//       toast.error(`Failed to delete question: ${error.message}`);
//     },
//   });
// }

// /**
//  * Hook to upload question image (Admin/SuperAdmin only)
//  */
// export function useUploadQuestionImage() {
//   const { isAdmin } = useAuth();

//   return useMutation({
//     mutationFn: async (file: File): Promise<ImageUploadResponse> => {
//       // Frontend validation
//       if (!isAdmin()) {
//         throw new Error('Only Admins and Super Admins can upload images');
//       }

//       // Validate file
//       const validation = fileUploadApiService.validateImageFile(file);
//       if (!validation.isValid) {
//         throw new Error(validation.errors.join(', '));
//       }

//       const response = await fileUploadApiService.uploadQuestionImage(file);
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to upload image');
//     },
//     onSuccess: () => {
//       toast.success('Image uploaded successfully');
//     },
//     onError: (error: Error) => {
//       toast.error(`Failed to upload image: ${error.message}`);
//     },
//   });
// }

// /**
//  * Hook to get file upload configuration
//  */
// export function useFileConfig() {
//   return useQuery({
//     queryKey: QUERY_KEYS.FILES.CONFIG,
//     queryFn: async () => {
//       const response = await fileUploadApiService.getFileConfig();
//       if (response.success && response.data) {
//         return response.data;
//       }
//       throw new Error(response.message || 'Failed to fetch file config');
//     },
//     staleTime: 10 * 60 * 1000, // 10 minutes - config doesn't change often
//     retry: 1, // Only retry once for config
//   });
// }

// src/hooks/useQuestionManagement.ts - FIXED: Removed duplicate toast notifications

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApiService } from '@/lib/api/questionService';
import { fileUploadApiService } from '@/lib/api/fileUploadService';
import { QUERY_KEYS, QUESTION_VALIDATION } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  Question, 
  QuestionDetail,
  QuestionPageResponse,
  QuestionStats,
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  ImageUploadResponse
} from '@/types';

/**
 * Hook to get all questions with pagination and filters
 */
export function useQuestions(params?: {
  page?: number;
  size?: number;
  categoryId?: string;
  level?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.QUESTIONS.LIST, params],
    queryFn: async (): Promise<QuestionPageResponse> => {
      const response = await questionApiService.getAllQuestions(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch questions');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to get question by ID
 */
export function useQuestionById(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.DETAIL(id),
    queryFn: async (): Promise<QuestionDetail> => {
      const response = await questionApiService.getQuestionById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch question');
    },
    enabled: !!id && !!user, // Only fetch if user is authenticated
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get question statistics
 */
export function useQuestionStats() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.STATS,
    queryFn: async (): Promise<QuestionStats> => {
      const response = await questionApiService.getQuestionStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch question stats');
    },
    enabled: isAdmin(), // Only admins can see stats
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search questions
 */
export function useSearchQuestions(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.SEARCH(query),
    queryFn: async (): Promise<Question[]> => {
      const response = await questionApiService.searchQuestions(query);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to search questions');
    },
    enabled: !!query.trim() && query.length >= 2, // Only search if query has at least 2 characters
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}

/**
 * Hook to create question (Admin/SuperAdmin only)
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateQuestionRequest): Promise<Question> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create questions');
      }

      // Validate title
      if (!request.title.trim()) {
        throw new Error('Question title is required');
      }
      if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
      }
      if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
        throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
      }

      // Validate statement
      if (!request.statement.trim()) {
        throw new Error('Question statement is required');
      }
      if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
        throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
      }
      if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
      }

      // Validate category
      if (!request.categoryId) {
        throw new Error('Category is required');
      }

      // Validate level
      if (!request.level) {
        throw new Error('Difficulty level is required');
      }

      // Validate images
      if (request.imageUrls && request.imageUrls.length > QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION) {
        throw new Error(`Maximum ${QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION} images allowed per question`);
      }

      const response = await questionApiService.createQuestion(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create question');
    },
    onSuccess: (newQuestion) => {
      // Invalidate and refetch questions list and stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(newQuestion.categoryId) });
      
      toast.success(`Question "${newQuestion.title}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

/**
 * Hook to update question (Admin/SuperAdmin only)
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateQuestionRequest }): Promise<Question> => {
      // Frontend validation (same as create)
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update questions');
      }

      // Validate title
      if (!request.title.trim()) {
        throw new Error('Question title is required');
      }
      if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
      }
      if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
        throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
      }

      // Validate statement
      if (!request.statement.trim()) {
        throw new Error('Question statement is required');
      }
      if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
        throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
      }
      if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
      }

      const response = await questionApiService.updateQuestion(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question');
    },
    onSuccess: (updatedQuestion, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      toast.success(`Question "${updatedQuestion.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

/**
 * Hook to delete question (Admin/SuperAdmin only)
 * WARNING: This will also delete all solutions and user progress!
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete questions');
      }

      const response = await questionApiService.deleteQuestion(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete question');
    },
    onSuccess: (result, questionId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });

      toast.success('Question deleted successfully. All related solutions and progress have been removed.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}

/**
 * Hook to upload question image (Admin/SuperAdmin only)
 * FIXED: No duplicate success toasts - only show when multiple files uploaded
 */
export function useUploadQuestionImage() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResponse> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can upload images');
      }

      // Validate file
      const validation = fileUploadApiService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await fileUploadApiService.uploadQuestionImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload image');
    },
    // FIXED: Don't show individual success toasts - let the caller handle batch notifications
    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
}

/**
 * Hook to get file upload configuration
 */
export function useFileConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.CONFIG,
    queryFn: async () => {
      const response = await fileUploadApiService.getFileConfig();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch file config');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - config doesn't change often
    retry: 1, // Only retry once for config
  });
}