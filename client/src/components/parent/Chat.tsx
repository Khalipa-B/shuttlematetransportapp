import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useChatMessages } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { formatTime, formatDate, timeAgo } from '@/lib/utils';
import { User, Message } from '@shared/schema';

interface Contact {
  id: string;
  name: string;
  role: string;
  profileImageUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Query to get available contacts (drivers, admins)
  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ['/api/users/contacts'],
    // If this endpoint doesn't exist, we can create a fallback list of contacts
    onError: () => {
      return [
        {
          id: 'driver-1',
          name: 'John Davis',
          role: 'Bus Driver',
          lastMessage: 'We\'re running about 5 minutes late due to traffic.',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2
        },
        {
          id: 'admin-1',
          name: 'Emma Torres',
          role: 'Transportation Admin',
          lastMessage: 'Schedule change for next week',
          lastMessageTime: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  });
  
  // Get messages with selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedContact?.id],
    enabled: !!selectedContact?.id
  });
  
  // Subscribe to real-time chat messages
  const { messages: realtimeMessages } = useChatMessages(selectedContact?.id);
  
  // Combine API and realtime messages
  const allMessages = React.useMemo(() => {
    if (!messages) return realtimeMessages;
    
    // Create a map of existing messages to avoid duplicates
    const messageMap = new Map();
    messages.forEach(msg => messageMap.set(msg.id, msg));
    
    // Add realtime messages, avoiding duplicates
    realtimeMessages.forEach(msg => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
      }
    });
    
    // Convert back to array and sort by timestamp
    return Array.from(messageMap.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, realtimeMessages]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedContact) throw new Error("No contact selected");
      
      return apiRequest('POST', '/api/messages', {
        receiverId: selectedContact.id,
        content
      });
    },
    onSuccess: () => {
      // Clear message input and invalidate the query to refetch messages
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedContact?.id] });
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages]);
  
  // Select first contact by default
  useEffect(() => {
    if (contacts?.length && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);
  
  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedContact) {
      sendMessageMutation.mutate(message);
    }
  };
  
  // Determine if a date separator should be shown
  const shouldShowDateSeparator = (currentIndex: number, messages: Message[]) => {
    if (currentIndex === 0) return true;
    
    const currentDate = new Date(messages[currentIndex].timestamp).toDateString();
    const prevDate = new Date(messages[currentIndex - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Contacts List */}
        <div className="border-r border-gray-200">
          <CardHeader className="py-4">
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          
          <div className="h-[calc(600px-70px)] overflow-y-auto divide-y">
            {contactsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-royal-blue animate-spin" />
              </div>
            ) : contacts?.length ? (
              contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`p-4 flex items-center hover:bg-gray-50 cursor-pointer ${
                    selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage 
                      src={contact.profileImageUrl} 
                      alt={contact.name}
                    />
                    <AvatarFallback className="bg-royal-blue text-white">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    {contact.lastMessageTime && (
                      <span className="text-xs text-gray-500">
                        {timeAgo(contact.lastMessageTime)}
                      </span>
                    )}
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <span className="bg-royal-blue text-white text-xs px-2 py-1 rounded-full mt-1">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full p-4 text-center">
                <div>
                  <p className="text-gray-600 mb-2">No contacts available</p>
                  <p className="text-sm text-gray-500">Contact your school administrator to set up communication</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Content */}
        <div className="col-span-2 flex flex-col h-full">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage 
                    src={selectedContact.profileImageUrl} 
                    alt={selectedContact.name}
                  />
                  <AvatarFallback className="bg-royal-blue text-white">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedContact.name}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-royal-blue animate-spin" />
                  </div>
                ) : allMessages?.length ? (
                  <>
                    {allMessages.map((msg, index) => (
                      <React.Fragment key={msg.id || index}>
                        {/* Date Separator */}
                        {shouldShowDateSeparator(index, allMessages) && (
                          <div className="flex justify-center">
                            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`flex items-start ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          {msg.senderId !== user?.id && (
                            <Avatar className="h-9 w-9 mr-3 mt-1">
                              <AvatarImage 
                                src={selectedContact.profileImageUrl} 
                                alt={selectedContact.name}
                              />
                              <AvatarFallback className="bg-royal-blue text-white">
                                {selectedContact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`rounded-lg p-3 shadow-sm max-w-xs ${
                            msg.senderId === user?.id 
                              ? 'bg-royal-blue text-white' 
                              : 'bg-white text-gray-800'
                          }`}>
                            <p>{msg.content}</p>
                            <span className={`text-xs mt-1 block ${
                              msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-royal-blue mr-3"
                  >
                    <Paperclip className="h-6 w-6" />
                  </Button>
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-grow py-2 px-4 rounded-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="submit"
                    className="bg-royal-blue text-white rounded-full p-2 ml-3 hover:bg-light-blue transition"
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? 
                      <Loader2 className="h-6 w-6 animate-spin" /> : 
                      <Send className="h-6 w-6" />
                    }
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Chat;
