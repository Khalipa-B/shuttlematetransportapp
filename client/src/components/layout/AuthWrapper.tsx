import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { UserRole } from "@shared/schema";
import { useEffect } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthWrapper({ children, allowedRoles }: AuthWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isLoading && !isAuthenticated && location !== "/login") {
      setLocation("/login");
      return;
    }

    // If authenticated but on login page, redirect based on role
    if (!isLoading && isAuthenticated && location === "/login") {
      if (user?.role === UserRole.PARENT) {
        setLocation("/parent/dashboard");
      } else if (user?.role === UserRole.DRIVER) {
        setLocation("/driver/dashboard");
      } else if (user?.role === UserRole.ADMIN) {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/");
      }
      return;
    }

    // Check for role-based access
    if (!isLoading && isAuthenticated && allowedRoles && user?.role) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === UserRole.PARENT) {
          setLocation("/parent/dashboard");
        } else if (user.role === UserRole.DRIVER) {
          setLocation("/driver/dashboard");
        } else if (user.role === UserRole.ADMIN) {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, location, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
