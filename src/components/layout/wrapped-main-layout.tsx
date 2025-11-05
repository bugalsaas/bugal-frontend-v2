'use client';

import { useAuth } from '@/contexts/auth-context';
import { MainLayout as BaseMainLayout } from '@/components/layout/main-layout';
import { MainLayoutProps } from '@/lib/navigation-config';
import { Protected } from '@/components/auth/Protected';

interface WrappedMainLayoutProps extends MainLayoutProps {
  // All props come from MainLayoutProps
}

export function MainLayout(props: WrappedMainLayoutProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  return (
    <Protected>
      <BaseMainLayout {...props} isAdmin={isAdmin} />
    </Protected>
  );
}
