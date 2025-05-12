import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'wouter';
import { getDefaultRouteForRole } from '@/lib/routes';
import { Helmet } from 'react-helmet';

export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(redirect || defaultRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = () => {
    // Store the intended destination in the query string
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
    <>
      <Helmet>
        <title>Login - ShuttleMate</title>
        <meta name="description" content="Log in to ShuttleMate to access the school transportation management system. Safe. Smart. Connected." />
      </Helmet>
      
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Welcome to ShuttleMate
            </h1>
            
            <p className="text-center text-gray-600 mb-8">
              Safe and secure transportation management for your school
            </p>
            
            <Button
              onClick={handleLogin}
              className="w-full bg-royal-blue hover:bg-blue-700 py-6 text-lg font-bold"
            >
              Log in with Replit
            </Button>
            
            <p className="mt-6 text-center text-gray-500 text-sm">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
