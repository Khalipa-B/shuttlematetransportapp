import { useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Home, 
  Map, 
  Bell, 
  MessageSquare, 
  User, 
  Bus, 
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };
  
  const routes = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Home', icon: Home },
        { path: '/login', label: 'Login', icon: User }
      ];
    }
    
    const userRole = user?.role || '';
    
    if (userRole === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/admin/drivers', label: 'Drivers', icon: Users },
        { path: '/admin/buses', label: 'Buses', icon: Bus },
        { path: '/notifications', label: 'Alerts', icon: Bell },
        { path: '/messages', label: 'Messages', icon: MessageSquare }
      ];
    }
    
    if (userRole === 'DRIVER') {
      return [
        { path: '/driver/dashboard', label: 'Dashboard', icon: Home },
        { path: '/driver/route', label: 'Route', icon: Map },
        { path: '/driver/students', label: 'Students', icon: Users },
        { path: '/notifications', label: 'Alerts', icon: Bell },
        { path: '/messages', label: 'Messages', icon: MessageSquare }
      ];
    }
    
    // Default to parent routes
    return [
      { path: '/parent/dashboard', label: 'Dashboard', icon: Home },
      { path: '/parent/track', label: 'Track', icon: Map },
      { path: '/parent/children', label: 'Children', icon: Users },
      { path: '/notifications', label: 'Alerts', icon: Bell },
      { path: '/messages', label: 'Messages', icon: MessageSquare }
    ];
  }, [isAuthenticated, user, location]);
  
  return (
    <nav className="mobile-bottom-nav safe-area-inset-bottom">
      {routes.map((route) => {
        const Icon = route.icon;
        return (
          <Link key={route.path} href={route.path}>
            <a className={cn(
              "mobile-bottom-nav-item",
              isActive(route.path) && "active"
            )}>
              <Icon 
                className={cn(
                  "h-6 w-6",
                  isActive(route.path) ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span className={cn(
                "text-xs",
                isActive(route.path) ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {route.label}
              </span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}