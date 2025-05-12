import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRound } from "lucide-react";
import { formatTimeString } from "@/lib/mapUtils";

interface ChildStatusProps {
  child: {
    id: number;
    firstName: string;
    lastName: string;
    grade: string;
    school: string;
  };
  attendance?: {
    boardedAt?: string;
    droppedOffAt?: string;
    status?: 'present' | 'absent' | 'late';
  };
  route?: {
    name: string;
    startTime: string;
    endTime: string;
    busNumber?: string;
  };
  isLoading?: boolean;
}

export default function ChildStatus({ child, attendance, route, isLoading = false }: ChildStatusProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Skeleton className="h-14 w-14 rounded-full mr-3" />
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status calculation based on attendance
  const getStatus = () => {
    if (!attendance) return { label: "Unknown", class: "bg-gray-400 text-white" };
    
    if (attendance.status === 'absent') {
      return { label: "Absent", class: "bg-destructive text-white" };
    }
    
    if (attendance.droppedOffAt) {
      return { label: "Dropped Off", class: "bg-success text-white" };
    }
    
    if (attendance.boardedAt) {
      return { label: "On Route", class: "bg-success bg-opacity-10 text-success" };
    }
    
    return { label: "Not Boarded", class: "bg-warning bg-opacity-10 text-warning" };
  };

  const status = getStatus();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-14 w-14 mr-3">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(child.firstName, child.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{child.firstName} {child.lastName}</h3>
              <p className="text-gray-600">Grade {child.grade}, {child.school}</p>
            </div>
          </div>
          <Badge className={status.class}>{status.label}</Badge>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          {route ? (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pickup time:</span>
                <span className="font-semibold">{formatTimeString(route.startTime)}</span>
              </div>
              {attendance?.boardedAt && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Boarded at:</span>
                  <span className="font-semibold">
                    {new Date(attendance.boardedAt).toLocaleTimeString([], {
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              )}
              {attendance?.droppedOffAt ? (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Dropped off at:</span>
                  <span className="font-semibold">
                    {new Date(attendance.droppedOffAt).toLocaleTimeString([], {
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Expected drop-off:</span>
                  <span className="font-semibold">{formatTimeString(route.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bus:</span>
                <span className="font-semibold">
                  {route.busNumber ? `Bus #${route.busNumber}` : ""} - {route.name}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-4 text-gray-500">
              <UserRound className="mr-2 h-5 w-5" />
              <span>No route assigned</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
