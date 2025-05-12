import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import BusMap from '@/components/bus-tracking/bus-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/hooks/useTracking';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { Map, Navigation, Clock, AlertTriangle } from 'lucide-react';

export default function DriverRoutePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLocation, isTracking, startTracking, stopTracking, error } = useTracking();
  
  // Fetch active trip for driver
  const { 
    data: activeTrip,
    isLoading: isLoadingTrip
  } = useQuery({
    queryKey: ['/api/trips/active'],
    enabled: !!user,
  });
  
  // Fetch stops for the active trip
  const { 
    data: stops,
    isLoading: isLoadingStops
  } = useQuery({
    queryKey: ['/api/trips', activeTrip?.id, 'stops'],
    enabled: !!activeTrip?.id,
  });
  
  // Get next stop info
  const { 
    data: nextStop,
    isLoading: isLoadingNextStop
  } = useQuery({
    queryKey: ['/api/trips', activeTrip?.id, 'next-stop'],
    enabled: !!activeTrip?.id,
  });
  
  // Trigger tracking manually if needed
  const handleTrackingToggle = () => {
    if (isTracking) {
      stopTracking();
      toast({
        title: 'Location sharing stopped',
        description: 'You are no longer sharing your location with parents.',
      });
    } else {
      startTracking();
      toast({
        title: 'Location sharing started',
        description: 'You are now sharing your location with parents.',
      });
    }
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['driver']}>
      <Helmet>
        <title>Route Navigation - ShuttleMate</title>
        <meta name="description" content="Navigate your bus route with turn-by-turn directions and manage bus stops with ShuttleMate." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Route Navigation</h1>
          {activeTrip && (
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-sm">
                {activeTrip.direction === 'to_school' ? 'To School' : 'From School'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Bus #{activeTrip.busNumber}
              </Badge>
            </div>
          )}
        </div>
        
        {isLoadingTrip ? (
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : !activeTrip ? (
          <Card>
            <CardHeader>
              <CardTitle>No Active Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You don't have an active trip. Please start a trip from the Students page to view your route.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => window.location.href = '/students'}>
                  Go to Students Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-[500px]">
                <BusMap 
                  tripId={activeTrip.id}
                  showRoute={true}
                  showStops={true}
                  showSchool={true}
                />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>Navigation</span>
                      <Badge className={isTracking ? 'bg-green-500' : 'bg-gray-500'}>
                        {isTracking ? 'Tracking On' : 'Tracking Off'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-3">
                      <Button 
                        className={isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                        onClick={handleTrackingToggle}
                      >
                        {isTracking ? 'Stop Sharing Location' : 'Start Sharing Location'}
                      </Button>
                      
                      {nextStop && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold flex items-center text-blue-700">
                            <Navigation className="h-5 w-5 mr-2" />
                            Next Stop
                          </h3>
                          <p className="font-medium mt-1">{nextStop.name}</p>
                          <p className="text-sm text-gray-600">{nextStop.address}</p>
                          <div className="flex items-center mt-2 text-sm">
                            <Clock className="h-4 w-4 mr-1 text-blue-500" />
                            <span>ETA: {nextStop.eta} minutes</span>
                          </div>
                          {nextStop.students && nextStop.students.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-blue-700">Students at this stop:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {nextStop.students.map((student: any) => (
                                  <Badge key={student.id} variant="outline" className="bg-white">
                                    {student.firstName} {student.lastName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Trip Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Route:</span>
                        <span className="font-medium">{activeTrip.routeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trip Started:</span>
                        <span className="font-medium">{formatDate(activeTrip.startTime, true)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Direction:</span>
                        <span className="font-medium">
                          {activeTrip.direction === 'to_school' ? 'To School' : 'From School'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stops:</span>
                        <span className="font-medium">
                          {stops ? `${stops.length} total` : 'Loading...'}
                        </span>
                      </div>
                      {currentLocation && (
                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                          <h4 className="font-medium text-sm text-gray-700">Current Location:</h4>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>Lat: {currentLocation.latitude.toFixed(6)}</div>
                            <div>Lng: {currentLocation.longitude.toFixed(6)}</div>
                            <div>Accuracy: ±{currentLocation.accuracy?.toFixed(1) || '?'}m</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {!isLoadingStops && stops && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 mr-2" />
                    Route Stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute h-full w-0.5 bg-gray-200 left-4 top-0"></div>
                    <div className="space-y-6 ml-9">
                      {stops.map((stop: any, index: number) => (
                        <div key={stop.id} className="relative">
                          <div className={`absolute w-8 h-8 rounded-full -left-9 flex items-center justify-center ${
                            stop.status === 'completed' ? 'bg-green-500' : 
                            stop.status === 'current' ? 'bg-royal-blue' : 
                            'bg-gray-300'
                          }`}>
                            {stop.status === 'completed' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-white font-medium">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className={`bg-gray-50 p-3 rounded-lg ${stop.status === 'current' ? 'border-2 border-royal-blue' : ''}`}>
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{stop.name}</h3>
                              <span className="text-xs text-gray-500">
                                {stop.arrivalTime ? new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{stop.address}</p>
                            {stop.students && stop.students.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">
                                  {stop.students.length} student{stop.students.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {stop.students.map((student: any) => (
                                    <Badge key={student.id} variant="outline" className="text-xs">
                                      {student.firstName} {student.lastName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-2">
                              <Badge className={
                                stop.status === 'completed' ? 'bg-green-500' : 
                                stop.status === 'current' ? 'bg-blue-500' : 
                                'bg-gray-300'
                              }>
                                {stop.status === 'completed' ? 'Completed' : 
                                 stop.status === 'current' ? 'Current Stop' : 
                                 'Upcoming'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
