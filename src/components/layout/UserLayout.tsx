// src/components/layout/UserLayout.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  Code,
  BookOpen,
  FolderOpen,
  TrendingUp,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { roleUtils } from '@/lib/utils/auth';
import { stringUtils } from '@/lib/utils/common';

interface UserLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Overview and stats'
  },
  {
    id: 'questions',
    label: 'Questions',
    icon: BookOpen,
    href: '/questions',
    description: 'Browse problems'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: FolderOpen,
    href: '/categories',
    description: 'Topic categories'
  },
  {
    id: 'compiler',
    label: 'Compiler',
    icon: Code,
    href: '/compiler',
    description: 'Code editor'
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    href: '/userprogress',
    description: 'Track your growth'
  }
];

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved sidebar state
  useEffect(() => {
    if (!isMobile) {
      const savedCollapsed = localStorage.getItem('userSidebarCollapsed');
      if (savedCollapsed !== null) {
        setIsCollapsed(JSON.parse(savedCollapsed));
      }
    }
  }, [isMobile]);

  // Save sidebar state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('userSidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActiveRoute = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64`
          : `relative transition-all duration-300 ease-in-out ${sidebarWidth}`
        }
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AlgoArena
              </h1>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? (
              isMobileOpen ? <X size={20} /> : <Menu size={20} />
            ) : (
              isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 group
                  ${active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon 
                  size={20} 
                  className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} 
                />
                
                {(!isCollapsed || isMobile) && (
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Link */}
        {isAdmin() && (
          <div className="px-4 py-2">
            <button
              onClick={() => handleNavigation('/admin')}
              className="w-full flex items-center px-3 py-2 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              title={isCollapsed ? 'Admin Panel' : ''}
            >
              <User size={18} className="flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-3 font-medium">Admin Panel</span>
              )}
            </button>
          </div>
        )}

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                {stringUtils.getInitials(user.name)}
              </div>
            )}
            
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {roleUtils.formatRole(user.role)}
                </div>
              </div>
            )}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              <span>Logout</span>
            </button>
          )}
          
          {isCollapsed && !isMobile && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}