import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import IncidentReportForm from '@/components/incident-report/report-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { 
  AlertOctagon, 
  Flag, 
  Clock, 
  CheckCircle2, 
  Car, 
  User, 
  Shield, 
  AlertTriangle, 
  MoreHorizontal,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DriverIncidentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedIncidents, setExpandedIncidents] = useState<Set<number>>(new Set());
  
  // Fetch active trip for driver
  const { 
    data: activeTrip,
    isLoading: isLoadingTrip
  } = useQuery({
    queryKey: ['/api/trips/active'],
    enabled: !!user,
  });
  
  // Fetch driver's incidents
  const {
    data: incidents,
    isLoading: isLoadingIncidents
  } = useQuery({
    queryKey: ['/api/driver/incidents'],
    enabled: !!user,
  });
  
  // Mark incident as resolved
  const resolveIncident = async (incidentId: number) => {
    try {
      await apiRequest('PATCH', `/api/incidents/${incidentId}`, {
        resolved: true
      });
      
      toast({
        title: 'Incident resolved',
        description: 'The incident has been marked as resolved.',
      });
      
      // Refresh incidents data
      queryClient.invalidateQueries({ queryKey: ['/api/driver/incidents'] });
    } catch (error) {
      toast({
        title: 'Error resolving incident',
        description: 'There was a problem resolving the incident. Please try again.',
        variant: 'destructive',
      });
      console.error('Error resolving incident:', error);
    }
  };
  
  // Toggle incident details
  const toggleIncidentDetails = (incidentId: number) => {
    setExpandedIncidents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(incidentId)) {
        newSet.delete(incidentId);
      } else {
        newSet.add(incidentId);
      }
      return newSet;
    });
  };
  
  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get incident type icon
  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case 'behavior':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'medical':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'vehicle':
        return <Car className="h-5 w-5 text-blue-500" />;
      case 'route':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['driver']}>
      <Helmet>
        <title>Incident Reports - ShuttleMate</title>
        <meta name="description" content="Report and manage incidents that occur during bus trips with ShuttleMate's incident reporting system." />
      </Helmet>
      
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
        
        <Tabs defaultValue="report">
          <TabsList className="mb-4">
            <TabsTrigger value="report">
              <Flag className="h-4 w-4 mr-2" />
              Report Incident
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              Incident History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="report">
            {isLoadingTrip ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ) : !activeTrip ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You need an active trip to report an incident. Please start a trip from the Students page first.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => window.location.href = '/students'}>
                      Go to Students Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <IncidentReportForm
                tripId={activeTrip.id}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/driver/incidents'] });
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingIncidents ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ) : !incidents || !Array.isArray(incidents) || incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertOctagon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No incidents reported</h3>
                    <p className="text-gray-500">You haven't reported any incidents yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <Card key={incident.id} className="overflow-hidden">
                        <div 
                          className={`p-4 cursor-pointer ${incident.resolved ? 'bg-gray-50' : 'bg-blue-50'}`}
                          onClick={() => toggleIncidentDetails(incident.id)}
                        >
                          <div className="flex items-start">
                            <div className="mr-3">
                              {getIncidentTypeIcon(incident.type)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h3 className="font-semibold text-gray-900">
                                  {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident
                                </h3>
                                <div className="flex items-center">
                                  {getSeverityBadge(incident.severity)}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="ml-2 p-0 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleIncidentDetails(incident.id);
                                    }}
                                  >
                                    {expandedIncidents.has(incident.id) ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Reported: {formatDate(incident.timestamp, true)}</span>
                                <Badge variant="outline" className={incident.resolved ? 'text-green-600' : 'text-yellow-600'}>
                                  {incident.resolved ? 'Resolved' : 'Pending'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {expandedIncidents.has(incident.id) && (
                          <div className="p-4 border-t">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-500">Location</h4>
                                <p>{incident.location || 'Not specified'}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                                <p className="whitespace-pre-line">{incident.description}</p>
                              </div>
                              
                              {incident.actionTaken && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500">Action Taken</h4>
                                  <p className="whitespace-pre-line">{incident.actionTaken}</p>
                                </div>
                              )}
                              
                              {incident.students && incident.students.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500">Students Involved</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {incident.students.map((student: any) => (
                                      <Badge key={student.id} variant="outline">
                                        {student.firstName} {student.lastName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {!incident.resolved && (
                                <div className="flex justify-end">
                                  <Button 
                                    variant="outline"
                                    onClick={() => resolveIncident(incident.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Resolved
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
