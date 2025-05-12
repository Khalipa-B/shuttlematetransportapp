import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import ConversationList from '@/components/messages/conversation-list';
import ChatWindow from '@/components/messages/chat-window';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { User } from '@shared/schema';

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Get URL query parameters
  const params = new URLSearchParams(window.location.search);
  const recipientId = params.get('recipient');
  
  // Set recipient from URL if provided
  useEffect(() => {
    if (recipientId) {
      setSelectedUserId(recipientId);
    }
  }, [recipientId]);
  
  // Fetch recipient user details
  const { data: selectedUser } = useQuery({
    queryKey: ['/api/users', selectedUserId],
    enabled: !!selectedUserId,
  });
  
  // Fetch messages for the selected conversation
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['/api/messages', selectedUserId],
    enabled: !!selectedUserId,
  });
  
  // Handle selecting a conversation
  const handleSelectConversation = (user: User) => {
    setSelectedUserId(user.id);
    
    // Update URL to include recipient
    const url = new URL(window.location.href);
    url.searchParams.set('recipient', user.id);
    window.history.pushState({}, '', url);
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['parent']}>
      <Helmet>
        <title>Messages - ShuttleMate</title>
        <meta name="description" content="Stay connected with your child's bus drivers and transportation administrators through ShuttleMate's secure messaging system." />
      </Helmet>
      
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        
        <Card className="h-[calc(100vh-200px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="md:col-span-1 border-r border-gray-200 h-full overflow-hidden">
              <ConversationList 
                selectedUserId={selectedUserId} 
                onSelectConversation={handleSelectConversation} 
              />
            </div>
            <div className="md:col-span-2 h-full">
              <ChatWindow 
                recipient={selectedUser || null} 
                messages={messages || []} 
                isLoadingMessages={isLoadingMessages} 
              />
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
