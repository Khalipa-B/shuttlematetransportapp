import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { formatGrade } from '@/lib/utils';
import { User, NotificationSettings, Student } from '@shared/schema';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || ''
  });
  
  // Query to get the user's children
  const { data: children, isLoading: childrenLoading } = useQuery<Student[]>({
    queryKey: ['/api/students/parent'],
  });
  
  // Query to get notification settings
  const { data: notificationSettings, isLoading: settingsLoading } = useQuery<NotificationSettings>({
    queryKey: ['/api/notification-settings'],
  });
  
  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest('PUT', '/api/users/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile",
        variant: "destructive"
      });
    }
  });
  
  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      return apiRequest('PUT', '/api/notification-settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your notification settings have been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notification-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message || "There was an error updating your settings",
        variant: "destructive"
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };
  
  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    if (!notificationSettings) return;
    
    updateSettingsMutation.mutate({ 
      [setting]: value,
      userId: user?.id 
    });
  };
  
  const isLoading = childrenLoading || settingsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-royal-blue animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-royal-blue"
                    disabled={saveProfileMutation.isPending}
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Picture & Settings */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                  <AvatarFallback className="bg-royal-blue text-white text-2xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Picture
                </Button>
                
                <div className="w-full mt-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Account Info</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Email: {user?.email}</p>
                    {user?.phoneNumber && <p>Phone: {user?.phoneNumber}</p>}
                    <p>Role: Parent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bus-arrival">Bus Arrival Alerts</Label>
                  <p className="text-sm text-gray-500">Notify when bus is approaching</p>
                </div>
                <Switch
                  id="bus-arrival"
                  checked={notificationSettings?.busArrival}
                  onCheckedChange={(checked) => handleSettingChange('busArrival', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bus-delay">Bus Delay Notifications</Label>
                  <p className="text-sm text-gray-500">Notify about schedule changes</p>
                </div>
                <Switch
                  id="bus-delay"
                  checked={notificationSettings?.busDelay}
                  onCheckedChange={(checked) => handleSettingChange('busDelay', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="student-boarding">Student Check-in/out</Label>
                  <p className="text-sm text-gray-500">Notify when your child boards or exits the bus</p>
                </div>
                <Switch
                  id="student-boarding"
                  checked={notificationSettings?.studentBoarding}
                  onCheckedChange={(checked) => handleSettingChange('studentBoarding', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="driver-messages">Driver Messages</Label>
                  <p className="text-sm text-gray-500">Receive driver communications</p>
                </div>
                <Switch
                  id="driver-messages"
                  checked={notificationSettings?.driverMessages}
                  onCheckedChange={(checked) => handleSettingChange('driverMessages', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Children Information */}
      <Card>
        <CardHeader>
          <CardTitle>Children</CardTitle>
        </CardHeader>
        <CardContent>
          {children && children.length > 0 ? (
            <div className="space-y-4">
              {children.map(child => (
                <div key={child.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={child.profileImageUrl} alt={child.firstName} />
                    <AvatarFallback className="bg-royal-blue text-white">
                      {child.firstName[0]}{child.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{child.firstName} {child.lastName}</p>
                    <p className="text-sm text-gray-600">
                      {formatGrade(child.grade)} • Student ID: {child.studentId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No children associated with your account</p>
              <p className="text-sm text-gray-400 mt-1">Please contact the school administrator</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
