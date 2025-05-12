import React, { useEffect } from 'react';
import { useNavigate } from 'wouter';
import DashboardShell from '@/components/layout/dashboard-shell';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';

export default function ParentIndexPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to tracking page
  useEffect(() => {
    if (user?.role === 'parent') {
      navigate('/tracking');
    }
  }, [navigate, user]);

  return (
    <DashboardShell requireAuth={true} allowedRoles={['parent']}>
      <Helmet>
        <title>Parent Dashboard - ShuttleMate</title>
        <meta name="description" content="ShuttleMate parent dashboard - Track your child's school bus in real-time and stay connected with drivers." />
      </Helmet>
      
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block rounded-full bg-blue-100 p-3 mb-4">
            <div className="rounded-full bg-royal-blue p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-gray-500">Taking you to the bus tracking page</p>
        </div>
      </div>
    </DashboardShell>
  );
}
