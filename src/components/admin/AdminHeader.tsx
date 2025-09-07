// src/components/admin/AdminHeader.tsx - Top header with user info
'use client';

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { roleUtils } from '@/lib/utils/auth';
import { dateUtils } from '@/lib/utils/common';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin page
            </h1>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-500">
                  {roleUtils.formatRole(user.role)} • Member since {dateUtils.formatDate(user.createdAt).split(',')[0]}
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}