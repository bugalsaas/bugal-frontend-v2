'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

export function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public routes to render without guard
    if (PUBLIC_ROUTES.includes(pathname || '')) return;

    if (!isLoading && !isAuthenticated) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // While auth state initializes, render nothing to avoid flicker
  if (isLoading) return null;

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname || '')) return null;

  return <>{children}</>;
}


