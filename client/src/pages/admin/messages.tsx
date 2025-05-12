import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Phone, VideoIcon } from "lucide-react";

export default function AdminMessages() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  
  // Fetch all users that admin can chat with
  const { data: chatUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/chat-users'],
  });
  
  // Fetch messages with selected user
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/admin/messages', selectedUserId],
    enabled: !!selectedUserId,
  });
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId) return;
    
    // API call would go here
    console.log(`Sending message to ${selectedUserId}: ${messageText}`);
    
    // Clear message input
    setMessageText("");
  };
  
  return (
    <AppLayout showSidebar={true}>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Contacts Sidebar */}
        <div className="w-full md:w-80 border-r bg-muted/20">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." className="pl-8" />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Conversations</h3>
              {isLoadingUsers ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chatUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No contacts available
                </div>
              ) : (
                <div className="space-y-1">
                  {chatUsers.map((chatUser: any) => (
                    <button
                      key={chatUser.id}
                      className={`flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors ${
                        selectedUserId === chatUser.id ? 'bg-muted' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedUserId(chatUser.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chatUser.profileImageUrl} />
                        <AvatarFallback>
                          {chatUser.firstName?.[0]}{chatUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {chatUser.firstName} {chatUser.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chatUser.role === UserRole.DRIVER ? 'Driver' : 'Parent'}
                        </div>
                      </div>
                      {chatUser.unreadCount > 0 && (
                        <div className="ml-auto bg-primary text-primary-foreground rounded-full h-5 min-w-[20px] flex items-center justify-center text-xs px-1">
                          {chatUser.unreadCount}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center justify-between">
                {isLoadingUsers ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {chatUsers.find((u: any) => u.id === selectedUserId)?.firstName?.[0]}
                        {chatUsers.find((u: any) => u.id === selectedUserId)?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {chatUsers.find((u: any) => u.id === selectedUserId)?.firstName}{' '}
                        {chatUsers.find((u: any) => u.id === selectedUserId)?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Online
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <VideoIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-muted' : 'bg-primary text-primary-foreground'} rounded-lg p-3`}>
                          <Skeleton className={`h-4 w-full ${i % 2 === 0 ? 'bg-gray-300' : 'bg-primary-700'}`} />
                          <Skeleton className={`h-4 w-2/3 mt-1 ${i % 2 === 0 ? 'bg-gray-300' : 'bg-primary-700'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold">No Messages Yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Start the conversation by sending a message below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        {message.senderId !== user?.id && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {chatUsers.find((u: any) => u.id === message.senderId)?.firstName?.[0]}
                              {chatUsers.find((u: any) => u.id === message.senderId)?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] ${
                          message.senderId === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3`}>
                          <p>{message.message}</p>
                          <div className={`text-xs mt-1 ${
                            message.senderId === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold">Your Messages</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Select a conversation from the left to view and send messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}