/**
 * This file defines the application routes based on user roles
 */

export interface RouteDefinition {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

// Parent Routes
export const parentRoutes: RouteDefinition[] = [
  {
    path: '/tracking',
    label: 'Bus Tracking',
    icon: 'map-pin',
    roles: ['parent']
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: 'message-square',
    roles: ['parent']
  },
  {
    path: '/notifications',
    label: 'Notifications',
    icon: 'bell',
    roles: ['parent']
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: 'user',
    roles: ['parent']
  }
];

// Driver Routes
export const driverRoutes: RouteDefinition[] = [
  {
    path: '/students',
    label: 'Students',
    icon: 'users',
    roles: ['driver']
  },
  {
    path: '/route',
    label: 'Route',
    icon: 'map',
    roles: ['driver']
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: 'message-square',
    roles: ['driver']
  },
  {
    path: '/incidents',
    label: 'Incidents',
    icon: 'alert-triangle',
    roles: ['driver']
  },
  {
    path: '/emergency',
    label: 'Emergency',
    icon: 'alert-octagon',
    roles: ['driver']
  }
];

// Admin Routes
export const adminRoutes: RouteDefinition[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'bar-chart-2',
    roles: ['admin']
  },
  {
    path: '/buses',
    label: 'Buses',
    icon: 'truck',
    roles: ['admin']
  },
  {
    path: '/drivers',
    label: 'Drivers',
    icon: 'briefcase',
    roles: ['admin']
  },
  {
    path: '/users',
    label: 'Users',
    icon: 'users',
    roles: ['admin']
  },
  {
    path: '/routes',
    label: 'Routes',
    icon: 'map',
    roles: ['admin']
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'file-text',
    roles: ['admin']
  }
];

// Helper function to get routes for a specific role
export const getRoutesByRole = (role: string): RouteDefinition[] => {
  switch (role) {
    case 'parent':
      return parentRoutes;
    case 'driver':
      return driverRoutes;
    case 'admin':
      return adminRoutes;
    default:
      return [];
  }
};

// Helper function to get the default route for a role
export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'parent':
      return '/tracking';
    case 'driver':
      return '/students';
    case 'admin':
      return '/dashboard';
    default:
      return '/';
  }
};
