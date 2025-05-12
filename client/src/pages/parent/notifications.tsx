import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Info,
  CheckCheck
} from 'lucide-react';

export default function ParentNotificationsPage() {
  const { user } = useAuth();
  
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });
  
  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    await apiRequest('POST', `/api/notifications/${notificationId}/read`, {});
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    await apiRequest('POST', '/api/notifications/read-all', {});
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };
  
  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return {};
    
    const groups: Record<string, any[]> = {
      today: [],
      yesterday: [],
      earlier: []
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.timestamp);
      notificationDate.setHours(0, 0, 0, 0);
      
      if (notificationDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });
    
    return groups;
  }, [notifications]);
  
  // Count unread notifications
  const unreadCount = React.useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bus_update':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'student_check_in':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'incident':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'announcement':
        return <Info className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['parent']}>
      <Helmet>
        <title>Notifications - ShuttleMate</title>
        <meta name="description" content="Stay informed with real-time notifications about your child's school transportation." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bus_update">Bus Updates</TabsTrigger>
            <TabsTrigger value="student_check_in">Check-ins</TabsTrigger>
            <TabsTrigger value="announcement">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              {isLoading ? (
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-24 bg-gray-200 rounded"></div>
                      <div className="h-24 bg-gray-200 rounded"></div>
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              ) : (
                Object.entries(groupedNotifications).map(([period, notifs]) => (
                  notifs.length > 0 && (
                    <div key={period}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 uppercase">{period}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {notifs.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`flex items-start p-4 rounded-lg ${!notification.read ? 'bg-blue-50' : 'bg-gray-50'}`}
                          >
                            <div className="mr-4">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.timestamp, true)}
                                </span>
                              </div>
                              <p className="text-gray-700">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </div>
                  )
                ))
              )}
              
              {!isLoading && Object.values(groupedNotifications).every(group => group.length === 0) && (
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
                    <p className="text-gray-500">You don't have any notifications yet.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
          
          {['bus_update', 'student_check_in', 'announcement'].map((type) => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-gray-200 rounded"></div>
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      {Object.values(groupedNotifications)
                        .flat()
                        .filter(notification => notification.type === type)
                        .map(notification => (
                          <div 
                            key={notification.id}
                            className={`flex items-start p-4 rounded-lg mb-4 ${!notification.read ? 'bg-blue-50' : 'bg-gray-50'}`}
                          >
                            <div className="mr-4">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.timestamp, true)}
                                </span>
                              </div>
                              <p className="text-gray-700">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      
                      {Object.values(groupedNotifications)
                        .flat()
                        .filter(notification => notification.type === type).length === 0 && (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 text-gray-300 mx-auto mb-4">
                            {getNotificationIcon(type)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No {type.replace('_', ' ')} notifications</h3>
                          <p className="text-gray-500">You don't have any {type.replace('_', ' ')} notifications yet.</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardShell>
  );
}
