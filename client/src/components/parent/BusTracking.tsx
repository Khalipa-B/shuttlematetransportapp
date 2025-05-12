import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Navigation, Clock, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useBusLocationUpdates } from '@/hooks/useSocket';
import { useMapbox } from '@/hooks/useMapbox';
import { formatTime, timeAgo, getStatusColor } from '@/lib/utils';
import { Student, Route, Stop, Bus, BusLocation } from '@shared/schema';

const BusTracking: React.FC = () => {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Initialize map
  const { 
    initializeMap, 
    map, 
    addBusMarker, 
    addStopMarker, 
    updateBusPosition, 
    drawRoute,
    fitMapToMarkers
  } = useMapbox();
  
  // Fetch student data for current parent
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students/parent'],
  });
  
  // Get active routes for the student's bus
  const { data: routes, isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
    enabled: !!students && students.length > 0,
  });
  
  // Get real-time bus location from WebSocket
  const { latestUpdate: busLocation } = useBusLocationUpdates(selectedBusId || undefined);
  
  // Get active route details when a bus is selected
  const { data: routeDetails, isLoading: routeDetailsLoading } = useQuery<Route>({
    queryKey: ['/api/routes', selectedBusId],
    enabled: !!selectedBusId,
  });
  
  // Get stops for the selected route
  const { data: stops, isLoading: stopsLoading } = useQuery<Stop[]>({
    queryKey: ['/api/routes', routeDetails?.id, 'stops'],
    enabled: !!routeDetails?.id,
  });
  
  // Get students on the route
  const { data: routeStudents, isLoading: routeStudentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/routes', routeDetails?.id, 'students'],
    enabled: !!routeDetails?.id,
  });
  
  // Get bus details
  const { data: busDetails, isLoading: busDetailsLoading } = useQuery<Bus>({
    queryKey: ['/api/buses', routeDetails?.busId],
    enabled: !!routeDetails?.busId,
  });
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapInitialized) {
      initializeMap(mapContainerRef.current);
      setMapInitialized(true);
    }
  }, [mapContainerRef, mapInitialized, initializeMap]);
  
  // Select first bus by default if student info is available
  useEffect(() => {
    if (students?.length && routes?.length && !selectedBusId) {
      // Find routes that have the student's bus
      const studentStops = students.map(student => student.stopId).filter(Boolean);
      const relevantRoutes = routes.filter(route => 
        route.active && route.type === 'morning' || route.type === 'afternoon'
      );
      
      if (relevantRoutes.length > 0) {
        setSelectedBusId(relevantRoutes[0].busId);
      }
    }
  }, [students, routes, selectedBusId]);
  
  // Update map markers and route when data changes
  useEffect(() => {
    if (map && stops?.length && busLocation) {
      // Clear previous markers and routes
      map.clearMarkers();
      map.clearRoutes();
      
      // Add stop markers
      stops.forEach(stop => {
        addStopMarker(stop.id.toString(), stop.latitude, stop.longitude, stop.name);
      });
      
      // Add or update bus marker
      if (busLocation) {
        if (map.hasMarker('bus')) {
          updateBusPosition('bus', busLocation.latitude, busLocation.longitude);
        } else {
          addBusMarker('bus', busLocation.latitude, busLocation.longitude);
        }
      }
      
      // Draw route path
      if (stops.length > 1) {
        drawRoute('route', stops.map(stop => ({
          id: stop.id,
          latitude: stop.latitude,
          longitude: stop.longitude,
          name: stop.name,
          stopOrder: stop.stopOrder
        })));
      }
      
      // Fit map to show all markers
      fitMapToMarkers();
    }
  }, [map, stops, busLocation, addBusMarker, addStopMarker, updateBusPosition, drawRoute, fitMapToMarkers]);
  
  // Loading state
  if (studentsLoading || routesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-royal-blue animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading your children's transport information...</p>
      </div>
    );
  }
  
  // No students found
  if (!students?.length) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-xl font-bold">No Children Found</h3>
            <p className="text-gray-600">
              We couldn't find any children registered to your account. Please contact your school administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No routes found
  if (!routes?.length) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-xl font-bold">No Active Routes</h3>
            <p className="text-gray-600">
              There are no active bus routes at this time. Check back during school transport hours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-[500px] relative">
          <div ref={mapContainerRef} className="h-full w-full"></div>
          
          {/* Bus Status Overlay */}
          {busLocation && (
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md max-w-[300px]">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className={getStatusColor(busLocation.status || 'unknown')}>
                  {busLocation.status || 'Unknown'}
                </Badge>
                <span className="ml-2 text-xs text-gray-500">
                  Updated {timeAgo(busLocation.timestamp)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {routeDetails?.name || `Route #${routeDetails?.routeNumber}`}
              </div>
            </div>
          )}
        </div>
        
        {/* Bus and Status Info */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-bold text-royal-blue mb-4">Bus Status</h2>
          
          {/* Child Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your {students.length > 1 ? 'Children' : 'Child'}</h3>
            <div className="space-y-3">
              {students.map(student => (
                <div key={student.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-royal-blue text-white flex items-center justify-center mr-3">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-600">
                      Grade {student.grade} • ID: {student.studentId}
                    </p>
                  </div>
                  {routeStudents?.some(s => s.id === student.id) && (
                    <Badge className="ml-auto bg-green-100 text-green-800">
                      ON BUS
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bus Info */}
          {busDetails && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bus Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <span className="font-medium">Bus Number:</span>
                  <span>{busDetails.busNumber}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="font-medium">Driver:</span>
                  <span>{routeDetails?.driverName || 'Assigned Driver'}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="font-medium">Current Status:</span>
                  <span className={getStatusColor(busLocation?.status || 'unknown')}>
                    {busLocation?.status || 'Unknown'}
                  </span>
                </div>
                {busLocation && routeDetails && (
                  <div className="flex justify-between">
                    <span className="font-medium">ETA to Next Stop:</span>
                    <span>{routeDetails.estimatedTime ? formatTime(routeDetails.estimatedTime) : 'Calculating...'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Route Progress */}
          {stops && stops.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Route Progress:</span>
                <span className="text-sm text-gray-600">{busLocation?.completedStops || 0}/{stops.length} stops</span>
              </div>
              <Progress value={(busLocation?.completedStops || 0) / stops.length * 100} className="h-2" />
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="flex items-center justify-center w-full" asChild>
                <a href="/dashboard/chat">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message Driver
                </a>
              </Button>
              <Button variant="outline" className="flex items-center justify-center w-full">
                <Clock className="h-5 w-5 mr-2" />
                Bus Schedule
              </Button>
            </div>
          </div>
          
          {/* Last Updated */}
          {busLocation && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              Last updated: {timeAgo(busLocation.timestamp)}
            </div>
          )}
        </div>
      </div>
      
      {/* Journey Timeline */}
      {stops && stops.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Today's Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute h-full w-0.5 bg-gray-200 left-4 top-0"></div>
              
              {/* Stop Items */}
              <div className="space-y-6">
                {stops.sort((a, b) => a.stopOrder - b.stopOrder).map((stop, index) => {
                  const isCompleted = busLocation?.completedStops ? index < busLocation.completedStops : false;
                  const isCurrent = busLocation?.completedStops ? index === busLocation.completedStops : false;
                  
                  return (
                    <div key={stop.id} className="ml-9 relative">
                      {/* Timeline Dot */}
                      <div className={`absolute w-8 h-8 rounded-full -left-9 flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : 
                        isCurrent ? 'bg-royal-blue' : 
                        'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-white font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isCurrent ? 'bg-blue-50 border-2 border-royal-blue' : 
                        'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{stop.name}</h3>
                          <span className="text-xs text-gray-500">
                            {stop.estimatedTime ? formatTime(stop.estimatedTime) : '--:--'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{stop.address}</p>
                        
                        {/* Show relevant students at this stop */}
                        {routeStudents && routeStudents.some(student => student.stopId === stop.id) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {routeStudents
                              .filter(student => student.stopId === stop.id)
                              .map(student => (
                                <Badge key={student.id} variant="outline" className="text-xs">
                                  {student.firstName} {student.lastName}
                                </Badge>
                              ))
                            }
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs">
                          <Badge 
                            variant="outline" 
                            className={
                              isCompleted ? 'bg-green-100 text-green-800' : 
                              isCurrent ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {isCompleted ? 'Completed' : isCurrent ? 'Current Stop' : 'Upcoming'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusTracking;
