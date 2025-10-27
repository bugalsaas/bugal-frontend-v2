'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send recovery email');
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  if (success) {
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
              Check your email
            </h2>
          </div>

          {/* Success Message */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              If the email you have entered is linked to a Bugal Account, you will receive a link to reset your password shortly.
            </AlertDescription>
          </Alert>

          {/* Sign In Link */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleSignIn}
              className="text-blue-600 hover:text-blue-500 p-0 h-auto"
            >
              Remembered your password?
            </Button>
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
            Forgot your password?
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base"
                  placeholder="Email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Send Recovery Email Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Send recovery email' : 'Send recovery email'}
          </Button>
        </form>

        {/* Sign In Link */}
        {!isLoading && (
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleSignIn}
              className="text-blue-600 hover:text-blue-500 p-0 h-auto"
            >
              Remembered your password?
            </Button>
          </div>
        )}

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