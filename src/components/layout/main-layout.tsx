'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search,
  Filter,
  Plus,
  Bell,
  MoreHorizontal,
  User,
  LogOut,
  Settings,
  Rocket,
  Menu,
  X,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { navigationItems, MainLayoutProps, PageHeaderConfig } from '@/lib/navigation-config';
import { colors } from '@/lib/design-tokens';
import { OrganizationSwitcher } from './organization-switcher';
import MobileBottomNav from './mobile-bottom-nav';
import { mobileNavItems, filterMobileNavItems } from '@/lib/navigation/mobile-nav-items';

export function MainLayout({ 
  children, 
  activeNavItem, 
  headerConfig,
  notifications = 0,
  user,
  isAdmin = false
}: MainLayoutProps & { isAdmin?: boolean }) {
  const router = useRouter();
  const { user: authUser, logout, organizations: authOrganizations, switchOrganization } = useAuth();
  const effectiveIsAdmin = isAdmin || (authUser?.isAdmin || false);
  
  // Use authUser data for display, with fallback to prop or defaults
  const displayUser = user || (authUser ? {
    name: authUser.fullName || authUser.name || 'User',
    initials: authUser.initials || 'U',
    avatar: authUser.avatar,
  } : { name: "User", initials: "U" });
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSubscriptions = () => {
    router.push('/subscription');
  };

  const handleBusinessSettings = () => {
    router.push('/organizations/settings');
  };

  const handleStaff = () => {
    router.push('/organizations/staff');
  };

  const handleLogout = () => {
    logout();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    headerConfig.onSearchChange?.(value);
  };

  const handleFilterClick = () => {
    headerConfig.onFilterClick?.();
  };

  const handleAddClick = () => {
    headerConfig.onAddClick?.();
  };

  // Filter navigation items based on admin status
  // Only show "Organizations" and "Users" for platform admins
  const filteredNavigationItems = navigationItems.filter(item => {
    if ((item.id === 'organizations' || item.id === 'users') && !effectiveIsAdmin) {
      return false;
    }
    return true;
  });

  // Update navigation items with active state
  const updatedNavigationItems = filteredNavigationItems.map(item => ({
    ...item,
    isActive: item.id === activeNavItem
  }));

  // Get organizations from auth context
  const organizations = authOrganizations || [];
  const currentOrg = authUser?.organization ? {
    id: authUser.organization.id,
    name: authUser.organization.name,
    type: authUser.organization.type
  } : null;

  const handleOrganizationSwitch = (org: any) => {
    switchOrganization(org.id);
  };

  const handleCreateNewOrg = () => {
    router.push('/organizations');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Sidebar */}
        <div 
          className={`flex flex-col bugal-sidebar sticky top-0 h-screen overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? 'w-0' : 'w-64'
          }`}
          style={{ 
            backgroundColor: 'rgb(9, 28, 44)',
            minHeight: '100vh'
          }}
        >
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: colors.sidebar.border }}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 transition-opacity ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <Image
                  src="/logo-full.png"
                  alt="Bugal Logo"
                  width={120}
                  height={40}
                  className="object-contain brightness-0 invert"
                  priority
                  style={{ filter: 'brightness(0) invert(1)', width: 'auto', height: 'auto' }}
                />
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
              >
                {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-2 ${sidebarCollapsed ? 'overflow-hidden' : ''}`}>
            {updatedNavigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-white hover:bg-gray-700 hover:text-white'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                style={{ 
                  color: 'white !important',
                  textDecoration: 'none'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: 'white' }} />
                  <span className={`${sidebarCollapsed ? 'hidden' : ''}`} style={{ color: 'white' }}>{item.label}</span>
                </div>
              </a>
            ))}
          </nav>

          {/* Organization Switcher */}
          <div className={`border-t px-4 py-4 ${sidebarCollapsed ? 'opacity-0 overflow-hidden' : ''}`} style={{ borderColor: colors.sidebar.border }}>
            {currentOrg && (
              <OrganizationSwitcher
                organizations={organizations}
                currentOrganization={currentOrg}
                onOrganizationSwitch={handleOrganizationSwitch}
                onCreateNew={handleCreateNewOrg}
              />
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{headerConfig.title}</h1>
                {headerConfig.subtitle && (
                  <p className="text-gray-600 mt-1">{headerConfig.subtitle}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {headerConfig.showSearch && (
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Search className="h-5 w-5" />
                  </button>
                )}
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">{displayUser.initials}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{displayUser.name}</p>
                        <p className="text-xs text-gray-500">{authUser?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBusinessSettings}>
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Business settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleStaff}>
                      <Users className="h-4 w-4 mr-2" />
                      <span>Staff</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSubscriptions}>
                      <Rocket className="h-4 w-4 mr-2" />
                      <span>Subscription</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Search and Actions */}
              {(headerConfig.showSearch || headerConfig.showFilters || headerConfig.showAddButton || headerConfig.customFilterComponent) && (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1 sm:max-w-md">
                    {headerConfig.showSearch && (
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={headerConfig.searchPlaceholder || "Search..."}
                          className="pl-10 w-full"
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </div>
                    )}
                    {headerConfig.customFilterComponent && (
                      <div className="w-full sm:w-auto">
                        {headerConfig.customFilterComponent}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {headerConfig.showFilters && (
                      <Button variant="outline" className="flex items-center space-x-2" onClick={handleFilterClick}>
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                      </Button>
                    )}
                    {headerConfig.showAddButton && (
                      <Button onClick={handleAddClick} className="flex items-center space-x-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>{headerConfig.addButtonText || "Add"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Page Content */}
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header 
          className="border-b px-4 py-3 sticky top-0 z-10"
          style={{ 
            backgroundColor: 'rgb(9, 28, 44)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center relative">
            {/* Left: Logo */}
            <div className="flex-shrink-0 w-10">
              <Image
                src="/logo-color.png"
                alt="Bugal Logo"
                width={40}
                height={40}
                className="object-contain brightness-0 invert"
                priority
                style={{ width: 'auto', height: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            {/* Center: Title */}
            <div className="flex-1 flex justify-center absolute left-0 right-0 pointer-events-none">
              <h1 className="text-lg font-semibold text-white pointer-events-auto">{headerConfig.title}</h1>
            </div>
            {/* Right: Icons */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
              {headerConfig.showSearch && (
                <button className="p-2 text-white hover:opacity-80 transition-opacity">
                  <Search className="h-5 w-5" />
                </button>
              )}
              <button className="p-2 text-white hover:opacity-80 transition-opacity relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
        
        {/* Mobile Content */}
        <main className="flex-1 p-4 pb-[96px]" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
          <div className="space-y-4">
            {/* Mobile Search and Actions */}
            {(headerConfig.showSearch || headerConfig.showFilters || headerConfig.showAddButton || headerConfig.customFilterComponent) && (
              <div className="space-y-3">
                {headerConfig.showSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={headerConfig.searchPlaceholder || "Search..."}
                      className="pl-10"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                )}
                {headerConfig.customFilterComponent && (
                  <div className="w-full">
                    {headerConfig.customFilterComponent}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  {headerConfig.showFilters && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleFilterClick}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  )}
                  {headerConfig.showAddButton && (
                    <Button size="sm" className="flex-1" onClick={handleAddClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      {headerConfig.addButtonText || "Add"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Page Content */}
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          items={filterMobileNavItems(
            mobileNavItems.map((i) => ({
              ...i,
              // reuse icons already sized in config
            })),
            { isAdmin: effectiveIsAdmin }
          )}
        />
      </div>
    </div>
  );
}
