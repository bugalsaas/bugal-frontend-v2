'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, error, clearError, isAuthenticated, enableDevelopmentMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Check for messages from URL params
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await login(email, password);
      // Redirect will happen automatically via useEffect
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  const handleDevelopmentMode = () => {
    enableDevelopmentMode();
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
            Log in to your account
          </h2>
        </div>

          {/* Messages */}
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

        {/* Sign In Form */}
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
                  autoComplete="current-password"
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
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Log in' : 'Log in'}
          </Button>
        </form>

        {/* Links */}
        {!isLoading && (
          <div className="flex justify-between text-sm">
            <Button
              type="button"
              variant="link"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-500 p-0 h-auto"
            >
              Forgot your password?
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleSignUp}
              className="text-blue-600 hover:text-blue-500 p-0 h-auto"
            >
              Create an account
            </Button>
          </div>
        )}

        {/* Development Mode Button */}
        {(error && error.includes('backend server')) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleDevelopmentMode}
              className="w-full h-12 text-base font-medium text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            >
              Continue in Development Mode
            </Button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Use mock data when backend is unavailable
            </p>
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
