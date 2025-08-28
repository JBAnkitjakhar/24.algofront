// src/app/dashboard/page.tsx
'use client';

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { roleUtils } from '@/lib/utils/auth';
import { dateUtils, stringUtils } from '@/lib/utils/common';

function DashboardContent() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">AlgoArena</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-500">
                    {/* Use centralized role utilities */}
                    {roleUtils.formatRole(user.role)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Welcome to AlgoArena Dashboard!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Authentication is working perfectly! Phase 1 Complete.
            </p>
            <div className="inline-block w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Info</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {roleUtils.formatRole(user.role)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Initials:</span> {stringUtils.getInitials(user.name)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Member Since:</span> {dateUtils.formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Permissions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Admin:</span>
                    <span className={`text-sm font-medium ${isAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                      {isAdmin() ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Super Admin:</span>
                    <span className={`text-sm font-medium ${isSuperAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                      {isSuperAdmin() ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Next Phase Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next Phase</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Ready to implement Admin Dashboard!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Dashboard Link */}
          {isAdmin() && (
            <div className="mt-8 text-center">
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Admin Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}