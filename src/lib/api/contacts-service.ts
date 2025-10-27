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
