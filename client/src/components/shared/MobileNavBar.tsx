import { Link, useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import { Home, Map, MessageSquare, User, Library, List } from "lucide-react";

interface MobileNavBarProps {
  userRole: string;
}

export default function MobileNavBar({ userRole }: MobileNavBarProps) {
  const [location] = useLocation();

  const getNavItems = () => {
    if (userRole === UserRole.PARENT) {
      return [
        { icon: <Home className="h-5 w-5" />, label: "Home", href: "/parent/dashboard" },
        { icon: <Map className="h-5 w-5" />, label: "Tracking", href: "/parent/tracking" },
        { icon: <MessageSquare className="h-5 w-5" />, label: "Messages", href: "/parent/messages" },
        { icon: <User className="h-5 w-5" />, label: "Profile", href: "/parent/profile" }
      ];
    } else if (userRole === UserRole.DRIVER) {
      return [
        { icon: <Home className="h-5 w-5" />, label: "Home", href: "/driver/dashboard" },
        { icon: <List className="h-5 w-5" />, label: "Students", href: "/driver/students" },
        { icon: <MessageSquare className="h-5 w-5" />, label: "Messages", href: "/driver/messages" },
        { icon: <User className="h-5 w-5" />, label: "Profile", href: "/driver/profile" }
      ];
    } else if (userRole === UserRole.ADMIN) {
      return [
        { icon: <Home className="h-5 w-5" />, label: "Home", href: "/admin/dashboard" },
        { icon: <Library className="h-5 w-5" />, label: "Buses", href: "/admin/buses" },
        { icon: <List className="h-5 w-5" />, label: "Routes", href: "/admin/routes" },
        { icon: <MessageSquare className="h-5 w-5" />, label: "Messages", href: "/admin/messages" }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 text-sm font-medium z-10">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={`flex flex-col items-center py-1 px-3 ${
            location === item.href 
              ? "text-primary" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
