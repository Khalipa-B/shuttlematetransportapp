import React, { ReactNode, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth, useUserRole } from '@/hooks/useAuth';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Menu, 
  X, 
  MapPin, 
  MessageSquare, 
  User, 
  Home, 
  Users, 
  Truck, 
  BarChart3, 
  Map, 
  AlertTriangle, 
  FileText, 
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { role, isParent, isDriver, isAdmin } = useUserRole();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Define navigation items based on user role
  const navigationItems = [
    // Parent navigation
    ...(isParent ? [
      { name: 'Bus Tracking', href: '/dashboard', icon: MapPin },
      { name: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ] : []),
    
    // Driver navigation
    ...(isDriver ? [
      { name: 'Student Check-In', href: '/dashboard', icon: Users },
      { name: 'Route', href: '/dashboard/route', icon: Map },
      { name: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Report Incident', href: '/dashboard/incident', icon: FileText },
      { name: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle },
    ] : []),
    
    // Admin navigation
    ...(isAdmin ? [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Buses', href: '/dashboard/buses', icon: Truck },
      { name: 'Drivers', href: '/dashboard/drivers', icon: User },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Routes', href: '/dashboard/routes', icon: Map },
      { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    ] : []),
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Role name for display
  const roleName = role?.charAt(0).toUpperCase() + role?.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex-shrink-0">
                  <Logo size="small" />
                </a>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName} ({roleName})
              </div>
              
              <div className="relative ml-4">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-royal-blue text-white flex items-center justify-center">
                    {user?.firstName ? user.firstName[0] : '?'}
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    onBlur={() => setProfileMenuOpen(false)}
                  >
                    <div className="py-1">
                      <Link href="/dashboard/profile">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Profile Settings
                        </a>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pt-2 pb-3 border-b border-gray-200">
          <div className="px-2 space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                    location === item.href 
                      ? "bg-royal-blue text-white" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-royal-blue text-white flex items-center justify-center">
                  {user?.firstName ? user.firstName[0] : '?'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-2 space-y-1 divide-y">
                <div className="space-y-1 pb-2">
                  {navigationItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a 
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                          location === item.href 
                            ? "bg-royal-blue text-white" 
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <LogOut className="mr-3 h-6 w-6" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-10">
          <div className="grid grid-cols-5 h-16">
            {navigationItems.slice(0, 5).map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium",
                  location === item.href
                    ? "text-royal-blue"
                    : "text-gray-500 hover:text-gray-700"
                )}>
                  <item.icon className="h-6 w-6 mb-1" />
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
