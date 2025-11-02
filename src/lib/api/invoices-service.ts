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
  shifts: InvoiceShift[];
  expenses: InvoiceExpense[];
  receipts: Receipt[];
  notifications: InvoiceNotification[];
}

export interface InvoiceShift {
  id: string;
  code: string;
  summary: string;
  startDate: string;
  duration: number;
  totalExclGst: number;
  totalInclGst: number;
  shiftStatus: string;
  assignee?: {
    id: string;
    fullName: string;
  };
}

export interface InvoiceExpense {
  id: string;
  code: string;
  description: string;
  date: string;
  amountExclGst: number;
  amountInclGst: number;
  expenseType: string;
}

export interface Receipt {
  id: string;
  code: string;
  receiptType: ReceiptType;
  date: string;
  amountExclGst: number;
  amountInclGst: number;
  amountGst: number;
  paymentMethod?: PaymentMethod;
  otherPaymentMethod?: string;
  notes?: string;
}

export interface InvoiceNotification {
  id: string;
  createdAt: string;
  recipients: NotifyItem[];
}

export interface NotifyItem {
  name: string;
  email: string;
}

export enum InvoiceStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  WrittenOff = 'Written Off',
}

export enum ReceiptType {
  InvoiceReceipt = 'InvoiceReceipt',
  InvoiceWriteOff = 'InvoiceWriteOff',
}

export enum PaymentMethod {
  EFT = 'EFT',
  Cash = 'Cash',
  Other = 'Other',
}

export interface InvoiceCreateDto {
  date: string;
  dueDate: string;
  idContact: string;
  shiftIds: string[];
  expenseIds: string[];
}

export interface InvoiceUpdateDto {
  date: string;
  dueDate: string;
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
      // Backend expects "Written-off" but frontend enum is "Written Off", so map it
      const statusForApi = filters.status === InvoiceStatus.WrittenOff 
        ? 'Written-off' 
        : filters.status;
      params.append('status', statusForApi);
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
      const errorText = await response.text();
      console.error('Invoices fetch error:', response.status, errorText);
      throw new Error(`Failed to fetch invoices: ${errorText || response.statusText}`);
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

  async create(invoice: InvoiceCreateDto): Promise<Invoice> {
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
      const errorText = await response.text();
      console.error('Invoice create error:', response.status, errorText);
      throw new Error(`Failed to create invoice: ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async update(id: string, invoice: InvoiceUpdateDto): Promise<Invoice> {
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
      const errorText = await response.text();
      console.error('Invoice update error:', response.status, errorText);
      throw new Error(`Failed to update invoice: ${errorText || response.statusText}`);
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

    // First get the signed URL
    const urlResponse = await fetch(`${API_BASE_URL}/invoices/${id}/url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!urlResponse.ok) {
      const errorText = await urlResponse.text();
      console.error('Invoice URL error:', urlResponse.status, errorText);
      throw new Error(`Failed to get invoice URL: ${errorText || urlResponse.statusText}`);
    }

    const { url } = await urlResponse.json();
    
    // Open the signed URL in a new window
    window.open(url, '_blank');
  },

  async getRecipients(id: string): Promise<NotifyItem[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/invoices/${id}/recipients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Invoice recipients error:', response.status, errorText);
      throw new Error(`Failed to fetch recipients: ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async notify(id: string, payload: { recipients: NotifyItem[] }): Promise<void> {
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
      const errorText = await response.text();
      console.error('Invoice notify error:', response.status, errorText);
      throw new Error(`Failed to notify invoice: ${errorText || response.statusText}`);
    }
  },
};