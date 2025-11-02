'use client';

import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export enum AgreementStatus {
  Draft = 'Draft',
  Completed = 'Completed',
  All = 'All',
}

export enum DaysOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export interface Frequency {
  duration: number;
  dayOfWeek: DaysOfWeek;
}

export interface AgreementSupportItem {
  NDISName: string;
  NDISNumber: string;
  description: string;
  amountExclGst: string;
  frequency: Frequency[];
  location?: string;
}

export interface NotifyItem {
  name: string;
  email: string;
}

export interface Agreement {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  idUser: string;
  userResponsibilities: string[];
  contact: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    state?: string;
    postcode?: string;
  };
  idContact: string;
  contactResponsibilities: string[];
  code: string;
  agreementStatus: AgreementStatus;
  startDate: string;
  endDate: string;
  reviewDate: string;
  amendmentDays: number;
  sendInvoicesAfter: number;
  supportItems: AgreementSupportItem[];
  canChargeCancellation: boolean;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementCreateDto {
  idContact: string;
  startDate: string;
  endDate: string;
  reviewDate: string;
  amendmentDays: number;
  sendInvoicesAfter?: number;
  supportItems: AgreementSupportItem[];
  userResponsibilities: string[];
  contactResponsibilities: string[];
  canChargeCancellation?: boolean;
  idAttachments?: string[];
}

export interface AgreementUpdateDto extends AgreementCreateDto {
  id: string;
}

export interface AgreementFilters {
  search?: string;
  idContact?: string;
  status?: AgreementStatus;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AgreementListResponse {
  data: Agreement[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

// All data is sourced from the real API

export const agreementsApi = {
  async getAll(filters: AgreementFilters = {}): Promise<AgreementListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.idContact) params.append('idContact', filters.idContact);
    // Only send status if it's not "All" - backend only accepts "Draft" or "Completed"
    if (filters.status && filters.status !== AgreementStatus.All) {
      params.append('status', filters.status);
    }
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/agreements?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agreements API error:', response.status, errorText);
      throw new Error(`Failed to fetch agreements: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<Agreement> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch agreement');
    }
    return response.json();
  },

  async create(agreement: AgreementCreateDto): Promise<Agreement> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agreement create error:', response.status, errorText);
      throw new Error(`Failed to create agreement: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async update(id: string, agreement: AgreementUpdateDto): Promise<Agreement> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...agreement, id }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agreement update error:', response.status, errorText);
      throw new Error(`Failed to update agreement: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete agreement');
    }
  },

  async getRecipients(id: string): Promise<NotifyItem[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}/recipients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get recipients error:', response.status, errorText);
      throw new Error(`Failed to get recipients: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async complete(id: string): Promise<Agreement> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Complete agreement error:', response.status, errorText);
      throw new Error(`Failed to complete agreement: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async draft(id: string): Promise<Agreement> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}/undo`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Revert to draft error:', response.status, errorText);
      throw new Error(`Failed to revert agreement to draft: ${response.status} ${errorText || response.statusText}`);
    }
    return response.json();
  },

  async notify(id: string, recipients: NotifyItem[]): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/agreements/${id}/notify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notify agreement error:', response.status, errorText);
      throw new Error(`Failed to notify agreement: ${response.status} ${errorText || response.statusText}`);
    }
  },
};
