import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  LogOut,
  Home,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  // Links based on user role
  const getLinks = (): SidebarLink[] => {
    if (!user) return [];

    const commonLinks = [
      { href: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    ];

    switch (user.role) {
      case 'parent':
        return [
          ...commonLinks,
          { 
            href: '/tracking', 
            label: 'Bus Tracking', 
            icon: <MapPin className="h-5 w-5" /> 
          },
          { 
            href: '/messages', 
            label: 'Messages', 
            icon: <MessageSquare className="h-5 w-5" /> 
          },
          { 
            href: '/notifications', 
            label: 'Notifications', 
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
          ...commonLinks,
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
            label: 'Messages', 
            icon: <MessageSquare className="h-5 w-5" /> 
          },
          { 
            href: '/incidents', 
            label: 'Incidents', 
            icon: <AlertTriangle className="h-5 w-5" /> 
          },
          { 
            href: '/emergency', 
            label: 'Emergency', 
            icon: <AlertTriangle className="h-5 w-5 text-red-500" /> 
          },
        ];
      case 'admin':
        return [
          ...commonLinks,
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
            href: '/routes', 
            label: 'Routes', 
            icon: <Route className="h-5 w-5" /> 
          },
          { 
            href: '/reports', 
            label: 'Reports', 
            icon: <BarChart3 className="h-5 w-5" /> 
          },
        ];
      default:
        return commonLinks;
    }
  };

  const links = getLinks();

  const handleLogout = () => {
    // Redirects to the server's logout endpoint
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className={cn("hidden md:block w-64 bg-white border-r border-gray-200", className)}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("hidden md:block w-64 bg-white border-r border-gray-200", className)}>
      <div className="flex flex-col h-full">
        <div className="py-6 px-3 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(link.href) ? "bg-royal-blue text-white" : "text-gray-700"
                )}
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </Button>
            </Link>
          ))}
        </div>
        
        <div className="mt-auto p-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
