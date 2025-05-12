import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@shared/schema';
import { Search } from 'lucide-react';

interface Conversation {
  user: User;
  lastMessage: {
    content: string;
    timestamp: string;
    unreadCount: number;
  };
}

interface ConversationListProps {
  selectedUserId: string | null;
  onSelectConversation: (user: User) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ selectedUserId, onSelectConversation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user,
  });

  // Handle search
  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    
    return conversations.filter((convo: Conversation) => {
      const fullName = `${convo.user.firstName} ${convo.user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-royal-blue mb-4">Messages</h2>
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute top-3 left-3 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((convo: Conversation) => (
              <Button
                key={convo.user.id}
                variant="ghost"
                className={`w-full flex items-center p-4 h-auto justify-start ${
                  selectedUserId === convo.user.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectConversation(convo.user)}
              >
                <UserAvatar
                  src={convo.user.profileImageUrl || undefined}
                  name={`${convo.user.firstName} ${convo.user.lastName}`}
                  className="mr-3"
                />
                <div className="flex-grow text-left">
                  <div className="font-semibold">{convo.user.firstName} {convo.user.lastName}</div>
                  <p className="text-sm text-gray-600 truncate max-w-[200px]">
                    {convo.lastMessage.content}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(convo.lastMessage.timestamp), { addSuffix: true })}
                  </span>
                  {convo.lastMessage.unreadCount > 0 && (
                    <span className="bg-royal-blue text-white text-xs px-2 py-1 rounded-full mt-1">
                      {convo.lastMessage.unreadCount}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
