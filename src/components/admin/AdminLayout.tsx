// src/components/admin/AdminLayout.tsx - Layout wrapper for admin pages
'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function AdminLayout({ children, requireSuperAdmin = false }: AdminLayoutProps) {
  const { isSuperAdmin } = useAuth();

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar isSuperAdmin={isSuperAdmin()} />
        
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden md:pl-64">
          {/* Header */}
          <AdminHeader />
          
          {/* Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {requireSuperAdmin && !isSuperAdmin() ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-800">
                    <h3 className="text-lg font-medium mb-2">Access Denied</h3>
                    <p>This page requires Super Admin privileges.</p>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}