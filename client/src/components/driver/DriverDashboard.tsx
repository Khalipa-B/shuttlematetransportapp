import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentCheckIn from './StudentCheckIn';
import RouteManagement from './RouteManagement';
import DriverChat from './DriverChat';
import IncidentReport from './IncidentReport';
import Emergency from './Emergency';
import { Users, Map, MessageSquare, AlertTriangle, FileText } from 'lucide-react';

const DriverDashboard: React.FC = () => {
  const [location] = useLocation();
  
  // Determine active tab based on the current route
  const getActiveTab = () => {
    if (location === '/dashboard/route') return 'route';
    if (location === '/dashboard/chat') return 'chat';
    if (location === '/dashboard/incident') return 'incident';
    if (location === '/dashboard/emergency') return 'emergency';
    return 'students'; // Default tab
  };
  
  const activeTab = getActiveTab();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
      
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid grid-cols-5 md:w-auto">
          <TabsTrigger 
            value="students" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Students</span>
            <span className="sm:hidden">Check-In</span>
          </TabsTrigger>
          <TabsTrigger 
            value="route" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/route'}
          >
            <Map className="w-4 h-4 mr-2" />
            <span>Route</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/chat'}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Messages</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="incident" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/incident'}
          >
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Incident Report</span>
            <span className="sm:hidden">Report</span>
          </TabsTrigger>
          <TabsTrigger 
            value="emergency" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/emergency'}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Emergency</span>
            <span className="sm:hidden">Alert</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="students">
            <StudentCheckIn />
          </TabsContent>
          <TabsContent value="route">
            <RouteManagement />
          </TabsContent>
          <TabsContent value="chat">
            <DriverChat />
          </TabsContent>
          <TabsContent value="incident">
            <IncidentReport />
          </TabsContent>
          <TabsContent value="emergency">
            <Emergency />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DriverDashboard;
