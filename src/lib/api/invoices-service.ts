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