import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import DashboardStats from "@/components/admin/DashboardStats";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MapDisplay from "@/components/shared/MapDisplay";
import { 
  Plus, 
  Download, 
  Filter, 
  FileDown, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Map,
  RefreshCw
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch active buses location data
  const { data: busLocations = [], isLoading: isLoadingLocations, refetch: refetchLocations } = useQuery({
    queryKey: ['/api/admin/bus-locations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch recent incidents
  const { data: incidents = [], isLoading: isLoadingIncidents } = useQuery({
    queryKey: ['/api/admin/incidents?limit=5'],
  });
  
  // Fetch active buses overview
  const { data: activeBuses = [], isLoading: isLoadingBuses } = useQuery({
    queryKey: ['/api/admin/active-buses'],
  });
  
  // Fetch recent driver activity
  const { data: driverActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/admin/driver-activity'],
  });
  
  const getIncidentBadge = (type: string, severity: string) => {
    if (type === 'accident') {
      return <Badge className="bg-destructive">Accident</Badge>;
    } else if (type === 'breakdown') {
      return <Badge className="bg-warning">Breakdown</Badge>;
    } else if (type === 'delay') {
      return <Badge className="bg-yellow-500">Delay</Badge>;
    } else {
      return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-success">On Schedule</Badge>;
    } else if (status === 'delayed') {
      return <Badge className="bg-warning">Delayed</Badge>;
    } else {
      return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  // Calculate time ago for activity
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your transportation network</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add New Bus
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileDown className="mr-1 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <DashboardStats />
        
        {/* Active Buses Map */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Bus Locations</h2>
              <div className="text-sm text-gray-600">Last Updated: {new Date().toLocaleTimeString()}</div>
            </div>
            
            {isLoadingLocations ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : busLocations.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <Map className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold">No Active Buses</h3>
                <p className="text-gray-500 mt-1">There are no buses currently on route</p>
              </div>
            ) : (
              <>
                <MapDisplay
                  latitude={busLocations[0]?.latitude || "40.7128"}
                  longitude={busLocations[0]?.longitude || "-74.0060"}
                  height="400px"
                  busMarkers={busLocations.map((bus: any) => ({
                    id: bus.busId,
                    latitude: bus.latitude,
                    longitude: bus.longitude,
                    label: `Bus #${bus.busNumber}`,
                    status: bus.status
                  }))}
                  showRoute={false}
                  onRefresh={() => refetchLocations()}
                />
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                    <span className="text-sm">On Schedule</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                    <span className="text-sm">Slight Delay</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
                    <span className="text-sm">Significant Delay</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-sm">Not in Service</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Alerts and Buses/Drivers Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Alerts</h2>
                  <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
                </div>
                
                {isLoadingIncidents ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full rounded-lg" />
                    ))}
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold">No Recent Incidents</h3>
                    <p className="text-gray-500 mt-1">There are no reported incidents</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents.map((incident: any) => (
                      <div 
                        key={incident.id} 
                        className={`p-3 rounded-lg border-l-4 ${
                          incident.severity === 'critical' || incident.type === 'accident' 
                            ? 'bg-destructive bg-opacity-10 border-destructive' 
                            : incident.severity === 'high' || incident.type === 'breakdown'
                              ? 'bg-warning bg-opacity-10 border-warning'
                              : 'bg-light border-primary'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{incident.title}</p>
                              {getIncidentBadge(incident.type, incident.severity)}
                            </div>
                            <p className="text-sm text-gray-600">{incident.description}</p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(incident.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Buses and Drivers Tables */}
          <div className="lg:col-span-2 space-y-8">
            {/* Buses Table */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Buses Overview</h2>
                  <Button variant="link" className="text-primary p-0 h-auto">See All Buses</Button>
                </div>
                
                {isLoadingBuses ? (
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bus ID</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeBuses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              No active buses found
                            </TableCell>
                          </TableRow>
                        ) : (
                          activeBuses.map((bus: any) => (
                            <TableRow key={bus.id}>
                              <TableCell className="font-medium">Bus #{bus.busNumber}</TableCell>
                              <TableCell>{bus.route}</TableCell>
                              <TableCell>{bus.driverName}</TableCell>
                              <TableCell>
                                {getStatusBadge(bus.status)}
                              </TableCell>
                              <TableCell className="text-primary">View Details</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Drivers Activity */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Driver Activity</h2>
                  <Button variant="link" className="text-primary p-0 h-auto">See All Drivers</Button>
                </div>
                
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : driverActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No recent driver activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {driverActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={activity.profileImageUrl} />
                          <AvatarFallback className="bg-secondary text-white">
                            {activity.firstName?.[0]}{activity.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-semibold">{activity.firstName} {activity.lastName}</p>
                            <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                          </div>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
