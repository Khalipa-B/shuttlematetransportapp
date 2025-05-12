import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import DriversTable from "@/components/admin/DriversTable";
import { Plus } from "lucide-react";

export default function AdminDrivers() {
  const { user } = useAuth();
  
  // Fetch all drivers data
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/drivers'],
  });
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Drivers</h1>
            <p className="text-gray-600">View and manage your driver staff</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Driver
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Driver Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <DriversTable drivers={drivers} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}