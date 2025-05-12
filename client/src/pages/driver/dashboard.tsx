import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import StudentCheckIn from "@/components/driver/StudentCheckIn";
import RouteDisplay from "@/components/driver/RouteDisplay";
import DelayReporter from "@/components/driver/DelayReporter";
import { UserRole } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, MessageSquare, AlertCircle, CheckSquare, FileText, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);

  // Fetch driver profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/driver/profile'],
    enabled: !!user,
  });

  // Fetch assigned bus
  const { data: bus, isLoading: isLoadingBus } = useQuery({
    queryKey: ['/api/driver/bus'],
    enabled: !!user,
  });

  // Fetch routes for the assigned bus
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['/api/driver/routes'],
    enabled: !!bus,
  });

  // Emergency button mutation
  const emergencyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/driver/emergency', data);
    },
    onSuccess: () => {
      setIsEmergencyDialogOpen(false);
      toast({
        title: "Emergency alert sent",
        description: "The emergency alert has been sent to administrators.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error sending alert",
        description: (error as Error).message || "An error occurred while sending the emergency alert.",
        variant: "destructive",
      });
    }
  });

  const handleEmergency = (type: string) => {
    if (!bus) return;
    
    emergencyMutation.mutate({
      busId: bus.id,
      routeId: routes[0]?.id,
      type,
      severity: type === 'accident' ? 'high' : 'medium'
    });
  };

  const isLoading = isLoadingProfile || isLoadingBus || isLoadingRoutes;
  const currentRoute = routes.length > 0 ? routes[0] : null;

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            {isLoadingProfile ? (
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome, {profile?.user?.firstName || user?.firstName || "Driver"}!
                </h2>
                <p className="text-gray-600">
                  {bus ? `Bus #${bus.busNumber}` : "No bus assigned"} 
                  {currentRoute ? ` - ${currentRoute.name}` : ""}
                </p>
              </div>
            )}
          </div>
          
          <Button
            className="bg-error hover:bg-red-600 text-white font-bold"
            onClick={() => setIsEmergencyDialogOpen(true)}
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            Emergency
          </Button>
        </div>
        
        {/* Route Information */}
        {isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-lg mb-6" />
        ) : !bus ? (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Bus Assigned</h3>
              <p className="text-gray-600 mb-4">
                You currently don't have a bus assigned to you. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <RouteDisplay busId={bus.id} routeId={currentRoute?.id} />
        )}
        
        {/* Student Check-in List */}
        {bus && currentRoute && (
          <div className="mt-6">
            <StudentCheckIn busId={bus.id} routeId={currentRoute.id} />
          </div>
        )}
        
        {/* Delay Reporter */}
        {currentRoute && (
          <div className="mt-6 flex justify-end">
            <DelayReporter routeId={currentRoute.id} />
          </div>
        )}
        
        {/* Driver Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Driver Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/driver/messages">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-auto py-4 w-full hover:bg-gray-100"
                >
                  <MessageSquare className="text-primary text-2xl mb-2" />
                  <span className="text-sm font-semibold">Messages</span>
                </Button>
              </Link>
              <Link href="/driver/report-incident">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-auto py-4 w-full hover:bg-gray-100"
                >
                  <FileText className="text-primary text-2xl mb-2" />
                  <span className="text-sm font-semibold">Incident Report</span>
                </Button>
              </Link>
              <Link href="/driver/students">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-auto py-4 w-full hover:bg-gray-100"
                >
                  <CheckSquare className="text-primary text-2xl mb-2" />
                  <span className="text-sm font-semibold">Student Check</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-4 hover:bg-gray-100"
              >
                <HelpCircle className="text-primary text-2xl mb-2" />
                <span className="text-sm font-semibold">Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Emergency Dialog */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription>
              Select the type of emergency to alert administrators and relevant parents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button 
              variant="destructive" 
              className="w-full py-6 text-lg"
              onClick={() => handleEmergency('accident')}
              disabled={emergencyMutation.isPending}
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              Accident
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full py-6 text-lg"
              onClick={() => handleEmergency('breakdown')}
              disabled={emergencyMutation.isPending}
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              Vehicle Breakdown
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full py-6 text-lg"
              onClick={() => handleEmergency('other')}
              disabled={emergencyMutation.isPending}
            >
              Other Emergency
            </Button>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmergencyDialogOpen(false)}
              disabled={emergencyMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.DRIVER} />
    </AppLayout>
  );
}
