import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { insertIncidentSchema } from '@shared/schema';

// Extend the incident schema with client-side validation
const incidentFormSchema = insertIncidentSchema.extend({
  type: z.enum(['behavior', 'medical', 'vehicle', 'route', 'other'], {
    required_error: 'Please select an incident type',
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Please select the severity level',
  }),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  actionTaken: z.string().optional(),
  students: z.array(z.number()).optional(),
  isEmergency: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentReportFormProps {
  tripId: number;
  onSuccess?: () => void;
  className?: string;
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ 
  tripId, 
  onSuccess,
  className = '' 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch students for the trip
  const { data: students } = useQuery({
    queryKey: ['/api/trips', tripId, 'students'],
    enabled: !!tripId,
  });

  // Create form with default values
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      tripId,
      driverId: user?.id,
      type: undefined,
      severity: undefined,
      location: '',
      description: '',
      actionTaken: '',
      students: [],
      isEmergency: false,
    },
  });

  // Submit incident report
  const submitMutation = useMutation({
    mutationFn: async (values: IncidentFormValues) => {
      // Extract students array to be sent separately
      const { students, isEmergency, ...incidentData } = values;
      
      // Submit the incident
      const response = await apiRequest('POST', '/api/incidents', {
        ...incidentData,
        tripId,
        driverId: user?.id,
      });
      
      const incident = await response.json();
      
      // If we have students, attach them to the incident
      if (students && students.length > 0) {
        await apiRequest('POST', `/api/incidents/${incident.id}/students`, {
          studentIds: students,
        });
      }
      
      // If it's an emergency, send emergency notification
      if (isEmergency) {
        await apiRequest('POST', '/api/incidents/emergency', {
          incidentId: incident.id,
        });
      }
      
      return incident;
    },
    onSuccess: () => {
      toast({
        title: 'Incident reported',
        description: 'Your incident report has been submitted successfully',
      });
      
      // Reset form after successful submission
      form.reset();
      
      // Invalidate incidents queries
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error submitting report',
        description: 'There was a problem submitting your incident report. Please try again.',
        variant: 'destructive',
      });
      console.error('Error submitting incident report:', error);
    },
  });

  const onSubmit = (values: IncidentFormValues) => {
    submitMutation.mutate(values);
  };

  return (
    <Card className={className}>
      <CardHeader className="bg-royal-blue text-white">
        <CardTitle>Report an Incident</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="behavior">Student Behavior</SelectItem>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="vehicle">Vehicle Issue</SelectItem>
                        <SelectItem value="route">Route Disruption</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Informational</SelectItem>
                        <SelectItem value="medium">Medium - Requires Attention</SelectItem>
                        <SelectItem value="high">High - Urgent</SelectItem>
                        <SelectItem value="critical">Critical - Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter incident location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="students"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Students Involved</FormLabel>
                      <FormDescription>
                        Select all students involved in this incident.
                      </FormDescription>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                      {!students || !Array.isArray(students) || students.length === 0 ? (
                        <p className="text-gray-500">No students on this trip</p>
                      ) : (
                        students.map((student: any) => (
                          <FormField
                            key={student.id}
                            control={form.control}
                            name="students"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={student.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 py-1"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(student.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), student.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== student.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {student.firstName} {student.lastName} (Grade {student.grade})
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what happened in detail..." 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="actionTaken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actions Taken</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any actions you have taken..." 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="isEmergency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-amber-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-amber-900">
                          This is an emergency that requires immediate attention
                        </FormLabel>
                        <FormDescription className="text-amber-800">
                          Checking this will notify administrators and emergency services if necessary.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CardFooter className="flex justify-end space-x-4 px-0">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IncidentReportForm;
