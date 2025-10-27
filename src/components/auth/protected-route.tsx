'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { FullScreenLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <FullScreenLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600">Loading...</p>
          </Card>
        </div>
      </FullScreenLayout>
    );
  }

  // Show fallback or redirect if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <FullScreenLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access this page.
            </p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Go to Sign In
            </Button>
          </Card>
        </div>
      </FullScreenLayout>
    );
  }

  // User is authenticated, show children
  return <>{children}</>;
}

// Hook for checking auth status in components
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
      return false;
    }
    return isAuthenticated;
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
  };
}
