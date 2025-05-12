import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import MobileNavBar from "@/components/shared/MobileNavBar";
import { UserRole } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ReportIncident() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("medium");
  
  // Fetch assigned bus
  const { data: bus } = useQuery({
    queryKey: ['/api/driver/bus'],
    enabled: !!user,
  });
  
  // Fetch routes for the assigned bus
  const { data: routes = [] } = useQuery({
    queryKey: ['/api/driver/routes'],
    enabled: !!bus,
  });
  
  // Report incident mutation
  const reportIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/driver/report-incident', data);
    },
    onSuccess: () => {
      toast({
        title: "Incident reported",
        description: "Your incident report has been successfully submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      navigate("/driver/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error reporting incident",
        description: (error as Error).message || "An error occurred while submitting your incident report.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bus || !type || !title || !description) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    reportIncidentMutation.mutate({
      busId: bus.id,
      routeId: routes[0]?.id,
      title,
      description,
      type,
      severity
    });
  };
  
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Report Incident</h2>
          <p className="text-gray-600">Report any issues or incidents that occur during your route</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Incident Report Form</CardTitle>
            <CardDescription>
              Please provide detailed information about the incident
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bus-info">Bus Information</Label>
                  <Input
                    id="bus-info"
                    value={bus ? `Bus #${bus.busNumber} - ${bus.licenseNumber}` : "Loading..."}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="route-info">Route Information</Label>
                  <Input
                    id="route-info"
                    value={routes.length > 0 ? `${routes[0].name} (${routes[0].startTime} - ${routes[0].endTime})` : "No active route"}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Brief title describing the incident"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Type of Incident <span className="text-destructive">*</span></Label>
                  <Select
                    value={type}
                    onValueChange={setType}
                    required
                  >
                    <SelectTrigger id="incident-type">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                      <SelectItem value="delay">Significant Delay</SelectItem>
                      <SelectItem value="behavior">Student Behavior</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Severity Level <span className="text-destructive">*</span></Label>
                  <RadioGroup 
                    value={severity} 
                    onValueChange={setSeverity}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="severity-low" />
                      <Label htmlFor="severity-low" className="font-normal">
                        Low - Minor issue, no delays or safety concerns
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="severity-medium" />
                      <Label htmlFor="severity-medium" className="font-normal">
                        Medium - Moderate issue with minor delays or concerns
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="severity-high" />
                      <Label htmlFor="severity-high" className="font-normal">
                        High - Serious issue with significant delays or concerns
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="critical" id="severity-critical" />
                      <Label htmlFor="severity-critical" className="font-normal">
                        Critical - Emergency situation requiring immediate attention
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about what happened"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                
                {type === "accident" && (
                  <div className="p-4 border border-destructive bg-destructive/10 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-destructive">Important Note for Accidents</h4>
                        <p className="text-sm mt-1">If this is a serious accident with injuries, please ensure you have:</p>
                        <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                          <li>Called emergency services if needed (911)</li>
                          <li>Secured the scene and assessed any injuries</li>
                          <li>Notified administration using the emergency button</li>
                          <li>Documented the incident with photos if possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/driver/dashboard")}
                    disabled={reportIncidentMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={reportIncidentMutation.isPending || !title || !description || !type}
                  >
                    {reportIncidentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavBar userRole={UserRole.DRIVER} />
    </AppLayout>
  );
}
