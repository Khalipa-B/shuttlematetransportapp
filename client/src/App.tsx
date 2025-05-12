import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Notifications from "@/pages/notifications";
import AuthWrapper from "@/components/layout/AuthWrapper";
import { UserRole } from "@shared/schema";

// Mobile components
import MobileNavigation from "@/components/mobile/MobileNavigation";
import AppInstallBanner from "@/components/mobile/AppInstallBanner";
import OfflineIndicator from "@/components/mobile/OfflineIndicator";
import { useIsMobile } from "@/hooks/useIsMobile";

// Parent Pages
import ParentDashboard from "@/pages/parent/dashboard";
import ParentTracking from "@/pages/parent/tracking";
import ParentMessages from "@/pages/parent/messages";
import ParentProfile from "@/pages/parent/profile";

// Driver Pages
import DriverDashboard from "@/pages/driver/dashboard";
import DriverStudents from "@/pages/driver/students";
import DriverMessages from "@/pages/driver/messages";
import DriverProfile from "@/pages/driver/profile";
import ReportIncident from "@/pages/driver/report-incident";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBuses from "@/pages/admin/buses";
import AdminDrivers from "@/pages/admin/drivers";
import AdminStudents from "@/pages/admin/students";
import AdminParents from "@/pages/admin/parents";
import AdminRoutes from "@/pages/admin/routes";
import AdminMessages from "@/pages/admin/messages";
import AdminReports from "@/pages/admin/reports";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      {/* Shared Protected Pages */}
      <Route path="/notifications">
        <AuthWrapper>
          <Notifications />
        </AuthWrapper>
      </Route>

      {/* Parent Pages */}
      <Route path="/parent/dashboard">
        <AuthWrapper allowedRoles={[UserRole.PARENT]}>
          <ParentDashboard />
        </AuthWrapper>
      </Route>
      <Route path="/parent/tracking">
        <AuthWrapper allowedRoles={[UserRole.PARENT]}>
          <ParentTracking />
        </AuthWrapper>
      </Route>
      <Route path="/parent/messages">
        <AuthWrapper allowedRoles={[UserRole.PARENT]}>
          <ParentMessages />
        </AuthWrapper>
      </Route>
      <Route path="/parent/profile">
        <AuthWrapper allowedRoles={[UserRole.PARENT]}>
          <ParentProfile />
        </AuthWrapper>
      </Route>

      {/* Driver Pages */}
      <Route path="/driver/dashboard">
        <AuthWrapper allowedRoles={[UserRole.DRIVER]}>
          <DriverDashboard />
        </AuthWrapper>
      </Route>
      <Route path="/driver/students">
        <AuthWrapper allowedRoles={[UserRole.DRIVER]}>
          <DriverStudents />
        </AuthWrapper>
      </Route>
      <Route path="/driver/messages">
        <AuthWrapper allowedRoles={[UserRole.DRIVER]}>
          <DriverMessages />
        </AuthWrapper>
      </Route>
      <Route path="/driver/profile">
        <AuthWrapper allowedRoles={[UserRole.DRIVER]}>
          <DriverProfile />
        </AuthWrapper>
      </Route>
      <Route path="/driver/report-incident">
        <AuthWrapper allowedRoles={[UserRole.DRIVER]}>
          <ReportIncident />
        </AuthWrapper>
      </Route>

      {/* Admin Pages */}
      <Route path="/admin/dashboard">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </AuthWrapper>
      </Route>
      <Route path="/admin/buses">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminBuses />
        </AuthWrapper>
      </Route>
      <Route path="/admin/drivers">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminDrivers />
        </AuthWrapper>
      </Route>
      <Route path="/admin/students">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminStudents />
        </AuthWrapper>
      </Route>
      <Route path="/admin/parents">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminParents />
        </AuthWrapper>
      </Route>
      <Route path="/admin/routes">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminRoutes />
        </AuthWrapper>
      </Route>
      <Route path="/admin/messages">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminMessages />
        </AuthWrapper>
      </Route>
      <Route path="/admin/reports">
        <AuthWrapper allowedRoles={[UserRole.ADMIN]}>
          <AdminReports />
        </AuthWrapper>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function MobileAppContainer() {
  const isMobile = useIsMobile();
  
  return (
    <>
      <OfflineIndicator />
      <AppInstallBanner />
      <div className="pb-16"> {/* Add padding to the bottom for the mobile nav */}
        <Router />
      </div>
      {isMobile && <MobileNavigation />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MobileAppContainer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
