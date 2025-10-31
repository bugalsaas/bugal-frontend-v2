'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const headerConfig = {
    title: 'Subscription',
    subtitle: 'Subscription overview',
    showAddButton: false,
  };

  return (
    <MainLayout activeNavItem="subscription" headerConfig={headerConfig}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to Bugal. Your account has been upgraded and you now have access to all premium features.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Account activated</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Premium features enabled</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Confirmation email sent</span>
              </div>
            </div>
            
            <Button onClick={handleGoToDashboard} className="w-full" size="lg">
              <Rocket className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
