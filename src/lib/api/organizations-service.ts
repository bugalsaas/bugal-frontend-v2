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

// Mock data for development
const mockCountries: Country[] = [
  { id: '1', name: 'Australia', code: 'AU' },
  { id: '2', name: 'New Zealand', code: 'NZ' },
];

const mockStates: State[] = [
  { id: '1', name: 'New South Wales', code: 'NSW', idCountry: '1' },
  { id: '2', name: 'Victoria', code: 'VIC', idCountry: '1' },
  { id: '3', name: 'Queensland', code: 'QLD', idCountry: '1' },
  { id: '4', name: 'Western Australia', code: 'WA', idCountry: '1' },
  { id: '5', name: 'South Australia', code: 'SA', idCountry: '1' },
  { id: '6', name: 'Tasmania', code: 'TAS', idCountry: '1' },
  { id: '7', name: 'Australian Capital Territory', code: 'ACT', idCountry: '1' },
  { id: '8', name: 'Northern Territory', code: 'NT', idCountry: '1' },
];

const mockBanks: Bank[] = [
  { id: '1', name: 'Commonwealth Bank', code: 'CBA' },
  { id: '2', name: 'Westpac', code: 'WBC' },
  { id: '3', name: 'ANZ', code: 'ANZ' },
  { id: '4', name: 'National Australia Bank', code: 'NAB' },
  { id: '5', name: 'Other', code: 'OTHER' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    idOrganization: '1',
    name: 'Owner',
    description: 'Full access to all features',
    permissions: ['all'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    idOrganization: '1',
    name: 'Manager',
    description: 'Manage shifts, contacts, and invoices',
    permissions: ['shifts', 'contacts', 'invoices'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    idOrganization: '1',
    name: 'Staff',
    description: 'View and update shifts',
    permissions: ['shifts:view', 'shifts:update'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Bugal Care Services',
    email: 'admin@bugal.com.au',
    organizationType: OrganizationType.Company,
    isGstRegistered: true,
    country: mockCountries[0],
    idCountry: '1',
    idState: '1',
    timezone: 'Australia/Sydney',
    phoneNumber: '+61 2 1234 5678',
    addressLine1: '123 Business Street',
    addressLine2: 'Suite 100',
    postcode: '2000',
    abn: '12345678901',
    paymentTerms: 30,
    invoicePrefix: 'BCS',
    bankName: mockBanks[0],
    bankBsb: '062-000',
    bankAccountNumber: '12345678',
    referralCode: 'BUGAL2024',
    subscriptionStatus: SubscriptionStatus.Active,
    createdAt: '2024-01-01T00:00:00Z',
    trialEndDate: '2024-12-31T23:59:59Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson Care',
    email: 'sarah@example.com',
    organizationType: OrganizationType.SoleTrader,
    isGstRegistered: false,
    country: mockCountries[0],
    idCountry: '1',
    idState: '2',
    timezone: 'Australia/Melbourne',
    phoneNumber: '+61 3 9876 5432',
    addressLine1: '456 Home Street',
    postcode: '3000',
    abn: '98765432109',
    paymentTerms: 14,
    invoicePrefix: 'SJC',
    bankName: mockBanks[1],
    bankBsb: '033-000',
    bankAccountNumber: '87654321',
    referralCode: 'SARAH2024',
    subscriptionStatus: SubscriptionStatus.Trial,
    createdAt: '2024-02-01T00:00:00Z',
    trialEndDate: '2024-12-31T23:59:59Z',
  },
];

const mockOrganizationUsers: OrganizationUser[] = [
  {
    id: '1',
    idOrganization: '1',
    idRole: '1',
    firstName: 'Andrew',
    lastName: 'Giles',
    fullName: 'Andrew Giles',
    email: 'andrew@bugal.com.au',
    initials: 'AG',
    color: '#3B82F6',
    status: OrganizationUserStatus.Active,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    role: mockRoles[0],
  },
  {
    id: '2',
    idOrganization: '1',
    idRole: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah@bugal.com.au',
    initials: 'SJ',
    color: '#10B981',
    status: OrganizationUserStatus.Active,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    role: mockRoles[1],
  },
  {
    id: '3',
    idOrganization: '1',
    idRole: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    fullName: 'Mike Wilson',
    email: 'mike@bugal.com.au',
    initials: 'MW',
    color: '#F59E0B',
    status: OrganizationUserStatus.Invited,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    role: mockRoles[2],
  },
  {
    id: '4',
    idOrganization: '1',
    idRole: '3',
    firstName: 'Emma',
    lastName: 'Davis',
    fullName: 'Emma Davis',
    email: 'emma@bugal.com.au',
    initials: 'ED',
    color: '#EF4444',
    status: OrganizationUserStatus.Disabled,
    disabledAt: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    role: mockRoles[2],
  },
];

const mockOrganizationsResponse: OrganizationListResponse = {
  data: mockOrganizations,
  meta: {
    total: mockOrganizations.length,
    page: 1,
    pageSize: 10,
  },
};

const mockOrganizationUsersResponse: OrganizationUsersListResponse = {
  data: mockOrganizationUsers,
  meta: {
    total: mockOrganizationUsers.length,
    page: 1,
    pageSize: 10,
  },
};

// API functions
export const organizationsApi = {
  // Organizations
  getAll: async (filters?: { page?: number; pageSize?: number; text?: string }): Promise<OrganizationListResponse> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockOrganizationsResponse;
    }
    
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.text) params.append('text', filters.text);
    
    const response = await fetch(`/api/organizations?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },

  getById: async (id: string): Promise<Organization> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch organization');
    return response.json();
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
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      const orgIndex = mockOrganizations.findIndex(o => o.id === id);
      if (orgIndex === -1) throw new Error('Organization not found');
      
      mockOrganizations[orgIndex] = { ...mockOrganizations[orgIndex], ...data };
      return mockOrganizations[orgIndex];
    }
    
    const response = await fetch(`/api/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update organization');
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
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockOrganizationUsersResponse;
    }
    
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.text) params.append('text', filters.text);
    
    const response = await fetch(`/api/organizations/${idOrganization}/users?${params}`, {
      headers: { 'Content-Type': 'application/json' },
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
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockRoles;
    }
    
    const response = await fetch(`/api/organizations/${idOrganization}/roles`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },

  // Countries, States, Banks
  getCountries: async (): Promise<Country[]> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockCountries;
    }
    
    const response = await fetch('/api/countries', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch countries');
    return response.json();
  },

  getStates: async (idCountry: string): Promise<State[]> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockStates.filter(s => s.idCountry === idCountry);
    }
    
    const response = await fetch(`/api/countries/${idCountry}/states`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch states');
    return response.json();
  },

  getBanks: async (): Promise<Bank[]> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return mockBanks;
    }
    
    const response = await fetch('/api/banks', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch banks');
    return response.json();
  },
};
