import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import ChatInterface from "@/components/shared/ChatInterface";
import { UserRole } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Users, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DriverMessages() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch contacts (parents of students on route and admins)
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/driver/contacts'],
    enabled: !!user,
  });

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(query) ||
      contact.lastName?.toLowerCase().includes(query) ||
      contact.role?.toLowerCase().includes(query) ||
      contact.studentName?.toLowerCase().includes(query) ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Communicate with parents and administrators</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="md:col-span-1">
            <Card>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardContent className="p-0">
                <Tabs defaultValue="parents" className="w-full">
                  <TabsList className="w-full rounded-none">
                    <TabsTrigger value="parents" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Parents
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex-1">
                      <UserRound className="h-4 w-4 mr-2" />
                      Admin
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="parents" className="m-0">
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredContacts.filter(c => c.role === 'parent').length === 0 ? (
                      <div className="p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No parents found</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredContacts
                          .filter((contact: any) => contact.role === 'parent')
                          .map((contact: any) => (
                            <div 
                              key={contact.id}
                              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                                selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => setSelectedContact(contact)}
                            >
                              <Avatar>
                                <AvatarImage src={contact.profileImageUrl} />
                                <AvatarFallback className="bg-accent text-primary">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Parent of {contact.studentName}
                                </div>
                              </div>
                              {contact.unreadCount > 0 && (
                                <Badge className="bg-primary h-6 w-6 rounded-full flex items-center justify-center p-0">
                                  {contact.unreadCount}
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="admin" className="m-0">
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        {Array(2).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredContacts.filter(c => c.role === 'admin').length === 0 ? (
                      <div className="p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No administrators found</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredContacts
                          .filter((contact: any) => contact.role === 'admin')
                          .map((contact: any) => (
                            <div 
                              key={contact.id}
                              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                                selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => setSelectedContact(contact)}
                            >
                              <Avatar>
                                <AvatarImage src={contact.profileImageUrl} />
                                <AvatarFallback className="bg-primary text-white">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Transport Administrator
                                </div>
                              </div>
                              {contact.unreadCount > 0 && (
                                <Badge className="bg-primary h-6 w-6 rounded-full flex items-center justify-center p-0">
                                  {contact.unreadCount}
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedContact ? (
              <ChatInterface
                receiverId={selectedContact.id}
                receiverName={`${selectedContact.firstName} ${selectedContact.lastName}`}
                receiverImage={selectedContact.profileImageUrl}
                receiverRole={selectedContact.role}
              />
            ) : (
              <Card className="flex flex-col h-full">
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-blue-100 p-6 mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Select a Contact</h2>
                  <p className="text-gray-600 max-w-md">
                    Choose a parent or administrator from the list to start a conversation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.DRIVER} />
    </AppLayout>
  );
}
