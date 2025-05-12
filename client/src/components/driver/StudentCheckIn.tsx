import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StudentCheckInProps {
  routeId: number;
  busId: number;
}

export default function StudentCheckIn({ routeId, busId }: StudentCheckInProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedView, setExpandedView] = useState(false);

  // Fetch students for this route
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: [`/api/driver/route/${routeId}/students`],
    enabled: !!routeId,
  });

  // Fetch today's attendance records
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: [`/api/driver/route/${routeId}/attendance`],
    enabled: !!routeId,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return await apiRequest('POST', '/api/driver/check-in', {
        studentId,
        busId,
        routeId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/driver/route/${routeId}/attendance`] });
      toast({
        title: "Student checked in",
        description: "The student has been successfully checked in.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: (error as Error).message || "An error occurred while checking in the student.",
        variant: "destructive",
      });
    }
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return await apiRequest('POST', '/api/driver/check-out', {
        studentId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/driver/route/${routeId}/attendance`] });
      toast({
        title: "Student checked out",
        description: "The student has been successfully checked out.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Check-out failed",
        description: (error as Error).message || "An error occurred while checking out the student.",
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingStudents || isLoadingAttendance;

  // Calculate status for each student
  const studentsWithStatus = students.map((student: any) => {
    const attendanceRecord = attendanceRecords.find(
      (rec: any) => rec.studentId === student.id
    );

    return {
      ...student,
      status: attendanceRecord ? (
        attendanceRecord.droppedOffAt 
          ? "checked-out" 
          : attendanceRecord.boardedAt 
            ? "checked-in" 
            : "not-boarded"
      ) : "not-boarded",
      attendanceId: attendanceRecord?.id,
      boardedAt: attendanceRecord?.boardedAt,
      droppedOffAt: attendanceRecord?.droppedOffAt
    };
  });

  // Calculate boarding statistics
  const totalStudents = studentsWithStatus.length;
  const boardedStudents = studentsWithStatus.filter(s => 
    s.status === "checked-in" || s.status === "checked-out"
  ).length;

  // Handle check in/out
  const handleCheckIn = (studentId: number) => {
    checkInMutation.mutate(studentId);
  };

  const handleCheckOut = (studentId: number) => {
    checkOutMutation.mutate(studentId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Student Check-in</CardTitle>
          <div>
            <span className="text-primary font-semibold">{boardedStudents}/{totalStudents}</span> boarded
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 border rounded-lg overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center border-b">
                <div className="flex-1 flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            ))}
          </div>
        ) : studentsWithStatus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold">No students assigned</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no students assigned to this route
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {studentsWithStatus
              .slice(0, expandedView ? undefined : 3)
              .map((student: any) => (
                <div key={student.id} className="p-4 flex items-center border-b last:border-b-0">
                  <div className="flex-1 flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {student.firstName} {student.lastName}
                        {student.status === "checked-in" && (
                          <Badge className="ml-2 bg-success text-white">On board</Badge>
                        )}
                        {student.status === "checked-out" && (
                          <Badge className="ml-2 bg-gray-500 text-white">Dropped off</Badge>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        {student.stop 
                          ? `Stop #${student.stop.order} - ${student.stop.name}` 
                          : "No stop assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {student.status === "checked-in" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center"
                        onClick={() => handleCheckOut(student.id)}
                        disabled={checkOutMutation.isPending}
                      >
                        {checkOutMutation.isPending && checkOutMutation.variables === student.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Drop Off
                      </Button>
                    ) : student.status === "checked-out" ? (
                      <div className="flex items-center">
                        <CheckCircle className="text-success mr-2 h-5 w-5" />
                        <span className="text-sm text-gray-600">
                          {new Date(student.droppedOffAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary text-white flex items-center"
                        onClick={() => handleCheckIn(student.id)}
                        disabled={checkInMutation.isPending}
                      >
                        {checkInMutation.isPending && checkInMutation.variables === student.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Check-in
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {!isLoading && studentsWithStatus.length > 3 && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setExpandedView(!expandedView)}
          >
            {expandedView ? "Show Less" : "View All Students"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
