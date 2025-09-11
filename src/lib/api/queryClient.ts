// src/lib/api/queryClient.ts - OPTIMIZED FOR REAL-TIME UPDATES

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CRITICAL: Fresh data strategy for real-time updates
      staleTime: 0, // Always consider data stale - ensures fresh data on navigation
      gcTime: 2 * 60 * 1000, // Keep in memory for 2 minutes only
      
      // REAL-TIME UPDATE STRATEGY
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch on network reconnect
      
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
    },
  },
});