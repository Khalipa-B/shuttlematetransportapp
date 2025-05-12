import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unread-notifications'] });
    }
  });

  // Mark selected notifications as read
  const markSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsReadMutation.mutateAsync(id);
    }
    setSelectedNotifications([]);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const filteredNotifications = selectedTab === 'all' 
    ? notifications 
    : selectedTab === 'unread' 
      ? notifications.filter((n: any) => !n.isRead)
      : notifications.filter((n: any) => n.type === selectedTab);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="mr-3 h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="ml-3 bg-accent text-primary">{unreadCount} unread</Badge>
            )}
          </div>
          
          {selectedNotifications.length > 0 && (
            <Button 
              variant="outline" 
              onClick={markSelectedAsRead}
              disabled={markAsReadMutation.isPending}
            >
              Mark {selectedNotifications.length} as read
            </Button>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="warning" className="hidden md:block">Warning</TabsTrigger>
            <TabsTrigger value="error" className="hidden md:block">Error</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No notifications</h3>
                    <p className="text-muted-foreground">
                      {selectedTab === 'unread' 
                        ? "You've read all your notifications" 
                        : "You don't have any notifications yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification: any) => (
                      <div 
                        key={notification.id} 
                        className={`flex items-start p-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <Checkbox 
                          id={`select-${notification.id}`}
                          className="mr-3 mt-1"
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => handleCheckboxChange(notification.id)}
                        />
                        <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{notification.title}</h3>
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
