// src/lib/api/queryClient.ts - OPTIMIZED FOR REAL-TIME UPDATES WITH SMART CACHING

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SMART CACHING STRATEGY:
      // 1. Fresh data on page refresh (staleTime: 0)
      // 2. Auto-refresh after 30 minutes (gcTime controls background cleanup)
      // 3. Intelligent refetching on focus/mount
      
      staleTime: 0, // Always consider data stale - ensures fresh data on page refresh
      gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
      
      // REAL-TIME UPDATE STRATEGY
      refetchOnMount: true, // Always refetch when component mounts (page refresh)
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch on network reconnect
      
      // FORCE REFRESH AFTER 30 MINUTES
      refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes
      refetchIntervalInBackground: false, // Only when tab is active
      
      // Retry logic - don't retry auth errors
      retry: (failureCount, error: Error) => {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        
        // Don't retry client errors (400-499) except 401 (handled by interceptor)
        if (status && status >= 400 && status < 500 && status !== 401) {
          return false;
        }
        
        // Only retry up to 2 times for server errors
        return failureCount < 2;
      },
      
      // Shorter retry delay for faster feedback
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: false, // Never retry mutations to avoid duplicates
      
      // CRITICAL: Enhanced mutation cache invalidation
      onSuccess: () => {
        // This will be overridden by specific mutations but provides a fallback
      },
    },
  },
});

// ENHANCED CACHE INVALIDATION HELPERS
export const cacheInvalidationHelpers = {
  // Invalidate all questions-related data
  invalidateQuestions: () => {
    queryClient.invalidateQueries({ queryKey: ['questions'] });
    queryClient.invalidateQueries({ queryKey: ['questionSummaries'] });
    // Remove specific question details to force refetch
    queryClient.removeQueries({ 
      predicate: (query) => 
        query.queryKey[0] === 'questions' && query.queryKey[1] === 'detail'
    });
  },
  
  // Invalidate all categories-related data
  invalidateCategories: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    // Remove specific category details to force refetch
    queryClient.removeQueries({ 
      predicate: (query) => 
        query.queryKey[0] === 'categories' && query.queryKey[1] === 'detail'
    });
  },
  
  // Invalidate user progress data
  invalidateUserProgress: () => {
    queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    queryClient.invalidateQueries({ queryKey: ['approaches'] });
  },
  
  // Force fresh data for specific pages
  forceRefreshQuestionsPage: () => {
    queryClient.invalidateQueries({ queryKey: ['questions', 'list'] });
    queryClient.refetchQueries({ queryKey: ['questions', 'list'] });
  },
  
  forceRefreshCategoriesPage: () => {
    queryClient.invalidateQueries({ queryKey: ['categories', 'with-progress'] });
    queryClient.refetchQueries({ queryKey: ['categories', 'with-progress'] });
  },
};