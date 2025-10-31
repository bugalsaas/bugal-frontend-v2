import { formatCurrency, formatDate } from '@/lib/utils';
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export enum OrganizationType {
  SoleTrader = 'SoleTrader',
  Partnership = 'Partnership',
  Company = 'Company',
}

export enum OrganizationUserStatus {
  Active = 'Active',
  Invited = 'Invited',
  Disabled = 'Disabled',
}

export enum SubscriptionStatus {
  Active = 'Active',
  Trial = 'Trial',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
  idCountry: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: string;
  idOrganization: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUser {
  id: string;
  idOrganization: string;
  idRole: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  initials: string;
  color: string;
  status: OrganizationUserStatus;
  disabledAt?: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  organizationType: OrganizationType;
  isGstRegistered: boolean;
  country: Country;
  idCountry: string;
  idState: string;
  timezone: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
  abn?: string;
  paymentTerms: number;
  invoicePrefix?: string;
  bankName?: Bank;
  bankNameOther?: string;
  bankBsb?: string;
  bankAccountNumber?: string;
  referralCode: string;
  subscriptionStatus?: SubscriptionStatus;
  createdAt: string;
  trialEndDate: string;
  invitationCode?: string;
}

export interface OrganizationCreateDto {
  name: string;
  abn: string;
  email: string;
  organizationType: OrganizationType;
  isGstRegistered: boolean;
  idCountry: string;
  idState: string;
  timezone: string;
}

export interface OrganizationUpdateDto {
  name: string;
  email: string;
  organizationType: OrganizationType;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
  abn: string;
  paymentTerms?: number;
  invoicePrefix?: string;
  bankName?: Bank;
  bankNameOther?: string;
  bankBsb?: string;
  bankAccountNumber?: string;
}

export interface OrganizationInviteDto {
  idRole: string;
  email: string;
  initials: string;
  color: string;
  firstName?: string;
  lastName?: string;
}

export interface StaffUpdateDto {
  initials: string;
  color: string;
  idRole: string;
}

export interface OrganizationFilters {
  search?: string;
  status?: OrganizationUserStatus;
  organizationType?: OrganizationType;
}

export interface OrganizationListResponse {
  data: Organization[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface OrganizationUsersListResponse {
  data: OrganizationUser[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// All data is sourced from the real API

// API functions
export const organizationsApi = {
  // Organizations
  getAll: async (filters?: { page?: number; pageSize?: number; text?: string }): Promise<OrganizationListResponse> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.text) params.append('text', filters.text);

    const response = await fetch(`${API_BASE_URL}/organizations?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },

  // Note: There's no GET /organizations/:id endpoint in the backend
  // Organization data is provided via the /me endpoint in the auth context
  // This method is kept for backward compatibility but returns null
  getById: async (id: string): Promise<Organization> => {
    throw new Error('Use organization data from auth context instead');
  },

  create: async (data: OrganizationCreateDto): Promise<Organization> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const newOrg: Organization = {
        id: Date.now().toString(),
        ...data,
        country: mockCountries[0],
        referralCode: `ORG${Date.now()}`,
        subscriptionStatus: SubscriptionStatus.Trial,
        createdAt: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentTerms: 30,
      };
      mockOrganizations.push(newOrg);
      return newOrg;
    }
    
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to create organization');
    return response.json();
  },

  update: async (id: string, data: OrganizationUpdateDto): Promise<Organization> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update organization');
    }
    
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const orgIndex = mockOrganizations.findIndex(o => o.id === id);
      if (orgIndex === -1) throw new Error('Organization not found');
      mockOrganizations.splice(orgIndex, 1);
      return;
    }
    
    const response = await fetch(`/api/organizations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete organization');
  },

  export: async (): Promise<void> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Exporting organizations...');
      return;
    }
    
    const response = await fetch('/api/organizations/export', {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to export organizations');
  },

  // Organization Users (Staff)
  getAllUsers: async (idOrganization: string, filters?: { page?: number; pageSize?: number; text?: string }): Promise<OrganizationUsersListResponse> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.text) params.append('text', filters.text);

    const response = await fetch(`${API_BASE_URL}/organizations/${idOrganization}/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch organization users');
    return response.json();
  },

  inviteUser: async (idOrganization: string, data: OrganizationInviteDto): Promise<OrganizationUser> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const newUser: OrganizationUser = {
        id: Date.now().toString(),
        idOrganization,
        ...data,
        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        status: OrganizationUserStatus.Invited,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: mockRoles.find(r => r.id === data.idRole),
      };
      mockOrganizationUsers.push(newUser);
      return newUser;
    }
    
    const response = await fetch(`/api/organizations/${idOrganization}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to invite user');
    return response.json();
  },

  updateUser: async (idOrganization: string, userId: string, data: StaffUpdateDto): Promise<OrganizationUser> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const userIndex = mockOrganizationUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockOrganizationUsers[userIndex] = { 
        ...mockOrganizationUsers[userIndex], 
        ...data,
        role: mockRoles.find(r => r.id === data.idRole),
        updatedAt: new Date().toISOString(),
      };
      return mockOrganizationUsers[userIndex];
    }
    
    const response = await fetch(`/api/organizations/${idOrganization}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  disableUser: async (idOrganization: string, userId: string): Promise<void> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const userIndex = mockOrganizationUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockOrganizationUsers[userIndex] = {
        ...mockOrganizationUsers[userIndex],
        status: OrganizationUserStatus.Disabled,
        disabledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return;
    }
    
    const response = await fetch(`/api/organizations/${idOrganization}/users/${userId}/disable`, {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to disable user');
  },

  enableUser: async (idOrganization: string, userId: string): Promise<void> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const userIndex = mockOrganizationUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockOrganizationUsers[userIndex] = {
        ...mockOrganizationUsers[userIndex],
        status: OrganizationUserStatus.Active,
        disabledAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      return;
    }
    
    const response = await fetch(`/api/organizations/${idOrganization}/users/${userId}/enable`, {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to enable user');
  },

  // Roles
  getRoles: async (idOrganization: string): Promise<Role[]> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/organizations/${idOrganization}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },

  // Countries, States, Banks
  getCountries: async (): Promise<Country[]> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/countries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch countries');
    return response.json();
  },

  getStates: async (idCountry: string): Promise<State[]> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/countries/${idCountry}/states`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch states');
    return response.json();
  },

  getBanks: async (): Promise<Bank[]> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/banks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch banks');
    return response.json();
  },
};
