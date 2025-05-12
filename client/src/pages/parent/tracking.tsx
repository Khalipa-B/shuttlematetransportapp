import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import BusMap from '@/components/bus-tracking/bus-map';
import BusStatus from '@/components/bus-tracking/bus-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet';
import { TripLocation } from '@shared/schema';

export default function ParentTrackingPage() {
  const { user } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<TripLocation | null>(null);

  // Fetch active trips for the parent's children
  const {
    data: activeTrips,
    isLoading: isLoadingTrips
  } = useQuery({
    queryKey: ['/api/parent/active-trips'],
    enabled: !!user,
  });

  // Fetch the parent's children
  const {
    data: children,
    isLoading: isLoadingChildren
  } = useQuery({
    queryKey: ['/api/parent/children'],
    enabled: !!user,
  });

  // Set default selections when data loads
  useEffect(() => {
    if (activeTrips?.length && !selectedTripId) {
      setSelectedTripId(activeTrips[0].id);
    }
    
    if (children?.length && !selectedStudentId) {
      setSelectedStudentId(children[0].id);
    }
  }, [activeTrips, children, selectedTripId, selectedStudentId]);

  // Handle map location updates
  const handleLocationUpdate = (location: TripLocation) => {
    setLastLocation(location);
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['parent']}>
      <Helmet>
        <title>Bus Tracking - ShuttleMate</title>
        <meta name="description" content="Track your child's school bus in real-time with ShuttleMate's GPS tracking system." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bus Tracking</h1>
          {activeTrips?.length > 0 && (
            <div className="flex space-x-2">
              {activeTrips.map((trip: any) => (
                <Badge 
                  key={trip.id} 
                  variant={selectedTripId === trip.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  {trip.direction === 'to_school' ? 'To School' : 'From School'}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoadingTrips || isLoadingChildren ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            <div className="lg:col-span-2 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        ) : activeTrips?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-[500px]">
              <BusMap 
                tripId={selectedTripId || undefined}
                showRoute={true}
                showStops={true}
                showSchool={true}
                showHome={true}
                onBusLocationUpdate={handleLocationUpdate}
              />
            </div>
            
            <BusStatus 
              tripId={selectedTripId || undefined}
              studentId={selectedStudentId || undefined}
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-royal-blue">No Active Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                There are currently no active bus trips for your children. When a bus trip starts, you'll be able to track it here in real-time.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-royal-blue mb-2">Next Scheduled Trips:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Morning pickup: 7:30 AM</li>
                  <li>Afternoon drop-off: 3:15 PM</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTrips?.length > 0 && (
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Today's Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTripId && lastLocation ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-green-600">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Bus is active and being tracked</p>
                        <p className="text-sm">Last updated: {new Date(lastLocation.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    {children?.map((child: any) => (
                      <div 
                        key={child.id} 
                        className="flex items-center"
                        onClick={() => setSelectedStudentId(child.id)}
                      >
                        <div className={`p-2 rounded-full mr-3 ${selectedStudentId === child.id ? 'bg-royal-blue' : 'bg-gray-100'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${selectedStudentId === child.id ? 'text-white' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{child.firstName} {child.lastName}</p>
                          <p className="text-sm text-gray-600">Grade {child.grade}</p>
                        </div>
                        <div className="ml-auto">
                          <Badge className={child.status === 'checked_in' ? 'bg-green-500' : 'bg-gray-300'}>
                            {child.status === 'checked_in' ? 'ON BUS' : 'NOT BOARDED'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No journey data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
