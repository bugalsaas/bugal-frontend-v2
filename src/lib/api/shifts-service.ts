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

// Mock data for development mode
export const mockShiftsData: Shift[] = [
  {
    id: '1',
    idAssignee: 'user-1',
    assignee: {
      id: 'user-1',
      name: 'Sarah Johnson',
      initials: 'SJ',
      color: '#3B82F6',
    },
    contact: {
      id: '1',
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+61 412 345 678',
    },
    summary: 'Morning assistance with daily activities',
    comments: 'Client was in good spirits today',
    notes: 'Remember to bring medication',
    client: 'John Smith',
    endDate: '2024-10-26T12:00:00Z',
    startDate: '2024-10-26T08:00:00Z',
    duration: 14400, // 4 hours in seconds
    location: '123 Main St, Melbourne',
    rate: 'Standard',
    category: ShiftCategory.AssistanceDailyLife,
    idRate: 'rate-1',
    rateAmountExclGst: 45.00,
    rateName: 'Standard Hourly Rate',
    rateType: RateType.Hourly,
    totalExclGst: 180.00,
    totalInclGst: 198.00,
    shiftStatus: ShiftStatus.Completed,
    isComplete: true,
    isDuplicate: false,
    idContact: '1',
    tz: 'Australia/Melbourne',
    isGstFree: false,
    recurrenceRule: '',
    incidentsCount: 0,
    createdAt: '2024-10-26T07:30:00Z',
    updatedAt: '2024-10-26T12:15:00Z',
  },
  {
    id: '2',
    idAssignee: 'user-2',
    assignee: {
      id: 'user-2',
      name: 'Mike Wilson',
      initials: 'MW',
      color: '#10B981',
    },
    contact: {
      id: '2',
      fullName: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+61 445 678 901',
    },
    summary: 'Transport to medical appointment',
    comments: 'Traffic was heavy but arrived on time',
    notes: 'Next appointment scheduled for next week',
    client: 'Emma Davis',
    endDate: '2024-10-26T15:30:00Z',
    startDate: '2024-10-26T14:00:00Z',
    duration: 5400, // 1.5 hours in seconds
    location: '456 Collins St, Melbourne',
    rate: 'Transport',
    category: ShiftCategory.Transport,
    idRate: 'rate-2',
    rateAmountExclGst: 35.00,
    rateName: 'Transport Rate',
    rateType: RateType.Hourly,
    totalExclGst: 52.50,
    totalInclGst: 57.75,
    shiftStatus: ShiftStatus.Pending,
    isComplete: false,
    isDuplicate: false,
    idContact: '2',
    tz: 'Australia/Melbourne',
    isGstFree: false,
    recurrenceRule: '',
    incidentsCount: 0,
    createdAt: '2024-10-26T13:45:00Z',
    updatedAt: '2024-10-26T13:45:00Z',
  },
  {
    id: '3',
    idAssignee: 'user-1',
    assignee: {
      id: 'user-1',
      name: 'Sarah Johnson',
      initials: 'SJ',
      color: '#3B82F6',
    },
    contact: {
      id: '3',
      fullName: 'Robert Chen',
      email: 'robert.chen@email.com',
      phone: '+61 456 789 012',
    },
    summary: 'Social and community participation',
    comments: 'Client enjoyed the community center activities',
    notes: 'Consider extending session duration',
    client: 'Robert Chen',
    endDate: '2024-10-26T17:00:00Z',
    startDate: '2024-10-26T15:00:00Z',
    duration: 7200, // 2 hours in seconds
    location: '789 Bourke St, Melbourne',
    rate: 'Standard',
    category: ShiftCategory.AssistanceSocialCommunity,
    idRate: 'rate-1',
    rateAmountExclGst: 45.00,
    rateName: 'Standard Hourly Rate',
    rateType: RateType.Hourly,
    totalExclGst: 90.00,
    totalInclGst: 99.00,
    shiftStatus: ShiftStatus.Cancelled,
    isComplete: false,
    isDuplicate: false,
    idContact: '3',
    tz: 'Australia/Melbourne',
    isGstFree: false,
    recurrenceRule: '',
    incidentsCount: 1,
    createdAt: '2024-10-26T14:30:00Z',
    updatedAt: '2024-10-26T16:45:00Z',
  },
  {
    id: '4',
    idAssignee: 'user-3',
    assignee: {
      id: 'user-3',
      name: 'Lisa Brown',
      initials: 'LB',
      color: '#F59E0B',
    },
    contact: {
      id: '4',
      fullName: 'ABC Corporation',
      email: 'contact@abccorp.com.au',
      phone: '+61 3 9876 5432',
    },
    summary: 'Support coordination meeting',
    comments: 'Productive discussion about care plan',
    notes: 'Follow up meeting scheduled',
    client: 'ABC Corporation',
    endDate: '2024-10-27T11:00:00Z',
    startDate: '2024-10-27T09:00:00Z',
    duration: 7200, // 2 hours in seconds
    location: '100 Business Ave, Melbourne',
    rate: 'Coordination',
    category: ShiftCategory.SupportCoordination,
    idRate: 'rate-3',
    rateAmountExclGst: 60.00,
    rateName: 'Coordination Rate',
    rateType: RateType.Hourly,
    totalExclGst: 120.00,
    totalInclGst: 132.00,
    shiftStatus: ShiftStatus.Pending,
    isComplete: false,
    isDuplicate: false,
    idContact: '4',
    tz: 'Australia/Melbourne',
    isGstFree: false,
    recurrenceRule: '',
    incidentsCount: 0,
    createdAt: '2024-10-26T16:00:00Z',
    updatedAt: '2024-10-26T16:00:00Z',
  },
  {
    id: '5',
    idAssignee: 'user-2',
    assignee: {
      id: 'user-2',
      name: 'Mike Wilson',
      initials: 'MW',
      color: '#10B981',
    },
    contact: {
      id: '5',
      fullName: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+61 445 678 901',
    },
    summary: 'Job search assistance',
    comments: 'Helped client prepare for interview',
    notes: 'Client has interview next week',
    client: 'Emma Davis',
    endDate: '2024-10-27T16:00:00Z',
    startDate: '2024-10-27T14:00:00Z',
    duration: 7200, // 2 hours in seconds
    location: '321 Queen St, Melbourne',
    rate: 'Standard',
    category: ShiftCategory.FindingKeepingJob,
    idRate: 'rate-1',
    rateAmountExclGst: 45.00,
    rateName: 'Standard Hourly Rate',
    rateType: RateType.Hourly,
    totalExclGst: 90.00,
    totalInclGst: 99.00,
    shiftStatus: ShiftStatus.Pending,
    isComplete: false,
    isDuplicate: false,
    idContact: '5',
    tz: 'Australia/Melbourne',
    isGstFree: false,
    recurrenceRule: '',
    incidentsCount: 0,
    createdAt: '2024-10-26T17:30:00Z',
    updatedAt: '2024-10-26T17:30:00Z',
  },
];

export const mockShiftsResponse: ShiftListResponse = {
  data: mockShiftsData,
  meta: {
    total: mockShiftsData.length,
    pageNumber: 1,
    pageSize: 100,
    hasMoreAfter: false,
    hasMoreBefore: false,
  },
};
