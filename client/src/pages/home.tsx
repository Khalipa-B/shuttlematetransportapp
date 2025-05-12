import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ShuttleMateLogo from "@/components/icons/ShuttleMateLogo";
import { Loader2, User, Car, Building, ChevronRight } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");

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

  const handleLogin = () => {
    // Store selected role in localStorage for later use
    if (selectedRole) {
      localStorage.setItem("preferredRole", selectedRole);
    }
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <ShuttleMateLogo 
              className="h-28 mx-auto mb-5" 
              variant="blue" 
              showFullLogo={false} 
            />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome to ShuttleMate
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Safe. Smart. Connected.
            </p>
          </div>

          <Card className="p-6 bg-white shadow-xl rounded-xl border-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">
                Log in as:
              </h3>
              
              <div className="space-y-3">
                <button
                  className={`w-full p-4 text-left rounded-lg transition-all flex items-center space-x-3 border-2 hover:bg-blue-50 ${selectedRole === 'PARENT' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedRole('PARENT')}
                >
                  <div className={`p-2 rounded-full ${selectedRole === 'PARENT' ? 'bg-primary text-white' : 'bg-blue-100 text-primary'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Parent</div>
                    <div className="text-sm text-gray-500">Track your child's journey</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${selectedRole === 'PARENT' ? 'text-primary' : 'text-gray-400'}`} />
                </button>
                
                <button
                  className={`w-full p-4 text-left rounded-lg transition-all flex items-center space-x-3 border-2 hover:bg-blue-50 ${selectedRole === 'DRIVER' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedRole('DRIVER')}
                >
                  <div className={`p-2 rounded-full ${selectedRole === 'DRIVER' ? 'bg-primary text-white' : 'bg-blue-100 text-primary'}`}>
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Driver</div>
                    <div className="text-sm text-gray-500">Manage your route and students</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${selectedRole === 'DRIVER' ? 'text-primary' : 'text-gray-400'}`} />
                </button>
                
                <button
                  className={`w-full p-4 text-left rounded-lg transition-all flex items-center space-x-3 border-2 hover:bg-blue-50 ${selectedRole === 'ADMIN' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedRole('ADMIN')}
                >
                  <div className={`p-2 rounded-full ${selectedRole === 'ADMIN' ? 'bg-primary text-white' : 'bg-blue-100 text-primary'}`}>
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Administrator</div>
                    <div className="text-sm text-gray-500">Manage fleet, routes and staff</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${selectedRole === 'ADMIN' ? 'text-primary' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full py-6 text-lg"
                  size="lg"
                  disabled={!selectedRole}
                  onClick={handleLogin}
                >
                  Continue
                </Button>
                
                {isAuthenticated && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/api/logout"}
                      className="text-sm"
                    >
                      Log out from current session
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <p className="mt-6 text-center text-sm text-gray-500">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
      
      <footer className="py-4 px-4 mt-auto">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} ShuttleMate. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
