import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import ShuttleMateLogo from "../icons/ShuttleMateLogo";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Bell, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function AppLayout({ children, showSidebar = false }: AppLayoutProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/unread-notifications'],
    enabled: !!user,
  });

  const unreadCount = notifications.length;

  // Get title based on user role
  const getTitle = () => {
    if (user?.role === UserRole.PARENT) {
      return "Parent Dashboard";
    } else if (user?.role === UserRole.DRIVER) {
      return "Driver Dashboard";
    } else if (user?.role === UserRole.ADMIN) {
      return "Admin Dashboard";
    } else {
      return "ShuttleMate";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          {showSidebar && (
            <button 
              className="mr-3 block md:hidden" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <ShuttleMateLogo className="h-10 mr-2" />
          <h1 className="text-xl font-bold hidden sm:block">{getTitle()}</h1>
        </div>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative">
              <Bell className="h-6 w-6 cursor-pointer" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-400 text-primary font-bold text-xs">
                  {unreadCount}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-center text-primary font-medium"
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-secondary text-white">
                  {user?.firstName?.[0] || user?.email?.[0] || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${user?.role}/profile`)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu */}
      {showSidebar && (
        <MobileNav 
          isOpen={isMobileMenuOpen} 
          onClose={toggleMobileMenu} 
          userRole={user?.role as string}
        />
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar (Desktop) */}
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar userRole={user?.role as string} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 pb-20 ${showSidebar ? 'md:ml-64' : ''}`}>
          {!showSidebar && user && (
            <div className="px-4 py-6">
              <h2 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user.firstName || 'there'}!
              </h2>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
