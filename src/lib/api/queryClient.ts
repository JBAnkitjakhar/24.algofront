// src/lib/api/queryClient.ts

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors except 401
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