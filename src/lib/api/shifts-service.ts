// Shifts API service
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types for shifts data
export interface Shift {
  id: string;
  idAssignee: string;
  assignee: {
    id: string;
    name: string;
    initials: string;
    color: string;
  };
  contact: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  summary: string;
  comments: string;
  notes: string;
  client: string;
  endDate: string;
  startDate: string;
  duration: number; // in seconds
  location: string;
  rate: string;
  category: string;
  idRate: string;
  rateAmountExclGst: number;
  rateName: string;
  rateType: RateType;
  totalExclGst: number;
  totalInclGst: number;
  shiftStatus: ShiftStatus;
  isComplete: boolean;
  isDuplicate: boolean;
  idContact?: string;
  idInvoice?: string;
  tz: string;
  isGstFree?: boolean;
  recurrenceRule?: string;
  incidentsCount: number;
  expenses?: Expense[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  idShift?: string;
  idContact?: string;
  expenseType: ExpenseType;
  amountExclGst: number;
  amountGst: number;
  amountInclGst: number;
  description: string;
  date: string;
  isGstFree: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

export enum ShiftStatus {
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  Today = 'Today',
  All = 'All statuses',
  NotInvoiced = 'Not invoiced',
}

export enum ShiftCategory {
  AssistanceDailyLife = 'Assistance with daily life',
  AssistanceSocialCommunity = 'Assistance with social and community participation',
  Transport = 'Transport',
  SupportCoordination = 'Support Coordination',
  IncreasedSocialcommunity = 'Increased social and community participation',
  FindingKeepingJob = 'Finding and keeping a job',
}

export enum ExpenseType {
  Reclaimable = 'Reclaimable',
  Kilometre = 'Kilometre',
}

export enum RateType {
  Hourly = 'Hourly',
  Daily = 'Daily',
  Fixed = 'Fixed',
}

export interface ShiftFilters {
  status?: ShiftStatus;
  assignee?: string;
  contact?: string;
  before?: string;
  after?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ShiftListResponse {
  data: Shift[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
    hasMoreAfter?: boolean;
    hasMoreBefore?: boolean;
  };
}

// API service functions
export const shiftsApi = {
  async getAll(filters: ShiftFilters = {}): Promise<ShiftListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== ShiftStatus.All) {
      params.append('status', filters.status);
    }
    if (filters.assignee && filters.assignee !== '-1') {
      params.append('assignee', filters.assignee);
    }
    if (filters.contact) {
      params.append('contact', filters.contact);
    }
    if (filters.before) {
      params.append('before', filters.before);
    }
    if (filters.after) {
      params.append('after', filters.after);
    }
    if (filters.pageNumber) {
      params.append('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const response = await fetch(`${API_BASE_URL}/shifts?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }

    return response.json();
  },

  async getById(id: string): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shift');
    }

    return response.json();
  },

  async create(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shift),
    });

    if (!response.ok) {
      throw new Error('Failed to create shift');
    }

    return response.json();
  },

  async update(id: string, shift: Partial<Shift>): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shift),
    });

    if (!response.ok) {
      throw new Error('Failed to update shift');
    }

    return response.json();
  },

  async complete(id: string, data: { isGstFree: boolean }): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to complete shift');
    }

    return response.json();
  },

  async cancel(id: string, data: { cancellationReason: string; cancellationAmountExclGst: number; isGstFree: boolean }): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel shift');
    }

    return response.json();
  },

  async delete(id: string, type: 'single' | 'future' | 'all'): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete shift');
    }
  },

  async amend(id: string): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/amend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to amend shift');
    }

    return response.json();
  },

  async notify(id: string, data: { message: string; recipients: string[] }): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/notify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to notify shift');
    }
  },
};
