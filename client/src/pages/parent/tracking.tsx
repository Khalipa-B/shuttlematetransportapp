import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@shared/schema";
import BusTracking from "@/components/parent/BusTracking";
import MapDisplay from "@/components/shared/MapDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeString } from "@/lib/mapUtils";

export default function ParentTracking() {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  // Fetch children
  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ['/api/parent/children'],
    enabled: !!user,
  });

  // Setting the first child as selected by default when data loads
  if (children.length > 0 && selectedChild === null) {
    setSelectedChild(children[0].id);
  }

  // Get the currently selected child's data
  const currentChild = selectedChild 
    ? children.find((child: any) => child.id === selectedChild) 
    : children[0];

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Bus Tracking</h2>
          <p className="text-gray-600">Track your child's bus location and schedule in real-time</p>
        </div>

        {isLoadingChildren ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">No children registered</h3>
              <p className="text-gray-600">
                You don't have any children registered in the system yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Child Selector Tabs */}
            {children.length > 1 && (
              <Tabs 
                value={selectedChild?.toString() || children[0].id.toString()}
                onValueChange={(value) => setSelectedChild(parseInt(value))}
                className="mb-6"
              >
                <TabsList className="w-full">
                  {children.map((child: any) => (
                    <TabsTrigger 
                      key={child.id} 
                      value={child.id.toString()}
                      className="flex-1"
                    >
                      {child.firstName} {child.lastName}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {/* Live Bus Tracking */}
            {currentChild?.routeId ? (
              <BusTracking 
                routeId={currentChild.routeId}
                routeName={currentChild.route?.name}
              />
            ) : (
              <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-bold mb-2">No route assigned</h3>
                  <p className="text-gray-600">
                    This child doesn't have a route assigned yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Route Information */}
            {currentChild?.route && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Route Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Route Name:</span>
                      <span className="font-semibold">{currentChild.route.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Bus Number:</span>
                      <span className="font-semibold">
                        {currentChild.route.busNumber ? `Bus #${currentChild.route.busNumber}` : "Not assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Morning Pickup:</span>
                      <span className="font-semibold">{formatTimeString(currentChild.route.startTime)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Estimated Arrival:</span>
                      <span className="font-semibold">{formatTimeString(currentChild.route.endTime)}</span>
                    </div>
                    {currentChild.stop && (
                      <div className="flex justify-between pb-3">
                        <span className="text-gray-600">Pickup/Drop-off Stop:</span>
                        <span className="font-semibold">{currentChild.stop.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Show map with all stops */}
                  {currentChild.routeId && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Route Stops</h4>
                      <MapDisplay
                        latitude={currentChild.stop?.latitude || "40.7128"}
                        longitude={currentChild.stop?.longitude || "-74.0060"}
                        stops={currentChild.route.stops || []}
                        height="250px"
                        showRoute={true}
                      />
                      <div className="mt-3 text-sm text-gray-500">
                        {currentChild.stop && (
                          <p>Your child's stop is highlighted.</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.PARENT} />
    </AppLayout>
  );
}
