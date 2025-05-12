import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MapPin } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminRoutes() {
  const { user } = useAuth();
  
  // Fetch all routes data
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['/api/admin/routes'],
  });
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Routes</h1>
            <p className="text-gray-600">View and manage bus routes</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Route
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bus Routes</CardTitle>
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
                      <TableHead>Route Name</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Stops</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No routes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      routes.map((route: any) => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.name}</TableCell>
                          <TableCell>Bus #{route.busNumber}</TableCell>
                          <TableCell>{route.driverName}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {route.startTime} - {route.endTime}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {route.stopCount} stops
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              route.status === 'active' ? 'bg-success' : 
                              route.status === 'inactive' ? 'bg-gray-500' : 
                              'bg-warning'
                            }>
                              {route.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="h-auto p-0">View Details</Button>
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