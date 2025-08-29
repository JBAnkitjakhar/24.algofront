// src/app/admin/categories/page.tsx - Categories management placeholder
'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { TagIcon } from '@heroicons/react/24/outline';

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Categories Management</h2>
          <p className="mt-2 text-gray-600">
            This section will be implemented in Phase 3.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Youll be able to create and manage question categories here.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}