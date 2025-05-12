import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, UserRound, GraduationCap, MapPin } from "lucide-react";

export default function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  const statCards = [
    {
      title: "Total Buses",
      icon: <Bus className="text-primary" />,
      mainStat: data?.buses?.total || 0,
      detailA: `${data?.buses?.active || 0} Active`,
      detailB: `${data?.buses?.maintenance || 0} In Maintenance`,
      colorA: "text-success",
      colorB: "text-gray-600",
      loading: isLoading
    },
    {
      title: "Total Drivers",
      icon: <UserRound className="text-secondary" />,
      mainStat: data?.drivers?.total || 0,
      detailA: `${data?.drivers?.active || 0} On Duty`,
      detailB: `${data?.drivers?.onLeave || 0} On Leave`,
      colorA: "text-success",
      colorB: "text-gray-600",
      loading: isLoading
    },
    {
      title: "Total Students",
      icon: <GraduationCap className="text-accent" />,
      mainStat: data?.students?.total || 0,
      detailA: `${data?.students?.active || 0} Active`,
      detailB: `${data?.students?.absent || 0} Absent Today`,
      colorA: "text-success",
      colorB: "text-gray-600",
      loading: isLoading
    },
    {
      title: "Routes",
      icon: <MapPin className="text-success" />,
      mainStat: data?.routes?.total || 0,
      detailA: `${data?.routes?.active || 0} On Schedule`,
      detailB: `${data?.routes?.total - (data?.routes?.active || 0)} Inactive`,
      colorA: "text-success",
      colorB: "text-gray-600",
      loading: isLoading
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600">{card.title}</p>
                {card.loading ? (
                  <Skeleton className="h-10 w-16 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold mt-1">{card.mainStat}</h3>
                )}
              </div>
              <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                {card.icon}
              </div>
            </div>
            
            {card.loading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="flex items-center mt-4 text-sm">
                <span className={card.colorA + " font-semibold"}>{card.detailA}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className={card.colorB}>{card.detailB}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
