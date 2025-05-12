import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatInterfaceProps {
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
  receiverRole?: string;
}

export default function ChatInterface({
  receiverId,
  receiverName,
  receiverImage,
  receiverRole
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isLoading, isConnected, isSending } = useChat(receiverId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-primary text-white";
      case "driver":
        return "bg-secondary text-white";
      case "parent":
        return "bg-accent text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={receiverImage} />
              <AvatarFallback className="bg-primary text-white">
                {receiverName?.[0] || <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{receiverName}</CardTitle>
              {receiverRole && (
                <Badge className={`text-xs mt-1 ${getRoleColor(receiverRole)}`}>
                  {receiverRole.charAt(0).toUpperCase() + receiverRole.slice(1)}
                </Badge>
              )}
            </div>
          </div>
          <Badge className={isConnected ? "bg-success" : "bg-warning"}>
            {isConnected ? "Connected" : "Reconnecting..."}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[60vh]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="bg-primary bg-opacity-10 rounded-full p-4 mb-3">
              <Send className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No messages yet</h3>
            <p className="text-muted-foreground mt-1">
              Start a conversation with {receiverName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isSender = msg.senderId === user?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      isSender 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        isSender ? 'text-primary-foreground opacity-80' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-3">
        {!isConnected ? (
          <div className="w-full p-2 bg-warning bg-opacity-10 rounded-lg text-warning text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Connection issue. Messages may be delayed.
          </div>
        ) : (
          <div className="flex w-full items-end gap-2">
            <Textarea 
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none"
              rows={2}
            />
            <Button 
              size="icon" 
              className="h-[40px]"
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
