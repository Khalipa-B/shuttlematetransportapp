import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  MapPin,
  MessageSquare,
  Bell,
  User,
  Users,
  Map,
  AlertTriangle,
  BarChart3,
  Bus,
  Briefcase,
  Route,
  Home,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  className?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ className }) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  // Items based on user role
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'parent':
        return [
          { 
            href: '/', 
            label: 'Home', 
            icon: <Home className="h-5 w-5" /> 
          },
          { 
            href: '/tracking', 
            label: 'Tracking', 
            icon: <MapPin className="h-5 w-5" /> 
          },
          { 
            href: '/messages', 
            label: 'Chat', 
            icon: <MessageSquare className="h-5 w-5" /> 
          },
          { 
            href: '/notifications', 
            label: 'Alerts', 
            icon: <Bell className="h-5 w-5" /> 
          },
          { 
            href: '/profile', 
            label: 'Profile', 
            icon: <User className="h-5 w-5" /> 
          },
        ];
      case 'driver':
        return [
          { 
            href: '/students', 
            label: 'Students', 
            icon: <Users className="h-5 w-5" /> 
          },
          { 
            href: '/route', 
            label: 'Route', 
            icon: <Map className="h-5 w-5" /> 
          },
          { 
            href: '/messages', 
            label: 'Chat', 
            icon: <MessageSquare className="h-5 w-5" /> 
          },
          { 
            href: '/incidents', 
            label: 'Report', 
            icon: <AlertTriangle className="h-5 w-5" /> 
          },
          { 
            href: '/emergency', 
            label: 'Emergency', 
            icon: <AlertTriangle className="h-5 w-5" /> 
          },
        ];
      case 'admin':
        return [
          { 
            href: '/dashboard', 
            label: 'Overview', 
            icon: <BarChart3 className="h-5 w-5" /> 
          },
          { 
            href: '/buses', 
            label: 'Buses', 
            icon: <Bus className="h-5 w-5" /> 
          },
          { 
            href: '/drivers', 
            label: 'Drivers', 
            icon: <Briefcase className="h-5 w-5" /> 
          },
          { 
            href: '/users', 
            label: 'Users', 
            icon: <Users className="h-5 w-5" /> 
          },
          { 
            href: '/reports', 
            label: 'Reports', 
            icon: <BarChart3 className="h-5 w-5" /> 
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (!user || !navItems.length) {
    return null;
  }

  return (
    <nav className={cn("md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50", className)}>
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={cn(
              "flex flex-col items-center py-2",
              isActive(item.href) 
                ? "text-royal-blue" 
                : "text-gray-600 hover:text-royal-blue"
            )}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
