import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Plus,
  Search,
  FileDown, 
  CheckCircle, 
  AlertTriangle,
  Wrench,
  XCircle,
  Loader2
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function BusesTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  
  // Form states
  const [busNumber, setBusNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [status, setStatus] = useState("active");
  const [driverId, setDriverId] = useState("");

  // Fetch buses
  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['/api/admin/buses'],
  });

  // Fetch drivers for assignment
  const { data: drivers = [] } = useQuery({
    queryKey: ['/api/admin/drivers'],
  });

  // Create bus mutation
  const createBusMutation = useMutation({
    mutationFn: async (busData: any) => {
      return await apiRequest('POST', '/api/admin/buses', busData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/buses'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Bus added",
        description: "The bus has been successfully added to the fleet.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding bus",
        description: (error as Error).message || "An error occurred while adding the bus.",
        variant: "destructive",
      });
    }
  });

  // Update bus mutation
  const updateBusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PUT', `/api/admin/buses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/buses'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Bus updated",
        description: "The bus details have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating bus",
        description: (error as Error).message || "An error occurred while updating the bus.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setBusNumber("");
    setCapacity("");
    setLicenseNumber("");
    setStatus("active");
    setDriverId("");
  };

  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    
    const busData = {
      busNumber,
      capacity: parseInt(capacity),
      licenseNumber,
      status,
      driverId: driverId ? parseInt(driverId) : null
    };
    
    createBusMutation.mutate(busData);
  };

  const handleEditBus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBus) return;
    
    const busData = {
      busNumber,
      capacity: parseInt(capacity),
      licenseNumber,
      status,
      driverId: driverId ? parseInt(driverId) : null
    };
    
    updateBusMutation.mutate({ id: selectedBus.id, data: busData });
  };

  const openEditDialog = (bus: any) => {
    setSelectedBus(bus);
    setBusNumber(bus.busNumber);
    setCapacity(bus.capacity.toString());
    setLicenseNumber(bus.licenseNumber);
    setStatus(bus.status);
    setDriverId(bus.driverId ? bus.driverId.toString() : "");
    setIsEditDialogOpen(true);
  };

  // Filter buses based on search query
  const filteredBuses = buses.filter((bus: any) => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success">Active</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning">Maintenance</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDriverName = (driverId: number | null) => {
    if (!driverId) return "Not assigned";
    
    const driver = drivers.find((d: any) => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : "Unknown";
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-initial">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="flex-1 md:flex-initial" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bus
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus ID</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredBuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No buses found
                </TableCell>
              </TableRow>
            ) : (
              filteredBuses.map((bus: any) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">Bus #{bus.busNumber}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell>{bus.licenseNumber}</TableCell>
                  <TableCell>{getDriverName(bus.driverId)}</TableCell>
                  <TableCell>{getStatusBadge(bus.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => openEditDialog(bus)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Bus Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBus}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="busNumber">Bus Number</Label>
                  <Input
                    id="busNumber"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <span className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-success" />
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <span className="flex items-center">
                          <Wrench className="mr-2 h-4 w-4 text-warning" />
                          Maintenance
                        </span>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <span className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                          Inactive
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver">Assign Driver</Label>
                  <Select
                    value={driverId}
                    onValueChange={(value) => setDriverId(value)}
                  >
                    <SelectTrigger id="driver">
                      <SelectValue placeholder="Assign driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      {drivers.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createBusMutation.isPending}
              >
                {createBusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add Bus</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBus}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-busNumber">Bus Number</Label>
                  <Input
                    id="edit-busNumber"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-licenseNumber">License Number</Label>
                <Input
                  id="edit-licenseNumber"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <span className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-success" />
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <span className="flex items-center">
                          <Wrench className="mr-2 h-4 w-4 text-warning" />
                          Maintenance
                        </span>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <span className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                          Inactive
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver">Assign Driver</Label>
                  <Select
                    value={driverId}
                    onValueChange={(value) => setDriverId(value)}
                  >
                    <SelectTrigger id="edit-driver">
                      <SelectValue placeholder="Assign driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      {drivers.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateBusMutation.isPending}
              >
                {updateBusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
