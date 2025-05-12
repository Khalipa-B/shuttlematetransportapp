import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import { UserRole } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, UserRound, Home, Phone, Mail, Shield, Key } from "lucide-react";

export default function ParentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Fetch parent profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/parent/profile'],
    enabled: !!user,
    onSuccess: (data) => {
      if (data?.parent) {
        setPhone(data.parent.phone || "");
        setAddress(data.parent.address || "");
      }
    }
  });
  
  // Fetch children
  const { data: children = [] } = useQuery({
    queryKey: ['/api/parent/children'],
    enabled: !!user,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/parent/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: (error as Error).message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      phone,
      address
    });
  };
  
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <p className="text-gray-600">View and update your personal information</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {isLoading ? (
                    <Skeleton className="h-24 w-24 rounded-full" />
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="bg-primary text-3xl text-white">
                        {user?.firstName?.[0] || user?.email?.[0] || <UserRound />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="mt-4 text-center">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-6 w-32 mx-auto mb-1" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <div className="mt-2 bg-blue-100 text-primary px-3 py-1 rounded-full inline-flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">Parent</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        <p className="font-medium">{profile?.parent?.phone || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start p-2 bg-gray-50 rounded-lg">
                    <Home className="h-4 w-4 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-48" />
                      ) : (
                        <p className="font-medium">{profile?.parent?.address || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-40" />
                      ) : (
                        <p className="font-medium">{user?.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Personal Information</TabsTrigger>
                <TabsTrigger value="children" className="flex-1">Children</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                placeholder="First Name"
                                value={user?.firstName || ""}
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">Managed by authentication provider</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                placeholder="Last Name"
                                value={user?.lastName || ""}
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">Managed by authentication provider</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email"
                              value={user?.email || ""}
                              disabled
                            />
                            <p className="text-xs text-muted-foreground">Managed by authentication provider</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              placeholder="Phone Number"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              placeholder="Address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setPhone(profile?.parent?.phone || "");
                              setAddress(profile?.parent?.address || "");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>Save Changes</>
                            )}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                            <p className="mt-1 text-lg">{user?.firstName || "Not provided"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                            <p className="mt-1 text-lg">{user?.lastName || "Not provided"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="mt-1 text-lg">{user?.email || "Not provided"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                          <p className="mt-1 text-lg">{profile?.parent?.phone || "Not provided"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Address</h3>
                          <p className="mt-1 text-lg">{profile?.parent?.address || "Not provided"}</p>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                          <Button onClick={() => setIsEditing(true)}>
                            Edit Information
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="children" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Children</CardTitle>
                    <CardDescription>
                      View information about your registered children
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array(2).fill(0).map((_, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-48 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : children.length === 0 ? (
                      <div className="text-center py-6">
                        <UserRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No children registered</h3>
                        <p className="text-muted-foreground mt-1">
                          You don't have any children registered in the system.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {children.map((child: any) => (
                          <div key={child.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-white">
                                {child.firstName[0]}{child.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-medium">{child.firstName} {child.lastName}</h3>
                              <p className="text-gray-600">Grade {child.grade}, {child.school}</p>
                              {child.routeId ? (
                                <p className="text-sm mt-1">
                                  <span className="text-primary font-medium">Route:</span> {child.route?.name}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 mt-1">No route assigned</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      To add or remove children, please contact your school administrator.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Password</h3>
                          <Button variant="outline" size="sm" disabled>
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Password management is handled by your authentication provider.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Account Information</h3>
                          <Button variant="outline" size="sm" onClick={() => window.location.href = "/api/logout"}>
                            Log Out
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You are currently logged in as {user?.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.PARENT} />
    </AppLayout>
  );
}
