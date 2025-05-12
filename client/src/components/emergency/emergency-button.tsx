import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from 'lucide-react';

interface EmergencyButtonProps {
  tripId: number;
  driverId: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  tripId,
  driverId,
  size = 'lg',
  className = '',
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/incidents/emergency', {
        tripId,
        driverId,
        type: 'emergency',
        severity: 'critical',
        description: 'Emergency alert triggered by driver',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Emergency Alert Sent',
        description: 'Your emergency alert has been sent. Help is on the way.',
        variant: 'destructive',
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Alert',
        description: 'Failed to send emergency alert. Please try again or use alternative methods to get help.',
        variant: 'destructive',
        duration: 10000,
      });
      console.error('Error sending emergency alert:', error);
    },
  });

  const handleEmergency = () => {
    emergencyMutation.mutate();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size={size} 
          className={`flex items-center justify-center ${className}`}
        >
          <ShieldAlert className="mr-2 h-5 w-5" />
          EMERGENCY ALERT
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Emergency Alert Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately notify school administrators, transportation department, and emergency services if necessary.
            <br /><br />
            <span className="font-bold">Only press this in case of a genuine emergency.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleEmergency} 
            className="bg-red-600 hover:bg-red-700"
          >
            {emergencyMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending Alert...
              </>
            ) : (
              'Confirm Emergency'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmergencyButton;
