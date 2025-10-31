'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users as Team,
  Search,
  Filter,
  Download,
  LogIn,
  Mail,
  Crown,
  CheckCircle,
  Loader2,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { useUsers, useUserActions } from '@/hooks/use-users';
import { formatDate } from '@/lib/utils';
import { UserManagement } from '@/lib/api/users-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function UsersList() {
  const { data: users, isLoading, filters, updateFilter, filterCounter, total } = useUsers();
  const { impersonateUser, resendConfirmationEmail, exportUsers } = useUserActions();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilter({ search: value });
  };

  const handleExport = async () => {
    try {
      await exportUsers();
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      await impersonateUser(userId);
    } catch (error) {
      console.error('Failed to impersonate user:', error);
    }
  };

  const handleResendEmail = async (userId: string) => {
    try {
      await resendConfirmationEmail(userId);
    } catch (error) {
      console.error('Failed to resend confirmation email:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
        <p className="text-gray-600">No users match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Users Cards */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((user: UserManagement) => (
          <Card key={user.id} className={`${!user.isEmailConfirmed ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12" style={{ backgroundColor: user.color }}>
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{user.fullName}</h3>
                      {user.isAdmin && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {!user.isEmailConfirmed && (
                        <Badge variant="destructive">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Email:</span>
                        <span className="ml-2 truncate">{user.email}</span>
                      </div>
                      
                      {user.isEmailConfirmed && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Email verified</span>
                        </div>
                      )}
                      
                      {!user.isEmailConfirmed && (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>Email not confirmed</span>
                        </div>
                      )}
                      
                      <div className="text-gray-500">
                        Created: {formatDate(new Date(user.createdAt))}
                      </div>
                      
                      {user.lastLoginAt && (
                        <div className="text-gray-500">
                          Last login: {formatDate(new Date(user.lastLoginAt))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!user.isEmailConfirmed && (
                      <DropdownMenuItem onClick={() => handleResendEmail(user.id)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Email
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleImpersonate(user.id)} variant="destructive">
                        <LogIn className="h-4 w-4 mr-2" />
                        Impersonate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer stats */}
      <div className="text-sm text-gray-600 text-center pt-4">
        Showing {users.length} of {total} users
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { filters, updateFilter, filterCounter } = useUsers();
  const { exportUsers } = useUserActions();

  const handleExport = async () => {
    try {
      await exportUsers();
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const headerConfig = {
    title: 'Users',
    subtitle: 'Users overview',
    icon: Team,
    showAddButton: false,
    showSearch: true,
    showFilters: true,
    searchPlaceholder: 'Search users by name or email',
    onSearchChange: (value: string) => {
      updateFilter({ search: value });
    },
    onFilterClick: () => setIsSearchOpen(!isSearchOpen),
  };

  return (
    <MainLayout activeNavItem="users" headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Filter Panel */}
        {isSearchOpen && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <Input
                    placeholder="Start typing to filter results"
                    value={filters.search}
                    onChange={(e) => updateFilter({ search: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {filterCounter > 0 && (
              <Badge variant="secondary">
                {filterCounter} filter{filterCounter !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Users List */}
        <UsersList />
      </div>
    </MainLayout>
  );
}
