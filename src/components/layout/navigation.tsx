'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { mobileNav, mobileUtils } from '@/lib/mobile-utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/',
    isActive: true
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    href: '/contacts',
    badge: '3'
  },
  {
    id: 'shifts',
    label: 'Shifts',
    icon: Calendar,
    href: '/shifts',
    badge: '12'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    href: '/invoices',
    badge: '8'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
];

interface NavigationProps {
  items?: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

// Mobile Bottom Navigation
export function MobileBottomNav({ 
  items = defaultNavigationItems, 
  onItemClick,
  className = "" 
}: NavigationProps) {
  return (
    <nav className={`${mobileNav.bottomNav} ${className}`}>
      <div className="grid grid-cols-5 h-16">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`${mobileNav.navItem} h-full rounded-none ${
                item.isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600'
              }`}
              onClick={() => onItemClick?.(item)}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

// Desktop Sidebar Navigation
export function DesktopSidebarNav({ 
  items = defaultNavigationItems, 
  onItemClick,
  className = "" 
}: NavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = item.isActive;

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
            level > 0 && "ml-4",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onItemClick?.(item);
            }
          }}
        >
          <Icon className="h-4 w-4 mr-3" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "h-4 w-4 ml-2 transition-transform",
                isExpanded && "rotate-180"
              )} 
            />
          )}
        </Button>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`${mobileNav.sidebar} ${className}`}>
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold">Bugal</span>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {items.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  );
}

// Mobile Drawer Navigation (for hamburger menu)
export function MobileDrawerNav({ 
  items = defaultNavigationItems, 
  onItemClick,
  isOpen = false,
  onClose,
  className = "" 
}: NavigationProps & { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">Bugal</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${
                    item.isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onItemClick?.(item);
                    onClose();
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

// Responsive Navigation Container
export function ResponsiveNavigation({ 
  items = defaultNavigationItems, 
  onItemClick,
  className = "" 
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebarNav 
          items={items} 
          onItemClick={onItemClick}
          className={className}
        />
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <MobileBottomNav 
          items={items} 
          onItemClick={onItemClick}
          className={className}
        />
      </div>
      
      {/* Mobile Drawer */}
      <MobileDrawerNav
        items={items}
        onItemClick={onItemClick}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
