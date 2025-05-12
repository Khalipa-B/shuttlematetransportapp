import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleLogin = () => {
    // Redirect to Replit Auth login endpoint
    window.location.href = "/api/login";
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="large" className="mb-6" />
          <CardTitle className="text-3xl font-bold text-center text-royal-blue">Welcome to ShuttleMate</CardTitle>
          <CardDescription className="text-center text-lg">
            Safe. Smart. Connected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2 text-center">
            <p className="text-gray-500">
              Sign in with your account to continue
            </p>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-royal-blue hover:bg-blue-700 text-white py-6 text-lg"
          >
            Login with Replit
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">About ShuttleMate</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>ShuttleMate provides safe and reliable school transportation management for parents, drivers, and school administrators.</p>
            <p className="mt-2">Featuring real-time GPS tracking, student check-in/out, and instant notifications.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
