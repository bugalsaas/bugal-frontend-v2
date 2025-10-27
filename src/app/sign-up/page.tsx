'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for referral code in URL params
  useEffect(() => {
    const referral = searchParams.get('referral');
    if (referral) {
      setReferralCode(referral);
    }
  }, [searchParams]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, referralCode, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const partnerCode = searchParams.get('partner') || '';
      const invitation = searchParams.get('invitation') || '';
      
      await signup(email, password, partnerCode, referralCode, invitation);
      
      // Redirect to sign-in with success message
      router.push('/sign-in?message=Account created successfully. Please check your email for verification.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

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
            Sign up for an account
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

        {/* Sign Up Form */}
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

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Referral Code Field */}
            <div>
              <Label htmlFor="referralCode" className="text-sm font-medium text-gray-700">
                Referral code (optional)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="h-12 text-base"
                  placeholder="Referral code"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-sm text-gray-600">
            <p>
              By signing up, I accept the Bugal{' '}
              <a 
                href="https://www.bugal.com.au/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                Terms and Conditions of Service
              </a>{' '}
              and acknowledge the{' '}
              <a 
                href="https://www.bugal.com.au/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Sign up' : 'Sign up'}
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
              Already have an account?
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