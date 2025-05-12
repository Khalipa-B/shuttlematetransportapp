import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar-fallback';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

// Profile schema for validation
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  notificationPreferences: z.object({
    busArrival: z.boolean().default(true),
    busDelay: z.boolean().default(true),
    studentCheckIn: z.boolean().default(true),
    studentCheckOut: z.boolean().default(true),
    driverMessages: z.boolean().default(true),
    announcements: z.boolean().default(true),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ParentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch parent profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/parent/profile'],
    enabled: !!user,
  });
  
  // Fetch parent's children
  const { data: children } = useQuery({
    queryKey: ['/api/parent/children'],
    enabled: !!user,
  });
  
  // Form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      notificationPreferences: {
        busArrival: true,
        busDelay: true,
        studentCheckIn: true,
        studentCheckOut: true,
        driverMessages: true,
        announcements: true,
      },
    },
  });
  
  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        notificationPreferences: profile.notificationPreferences || {
          busArrival: true,
          busDelay: true,
          studentCheckIn: true,
          studentCheckOut: true,
          driverMessages: true,
          announcements: true,
        },
      });
    }
  }, [profile, form]);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return apiRequest('PATCH', '/api/parent/profile', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: 'There was a problem updating your profile. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating profile:', error);
    },
  });
  
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  return (
    <DashboardShell requireAuth={true} allowedRoles={['parent']}>
      <Helmet>
        <title>Profile - ShuttleMate</title>
        <meta name="description" content="Manage your profile and notification preferences in ShuttleMate." />
      </Helmet>
      
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Parent Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <h3 className="text-lg font-semibold">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notificationPreferences.busArrival"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Bus Arrival Alerts</FormLabel>
                                <FormDescription>
                                  Receive notifications when the bus is arriving at your stop
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notificationPreferences.busDelay"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Bus Delay Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications about bus delays and route changes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notificationPreferences.studentCheckIn"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Student Check-in Alerts</FormLabel>
                                <FormDescription>
                                  Receive notifications when your child boards the bus
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notificationPreferences.studentCheckOut"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Student Check-out Alerts</FormLabel>
                                <FormDescription>
                                  Receive notifications when your child exits the bus
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <CardFooter className="flex justify-end space-x-4 px-0">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Picture & Children */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    src={user?.profileImageUrl || undefined} 
                    name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    size="lg"
                    className="mb-4"
                  />
                  <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Children</CardTitle>
              </CardHeader>
              <CardContent>
                {!children || !Array.isArray(children) || children.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No children registered
                  </div>
                ) : (
                  <div className="space-y-4">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <UserAvatar 
                          name={`${child.firstName} ${child.lastName}`}
                          size="sm"
                          className="mr-3"
                        />
                        <div>
                          <p className="font-semibold">{child.firstName} {child.lastName}</p>
                          <p className="text-sm text-gray-600">
                            Grade {child.grade} • ID: S-{child.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
