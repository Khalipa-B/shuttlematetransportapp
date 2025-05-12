import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface NotificationListProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function NotificationList({ limit = 3, showViewAll = true }: NotificationListProps) {
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    select: (data) => limit ? data.slice(0, limit) : data,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success mr-3" />;
      case 'warning':
        return <AlertTriangle className="text-warning mr-3" />;
      case 'error':
        return <AlertTriangle className="text-destructive mr-3" />;
      default:
        return <Info className="text-primary mr-3" />;
    }
  };

  // Format the timestamp to a readable format
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return "Just now";
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Recent Updates</CardTitle>
          {showViewAll && (
            <Link href="/notifications" className="text-primary text-sm">
              View all
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start p-3 bg-light rounded-lg">
                <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-muted-foreground">You don't have any notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className={`flex items-start p-3 ${!notification.isRead ? 'bg-blue-50' : 'bg-light'} rounded-lg`}
              >
                {getNotificationIcon(notification.type)}
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
