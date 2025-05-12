import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from './header';
import Sidebar from './sidebar';
import MobileNav from './mobile-nav';
import { useLocation, useNavigate } from 'wouter';

interface DashboardShellProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const DashboardShell: React.FC<DashboardShellProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const navigate = useNavigate();

  // Redirect to login page if not authenticated and auth is required
  React.useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, requireAuth, isAuthenticated, navigate]);

  // Check if user has the required role
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case 'parent':
            navigate('/tracking');
            break;
          case 'driver':
            navigate('/students');
            break;
          case 'admin':
            navigate('/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, allowedRoles, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If specific roles are required but user doesn't have one of them, don't render children
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardShell;
