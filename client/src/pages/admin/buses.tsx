import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import BusesTable from "@/components/admin/BusesTable";
import { Plus } from "lucide-react";

export default function AdminBuses() {
  const { user } = useAuth();
  
  // Fetch all buses data
  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['/api/admin/buses'],
  });
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Buses</h1>
            <p className="text-gray-600">View and manage your bus fleet</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Bus
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bus Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <BusesTable buses={buses} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}