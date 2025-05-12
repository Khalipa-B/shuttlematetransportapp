import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useStudentUpdates } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Check, LogIn, LogOut, MoreVertical, Filter, ArrowDown, ArrowUp } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Student, Route, StudentCheckIn } from '@shared/schema';
import { formatGrade, getStatusColor } from '@/lib/utils';

const StudentCheckInComponent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'lastName', direction: 'asc' });
  const [filterByStatus, setFilterByStatus] = useState<string | null>(null);
  
  // Get driver's active routes
  const { data: routes, isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ['/api/routes/driver'],
  });
  
  const activeRoute = routes?.find(route => route.active);
  
  // Get students for the active route
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/routes', activeRoute?.id, 'students'],
    enabled: !!activeRoute?.id,
  });
  
  // Get active check-ins for the current route
  const { data: checkIns, isLoading: checkInsLoading } = useQuery<StudentCheckIn[]>({
    queryKey: ['/api/routes', activeRoute?.id, 'active-checkins'],
    enabled: !!activeRoute?.id,
  });
  
  // Subscribe to real-time check-in/out updates
  const { checkIns: realtimeCheckIns, checkOuts: realtimeCheckOuts } = useStudentUpdates(activeRoute?.id);
  
  // Track check-in status for each student
  const studentStatusMap = React.useMemo(() => {
    const statusMap = new Map<number, string>();
    
    // Set default status for all students
    students?.forEach(student => {
      statusMap.set(student.id, 'not_boarded');
    });
    
    // Update with API check-ins
    checkIns?.forEach(checkIn => {
      if (!checkIn.checkOutTime) {
        statusMap.set(checkIn.studentId, checkIn.status);
      }
    });
    
    // Update with realtime check-ins
    realtimeCheckIns.forEach(checkIn => {
      statusMap.set(checkIn.studentId, checkIn.status);
    });
    
    // Update with realtime check-outs
    realtimeCheckOuts.forEach(checkOut => {
      statusMap.set(checkOut.studentId, checkOut.status);
    });
    
    return statusMap;
  }, [students, checkIns, realtimeCheckIns, realtimeCheckOuts]);
  
  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async ({ studentId, routeId, status }: { studentId: number, routeId: number, status: string }) => {
      return apiRequest('POST', '/api/checkins', {
        studentId,
        routeId,
        status,
        location: 'Current stop',
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes', activeRoute?.id, 'active-checkins'] });
      toast({
        title: "Student checked in",
        description: "The student has been successfully checked in",
      });
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: error.message || "There was an error checking in the student",
        variant: "destructive"
      });
    }
  });
  
  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async ({ checkInId, status }: { checkInId: number, status: string }) => {
      return apiRequest('PUT', `/api/checkins/${checkInId}/checkout`, {
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes', activeRoute?.id, 'active-checkins'] });
      toast({
        title: "Student checked out",
        description: "The student has been successfully checked out",
      });
    },
    onError: (error) => {
      toast({
        title: "Check-out failed",
        description: error.message || "There was an error checking out the student",
        variant: "destructive"
      });
    }
  });
  
  // Handle check-in/out actions
  const handleCheckInOut = (student: Student) => {
    const studentId = student.id;
    const status = studentStatusMap.get(studentId);
    
    if (!activeRoute?.id) {
      toast({
        title: "No active route",
        description: "You must have an active route to check students in or out",
        variant: "destructive"
      });
      return;
    }
    
    // If student is not boarded yet, check them in
    if (status === 'not_boarded' || !status) {
      checkInMutation.mutate({
        studentId,
        routeId: activeRoute.id,
        status: 'boarded'
      });
    } 
    // If student is already boarded, check them out
    else if (status === 'boarded') {
      // Find the active check-in record for this student
      const checkInRecord = checkIns?.find(ci => ci.studentId === studentId && !ci.checkOutTime);
      
      if (checkInRecord) {
        checkOutMutation.mutate({
          checkInId: checkInRecord.id,
          status: 'exited'
        });
      } else {
        toast({
          title: "No active check-in found",
          description: "Could not find an active check-in record for this student",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle bulk check-in
  const handleBulkCheckIn = () => {
    if (!activeRoute?.id || selectedStudentIds.length === 0) return;
    
    // Check in each selected student
    selectedStudentIds.forEach(studentId => {
      if (studentStatusMap.get(studentId) === 'not_boarded' || !studentStatusMap.get(studentId)) {
        checkInMutation.mutate({
          studentId,
          routeId: activeRoute.id,
          status: 'boarded'
        });
      }
    });
    
    // Clear selection after processing
    setSelectedStudentIds([]);
  };
  
  // Handle mark absent
  const handleMarkAbsent = (studentId: number) => {
    if (!activeRoute?.id) return;
    
    checkInMutation.mutate({
      studentId,
      routeId: activeRoute.id,
      status: 'absent'
    });
  };
  
  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Filter and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    if (!students) return [];
    
    // Filter by search term and status
    let filtered = students.filter(student => {
      const matchesSearch = searchTerm === '' ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterByStatus ||
        studentStatusMap.get(student.id) === filterByStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort
    return [...filtered].sort((a, b) => {
      const key = sortConfig.key as keyof Student;
      if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, searchTerm, filterByStatus, sortConfig, studentStatusMap]);
  
  // Handle select all students
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredAndSortedStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };
  
  // Handle select single student
  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };
  
  // Loading state
  const isLoading = routesLoading || studentsLoading || checkInsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-royal-blue animate-spin" />
      </div>
    );
  }
  
  // No active route found
  if (!activeRoute) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">No Active Route</h3>
            <p className="text-gray-600 mb-4">You currently don't have an active route assigned.</p>
            <p className="text-gray-500 text-sm">Please contact the transportation administrator to assign a route.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No students found on this route
  if (!students || students.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">No Students Found</h3>
            <p className="text-gray-600 mb-4">There are no students assigned to this route.</p>
            <p className="text-gray-500 text-sm">Please contact the transportation administrator to update route assignments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Student Check-In/Out</CardTitle>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-royal-blue text-white">
                Route #{activeRoute.routeNumber}
              </Badge>
              <Badge variant="outline" className="bg-green-600 text-white">
                {activeRoute.type === 'morning' ? 'Morning' : 'Afternoon'} Route
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row mb-4 gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text" 
                placeholder="Search students..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterByStatus(null)}>
                  All Students
                  {!filterByStatus && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterByStatus('not_boarded')}>
                  Not Boarded
                  {filterByStatus === 'not_boarded' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterByStatus('boarded')}>
                  On Bus
                  {filterByStatus === 'boarded' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterByStatus('exited')}>
                  Exited
                  {filterByStatus === 'exited' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterByStatus('absent')}>
                  Absent
                  {filterByStatus === 'absent' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedStudentIds.length > 0 && (
              <Button
                variant="default"
                className="bg-royal-blue"
                onClick={handleBulkCheckIn}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Check In Selected ({selectedStudentIds.length})
              </Button>
            )}
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredAndSortedStudents.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('lastName')}>
                    <div className="flex items-center">
                      Student
                      {sortConfig.key === 'lastName' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('grade')}>
                    <div className="flex items-center">
                      Grade
                      {sortConfig.key === 'grade' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStudents.map(student => {
                  const status = studentStatusMap.get(student.id) || 'not_boarded';
                  const isCheckedIn = status === 'boarded';
                  const isAbsent = status === 'absent';
                  const isExited = status === 'exited';
                  
                  // Find active check-in record for this student
                  const checkInRecord = checkIns?.find(
                    ci => ci.studentId === student.id && !ci.checkOutTime
                  );
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudentIds.includes(student.id)}
                          onCheckedChange={(checked) => 
                            handleSelectStudent(student.id, Boolean(checked))
                          }
                          disabled={isCheckedIn || isAbsent || isExited}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-royal-blue text-white flex items-center justify-center mr-3">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatGrade(student.grade)}</TableCell>
                      <TableCell>{student.stopName || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {status === 'not_boarded' ? 'Not Boarded' : 
                           status === 'boarded' ? 'On Bus' :
                           status === 'exited' ? 'Exited' : 
                           status === 'absent' ? 'Absent' : status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isCheckedIn ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleCheckInOut(student)}
                            disabled={checkOutMutation.isPending}
                          >
                            {checkOutMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <LogOut className="mr-2 h-4 w-4" />
                            )}
                            Check Out
                          </Button>
                        ) : status === 'not_boarded' ? (
                          <div className="flex items-center space-x-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex items-center bg-royal-blue"
                              onClick={() => handleCheckInOut(student)}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <LogIn className="mr-2 h-4 w-4" />
                              )}
                              Check In
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleMarkAbsent(student.id)}
                                  className="text-red-600"
                                >
                                  Mark Absent
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                          >
                            {status === 'absent' ? 'Marked Absent' : 'Processed'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {filteredAndSortedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <p>No students found matching your criteria</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              {filteredAndSortedStudents.length} student{filteredAndSortedStudents.length !== 1 ? 's' : ''} displayed
            </div>
            <div>
              {students.filter(s => studentStatusMap.get(s.id) === 'boarded').length} student{students.filter(s => studentStatusMap.get(s.id) === 'boarded').length !== 1 ? 's' : ''} currently on bus
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-royal-blue">
                {students.filter(s => studentStatusMap.get(s.id) === 'boarded').length}
              </h3>
              <p className="text-gray-500">Students On Bus</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {students.filter(s => studentStatusMap.get(s.id) === 'exited').length}
              </h3>
              <p className="text-gray-500">Students Dropped Off</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-500">
                {students.filter(s => studentStatusMap.get(s.id) === 'absent').length}
              </h3>
              <p className="text-gray-500">Students Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-500">
                {students.filter(s => 
                  !studentStatusMap.get(s.id) || 
                  studentStatusMap.get(s.id) === 'not_boarded'
                ).length}
              </h3>
              <p className="text-gray-500">Students Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentCheckInComponent;
