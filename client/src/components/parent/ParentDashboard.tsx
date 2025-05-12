import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusTracking from './BusTracking';
import Chat from './Chat';
import Notifications from './Notifications';
import Profile from './Profile';
import { MapPin, MessageSquare, Bell, User } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const [location] = useLocation();
  
  // Determine active tab based on the current route
  const getActiveTab = () => {
    if (location === '/dashboard/chat') return 'chat';
    if (location === '/dashboard/notifications') return 'notifications';
    if (location === '/dashboard/profile') return 'profile';
    return 'tracking'; // Default tab
  };
  
  const activeTab = getActiveTab();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
      
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-auto">
          <TabsTrigger 
            value="tracking" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard'}
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Bus Tracking</span>
            <span className="sm:hidden">Tracking</span>
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
            value="notifications" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/notifications'}
          >
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex items-center"
            onClick={() => window.location.href = '/dashboard/profile'}
          >
            <User className="w-4 h-4 mr-2" />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="tracking">
            <BusTracking />
          </TabsContent>
          <TabsContent value="chat">
            <Chat />
          </TabsContent>
          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>
          <TabsContent value="profile">
            <Profile />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ParentDashboard;
