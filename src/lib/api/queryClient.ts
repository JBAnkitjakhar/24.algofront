// src/lib/api/queryClient.ts  

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduced stale time for fresher data
      staleTime: 0, // 0 seconds - always consider data stale on mount
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in memory but refetch when needed
      
      // CRITICAL: Always refetch on mount and window focus
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch on network reconnect
      
      // Keep existing retry logic
      retry: (failureCount, error: Error) => {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        if (status && status >= 400 && status < 500 && status !== 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});