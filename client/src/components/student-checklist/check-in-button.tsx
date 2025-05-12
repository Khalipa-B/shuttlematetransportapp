import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut, UserX } from 'lucide-react';

interface CheckInButtonProps {
  tripId: number;
  studentId: number;
  currentStatus?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  tripId,
  studentId,
  currentStatus,
  size = 'default',
  showText = true,
  className = '',
}) => {
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest('POST', `/api/trips/${tripId}/students/${studentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'students'] });
      
      let message;
      if (newStatus === 'checked_in') {
        message = 'Student has been checked in';
      } else if (newStatus === 'checked_out') {
        message = 'Student has been checked out';
      } else {
        message = 'Student has been marked absent';
      }
      
      toast({
        title: 'Status updated',
        description: message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: 'There was a problem updating the status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating status:', error);
    },
  });

  // Determine the new status based on current status
  let newStatus: string;
  let buttonLabel: string;
  let icon: React.ReactNode;
  let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | null | undefined = 'default';

  if (currentStatus === 'checked_in') {
    newStatus = 'checked_out';
    buttonLabel = 'Check Out';
    icon = <LogOut className="h-4 w-4" />;
    variant = 'secondary';
  } else if (currentStatus === 'checked_out' || currentStatus === 'absent') {
    newStatus = 'checked_in';
    buttonLabel = 'Check In';
    icon = <LogIn className="h-4 w-4" />;
    variant = 'default';
  } else {
    newStatus = 'checked_in';
    buttonLabel = 'Check In';
    icon = <LogIn className="h-4 w-4" />;
    variant = 'default';
  }

  const handleClick = () => {
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={updateStatusMutation.isPending || (currentStatus === 'checked_out')}
      className={className}
    >
      <span className="mr-2">{icon}</span>
      {showText && buttonLabel}
    </Button>
  );
};

export const MarkAbsentButton: React.FC<Omit<CheckInButtonProps, 'currentStatus'>> = ({
  tripId,
  studentId,
  size = 'default',
  showText = true,
  className = '',
}) => {
  const { toast } = useToast();

  const markAbsentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/trips/${tripId}/students/${studentId}/status`, { status: 'absent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'students'] });
      toast({
        title: 'Status updated',
        description: 'Student has been marked absent',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: 'There was a problem marking the student as absent. Please try again.',
        variant: 'destructive',
      });
      console.error('Error marking student absent:', error);
    },
  });

  const handleClick = () => {
    markAbsentMutation.mutate();
  };

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleClick}
      disabled={markAbsentMutation.isPending}
      className={className}
    >
      <span className="mr-2"><UserX className="h-4 w-4" /></span>
      {showText && 'Mark Absent'}
    </Button>
  );
};
