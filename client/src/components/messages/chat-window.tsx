import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Message, User } from '@shared/schema';
import { Send, PaperclipIcon, Clock, Info, MapPin, CheckCircle } from 'lucide-react';

interface ChatWindowProps {
  recipient: User | null;
  messages: Message[];
  isLoadingMessages: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipient, messages, isLoadingMessages }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !recipient || !user) return;
    
    setIsSending(true);
    try {
      await apiRequest('POST', '/api/messages', {
        fromUserId: user.id,
        toUserId: recipient.id,
        content: newMessage
      });
      
      // If successful, clear the input field
      setNewMessage('');
      
      // Invalidate the messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/messages', recipient.id] });

    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again later',
        variant: 'destructive'
      });
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendQuickMessage = (template: string) => {
    setNewMessage(template);
  };

  // Helper function to group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!recipient) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a contact to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center">
        <UserAvatar 
          src={recipient.profileImageUrl || undefined} 
          name={`${recipient.firstName} ${recipient.lastName}`} 
        />
        <div className="ml-3">
          <h3 className="font-semibold">{recipient.firstName} {recipient.lastName}</h3>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
        {isLoadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Marker */}
              <div className="flex justify-center mb-4">
                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  {new Date(date).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? 'Today' 
                    : date}
                </span>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-4">
                {msgs.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex items-start ${message.fromUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.fromUserId !== user?.id && (
                      <UserAvatar 
                        src={recipient.profileImageUrl || undefined} 
                        name={`${recipient.firstName} ${recipient.lastName}`}
                        size="sm"
                        className="mr-2 mt-1"
                      />
                    )}
                    <div 
                      className={`rounded-lg p-3 shadow-sm max-w-xs ${
                        message.fromUserId === user?.id 
                          ? 'bg-royal-blue text-white' 
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <span 
                        className={`text-xs mt-1 block ${
                          message.fromUserId === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t bg-white">
        {/* Quick message buttons for driver */}
        {user?.role === 'driver' && (
          <div className="flex mb-2 space-x-2 overflow-x-auto pb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendQuickMessage("We're running about 5 minutes late due to traffic.")}
              className="whitespace-nowrap"
            >
              <Clock className="h-4 w-4 mr-1" />
              Delay
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendQuickMessage("Your child has boarded the bus safely.")}
              className="whitespace-nowrap"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Status
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendQuickMessage("We're currently at the corner of Main St and 5th Ave.")}
              className="whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Location
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendQuickMessage("Reminder: Early dismissal tomorrow at 2 PM.")}
              className="whitespace-nowrap"
            >
              <Info className="h-4 w-4 mr-1" />
              Info
            </Button>
          </div>
        )}
        
        <div className="flex items-center">
          <Button variant="ghost" className="rounded-full p-2 mr-2">
            <PaperclipIcon className="h-5 w-5 text-gray-500" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow rounded-3xl resize-none min-h-0 h-10 py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="rounded-full p-2 ml-2" 
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
