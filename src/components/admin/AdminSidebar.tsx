// src/components/admin/AdminSidebar.tsx - Navigation sidebar
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  UsersIcon, 
  QuestionMarkCircleIcon,
  LightBulbIcon,
  TagIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChartPieIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES, ROUTES } from '@/constants';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface AdminSidebarProps {
  isSuperAdmin: boolean;
}

export default function AdminSidebar({ isSuperAdmin }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation: SidebarItem[] = [
    { name: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: HomeIcon },
    { name: 'Analytics', href: ADMIN_ROUTES.ANALYTICS, icon: ChartPieIcon },
    { name: 'Questions', href: ADMIN_ROUTES.QUESTIONS, icon: QuestionMarkCircleIcon },
    { name: 'Solutions', href: ADMIN_ROUTES.SOLUTIONS, icon: LightBulbIcon },
    { name: 'Categories', href: ADMIN_ROUTES.CATEGORIES, icon: TagIcon },
    { name: 'Users', href: ADMIN_ROUTES.USERS, icon: UsersIcon },
    ...(isSuperAdmin ? [
      { name: 'Settings', href: ADMIN_ROUTES.SETTINGS, icon: Cog6ToothIcon },
    ] : []),
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <Link href={ROUTES.HOME} className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-6 w-6',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Dashboard Link */}
        <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200">
          <Link
            href={ROUTES.DASHBOARD}
            className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ChartBarIcon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}