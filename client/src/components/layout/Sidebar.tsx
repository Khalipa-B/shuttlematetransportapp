import { useLocation } from "wouter";
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
  Settings 
} from "lucide-react";
import ShuttleMateLogo from "../icons/ShuttleMateLogo";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
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

  return (
    <aside className="w-64 bg-primary text-white h-screen fixed shadow-md">
      <div className="p-4 flex items-center border-b border-blue-800">
        <ShuttleMateLogo className="h-10 mr-2" variant="white" />
        <h1 className="text-xl font-bold">ShuttleMate</h1>
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
              navigate(item.href);
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
