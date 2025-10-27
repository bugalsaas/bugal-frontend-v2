'use client';

import { useAuth } from '@/contexts/auth-context';
import { MainLayout as BaseMainLayout, MainLayoutProps } from '@/components/layout/main-layout';
import { ReactNode } from 'react';

interface WrappedMainLayoutProps extends MainLayoutProps {
  children: ReactNode;
}

export function MainLayout(props: WrappedMainLayoutProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  return <BaseMainLayout {...props} isAdmin={isAdmin} />;
}
