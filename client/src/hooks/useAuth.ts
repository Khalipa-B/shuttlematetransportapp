import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    refetch,
  };
}

export function useUserRole() {
  const { data: roleData, isLoading } = useQuery<{ role: { id: number, name: string } }>({
    queryKey: ["/api/users/role"],
    enabled: useAuth().isAuthenticated,
  });

  const role = roleData?.role?.name || null;
  const isParent = role === "parent";
  const isDriver = role === "driver";
  const isAdmin = role === "admin";

  return {
    role,
    roleId: roleData?.role?.id || null,
    isParent,
    isDriver,
    isAdmin,
    isLoading,
  };
}
