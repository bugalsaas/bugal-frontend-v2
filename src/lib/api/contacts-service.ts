// Contacts API service
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types for contacts data
export interface Contact {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postcode?: string;
  contactType: ContactType;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  dob?: string;
  notes?: string;
  // Guardian fields
  hasGuardian?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  // Organisation contact fields
  hasOrganisationContact?: boolean;
  organisationContactName?: string;
  organisationContactEmail?: string;
  organisationContactPhone?: string;
  // Invoice recipients
  invoiceRecipients?: Array<{ email: string; role: string }>;
}

export enum ContactType {
  All = 'All',
  Client = 'Client',
  Organisation = 'Organisation',
  Staff = 'Staff',
}

export enum ContactStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Archived = 'Archived',
}

export interface ContactFilters {
  type?: ContactType;
  search?: string;
  status?: ContactStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface ContactListResponse {
  data: Contact[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

// API service functions
export const contactsApi = {
  async getAll(filters: ContactFilters = {}): Promise<ContactListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    if (filters.type && filters.type !== ContactType.All) {
      params.append('type', filters.type);
    }
    if (filters.search) {
      params.append('text', filters.search);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.pageNumber) {
      params.append('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const response = await fetch(`${API_BASE_URL}/contacts?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    return response.json();
  },

  async getById(id: string): Promise<Contact> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact');
    }

    return response.json();
  },

  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error('Failed to create contact');
    }

    return response.json();
  },

  async update(id: string, contact: Partial<Contact>): Promise<Contact> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error('Failed to update contact');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }
  },
};

// Mock data for development mode
export const mockContactsData: Contact[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+61 412 345 678',
    addressLine1: '123 Main St',
    addressLine2: 'Unit 5',
    state: 'VIC',
    postcode: '3000',
    contactType: ContactType.Client,
    status: ContactStatus.Active,
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
    notes: 'Regular client, prefers morning shifts',
    dob: '1985-03-15',
    hasGuardian: true,
    guardianName: 'Mary Smith',
    guardianEmail: 'mary.smith@email.com',
    guardianPhone: '+61 412 345 679',
    guardianRelationship: 'parent',
    invoiceRecipients: [
      { email: 'john.smith@email.com', role: 'Primary' },
      { email: 'mary.smith@email.com', role: 'Secondary' }
    ],
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+61 423 456 789',
    addressLine1: '456 Collins St',
    state: 'VIC',
    postcode: '3000',
    contactType: ContactType.Staff,
    status: ContactStatus.Active,
    createdAt: '2024-10-19T09:00:00Z',
    updatedAt: '2024-10-19T09:00:00Z',
    notes: 'Senior staff member, excellent with clients',
    dob: '1990-07-22',
  },
  {
    id: '3',
    fullName: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+61 434 567 890',
    addressLine1: '789 Bourke St',
    state: 'VIC',
    postcode: '3000',
    contactType: ContactType.Client,
    status: ContactStatus.Inactive,
    createdAt: '2024-10-18T08:00:00Z',
    updatedAt: '2024-10-18T08:00:00Z',
    notes: 'Client on temporary break',
    dob: '1978-11-08',
  },
  {
    id: '4',
    fullName: 'ABC Corporation',
    email: 'contact@abccorp.com.au',
    phone: '+61 3 9876 5432',
    addressLine1: '100 Business Ave',
    addressLine2: 'Level 10',
    state: 'VIC',
    postcode: '3001',
    contactType: ContactType.Organisation,
    status: ContactStatus.Active,
    createdAt: '2024-10-17T07:00:00Z',
    updatedAt: '2024-10-17T07:00:00Z',
    notes: 'Corporate client, bulk bookings, prefers afternoon shifts',
    hasOrganisationContact: true,
    organisationContactName: 'Jennifer Brown',
    organisationContactEmail: 'j.brown@abccorp.com.au',
    organisationContactPhone: '+61 3 9876 5433',
  },
  {
    id: '5',
    fullName: 'Emma Davis',
    email: 'emma.davis@email.com',
    phone: '+61 445 678 901',
    addressLine1: '321 Queen St',
    state: 'VIC',
    postcode: '3000',
    contactType: ContactType.Staff,
    status: ContactStatus.Active,
    createdAt: '2024-10-16T06:00:00Z',
    updatedAt: '2024-10-16T06:00:00Z',
    notes: 'Part-time staff, available weekends',
    dob: '1995-01-14',
  },
  {
    id: '6',
    fullName: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '+61 456 789 012',
    addressLine1: '555 Swanston St',
    addressLine2: 'Apt 12B',
    state: 'VIC',
    postcode: '3000',
    contactType: ContactType.Client,
    status: ContactStatus.Active,
    createdAt: '2024-10-15T05:00:00Z',
    updatedAt: '2024-10-15T05:00:00Z',
    notes: 'New client, requires special assistance',
    dob: '1992-09-30',
    hasGuardian: true,
    guardianName: 'Lisa Chen',
    guardianEmail: 'lisa.chen@email.com',
    guardianPhone: '+61 456 789 013',
    guardianRelationship: 'sister',
    invoiceRecipients: [
      { email: 'robert.chen@email.com', role: 'Primary' }
    ],
  },
];

export const mockContactsResponse: ContactListResponse = {
  data: mockContactsData,
  meta: {
    total: mockContactsData.length,
    pageNumber: 1,
    pageSize: 100,
  },
};
