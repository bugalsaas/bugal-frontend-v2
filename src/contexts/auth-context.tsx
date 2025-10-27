'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Auth types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  initials?: string;
  isAdmin?: boolean; // Platform admin status
  organization?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDevelopmentMode: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, partnerCode?: string, referralCode?: string, invitation?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  enableDevelopmentMode: () => void;
  disableDevelopmentMode: () => void;
}

// Token management
const TOKEN_KEY = '@bugal-token';
const REFRESH_TOKEN_KEY = '@bugal-refresh-token';
const USER_KEY = '@bugal-user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Auth API functions
const authApi = {
  async login(email: string, password: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log('API Base URL:', apiUrl);
    console.log('Full signin URL:', `${apiUrl}/auth/signin`);
    
    try {
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Handle different error scenarios
        if (response.status === 0 || !response.status) {
          throw new Error('Backend server is not running. Please start the backend server.');
        }
        
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      // Check if response has content
      const text = await response.text();
      console.log('Raw response:', text);
      
      if (!text) {
        throw new Error('Empty response from server');
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 3000.');
      }
      throw error;
    }
  },

  async signup(email: string, password: string, partnerCode?: string, referralCode?: string, invitation?: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        partnerCode, 
        referralCode, 
        invitation 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Forgot password failed');
    }

    return response.json();
  },

  async resetPassword(token: string, password: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Reset password failed');
    }

    return response.json();
  },

  async getMe() {
    const token = getToken();
    if (!token) throw new Error('No token found');

    console.log('Fetching user data...');
    
    // Add timeout to prevent infinite waiting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          throw new Error('Session expired');
        }
        if (response.status === 0 || !response.status) {
          throw new Error('Backend server is not running. Please start the backend server.');
        }
        const error = await response.json().catch(() => ({ message: 'Failed to get user info' }));
        throw new Error(error.message || 'Failed to get user info');
      }

      const userData = await response.json();
      console.log('User data received:', userData);
      return userData;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 3000.');
      }
      throw error;
    }
  },
};

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isDevelopmentMode: false,
  });

  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();
        const user = getUser();

        if (token && user) {
          // Verify token is still valid
          try {
            console.log('Verifying existing token...');
            const freshUser = await authApi.getMe();
            console.log('Token valid, user:', freshUser);
            setState({
              user: freshUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Redirect to dashboard if we're on sign-in page
            if (window.location.pathname === '/sign-in') {
              console.log('Redirecting to dashboard...');
              router.push('/');
            }
          } catch (error) {
            console.log('Token invalid, clearing auth state');
            // Token is invalid, clear everything
            removeToken();
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } else {
          console.log('No existing auth state');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.login(email, password);
      console.log('Login response:', response);
      
      // The API only returns a token, we need to fetch user data separately
      const { token } = response;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      setToken(token);
      
      // Fetch user data after successful login
      const user = await authApi.getMe();
      setUser(user);
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isDevelopmentMode: false,
      });

      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // If backend is not available, offer development mode
      if (error instanceof Error && error.message.includes('backend server')) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `${error.message} Would you like to continue in development mode?`,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Login failed',
        }));
      }
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isDevelopmentMode: false,
    });
    router.push('/sign-in');
  };

  const signup = async (email: string, password: string, partnerCode?: string, referralCode?: string, invitation?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { token, user } = await authApi.signup(email, password, partnerCode, referralCode, invitation);
      
      if (token && user) {
        setToken(token);
        setUser(user);
        
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        router.push('/');
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        router.push('/sign-in?message=Please check your email to verify your account');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.forgotPassword(email);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Forgot password failed',
      }));
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.resetPassword(token, password);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      router.push('/sign-in?message=Password reset successful. Please sign in with your new password.');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Reset password failed',
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshUser = async () => {
    try {
      const user = await authApi.getMe();
      setUser(user);
      setState(prev => ({
        ...prev,
        user,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh user',
      }));
    }
  };

  const enableDevelopmentMode = () => {
    const mockUser: User = {
      id: 'dev-user-1',
      email: 'developer@bugal.com.au',
      name: 'Development User',
      initials: 'DU',
      organization: {
        id: 'dev-org-1',
        name: 'Bugal Development',
        type: 'business',
      },
    };
    
    setUser(mockUser);
    setState({
      user: mockUser,
      token: 'dev-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDevelopmentMode: true,
    });
    
    router.push('/');
  };

  const disableDevelopmentMode = () => {
    removeToken();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isDevelopmentMode: false,
    });
    router.push('/sign-in');
  };

  const value: AuthContextType = useMemo(() => ({
    ...state,
    login,
    logout,
    signup,
    forgotPassword,
    resetPassword,
    clearError,
    refreshUser,
    enableDevelopmentMode,
    disableDevelopmentMode,
  }), [
    state.user,
    state.token,
    state.isAuthenticated,
    state.isLoading,
    state.error,
    state.isDevelopmentMode,
    login,
    logout,
    signup,
    forgotPassword,
    resetPassword,
    clearError,
    refreshUser,
    enableDevelopmentMode,
    disableDevelopmentMode,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
