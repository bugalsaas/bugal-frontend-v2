import { User } from '@/contexts/auth-context';

export interface UserManagement extends User {
  id: string;
  fullName: string;
  email: string;
  isEmailConfirmed: boolean;
  emailConfirmedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  isAdmin: boolean;
  isDisabled?: boolean;
  disabledAt?: string;
}

export interface UserFilters {
  search?: string;
}

export interface UserListResponse {
  data: UserManagement[];
  meta: {
    total: number;
  };
}

// Mock data for development
const mockUsersData: UserManagement[] = [
  {
    id: '1',
    firstName: 'Andrew',
    lastName: 'Giles',
    fullName: 'Andrew Giles',
    email: 'andrew@example.com',
    initials: 'AG',
    color: '#3B82F6',
    isEmailConfirmed: true,
    emailConfirmedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-15T12:00:00Z',
    isAdmin: true,
    isDisabled: false,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    initials: 'SJ',
    color: '#10B981',
    isEmailConfirmed: true,
    emailConfirmedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-12-14T10:30:00Z',
    isAdmin: false,
    isDisabled: false,
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    fullName: 'Mike Wilson',
    email: 'mike@example.com',
    initials: 'MW',
    color: '#F59E0B',
    isEmailConfirmed: false,
    createdAt: '2024-01-03T00:00:00Z',
    isAdmin: false,
    isDisabled: false,
  },
];

// API functions
export const usersApi = {
  getAll: async (filters?: UserFilters & { pageNumber?: number; pageSize?: number }): Promise<UserListResponse> => {
    // Always use mock data in development for testing
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      console.log('Loading mock users data');
      let filteredData = mockUsersData;
      
      if (filters?.search) {
        filteredData = filteredData.filter(user => 
          user.fullName.toLowerCase().includes(filters.search!.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      return {
        data: filteredData,
        meta: {
          total: filteredData.length,
        },
      };
    }
    
    const response = await fetch(`/api/users?${new URLSearchParams(filters as any)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  impersonate: async (userId: string) => {
    if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost')) {
      // Mock impersonation
      return { token: 'mock-token', success: true };
    }
    
    const response = await fetch(`/api/users/${userId}/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to impersonate user');
    return response.json();
  },

  resendConfirmationEmail: async (userId: string) => {
    if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost')) {
      // Mock resend
      return { success: true };
    }
    
    const response = await fetch(`/api/users/${userId}/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to resend confirmation email');
    return response.json();
  },

  export: async () => {
    if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost')) {
      // Mock export
      const blob = new Blob(['Mock CSV data'], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      return { success: true };
    }
    
    const response = await fetch('/api/users/export', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to export users');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    return { success: true };
  },
};
