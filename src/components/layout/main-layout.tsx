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
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { navigationItems, MainLayoutProps, PageHeaderConfig } from '@/lib/navigation-config';
import { colors } from '@/lib/design-tokens';
import { OrganizationSwitcher } from './organization-switcher';

export function MainLayout({ 
  children, 
  activeNavItem, 
  headerConfig,
  notifications = 0,
  user = { name: "User", initials: "U" },
  isAdmin = false
}: MainLayoutProps & { isAdmin?: boolean }) {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const effectiveIsAdmin = isAdmin || (authUser?.isAdmin || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSubscriptions = () => {
    router.push('/subscription');
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

  // Mock organizations for organization switcher
  const mockOrganizations = [
    { id: '1', name: 'My Business', type: 'company' },
    { id: '2', name: 'Client Business', type: 'sole_trader' },
  ];
  const mockCurrentOrg = mockOrganizations[0];

  const handleOrganizationSwitch = (org: any) => {
    console.log('Switching to organization:', org);
    // TODO: Implement actual organization switching
    window.location.reload();
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
                  style={{ filter: 'brightness(0) invert(1)' }}
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
            <OrganizationSwitcher
              organizations={mockOrganizations}
              currentOrganization={mockCurrentOrg}
              onOrganizationSwitch={handleOrganizationSwitch}
              onCreateNew={handleCreateNewOrg}
            />
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
                        <span className="text-gray-600 text-sm font-medium">{user.initials}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{authUser?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSubscriptions}>
                      <Rocket className="h-4 w-4 mr-2" />
                      <span>Subscriptions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
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
              {(headerConfig.showSearch || headerConfig.showFilters || headerConfig.showAddButton) && (
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
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
                  </div>
                  <div className="flex items-center space-x-3">
                    {headerConfig.showFilters && (
                      <Button variant="outline" className="flex items-center space-x-2" onClick={handleFilterClick}>
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                      </Button>
                    )}
                    {headerConfig.showAddButton && (
                      <Button onClick={handleAddClick} className="flex items-center space-x-2">
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
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">{headerConfig.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {headerConfig.showSearch && (
                <button className="p-2 text-gray-500">
                  <Search className="h-5 w-5" />
                </button>
              )}
              <button className="p-2 text-gray-500 relative">
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
        <main className="flex-1 p-4 pb-20">
          <div className="space-y-4">
            {/* Mobile Search and Actions */}
            {(headerConfig.showSearch || headerConfig.showFilters || headerConfig.showAddButton) && (
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
                <div className="flex items-center space-x-2">
                  {headerConfig.showFilters && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleFilterClick}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  )}
                  {headerConfig.showAddButton && (
                    <Button size="sm" onClick={handleAddClick}>
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
        <nav className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 z-10">
          <div className="flex items-center justify-around">
            {updatedNavigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${
                  item.isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center -mt-1 -mr-1">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
