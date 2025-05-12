import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FileDown, Calendar, FileBarChart, Clock } from "lucide-react";

export default function AdminReports() {
  const { user } = useAuth();
  
  // Fetch attendance stats
  const { data: attendanceStats = {}, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/admin/stats/attendance'],
  });
  
  // Fetch incident reports
  const { data: incidentStats = {}, isLoading: isLoadingIncidents } = useQuery({
    queryKey: ['/api/admin/stats/incidents'],
  });
  
  // Fetch bus utilization
  const { data: busUtilization = [], isLoading: isLoadingUtilization } = useQuery({
    queryKey: ['/api/admin/stats/bus-utilization'],
  });
  
  // Dummy data for demonstration (this would normally come from API)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const pieData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 10 },
    { name: 'Late', value: 5 }
  ];
  
  const barData = [
    { name: 'Mon', onTime: 25, delayed: 2 },
    { name: 'Tue', onTime: 28, delayed: 0 },
    { name: 'Wed', onTime: 26, delayed: 1 },
    { name: 'Thu', onTime: 24, delayed: 3 },
    { name: 'Fri', onTime: 27, delayed: 1 }
  ];
  
  const incidentData = [
    { name: 'Traffic', value: 35 },
    { name: 'Behavior', value: 30 },
    { name: 'Mechanical', value: 20 },
    { name: 'Weather', value: 10 },
    { name: 'Other', value: 5 }
  ];
  
  return (
    <AppLayout showSidebar={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-gray-600">View and export detailed reports about your transportation system</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Last 30 Days
            </Button>
            <Button className="flex items-center">
              <FileDown className="mr-1 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* Reports Tabs */}
        <Tabs defaultValue="attendance">
          <TabsList className="mb-6">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="routes">Routes Analysis</TabsTrigger>
            <TabsTrigger value="buses">Bus Utilization</TabsTrigger>
          </TabsList>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Attendance Overview</CardTitle>
                  <CardDescription>Student attendance rates over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAttendance ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="onTime" name="On Time" fill="#0088FE" />
                        <Bar dataKey="delayed" name="Delayed" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
                  <CardDescription>Overall attendance status</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAttendance ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 w-full grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
                          <div className="text-xl font-bold text-blue-600">85%</div>
                          <div className="text-xs text-gray-600">Present</div>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-red-50">
                          <div className="text-xl font-bold text-red-600">10%</div>
                          <div className="text-xs text-gray-600">Absent</div>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-yellow-50">
                          <div className="text-xl font-bold text-yellow-600">5%</div>
                          <div className="text-xs text-gray-600">Late</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Incidents Tab */}
          <TabsContent value="incidents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Incident Reports Over Time</CardTitle>
                  <CardDescription>Number of incidents reported by month</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingIncidents ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[
                          { month: 'Jan', accidents: 1, breakdowns: 2, delays: 5, behavior: 4 },
                          { month: 'Feb', accidents: 0, breakdowns: 3, delays: 4, behavior: 5 },
                          { month: 'Mar', accidents: 2, breakdowns: 1, delays: 6, behavior: 3 },
                          { month: 'Apr', accidents: 1, breakdowns: 2, delays: 3, behavior: 6 },
                          { month: 'May', accidents: 0, breakdowns: 1, delays: 4, behavior: 5 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="accidents" name="Accidents" fill="#FF8042" />
                        <Bar dataKey="breakdowns" name="Breakdowns" fill="#8884D8" />
                        <Bar dataKey="delays" name="Delays" fill="#FFBB28" />
                        <Bar dataKey="behavior" name="Behavior" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Incident Types</CardTitle>
                  <CardDescription>Distribution of incident types</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingIncidents ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={incidentData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {incidentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                        {incidentData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm">{item.name}: {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Other tabs would be implemented similarly */}
          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle>Route Performance Analysis</CardTitle>
                <CardDescription>Analysis of route timeliness and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <FileBarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Route Analysis Coming Soon</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      We're currently collecting more data to provide meaningful route analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="buses">
            <Card>
              <CardHeader>
                <CardTitle>Bus Utilization</CardTitle>
                <CardDescription>Analysis of bus capacity and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Bus Utilization Coming Soon</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      We're currently collecting more data to provide meaningful bus utilization analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}