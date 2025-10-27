'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FreeTrialBannerProps {
  daysLeft: number;
  status: 'trial' | 'active' | 'past_due' | 'unsubscribed';
}

export function FreeTrialBanner({ daysLeft, status }: FreeTrialBannerProps) {
  const router = useRouter();

  // Only show for trial/unsubscribed status
  if (status !== 'unsubscribed') {
    return null;
  }

  const handleManageSubscription = () => {
    router.push('/subscription');
  };

  if (daysLeft <= 0) {
    return (
      <Alert variant="destructive" className="mb-4 cursor-pointer" onClick={handleManageSubscription}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Free Trial Expired</AlertTitle>
        <AlertDescription>
          Your free trial has expired. Click here to manage your subscription.
        </AlertDescription>
      </Alert>
    );
  }

  if (daysLeft <= 7) {
    return (
      <Alert variant="default" className="mb-4 cursor-pointer border-yellow-500 bg-yellow-50" onClick={handleManageSubscription}>
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Trial Expiring Soon</AlertTitle>
        <AlertDescription className="text-yellow-800">
          Your free trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Click here to subscribe and avoid interruptions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-500 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">Free Trial Active</AlertTitle>
      <AlertDescription className="text-green-800">
        You have {daysLeft} more day{daysLeft !== 1 ? 's' : ''} to try all Bugal features for free. You can subscribe anytime!
      </AlertDescription>
    </Alert>
  );
}
