import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Settings,
  Bus,
  UserCheck,
  BarChart3
} from 'lucide-react'

const Sidebar = ({ userRole }) => {
  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin-dashboard' },
          { icon: Users, label: 'User Management', path: '/admin-dashboard/users' },
          { icon: Bus, label: 'Fleet Management', path: '/admin-dashboard/fleet' },
          { icon: Calendar, label: 'Trip Planning', path: '/admin-dashboard/trips' },
          { icon: BarChart3, label: 'Reports', path: '/admin-dashboard/reports' },
          { icon: MessageCircle, label: 'Messages', path: '/admin-dashboard/messages' },
          { icon: Settings, label: 'Settings', path: '/admin-dashboard/settings' },
        ]
      case 'driver':
        return [
          { icon: Home, label: 'Dashboard', path: '/driver-dashboard' },
          { icon: MapPin, label: 'My Routes', path: '/driver-dashboard/routes' },
          { icon: UserCheck, label: 'Attendance', path: '/driver-dashboard/attendance' },
          { icon: MessageCircle, label: 'Messages', path: '/driver-dashboard/messages' },
          { icon: Settings, label: 'Settings', path: '/driver-dashboard/settings' },
        ]
      case 'parent':
        return [
          { icon: Home, label: 'Dashboard', path: '/parent-dashboard' },
          { icon: MapPin, label: 'Track Bus', path: '/parent-dashboard/tracking' },
          { icon: Calendar, label: 'Schedule', path: '/parent-dashboard/schedule' },
          { icon: MessageCircle, label: 'Messages', path: '/parent-dashboard/messages' },
          { icon: Settings, label: 'Settings', path: '/parent-dashboard/settings' },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="bg-white shadow-sm h-full w-64 fixed left-0 top-16 border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar