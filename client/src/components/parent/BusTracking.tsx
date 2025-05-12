import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import MapDisplay from "@/components/shared/MapDisplay";
import { formatTimeString } from "@/lib/mapUtils";

interface BusTrackingProps {
  routeId: number;
  busId?: number;
  routeName?: string;
}

export default function BusTracking({ routeId, busId, routeName }: BusTrackingProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch the bus location for this route
  const {
    data: location,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: [`/api/parent/bus-location/${routeId}`, refreshKey],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch route stops
  const { data: stops = [] } = useQuery({
    queryKey: [`/api/driver/route/${routeId}/stops`],
    enabled: !!routeId
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const [timeAgo, setTimeAgo] = useState("");

  // Update the "time ago" text
  useEffect(() => {
    if (!dataUpdatedAt) return;

    const updateTimeAgo = () => {
      const now = Date.now();
      const seconds = Math.floor((now - dataUpdatedAt) / 1000);
      
      if (seconds < 60) {
        setTimeAgo("Just now");
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)} min${Math.floor(seconds / 60) !== 1 ? 's' : ''} ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)} hr${Math.floor(seconds / 3600) !== 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 60000);
    
    return () => clearInterval(intervalId);
  }, [dataUpdatedAt]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Live Bus Tracking</CardTitle>
          {routeName && <Badge variant="outline">{routeName}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
            <p className="text-muted-foreground">Loading bus location...</p>
          </div>
        ) : isError ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center bg-red-50 rounded-lg">
            <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="font-bold text-destructive">Unable to load bus location</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              {(error as Error)?.message || "Please try again later."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : location ? (
          <>
            <MapDisplay
              latitude={location.latitude}
              longitude={location.longitude}
              busMarkers={[{
                id: location.busId,
                latitude: location.latitude,
                longitude: location.longitude,
                status: 'active'
              }]}
              stops={stops}
              showRoute={true}
              height="300px"
              onRefresh={handleRefresh}
            />
            <div className="mt-4 flex justify-between items-center">
              <div>
                <div className="flex items-center text-success">
                  <Clock className="h-4 w-4 mr-1" />
                  <p className="text-sm">
                    Bus is {location.isActive ? "on schedule" : "off schedule"}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Last updated: {timeAgo}</p>
              </div>
              <Button
                className="bg-primary hover:bg-secondary text-white"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
            <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3">
              <Map className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold">No tracking data available</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              The bus may not be on route right now or tracking is disabled.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
