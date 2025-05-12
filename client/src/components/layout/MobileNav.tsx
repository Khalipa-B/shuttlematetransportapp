import { UserRole } from "@shared/schema";
import { 
  LayoutDashboard, 
  Bus, 
  User, 
  Users, 
  School, 
  Map, 
  MessageSquare, 
  BarChart3, 
  Settings,
  X 
} from "lucide-react";
import { useLocation } from "wouter";
import ShuttleMateLogo from "../icons/ShuttleMateLogo";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function MobileNav({ isOpen, onClose, userRole }: MobileNavProps) {
  const [location, navigate] = useLocation();

  // Define navigation items based on user role
  const getNavItems = () => {
    if (userRole === UserRole.ADMIN) {
      return [
        { icon: <LayoutDashboard className="h-5 w-5 mr-3" />, label: "Dashboard", href: "/admin/dashboard" },
        { icon: <Bus className="h-5 w-5 mr-3" />, label: "Buses", href: "/admin/buses" },
        { icon: <User className="h-5 w-5 mr-3" />, label: "Drivers", href: "/admin/drivers" },
        { icon: <School className="h-5 w-5 mr-3" />, label: "Students", href: "/admin/students" },
        { icon: <Users className="h-5 w-5 mr-3" />, label: "Parents", href: "/admin/parents" },
        { icon: <Map className="h-5 w-5 mr-3" />, label: "Routes", href: "/admin/routes" },
        { icon: <MessageSquare className="h-5 w-5 mr-3" />, label: "Messages", href: "/admin/messages" },
        { icon: <BarChart3 className="h-5 w-5 mr-3" />, label: "Reports", href: "/admin/reports" },
        { icon: <Settings className="h-5 w-5 mr-3" />, label: "Settings", href: "/admin/settings" }
      ];
    } else if (userRole === UserRole.DRIVER) {
      return [
        { icon: <LayoutDashboard className="h-5 w-5 mr-3" />, label: "Dashboard", href: "/driver/dashboard" },
        { icon: <School className="h-5 w-5 mr-3" />, label: "Students", href: "/driver/students" },
        { icon: <MessageSquare className="h-5 w-5 mr-3" />, label: "Messages", href: "/driver/messages" },
        { icon: <User className="h-5 w-5 mr-3" />, label: "Profile", href: "/driver/profile" }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Handle navigation and close mobile menu
  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="bg-primary text-white w-64 h-full overflow-y-auto animate-slide-in-left">
        <div className="p-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center">
            <ShuttleMateLogo className="h-10 mr-2" variant="white" />
            <h1 className="text-xl font-bold">ShuttleMate</h1>
          </div>
          <button onClick={onClose} className="text-white" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center py-3 px-4 hover:bg-blue-800 transition-colors ${
                location === item.href ? "bg-blue-800" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
