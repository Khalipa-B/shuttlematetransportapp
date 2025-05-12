import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ShuttleMateLogo from "@/components/icons/ShuttleMateLogo";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === UserRole.PARENT) {
        navigate("/parent/dashboard");
      } else if (user.role === UserRole.DRIVER) {
        navigate("/driver/dashboard");
      } else if (user.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <ShuttleMateLogo className="h-12" />
            <h1 className="ml-3 text-2xl font-bold text-primary">ShuttleMate</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <Button onClick={() => window.location.href = "/api/logout"}>
                Log Out
              </Button>
            ) : (
              <Button onClick={() => window.location.href = "/api/login"}>
                Log In
              </Button>
            )}
          </div>
        </header>

        <main className="py-10">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Safe. Smart. Connected.
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              The ultimate school transport management solution keeping children safe and parents informed.
            </p>
            <div className="mt-10">
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                className="px-8 py-6 text-lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-primary mb-3">For Parents</h3>
              <p className="text-gray-600 mb-4">Track your child's journey in real-time, receive notifications, and communicate with drivers.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Real-time GPS tracking</li>
                <li>Instant notifications</li>
                <li>In-app messaging</li>
                <li>Journey history</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-primary mb-3">For Drivers</h3>
              <p className="text-gray-600 mb-4">Manage student check-in/out, follow optimized routes, and report incidents easily.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Digital attendance</li>
                <li>Route navigation</li>
                <li>Emergency reporting</li>
                <li>Delay notifications</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-primary mb-3">For Administrators</h3>
              <p className="text-gray-600 mb-4">Complete oversight of fleet, routes, staff, and students with robust reporting.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Fleet management</li>
                <li>Staff administration</li>
                <li>Route planning</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="py-10 border-t">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} ShuttleMate. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
