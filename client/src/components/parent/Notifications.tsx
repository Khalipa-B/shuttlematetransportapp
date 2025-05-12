import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Calendar, 
  Info, 
  Trash,
  Loader2
} from 'lucide-react';
import { formatDate, timeAgo } from '@/lib/utils';
import { Notification } from '@shared/schema';

// Function to get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'student_boarding':
    case 'student_exiting':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'bus_delay':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'emergency':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'chat_message':
      return <MessageSquare className="h-5 w-5 text-royal-blue" />;
    case 'schedule_change':
      return <Calendar className="h-5 w-5 text-purple-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationsList: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  // Query to get notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PUT', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/notifications/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    if (!notifications) return {};

    // Apply filters
    const filteredNotifications = filter === 'all' 
      ? notifications 
      : notifications.filter(notif => notif.type.includes(filter));

    // Group by date
    return filteredNotifications.reduce((groups, notification) => {
      const date = new Date(notification.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {} as Record<string, Notification[]>);
  }, [notifications, filter]);

  // Get sorted dates for display
  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedNotifications).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedNotifications]);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-royal-blue animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'bus_delay' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('bus_delay')}
          >
            Bus Updates
          </Button>
          <Button
            variant={filter === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('student')}
          >
            Student
          </Button>
          <Button
            variant={filter === 'schedule' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('schedule')}
          >
            Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                {date === new Date().toDateString() ? 'TODAY' : formatDate(date)}
              </h3>
              
              <div className="space-y-4">
                {groupedNotifications[date].map(notification => (
                  <div 
                    key={notification.id} 
                    className={`bg-white border-l-4 p-4 rounded-r-lg flex items-start relative group ${
                      notification.read 
                        ? 'border-gray-300 bg-gray-50' 
                        : notification.type === 'emergency'
                          ? 'border-red-500 bg-red-50'
                          : 'border-royal-blue bg-blue-50'
                    }`}
                  >
                    <div className={`rounded-full p-2 mr-3 ${
                      notification.type === 'emergency' 
                        ? 'bg-red-100' 
                        : notification.type.includes('student')
                          ? 'bg-green-100'
                          : 'bg-royal-blue bg-opacity-10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="font-semibold text-gray-800">{notification.title}</p>
                        <span className="text-xs text-gray-500">{timeAgo(notification.timestamp)}</span>
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 text-royal-blue hover:text-royal-blue/80 p-0 h-auto text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsList;
