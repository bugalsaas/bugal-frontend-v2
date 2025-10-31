'use client';

import React, { useState } from 'react';
import { Header, MobileHeader, DesktopHeader } from './header';
import { ResponsiveNavigation, MobileBottomNav, DesktopSidebarNav, MobileDrawerNav, NavigationItem } from './navigation';
import { mobileSpacing } from '@/lib/mobile-utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  notifications?: number;
  user?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
  navigationItems?: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    badge?: string | number;
    isActive?: boolean;
  }>;
  onNavigationClick?: (item: NavigationItem) => void;
  className?: string;
}

export function AppLayout({
  children,
  title = "Bugal",
  showBackButton = false,
  onBack,
  showSearch = true,
  onSearchClick,
  onNotificationClick,
  notifications = 0,
  user,
  navigationItems,
  onNavigationClick,
  className = ""
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigationClick = (item: NavigationItem) => {
    onNavigationClick?.(item);
    setMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    onSearchClick?.();
  };

  const handleNotificationClick = () => {
    onNotificationClick?.();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Sidebar */}
        <DesktopSidebarNav
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <DesktopHeader
            title={title}
            showSearch={showSearch}
            onSearchClick={handleSearchClick}
            onNotificationClick={handleNotificationClick}
            notifications={notifications}
            user={user}
          />
          
          {/* Main Content */}
          <main className={`flex-1 ${mobileSpacing.container} ${mobileSpacing.section}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <MobileHeader
          title={title}
          showBackButton={showBackButton}
          onBack={onBack}
          onMenuClick={() => setMobileMenuOpen(true)}
          notifications={notifications}
          user={user}
        />
        
        {/* Main Content */}
        <main className={`flex-1 ${mobileSpacing.container} ${mobileSpacing.section} pb-20`}>
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
      </div>

      {/* Mobile Drawer Menu */}
      <MobileDrawerNav
        items={navigationItems}
        onItemClick={handleNavigationClick}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}

// Simplified layout for pages that don't need full navigation
export function SimpleLayout({
  children,
  title = "Bugal",
  showBackButton = false,
  onBack,
  className = ""
}: {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Header
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
        showSearch={false}
        showNotifications={false}
        showMenu={false}
      />
      <main className={`${mobileSpacing.container} ${mobileSpacing.section}`}>
        {children}
      </main>
    </div>
  );
}

// Full-screen layout for modals, auth pages, etc.
export function FullScreenLayout({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}
