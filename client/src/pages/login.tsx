import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShuttleMateLogo from "@/components/icons/ShuttleMateLogo";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { isLoading } = useAuth();

  // Handle login redirect to Replit Auth
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <ShuttleMateLogo className="h-48 mx-auto" showFullLogo={true} variant="blue" />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center text-primary mb-6">Welcome Back!</h2>
              <div className="flex flex-col gap-4">
                <Button 
                  className="w-full py-6 text-lg"
                  onClick={handleLogin}
                >
                  Sign In with Your Account
                </Button>
              </div>
            </div>
            <p className="text-center text-gray-600">
              New to ShuttleMate? <a href="#" className="text-primary hover:text-secondary">Contact your school admin</a>
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ShuttleMate. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
