import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminStudents() {
  const { user } = useAuth();
  
  // Fetch all students data
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['/api/admin/students'],
  });
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Students</h1>
            <p className="text-gray-600">View and manage student information</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Student
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Roster</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Assigned Bus</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{student.firstName} {student.lastName}</div>
                              <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>Bus #{student.busNumber}</TableCell>
                          <TableCell>{student.parentName}</TableCell>
                          <TableCell>
                            <Badge className={
                              student.status === 'active' ? 'bg-success' : 
                              student.status === 'absent' ? 'bg-destructive' : 
                              'bg-gray-500'
                            }>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="h-auto p-0">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}