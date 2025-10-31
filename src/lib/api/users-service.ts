import { User, getToken } from '@/contexts/auth-context';
import { apiConfig, apiCall } from './config';

const API_BASE_URL = apiConfig.baseURL;

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

// API functions
export const usersApi = {
  getAll: async (filters?: UserFilters & { pageNumber?: number; pageSize?: number }): Promise<UserListResponse> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    return apiCall<UserListResponse>(`/users?${params}`);
  },

  impersonate: async (userId: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<{ token: string; success: boolean }>(`/users/${userId}/impersonate`, {
      method: 'POST',
    });
  },

  resendConfirmationEmail: async (userId: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<{ success: boolean }>(`/users/${userId}/resend-confirmation`, {
      method: 'POST',
    });
  },

  export: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    const response = await fetch(`${API_BASE_URL}/users/export`, {
      headers: apiConfig.getHeaders(),
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
