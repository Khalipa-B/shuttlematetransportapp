import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  FileDown, 
  Eye,
  Phone,
  Mail
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriversTable() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch drivers
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/drivers'],
  });

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter((driver: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      driver.firstName?.toLowerCase().includes(searchLower) ||
      driver.lastName?.toLowerCase().includes(searchLower) ||
      driver.user?.email?.toLowerCase().includes(searchLower) ||
      driver.phone?.includes(searchQuery) ||
      driver.licenseNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getDriverStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500">On Leave</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDriverInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "??";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Bus</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-9 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver: any) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={driver.user?.profileImageUrl} />
                        <AvatarFallback className="bg-primary text-white">
                          {getDriverInitials(driver.user?.firstName, driver.user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{driver.user?.firstName} {driver.user?.lastName}</div>
                        <div className="text-sm text-muted-foreground">{driver.user?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{driver.user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{driver.licenseNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getDriverStatus(driver.status)}</TableCell>
                  <TableCell>
                    {driver.bus ? (
                      <span>Bus #{driver.bus.busNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
