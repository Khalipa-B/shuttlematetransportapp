import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import { 
  CheckCircle, 
  LogIn, 
  LogOut, 
  Search, 
  Filter, 
  ArrowUpDown,
  MoreVertical, 
  FileUp,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface StudentCheckInListProps {
  tripId: number;
  title?: string;
  direction?: 'to_school' | 'from_school';
  className?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
  busStopId?: number;
  stopName?: string;
  stopAddress?: string;
  status?: 'checked_in' | 'checked_out' | 'absent' | null;
}

const StudentCheckInList: React.FC<StudentCheckInListProps> = ({ 
  tripId, 
  title = 'Student Check-In/Out', 
  direction = 'to_school',
  className = '' 
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch students for the trip
  const { data: students, isLoading } = useQuery({
    queryKey: ['/api/trips', tripId, 'students'],
    enabled: !!tripId,
  });

  // Fetch trip data
  const { data: trip } = useQuery({
    queryKey: ['/api/trips', tripId],
    enabled: !!tripId,
  });

  // Filter and sort students
  const filteredStudents = React.useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    
    let result = [...students];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((student: Student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(query);
      });
    }
    
    // Apply status filter
    if (filter) {
      result = result.filter((student: Student) => student.status === filter);
    }
    
    // Sort by name by default
    result.sort((a: Student, b: Student) => {
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
    
    return result;
  }, [students, searchQuery, filter]);

  // Pagination
  const paginatedStudents = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Count students by status
  const studentCounts = React.useMemo(() => {
    if (!students || !Array.isArray(students)) return { total: 0, checkedIn: 0, checkedOut: 0, absent: 0 };
    
    return {
      total: students.length,
      checkedIn: students.filter((s: Student) => s.status === 'checked_in').length,
      checkedOut: students.filter((s: Student) => s.status === 'checked_out').length,
      absent: students.filter((s: Student) => s.status === 'absent').length,
    };
  }, [students]);

  // Update student status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: number, status: string }) => {
      return apiRequest('POST', `/api/trips/${tripId}/students/${studentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'students'] });
      toast({
        title: 'Status updated',
        description: 'Student status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: 'There was a problem updating the status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating status:', error);
    },
  });

  const handleCheckIn = (studentId: number) => {
    updateStatusMutation.mutate({ studentId, status: 'checked_in' });
  };

  const handleCheckOut = (studentId: number) => {
    updateStatusMutation.mutate({ studentId, status: 'checked_out' });
  };

  const handleMarkAbsent = (studentId: number) => {
    updateStatusMutation.mutate({ studentId, status: 'absent' });
  };

  const handleMarkAllPresent = () => {
    // Get all students that aren't already checked in
    const studentsToUpdate = filteredStudents
      .filter((student: Student) => student.status !== 'checked_in')
      .map((student: Student) => student.id);
    
    // Update each student
    Promise.all(
      studentsToUpdate.map((studentId: number) => 
        updateStatusMutation.mutateAsync({ studentId, status: 'checked_in' })
      )
    )
      .then(() => {
        toast({
          title: 'All students marked present',
          description: `${studentsToUpdate.length} students have been checked in`,
        });
      })
      .catch((error) => {
        console.error('Error marking all present:', error);
      });
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-green-500">On Bus</Badge>;
      case 'checked_out':
        return <Badge className="bg-blue-500">Exited</Badge>;
      case 'absent':
        return <Badge className="bg-yellow-500">Absent</Badge>;
      default:
        return <Badge variant="outline">Not Boarded</Badge>;
    }
  };

  const getTripTitle = () => {
    if (!trip) return title;
    
    const directionLabel = direction === 'to_school' ? 'Morning Pickup' : 'Afternoon Drop-off';
    return `${directionLabel} - ${trip.schoolName || 'School'}`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!students || !Array.isArray(students) || students.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No students found for this trip</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="bg-royal-blue text-white">
        <CardTitle className="flex justify-between items-center">
          <div>{getTripTitle()}</div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-white border-white">
              Bus {trip?.busNumber || 'Unknown'}
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              {direction === 'to_school' ? 'Morning Route' : 'Afternoon Route'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFilter(filter === null ? 'checked_in' : null)}
              className={filter === 'checked_in' ? 'bg-gray-100' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'checked_in' ? 'All' : 'Present'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleMarkAllPresent}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button 
              variant="outline"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-bold">{studentCounts.total}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">On Bus</div>
            <div className="font-bold text-green-600">{studentCounts.checkedIn}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Dropped Off</div>
            <div className="font-bold text-blue-600">{studentCounts.checkedOut}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Absent</div>
            <div className="font-bold text-yellow-600">{studentCounts.absent}</div>
          </div>
        </div>
        
        {/* Student List */}
        <div className="overflow-hidden overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Student
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stop
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.map((student: Student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar 
                        name={`${student.firstName} ${student.lastName}`}
                        size="sm"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: S-{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Grade {student.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.stopName || student.stopAddress || 'No stop assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(student.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {student.status === 'checked_in' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCheckOut(student.id)}
                          className="flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Check Out
                        </Button>
                      ) : student.status === 'checked_out' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCheckIn(student.id)}
                          className="flex items-center"
                        >
                          <LogIn className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                      {student.status !== 'absent' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAbsent(student.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredStudents.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
              </span>{' '}
              of <span className="font-medium">{filteredStudents.length}</span> students
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredStudents.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCheckInList;
