'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Menu, 
  Search, 
  User,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { mobileSpacing, mobileUtils } from '@/lib/mobile-utils';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  user?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
  notifications?: number;
  className?: string;
}

export function Header({
  title = "Bugal",
  showBackButton = false,
  onBack,
  showSearch = true,
  showNotifications = true,
  showMenu = true,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  user,
  notifications = 0,
  className = ""
}: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${mobileSpacing.container} ${className}`}>
      <div className="flex items-center justify-between h-14 sm:h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Center Section - Search (Desktop only) */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <Button
              variant="outline"
              onClick={onSearchClick}
              className="w-full justify-start text-gray-500 hover:text-gray-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Search...
            </Button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Button */}
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="p-2 md:hidden hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNotificationClick}
                className="p-2 hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications > 9 ? '9+' : notifications}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* User Menu */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'} 
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
                  {user.initials || user.name?.charAt(0) || 'U'}
                </div>
              )}
            </Button>
          )}

          {/* Mobile Menu Button */}
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 sm:hidden hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// Mobile-specific header variant
export function MobileHeader({
  title,
  showBackButton,
  onBack,
  onMenuClick,
  notifications = 0,
  user
}: Pick<HeaderProps, 'title' | 'showBackButton' | 'onBack' | 'onMenuClick' | 'notifications' | 'user'>) {
  return (
    <Header
      title={title}
      showBackButton={showBackButton}
      onBack={onBack}
      showSearch={false}
      showNotifications={true}
      showMenu={true}
      onMenuClick={onMenuClick}
      onNotificationClick={() => console.log('Notifications clicked')}
      notifications={notifications}
      user={user}
    />
  );
}

// Desktop-specific header variant
export function DesktopHeader({
  title,
  showSearch = true,
  onSearchClick,
  onNotificationClick,
  notifications = 0,
  user
}: Pick<HeaderProps, 'title' | 'showSearch' | 'onSearchClick' | 'onNotificationClick' | 'notifications' | 'user'>) {
  return (
    <Header
      title={title}
      showBackButton={false}
      showSearch={showSearch}
      showNotifications={true}
      showMenu={false}
      onSearchClick={onSearchClick}
      onNotificationClick={onNotificationClick}
      notifications={notifications}
      user={user}
    />
  );
}
