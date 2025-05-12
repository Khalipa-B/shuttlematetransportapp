import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import { UserRole } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Search, ArrowDownUp, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DriverStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Fetch driver profile
  const { data: profile } = useQuery({
    queryKey: ['/api/driver/profile'],
    enabled: !!user,
  });
  
  // Fetch assigned bus
  const { data: bus } = useQuery({
    queryKey: ['/api/driver/bus'],
    enabled: !!user,
  });
  
  // Fetch routes for the assigned bus
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['/api/driver/routes'],
    enabled: !!bus,
  });
  
  // Get the active route
  const activeRoute = routes.find((route: any) => route.isActive) || routes[0];
  
  // Fetch students for the active route
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: [`/api/driver/route/${activeRoute?.id}/students`],
    enabled: !!activeRoute,
  });
  
  // Fetch today's attendance
  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: [`/api/driver/route/${activeRoute?.id}/attendance`],
    enabled: !!activeRoute,
  });
  
  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return await apiRequest('POST', '/api/driver/check-in', {
        studentId,
        busId: bus.id,
        routeId: activeRoute.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/driver/route/${activeRoute?.id}/attendance`] });
      toast({
        title: "Student checked in",
        description: "The student has been successfully checked in.",
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
      queryClient.invalidateQueries({ queryKey: [`/api/driver/route/${activeRoute?.id}/attendance`] });
      toast({
        title: "Student checked out",
        description: "The student has been successfully checked out.",
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
  
  const isLoading = isLoadingRoutes || isLoadingStudents || isLoadingAttendance;
  
  // Process students with attendance status
  const studentsWithStatus = students.map((student: any) => {
    const attendanceRecord = attendance.find(
      (record: any) => record.studentId === student.id
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
      boardedAt: attendanceRecord?.boardedAt,
      droppedOffAt: attendanceRecord?.droppedOffAt
    };
  });
  
  // Filter and sort students
  const filteredStudents = studentsWithStatus.filter((student: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
      student.grade.toString().includes(query) ||
      student.school.toLowerCase().includes(query)
    );
  });
  
  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
    const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
    
    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  
  // Get boarding statistics
  const totalStudents = studentsWithStatus.length;
  const boardedStudents = studentsWithStatus.filter(s => 
    s.status === "checked-in" || s.status === "checked-out"
  ).length;
  const droppedOffStudents = studentsWithStatus.filter(s => 
    s.status === "checked-out"
  ).length;
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleCheckIn = (studentId: number) => {
    checkInMutation.mutate(studentId);
  };
  
  const handleCheckOut = (studentId: number) => {
    checkOutMutation.mutate(studentId);
  };
  
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-gray-600">
            {bus ? `Bus #${bus.busNumber}` : "No bus assigned"} 
            {activeRoute ? ` - ${activeRoute.name}` : ""}
          </p>
        </div>
        
        {/* Route Selection (if multiple routes) */}
        {routes.length > 1 && (
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue={activeRoute?.id.toString()}>
                  <TabsList className="w-full">
                    {routes.map((route: any) => (
                      <TabsTrigger 
                        key={route.id} 
                        value={route.id.toString()}
                        className="flex-1"
                      >
                        {route.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Attendance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Total Students</div>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Boarded Today</div>
                <div className="text-2xl font-bold text-primary">{boardedStudents}</div>
              </div>
              <div className="mt-2 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full" 
                  style={{ width: `${totalStudents ? (boardedStudents / totalStudents) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Dropped Off</div>
                <div className="text-2xl font-bold text-success">{droppedOffStudents}</div>
              </div>
              <div className="mt-2 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-success h-full" 
                  style={{ width: `${boardedStudents ? (droppedOffStudents / boardedStudents) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Student List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle className="text-lg font-bold">Student List</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={toggleSortOrder} className="cursor-pointer">
                      <div className="flex items-center">
                        Name
                        <ArrowDownUp className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Grade/School</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedStudents.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-white">
                                {student.firstName[0]}{student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">
                              {student.lastName}, {student.firstName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>Grade {student.grade}</div>
                          <div className="text-sm text-gray-500">{student.school}</div>
                        </TableCell>
                        <TableCell>
                          {student.stop ? (
                            <div>
                              <div>Stop #{student.stop.order}</div>
                              <div className="text-sm text-gray-500">{student.stop.name}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.status === "checked-in" && (
                            <Badge className="bg-success">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              On Board
                            </Badge>
                          )}
                          {student.status === "checked-out" && (
                            <Badge variant="outline" className="text-success border-success">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Dropped Off
                            </Badge>
                          )}
                          {student.status === "not-boarded" && (
                            <Badge variant="outline" className="text-gray-500">
                              <XCircle className="mr-1 h-3 w-3" />
                              Not Boarded
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.status === "not-boarded" ? (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(student.id)}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending && checkInMutation.variables === student.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              Check In
                            </Button>
                          ) : student.status === "checked-in" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOut(student.id)}
                              disabled={checkOutMutation.isPending}
                            >
                              {checkOutMutation.isPending && checkOutMutation.variables === student.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              Drop Off
                            </Button>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-3 w-3" />
                              {new Date(student.droppedOffAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.DRIVER} />
    </AppLayout>
  );
}
