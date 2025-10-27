'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No verification token provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify email');
        }

        setSuccess(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to verify email');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/sign-in?message=Email confirmed successfully, please signin below.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6">
              <Image
                src="/logo-color.png"
                alt="Bugal Logo"
                width={128}
                height={128}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Image
              src="/logo-color.png"
              alt="Bugal Logo"
              width={128}
              height={128}
              className="mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>

        {/* Success or Error Message */}
        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email confirmed successfully! You can now sign in to your account.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Sign In Button */}
        <div className="text-center">
          <Button
            onClick={handleSignIn}
            className="w-full h-12 text-base font-medium"
          >
            Continue to Sign In
          </Button>
        </div>

        {/* Beta Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a beta version. Use test organization only.
          </p>
        </div>
      </div>
    </div>
  );
}
