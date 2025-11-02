// Shifts API service
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types for shifts data
export interface Shift {
  id: string;
  idAssignee: string;
  assignee?: {
    id: string;
    fullName: string;
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

export interface NotifyItem {
  name: string;
  email: string;
}

export enum DeleteShiftType {
  Single = 'single',
  Future = 'future',
  All = 'all',
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

export enum ShiftAction {
  Invoice = 'Invoice',
}

export interface ShiftFilters {
  status?: ShiftStatus;
  assignee?: string;
  contact?: string;
  before?: string;
  after?: string;
  action?: ShiftAction;
  pageNumber?: number;
  pageSize?: number;
}

export interface ShiftListResponse {
  data: Shift[];
  hasMoreAfter?: string; // Date string indicating there are more shifts after this range
  hasMoreBefore?: string; // Date string indicating there are more shifts before this range
}

// API service functions
export const shiftsApi = {
  async getAll(filters: ShiftFilters = {}): Promise<ShiftListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    if (filters.action) {
      params.append('action', filters.action);
    }
    if (filters.status && filters.status !== ShiftStatus.All) {
      params.append('status', filters.status);
    }
    // Backend requires assignee to always be present as a string
    // Default to '-1' (all users) if not provided or invalid
    const assigneeValue = (filters.assignee && typeof filters.assignee === 'string' && filters.assignee.trim() !== '') 
      ? filters.assignee 
      : '-1';
    params.append('assignee', assigneeValue);
    
    // Only send contact if it's a valid non-empty string
    if (filters.contact && typeof filters.contact === 'string' && filters.contact.trim() !== '') {
      params.append('contact', filters.contact);
    }
    
    // Backend requires at least one of 'before' or 'after' to be provided
    // UNLESS action=Invoice is specified (which doesn't need date filters)
    const hasBefore = filters.before && typeof filters.before === 'string' && filters.before.trim() !== '';
    const hasAfter = filters.after && typeof filters.after === 'string' && filters.after.trim() !== '';
    
    if (hasBefore) {
      params.append('before', filters.before);
    }
    if (hasAfter) {
      params.append('after', filters.after);
    }
    
    // If neither is provided and action is not Invoice, default to showing all future shifts (after today)
    if (!hasBefore && !hasAfter && !filters.action) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      params.append('after', todayStr);
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
      const errorText = await response.text();
      console.error('Shifts API error:', response.status, errorText);
      throw new Error(`Failed to fetch shifts: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async getOne(id: string): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get shift API error:', response.status, errorText);
      throw new Error(`Failed to fetch shift: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async getById(id: string): Promise<Shift> {
    // Alias for backwards compatibility
    return this.getOne(id);
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

  async complete(id: string, data: { isGstFree: boolean; notes?: string }): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Complete shift API error:', response.status, errorText);
      throw new Error(`Failed to complete shift: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async cancel(id: string, data: { cancellationReason: string; cancellationAmountExclGst: number; isGstFree: boolean }): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cancel shift API error:', response.status, errorText);
      throw new Error(`Failed to cancel shift: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async delete(id: string, type: DeleteShiftType = DeleteShiftType.Single): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    params.append('type', type);

    const response = await fetch(`${API_BASE_URL}/shifts/${id}?${params}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete shift API error:', response.status, errorText);
      throw new Error(`Failed to delete shift: ${response.status} ${errorText || response.statusText}`);
    }
  },

  async amend(id: string): Promise<Shift> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/ammend`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amend shift API error:', response.status, errorText);
      throw new Error(`Failed to amend shift: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async getRecipients(id: string): Promise<NotifyItem[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/recipients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get recipients API error:', response.status, errorText);
      throw new Error(`Failed to get recipients: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async notify(id: string, recipients: NotifyItem[]): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/shifts/${id}/notify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notify shift API error:', response.status, errorText);
      throw new Error(`Failed to notify shift: ${response.status} ${errorText || response.statusText}`);
    }
  },
};
