'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';

export default function NotFound() {
  const router = useRouter();

  const headerConfig = {
    title: 'Page Not Found',
    subtitle: 'The page you are looking for does not exist',
    showSearch: false,
    showAddButton: false,
  };

  return (
    <MainLayout activeNavItem="dashboard" headerConfig={headerConfig}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-400">404</span>
              </div>
            </div>
            <CardTitle className="text-center">Page Not Found</CardTitle>
            <CardDescription className="text-center">
              The page you are looking for doesn&apos;t exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

