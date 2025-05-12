import React, { ReactNode } from 'react';
import { useAuth, useUserRole } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'parent' | 'driver' | 'admin';
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes that require authentication
 * Can optionally require specific user roles
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  
  const isLoading = authLoading || (isAuthenticated && roleLoading);
  
  // If checking auth/role, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-royal-blue animate-spin" />
        <span className="ml-2 text-xl text-royal-blue">Loading...</span>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }
  
  // If role is required but user doesn't have it
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access this page. This area is restricted to {requiredRole} users.</p>
          <a 
            href="/dashboard" 
            className="bg-royal-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }
  
  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default AuthGuard;
