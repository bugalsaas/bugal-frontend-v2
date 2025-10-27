import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Invoice {
  id: string;
  code: string;
  contact: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  date: string;
  dueDate: string;
  totalExclGst: number;
  totalInclGst: number;
  totalGst: number;
  paidExclGst: number;
  paidInclGst: number;
  writtenOffExclGst: number;
  writtenOffInclGst: number;
  outstandingExclGst: number;
  outstandingInclGst: number;
  invoiceStatus: InvoiceStatus;
  shifts: any[];
  expenses: any[];
  notifications: any[];
  payments: InvoicePayment[];
}

export enum InvoiceStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  WrittenOff = 'Written Off',
}

export interface InvoicePayment {
  id: string;
  date: string;
  amountExclGst: number;
  amountInclGst: number;
  amountGst: number;
  paymentMethod: PaymentMethod;
  notes: string;
}

export enum PaymentMethod {
  EFT = 'EFT',
  Cash = 'Cash',
  Other = 'Other',
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  contact?: string;
  from?: string;
  to?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

export const invoicesApi = {
  async getAll(filters: InvoiceFilters = {}): Promise<InvoiceListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.contact) {
      params.append('contact', filters.contact);
    }
    if (filters.from) {
      params.append('from', filters.from);
    }
    if (filters.to) {
      params.append('to', filters.to);
    }
    if (filters.pageNumber) {
      params.append('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const response = await fetch(`${API_BASE_URL}/invoices?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  },

  async getById(id: string): Promise<Invoice> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  },

  async create(invoice: Partial<Invoice>): Promise<Invoice> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    return response.json();
  },

  async update(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  },

  async download(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async notify(id: string, payload: { recipients: any[] }): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}/notify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to notify invoice');
    }
  },
};

export const mockInvoicesData: Invoice[] = [
  {
    id: '1',
    code: 'INV-2024-001',
    contact: {
      id: '1',
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+61 412 345 678',
    },
    date: '2024-10-20T00:00:00Z',
    dueDate: '2024-11-20T00:00:00Z',
    totalExclGst: 1000.00,
    totalInclGst: 1100.00,
    totalGst: 100.00,
    paidExclGst: 1000.00,
    paidInclGst: 1100.00,
    writtenOffExclGst: 0,
    writtenOffInclGst: 0,
    outstandingExclGst: 0,
    outstandingInclGst: 0,
    invoiceStatus: InvoiceStatus.Paid,
    shifts: [],
    expenses: [],
    notifications: [],
    payments: [{
      id: 'p1',
      date: '2024-10-25T00:00:00Z',
      amountExclGst: 1000.00,
      amountInclGst: 1100.00,
      amountGst: 100.00,
      paymentMethod: PaymentMethod.EFT,
      notes: 'Payment received via bank transfer',
    }],
  },
  {
    id: '2',
    code: 'INV-2024-002',
    contact: {
      id: '2',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+61 423 456 789',
    },
    date: '2024-10-15T00:00:00Z',
    dueDate: '2024-11-15T00:00:00Z',
    totalExclGst: 1500.00,
    totalInclGst: 1650.00,
    totalGst: 150.00,
    paidExclGst: 0,
    paidInclGst: 0,
    writtenOffExclGst: 0,
    writtenOffInclGst: 0,
    outstandingExclGst: 1500.00,
    outstandingInclGst: 1650.00,
    invoiceStatus: InvoiceStatus.Unpaid,
    shifts: [],
    expenses: [],
    notifications: [],
    payments: [],
  },
  {
    id: '3',
    code: 'INV-2024-003',
    contact: {
      id: '3',
      fullName: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+61 434 567 890',
    },
    date: '2024-09-30T00:00:00Z',
    dueDate: '2024-10-30T00:00:00Z',
    totalExclGst: 800.00,
    totalInclGst: 880.00,
    totalGst: 80.00,
    paidExclGst: 0,
    paidInclGst: 0,
    writtenOffExclGst: 800.00,
    writtenOffInclGst: 880.00,
    outstandingExclGst: 0,
    outstandingInclGst: 0,
    invoiceStatus: InvoiceStatus.WrittenOff,
    shifts: [],
    expenses: [],
    notifications: [],
    payments: [],
  },
  {
    id: '4',
    code: 'INV-2024-004',
    contact: {
      id: '1',
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+61 412 345 678',
    },
    date: '2024-08-15T00:00:00Z',
    dueDate: '2024-09-15T00:00:00Z',
    totalExclGst: 2000.00,
    totalInclGst: 2200.00,
    totalGst: 200.00,
    paidExclGst: 0,
    paidInclGst: 0,
    writtenOffExclGst: 0,
    writtenOffInclGst: 0,
    outstandingExclGst: 2000.00,
    outstandingInclGst: 2200.00,
    invoiceStatus: InvoiceStatus.Overdue,
    shifts: [],
    expenses: [],
    notifications: [],
    payments: [],
  },
];

export const mockInvoicesResponse: InvoiceListResponse = {
  data: mockInvoicesData,
  meta: {
    total: mockInvoicesData.length,
    pageNumber: 1,
    pageSize: 100,
  },
};

