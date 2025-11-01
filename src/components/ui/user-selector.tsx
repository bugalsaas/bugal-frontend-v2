'use client';

import React from 'react';
import { useOrganizationUsers } from '@/hooks/use-organizations';
import { useAuth } from '@/contexts/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface UserSelectorProps {
  value?: string; // userId or '-1' for "All users" or undefined for current user
  onValueChange: (value: string) => void;
  className?: string;
}

export function UserSelector({ value, onValueChange, className }: UserSelectorProps) {
  const { user } = useAuth();
  const organizationId = user?.organization?.id || '';
  
  // Fetch organization users with larger page size to get all users
  const { users, isLoading, error, setPagination } = useOrganizationUsers(organizationId);
  
  // Set larger page size to fetch all users for the dropdown
  React.useEffect(() => {
    if (organizationId) {
      setPagination({ page: 1, pageSize: 100 });
    }
  }, [organizationId, setPagination]);

  // Build options: "All users" first, then list of users
  const options = React.useMemo(() => {
    const allUsersOption = { id: '-1', fullName: 'All users' };
    if (!users || users.length === 0) {
      return [allUsersOption];
    }
    return [allUsersOption, ...users];
  }, [users]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className || ''}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading users...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className || ''}`}>
        Failed to load users: {error}
      </div>
    );
  }

  return (
    <Select value={value || '-1'} onValueChange={onValueChange}>
      <SelectTrigger className={className || 'w-[200px]'}>
        <SelectValue placeholder="Select user" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

