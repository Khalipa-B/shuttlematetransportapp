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
import { Loader2, User, UserRound, Home, Phone, Mail, Shield, Key, Calendar, CreditCard, BadgeCent } from "lucide-react";

export default function DriverProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Fetch driver profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/driver/profile'],
    enabled: !!user,
    onSuccess: (data) => {
      if (data?.driver) {
        setPhone(data.driver.phone || "");
        setAddress(data.driver.address || "");
      }
    }
  });
  
  // Fetch assigned bus
  const { data: bus } = useQuery({
    queryKey: ['/api/driver/bus'],
    enabled: !!user,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/driver/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/profile'] });
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
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <p className="text-gray-600">View and update your driver information</p>
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
                          <span className="text-xs font-medium">Driver</span>
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
                        <p className="font-medium">{profile?.driver?.phone || "Not provided"}</p>
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
                        <p className="font-medium">{profile?.driver?.address || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Driver License</p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-40" />
                      ) : (
                        <p className="font-medium">{profile?.driver?.licenseNumber || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">License Expiry</p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-36" />
                      ) : (
                        <p className="font-medium">{formatDate(profile?.driver?.licenseExpiry) || "Not provided"}</p>
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
                <TabsTrigger value="info" className="flex-1">Driver Information</TabsTrigger>
                <TabsTrigger value="assignment" className="flex-1">Assignment</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
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
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="licenseNumber">License Number</Label>
                              <Input
                                id="licenseNumber"
                                placeholder="License Number"
                                value={profile?.driver?.licenseNumber || ""}
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">Cannot be edited by driver</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="licenseExpiry">License Expiry</Label>
                              <Input
                                id="licenseExpiry"
                                type="date"
                                placeholder="License Expiry"
                                value={profile?.driver?.licenseExpiry ? new Date(profile.driver.licenseExpiry).toISOString().split('T')[0] : ""}
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">Cannot be edited by driver</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setPhone(profile?.driver?.phone || "");
                              setAddress(profile?.driver?.address || "");
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
                          <p className="mt-1 text-lg">{profile?.driver?.phone || "Not provided"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Address</h3>
                          <p className="mt-1 text-lg">{profile?.driver?.address || "Not provided"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Driver License</h3>
                          <p className="mt-1 text-lg">{profile?.driver?.licenseNumber || "Not provided"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">License Expiry</h3>
                          <p className="mt-1 text-lg">{formatDate(profile?.driver?.licenseExpiry) || "Not provided"}</p>
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
              
              <TabsContent value="assignment" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Assignment</CardTitle>
                    <CardDescription>
                      Your bus assignment and routes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-6">
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                      </div>
                    ) : !bus ? (
                      <div className="text-center py-6">
                        <div className="mx-auto bg-gray-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                          <BadgeCent className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium">No Bus Assigned</h3>
                        <p className="text-muted-foreground mt-1">
                          You are not currently assigned to any bus.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium">Assigned Bus</h3>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Bus Number</p>
                              <p className="font-medium">Bus #{bus.busNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">License Plate</p>
                              <p className="font-medium">{bus.licenseNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Capacity</p>
                              <p className="font-medium">{bus.capacity} students</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="font-medium capitalize">{bus.status}</p>
                            </div>
                          </div>
                        </div>
                        
                        {profile?.routes?.length > 0 ? (
                          <div>
                            <h3 className="text-lg font-medium mb-3">Assigned Routes</h3>
                            <div className="divide-y border rounded-lg">
                              {profile.routes.map((route: any) => (
                                <div key={route.id} className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{route.name}</h4>
                                    <Badge className={route.isActive ? 'bg-success' : 'bg-gray-500'}>
                                      {route.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-500">Start Time: </span>
                                      {route.startTime}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">End Time: </span>
                                      {route.endTime}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">No routes assigned</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
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
      <MobileNavBar userRole={UserRole.DRIVER} />
    </AppLayout>
  );
}
