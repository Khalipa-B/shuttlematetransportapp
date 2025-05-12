import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import { MessageSquare, Clock, Navigation, User } from 'lucide-react';
import { useNavigate } from 'wouter';
import { Trip, Student, StudentCheckIn, Bus, User as UserType } from '@shared/schema';

interface BusStatusProps {
  tripId?: number;
  busId?: number;
  studentId?: number;
  className?: string;
}

const BusStatus: React.FC<BusStatusProps> = ({ tripId, busId, studentId, className = '' }) => {
  const navigate = useNavigate();
  
  // Fetch bus data if busId is provided or derived from trip
  const { 
    data: bus,
    isLoading: isLoadingBus 
  } = useQuery({
    queryKey: ['/api/buses', busId],
    enabled: !!busId,
  });

  // Fetch trip data if tripId is provided
  const { 
    data: trip,
    isLoading: isLoadingTrip 
  } = useQuery({
    queryKey: ['/api/trips', tripId],
    enabled: !!tripId,
  });

  // Fetch driver data based on trip or bus
  const driverId = (trip as Trip)?.driverId || (bus as Bus)?.driverId;
  const { 
    data: driver,
    isLoading: isLoadingDriver
  } = useQuery({
    queryKey: ['/api/users', driverId],
    enabled: !!driverId,
  });

  // Fetch student data if studentId is provided
  const {
    data: student,
    isLoading: isLoadingStudent
  } = useQuery({
    queryKey: ['/api/students', studentId],
    enabled: !!studentId,
  });

  // Fetch student check-in status if trip and student are available
  const {
    data: studentStatus,
    isLoading: isLoadingStudentStatus
  } = useQuery({
    queryKey: ['/api/trips', tripId, 'students', studentId, 'status'],
    enabled: !!tripId && !!studentId,
  });

  // Get next stop info
  const {
    data: nextStop,
    isLoading: isLoadingNextStop
  } = useQuery({
    queryKey: ['/api/trips', tripId, 'next-stop'],
    enabled: !!tripId,
  });

  const isLoading = isLoadingBus || isLoadingTrip || isLoadingDriver || 
                    isLoadingStudent || isLoadingStudentStatus || isLoadingNextStop;

  const handleMessageDriver = () => {
    if (driver) {
      navigate(`/messages?recipient=${(driver as UserType).id}`);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-green-500">ON BUS</Badge>;
      case 'checked_out':
        return <Badge className="bg-blue-500">DROPPED OFF</Badge>;
      case 'absent':
        return <Badge className="bg-yellow-500">ABSENT</Badge>;
      default:
        return <Badge className="bg-gray-500">NOT BOARDED</Badge>;
    }
  };

  const getTripStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-green-500">In Transit</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">Scheduled</Badge>;
    }
  };

  const getDirectionLabel = (direction: string) => {
    return direction === 'to_school' ? 'To School' : 'From School';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-royal-blue flex items-center justify-between">
          <span>Bus Status</span>
          {trip && (
            <div className="flex items-center space-x-2">
              {getTripStatusLabel((trip as Trip).status)}
              <Badge variant="outline">{getDirectionLabel((trip as Trip).direction)}</Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Child Info if studentId is provided */}
        {student && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Child</h3>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-3">
              <UserAvatar 
                size="sm"
                name={`${(student as Student).firstName} ${(student as Student).lastName}`}
                className="mr-3"
              />
              <div>
                <p className="font-semibold">{(student as Student).firstName} {(student as Student).lastName}</p>
                <p className="text-sm text-gray-600">Grade {(student as Student).grade}</p>
              </div>
              {studentStatus && (
                <div className="ml-auto">
                  {getStatusLabel((studentStatus as StudentCheckIn).status)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Bus Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bus Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Bus Number:</span>
              <span>B-{(bus as Bus)?.busNumber || "Unknown"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Driver:</span>
              <span>
                {driver 
                  ? `${(driver as UserType).firstName} ${(driver as UserType).lastName}` 
                  : "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Current Status:</span>
              <span className="text-green-600 font-medium">
                {(trip as Trip)?.status === 'in_progress' ? 'In Transit' : 'Scheduled'}
              </span>
            </div>
            {nextStop && (
              <div className="flex justify-between items-center">
                <span className="font-medium">ETA to Next Stop:</span>
                <span>{nextStop.eta} minutes</span>
              </div>
            )}
            {trip && trip.startTime && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Started:</span>
                <span>{formatDistanceToNow(new Date((trip as Trip).startTime), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="flex items-center justify-center"
              onClick={handleMessageDriver}
              disabled={!driver}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Message Driver
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center"
            >
              <Clock className="h-5 w-5 mr-2" />
              Bus Schedule
            </Button>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="text-sm text-gray-500 text-center pt-2">
          Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusStatus;
