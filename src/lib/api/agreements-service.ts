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
  amountExclGst: number;
  frequency: Frequency[];
  location?: string;
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
    if (filters.status) params.append('status', filters.status);
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
      throw new Error('Failed to fetch agreements');
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

  async create(agreement: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'user'>): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const newAgreement: Agreement = {
        ...agreement,
        id: Date.now().toString(),
        code: `AGR-${new Date().getFullYear()}-${String(mockAgreementsData.length + 1).padStart(3, '0')}`,
        user: {
          id: 'user1',
          fullName: 'Current User',
          email: 'user@example.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockAgreementsData.push(newAgreement);
      return newAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      throw new Error('Failed to create agreement');
    }
    return response.json();
  },

  async update(id: string, agreement: Partial<Agreement>): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const updatedAgreement: Agreement = {
        ...mockAgreementsData[index],
        ...agreement,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = updatedAgreement;
      return updatedAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      throw new Error('Failed to update agreement');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      mockAgreementsData.splice(index, 1);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete agreement');
    }
  },

  async complete(id: string): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const completedAgreement: Agreement = {
        ...mockAgreementsData[index],
        agreementStatus: AgreementStatus.Completed,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = completedAgreement;
      return completedAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to complete agreement');
    }
    return response.json();
  },

  async draft(id: string): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const draftAgreement: Agreement = {
        ...mockAgreementsData[index],
        agreementStatus: AgreementStatus.Draft,
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = draftAgreement;
      return draftAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/draft`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to revert agreement to draft');
    }
    return response.json();
  },

  async notify(id: string, recipients: string[]): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      console.log('Mock notify agreement:', id, 'to recipients:', recipients);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients }),
    });
    if (!response.ok) {
      throw new Error('Failed to notify agreement');
    }
  },
};
