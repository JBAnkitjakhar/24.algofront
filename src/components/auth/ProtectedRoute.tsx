// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';
import { roleUtils } from '@/lib/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mounting
    if (!isMounted) return;
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // Only redirect if we're sure user is not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      hasRedirected.current = true;
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, isMounted]);

  // Show loading during SSR and initial client load
  if (!isMounted || isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Show loading while redirecting to login
  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  // Check role-based access using centralized role utilities
  if (requiredRole) {
    let hasRequiredRole = false;

    if (Array.isArray(requiredRole)) {
      // Check if user has any of the required roles
      hasRequiredRole = roleUtils.hasAnyRole(user, requiredRole);
    } else {
      // Check if user has the specific role or higher privileges
      hasRequiredRole = roleUtils.hasRoleOrHigher(user, requiredRole);
    }

    if (!hasRequiredRole) {
      return <AccessDenied userRole={user.role} requiredRole={requiredRole} />;
    }
  }

  return <>{children}</>;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Access denied component
function AccessDenied({ 
  userRole, 
  requiredRole 
}: { 
  userRole: UserRole; 
  requiredRole: UserRole | UserRole[];
}) {
  const router = useRouter();

  // Use centralized utilities for role formatting
  const requiredRoleText = Array.isArray(requiredRole) 
    ? requiredRole.map(role => roleUtils.formatRole(role)).join(' or ')
    : roleUtils.formatRole(requiredRole);

  const currentRoleText = roleUtils.formatRole(userRole);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You dont have permission to access this page. 
          <br />
          Required role: <span className="font-semibold">{requiredRoleText}</span>
          <br />
          Your role: <span className="font-semibold">{currentRoleText}</span>
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.replace(ROUTES.HOME)}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}