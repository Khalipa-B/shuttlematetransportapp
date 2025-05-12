import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import StudentCheckInList from '@/components/student-checklist/student-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { Play, Pause, AlertTriangle } from 'lucide-react';

export default function DriverStudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const [isEndingTrip, setIsEndingTrip] = useState(false);
  
  // Fetch active trips for the driver
  const { 
    data: activeTrip,
    isLoading: isLoadingActiveTrip 
  } = useQuery({
    queryKey: ['/api/trips/active'],
    enabled: !!user,
  });
  
  // Fetch available routes for the driver
  const {
    data: availableRoutes,
    isLoading: isLoadingRoutes
  } = useQuery({
    queryKey: ['/api/driver/routes'],
    enabled: !!user && !activeTrip,
  });
  
  // Start a new trip
  const startTrip = async (routeId: number, direction: 'to_school' | 'from_school') => {
    setIsStartingTrip(true);
    try {
      await apiRequest('POST', '/api/trips', {
        routeId,
        direction,
        status: 'in_progress'
      });
      
      toast({
        title: 'Trip started',
        description: `Your ${direction === 'to_school' ? 'morning pickup' : 'afternoon drop-off'} trip has been started.`,
      });
      
      // Refresh active trip data
      queryClient.invalidateQueries({ queryKey: ['/api/trips/active'] });
    } catch (error) {
      toast({
        title: 'Error starting trip',
        description: 'There was a problem starting your trip. Please try again.',
        variant: 'destructive',
      });
      console.error('Error starting trip:', error);
    } finally {
      setIsStartingTrip(false);
    }
  };
  
  // End the current trip
  const endTrip = async () => {
    if (!activeTrip) return;
    
    setIsEndingTrip(true);
    try {
      await apiRequest('PATCH', `/api/trips/${activeTrip.id}`, {
        status: 'completed',
        endTime: new Date().toISOString()
      });
      
      toast({
        title: 'Trip completed',
        description: 'Your trip has been marked as completed.',
      });
      
      // Refresh active trip data
      queryClient.invalidateQueries({ queryKey: ['/api/trips/active'] });
    } catch (error) {
      toast({
        title: 'Error ending trip',
        description: 'There was a problem ending your trip. Please try again.',
        variant: 'destructive',
      });
      console.error('Error ending trip:', error);
    } finally {
      setIsEndingTrip(false);
    }
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['driver']}>
      <Helmet>
        <title>Student Check-In - ShuttleMate</title>
        <meta name="description" content="Manage student check-ins and check-outs for your bus route with ShuttleMate." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Check-In/Out</h1>
          {activeTrip && (
            <Button 
              variant="outline" 
              onClick={endTrip}
              disabled={isEndingTrip}
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              <Pause className="mr-2 h-4 w-4" />
              {isEndingTrip ? 'Ending trip...' : 'End Trip'}
            </Button>
          )}
        </div>

        {isLoadingActiveTrip || isLoadingRoutes ? (
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : activeTrip ? (
          <StudentCheckInList 
            tripId={activeTrip.id} 
            title={activeTrip.direction === 'to_school' ? 'Morning Pickup' : 'Afternoon Drop-off'}
            direction={activeTrip.direction}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Start a Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      No active trip. Start a new trip to begin tracking students.
                    </p>
                  </div>
                </div>
              </div>
              
              {!availableRoutes || !Array.isArray(availableRoutes) || availableRoutes.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No routes available. Please contact your administrator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRoutes.map((route) => (
                    <Card key={route.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-4">{route.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => startTrip(route.id, 'to_school')}
                            disabled={isStartingTrip}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            To School
                          </Button>
                          <Button 
                            onClick={() => startTrip(route.id, 'from_school')}
                            disabled={isStartingTrip}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            From School
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
