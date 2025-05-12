import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, Loader2, Clock, Map } from "lucide-react";
import MapDisplay from "@/components/shared/MapDisplay";
import { formatTimeString } from "@/lib/mapUtils";
import { Link } from "wouter";

interface RouteDisplayProps {
  busId: number;
  routeId?: number;
}

export default function RouteDisplay({ busId, routeId }: RouteDisplayProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch bus location
  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: [`/api/driver/bus/${busId}/location`, refreshKey],
    refetchInterval: 60000, // Refresh every minute
    enabled: !!busId,
  });

  // Fetch routes for this bus
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: [`/api/driver/routes?busId=${busId}`],
    enabled: !!busId,
  });

  // If routeId is provided, fetch that specific route
  const currentRoute = routeId 
    ? routes.find((r: any) => r.id === routeId) 
    : routes[0];

  // Fetch stops for the current route
  const { data: stops = [], isLoading: isLoadingStops } = useQuery({
    queryKey: [`/api/driver/route/${currentRoute?.id}/stops`],
    enabled: !!currentRoute?.id,
  });

  const isLoading = isLoadingLocation || isLoadingRoutes || isLoadingStops;

  // Get route status
  const getRouteStatus = () => {
    if (!currentRoute) return { label: "Unknown", class: "bg-gray-400 text-white" };
    
    if (!currentRoute.isActive) {
      return { label: "Inactive", class: "bg-gray-400 text-white" };
    }
    
    const now = new Date();
    const startTime = new Date();
    const [startHours, startMinutes] = currentRoute.startTime.split(':').map(Number);
    startTime.setHours(startHours, startMinutes, 0);
    
    const endTime = new Date();
    const [endHours, endMinutes] = currentRoute.endTime.split(':').map(Number);
    endTime.setHours(endHours, endMinutes, 0);
    
    if (now < startTime) {
      return { label: "Scheduled", class: "bg-accent text-primary" };
    } else if (now > endTime) {
      return { label: "Completed", class: "bg-success text-white" };
    } else {
      return { label: "In Progress", class: "bg-success bg-opacity-10 text-success" };
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Current Route</CardTitle>
          {currentRoute && (
            <Badge className={getRouteStatus().class}>{getRouteStatus().label}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 mr-2 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        ) : !currentRoute ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No route assigned</h3>
            <p className="text-muted-foreground mt-1">
              There are no routes assigned to this bus yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <Clock className="text-primary mr-2" />
              <div>
                <p className="font-semibold">{currentRoute.name}</p>
                <p className="text-sm text-gray-600">
                  {formatTimeString(currentRoute.startTime)} - {formatTimeString(currentRoute.endTime)}
                </p>
              </div>
            </div>
            
            <MapDisplay
              latitude={location?.latitude || stops[0]?.latitude || "40.7128"}
              longitude={location?.longitude || stops[0]?.longitude || "-74.0060"}
              stops={stops}
              busMarkers={location ? [{
                id: busId,
                latitude: location.latitude,
                longitude: location.longitude,
                status: 'active'
              }] : []}
              showRoute={true}
              height="300px"
              onRefresh={handleRefresh}
            />
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => {
                  // In a real app, this would open the navigation app on the driver's device
                  // with the route pre-loaded. For this example, we'll just show a message.
                  alert("This would open navigation with the route loaded");
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>
              
              <Link href="/driver/report-incident">
                <Button
                  variant="warning"
                  className="flex items-center"
                >
                  Report Issue
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
