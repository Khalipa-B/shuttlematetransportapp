import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import ChildStatus from "@/components/parent/ChildStatus";
import BusTracking from "@/components/parent/BusTracking";
import NotificationList from "@/components/parent/NotificationList";
import MobileNavBar from "@/components/shared/MobileNavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, CalendarClock, Map, Phone } from "lucide-react";
import { Link } from "wouter";
import { UserRole } from "@shared/schema";

export default function ParentDashboard() {
  const { user } = useAuth();

  // Fetch parent profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/parent/profile'],
    enabled: !!user,
  });

  // Fetch children
  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ['/api/parent/children'],
    enabled: !!user,
  });

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        {isLoadingProfile ? (
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{getGreeting()}, {profile?.user?.firstName || user?.firstName || "there"}!</h2>
            <p className="text-gray-600">Track your child's bus journey in real-time</p>
          </div>
        )}

        {/* Child Status Cards */}
        {isLoadingChildren ? (
          <ChildStatus 
            child={{
              id: 0,
              firstName: "",
              lastName: "",
              grade: "",
              school: ""
            }}
            isLoading={true}
          />
        ) : children.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">No children registered</h3>
              <p className="text-gray-600 mb-4">
                You don't have any children registered in the system yet.
              </p>
              <Button variant="outline">Contact School Admin</Button>
            </CardContent>
          </Card>
        ) : (
          children.map((child: any) => (
            <ChildStatus 
              key={child.id}
              child={child}
              attendance={child.attendance}
              route={child.route}
            />
          ))
        )}

        {/* Live Bus Tracking */}
        {children.length > 0 && children[0].routeId && (
          <BusTracking 
            routeId={children[0].routeId} 
            routeName={children[0].route?.name} 
          />
        )}

        {/* Recent Notifications */}
        <div className="mt-6">
          <NotificationList />
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/parent/messages">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-auto py-4 w-full hover:bg-gray-100"
                >
                  <MessageSquare className="text-primary text-2xl mb-2" />
                  <span className="text-sm font-semibold">Message Driver</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-4 hover:bg-gray-100"
              >
                <CalendarClock className="text-primary text-2xl mb-2" />
                <span className="text-sm font-semibold">Absence Notice</span>
              </Button>
              <Link href="/parent/tracking">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-auto py-4 w-full hover:bg-gray-100"
                >
                  <Map className="text-primary text-2xl mb-2" />
                  <span className="text-sm font-semibold">Bus Schedule</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-4 hover:bg-gray-100"
              >
                <Phone className="text-primary text-2xl mb-2" />
                <span className="text-sm font-semibold">Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.PARENT} />
    </AppLayout>
  );
}
