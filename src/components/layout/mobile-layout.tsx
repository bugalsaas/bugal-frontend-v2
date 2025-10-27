'use client';

import React from 'react';
import { mobileClasses, mobileLayout, mobileNav, mobileUtils, mobileSpacing } from '@/lib/mobile-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  Menu,
  Bell
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileLayout({ 
  children, 
  title = "Bugal", 
  showBackButton = false,
  onBack 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className={`${mobileNav.header} ${mobileSpacing.container}`}>
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                ←
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${mobileSpacing.container} ${mobileSpacing.section} pb-20`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={mobileNav.bottomNav}>
        <div className="grid grid-cols-5 h-16">
          <Button
            variant="ghost"
            className={`${mobileNav.navItem} h-full rounded-none`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`${mobileNav.navItem} h-full rounded-none`}
          >
            <Users className="h-5 w-5" />
            <span>Contacts</span>
          </Button>
          <Button
            variant="ghost"
            className={`${mobileNav.navItem} h-full rounded-none`}
          >
            <Calendar className="h-5 w-5" />
            <span>Shifts</span>
          </Button>
          <Button
            variant="ghost"
            className={`${mobileNav.navItem} h-full rounded-none`}
          >
            <FileText className="h-5 w-5" />
            <span>Invoices</span>
          </Button>
          <Button
            variant="ghost"
            className={`${mobileNav.navItem} h-full rounded-none`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Reports</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

// Desktop Sidebar Component
export function DesktopSidebar() {
  return (
    <aside className={`${mobileNav.sidebar} bg-sidebar text-sidebar-foreground`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold">Bugal</span>
        </div>
        
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Users className="h-4 w-4 mr-3" />
            Contacts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Calendar className="h-4 w-4 mr-3" />
            Shifts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <FileText className="h-4 w-4 mr-3" />
            Invoices
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            Reports
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </nav>
      </div>
    </aside>
  );
}

// Responsive Layout Wrapper
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden sm:flex">
        <DesktopSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="sm:hidden">
        <MobileLayout title="Bugal">
          {children}
        </MobileLayout>
      </div>
    </div>
  );
}
