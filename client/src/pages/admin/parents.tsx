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

export default function AdminParents() {
  const { user } = useAuth();
  
  // Fetch all parents data
  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['/api/admin/parents'],
  });
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Parents</h1>
            <p className="text-gray-600">View and manage parent information</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Parent
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Parent Directory</CardTitle>
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
                      <TableHead>Parent</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No parents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      parents.map((parent: any) => (
                        <TableRow key={parent.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={parent.profileImageUrl} />
                              <AvatarFallback>
                                {parent.firstName?.[0]}{parent.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{parent.firstName} {parent.lastName}</div>
                              <div className="text-xs text-gray-500">ID: {parent.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{parent.email}</TableCell>
                          <TableCell>{parent.phone}</TableCell>
                          <TableCell>{parent.childrenCount} students</TableCell>
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