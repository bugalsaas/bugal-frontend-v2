'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PastDueBannerProps {
  status: 'trial' | 'active' | 'past_due' | 'unsubscribed';
  hasPermission: boolean;
}

export function PastDueBanner({ status, hasPermission }: PastDueBannerProps) {
  const router = useRouter();

  // Only show for past_due status
  if (status !== 'past_due') {
    return null;
  }

  const handleManageSubscription = () => {
    router.push('/subscription');
  };

  if (!hasPermission) {
    return (
      <Alert variant="default" className="mb-4 border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Account Restricted</AlertTitle>
        <AlertDescription className="text-yellow-800">
          Your account is now in read-only mode. Please contact the account owner.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4 cursor-pointer" onClick={handleManageSubscription}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Payment Failed</AlertTitle>
      <AlertDescription>
        We couldn't process your payment. Your account is now in read-only mode. Click here to update your payment method.
      </AlertDescription>
    </Alert>
  );
}
