import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DelayReporterProps {
  routeId: number;
  className?: string;
}

export default function DelayReporter({ routeId, className }: DelayReporterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState("10");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("low");

  // Get route details
  const { data: route } = useQuery({
    queryKey: [`/api/driver/route/${routeId}`],
    enabled: !!routeId
  });

  // Report delay mutation
  const reportDelayMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/driver/report-delay', {
        routeId,
        delayMinutes: parseInt(delayMinutes),
        reason,
        severity
      });
    },
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Delay reported",
        description: "All affected parents have been notified.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error reporting delay",
        description: (error as Error).message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!delayMinutes || !reason) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    reportDelayMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="warning" 
          className={`${className || ''} flex items-center`}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Delay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Report Route Delay</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input 
              id="route" 
              value={route?.name || `Route #${routeId}`} 
              disabled 
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="delay-minutes">Estimated Delay (minutes)</Label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={delayMinutes === minutes.toString() ? "default" : "outline"}
                  onClick={() => setDelayMinutes(minutes.toString())}
                  className="flex-1"
                >
                  {minutes}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="delay-minutes"
                type="number"
                min="1"
                max="120"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-20"
              />
              <span>minutes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Delay</Label>
            <RadioGroup 
              value={reason} 
              onValueChange={setReason}
              className="flex flex-wrap gap-2"
            >
              {[
                "Traffic congestion",
                "Weather conditions",
                "Road construction",
                "Mechanical issue",
                "Other"
              ].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`reason-${option}`} />
                  <Label htmlFor={`reason-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {reason === "Other" && (
              <Textarea
                placeholder="Please specify the reason..."
                className="mt-2"
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Severity</Label>
            <RadioGroup 
              value={severity} 
              onValueChange={setSeverity}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="severity-low" />
                <Label htmlFor="severity-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="severity-medium" />
                <Label htmlFor="severity-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="severity-high" />
                <Label htmlFor="severity-high">High</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={reportDelayMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={reportDelayMutation.isPending || !reason || !delayMinutes}
              className="ml-2"
            >
              {reportDelayMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reporting...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Report Delay
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
