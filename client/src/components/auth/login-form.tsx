import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'wouter';

export default function LoginForm() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to appropriate dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    const redirectParam = location !== '/login' ? `?redirect=${encodeURIComponent(location)}` : '';
    window.location.href = `/api/login${redirectParam}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardContent className="pt-6 pb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          
          <p className="text-center text-gray-600 mb-8">
            Safe and secure transportation management for your school
          </p>
          
          <Button
            onClick={handleLogin}
            className="w-full bg-royal-blue hover:bg-blue-700 py-6 text-lg"
          >
            Log in with Replit
          </Button>
          
          <p className="mt-6 text-center text-gray-500 text-sm">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
