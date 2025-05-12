import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'wouter';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import Logo from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, User } from 'lucide-react';

interface HeaderProps {
  openMobileMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ openMobileMenu }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Redirects to the server's logout endpoint
    window.location.href = '/api/logout';
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return '';
    
    switch (user.role) {
      case 'parent':
        return 'Parent';
      case 'driver':
        return 'Driver';
      case 'admin':
        return 'Admin';
      default:
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between h-16">
      <div className="flex items-center">
        <Logo size="md" />
      </div>
      
      <div className="flex items-center">
        {isAuthenticated ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-2">
                  <UserAvatar 
                    src={user?.profileImageUrl ?? undefined} 
                    name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    size="sm"
                  />
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-semibold text-left">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">{getUserRoleDisplay()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button onClick={() => navigate('/login')}>Log in</Button>
        )}
      </div>
    </header>
  );
};

export default Header;
