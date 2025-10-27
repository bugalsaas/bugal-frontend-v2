'use client';

import { useAuth } from '@/contexts/auth-context';
import { AlertTriangle, X } from 'lucide-react';

export function DevModeBanner() {
  const { isDevelopmentMode, disableDevelopmentMode, error } = useAuth();

  // Show banner if in development mode or if there's a backend connection error
  const shouldShow = isDevelopmentMode || (error && error.includes('backend server'));

  if (!shouldShow) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div className="text-sm">
            {isDevelopmentMode ? (
              <div>
                <span className="font-medium text-yellow-800">Development Mode Active</span>
                <p className="text-yellow-700">
                  You're using mock data. Backend server is not connected.
                </p>
              </div>
            ) : (
              <div>
                <span className="font-medium text-yellow-800">Backend Connection Issue</span>
                <p className="text-yellow-700">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isDevelopmentMode ? (
            <button
              onClick={disableDevelopmentMode}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Exit Dev Mode
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Retry Connection
            </button>
          )}
          <button
            onClick={() => {
              // Hide banner temporarily
              const banner = document.querySelector('[data-dev-banner]');
              if (banner) banner.style.display = 'none';
            }}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
