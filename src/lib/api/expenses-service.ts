import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Expense {
  id: string;
  expenseType: ExpenseType;
  businessExpenseType?: BusinessExpenseType;
  idCategory?: string;
  category?: string;
  payee: string;
  description: string;
  date: string;
  amountExclGst: number;
  amountInclGst: number;
  amountGst: number;
  paymentMethod: string;
  idContact?: string;
  contact?: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  idShift?: string;
  shift?: {
    id: string;
    summary: string;
    startDate: string;
  };
  attachments?: Attachment[];
  idInvoice?: string;
  kms?: number;
  kmRateAmountExclGst?: number;
  isGstFree?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
  uploadedAt: string;
}

export enum ExpenseType {
  Business = 'Business',
  Reclaimable = 'Reclaimable',
  Kilometre = 'Kilometre',
  // Not persistent - used for filtering only
  All = 'All types',
}

export enum BusinessExpenseType {
  Capital = 'Capital',
  General = 'General',
}

export enum ExpenseCategories {
  AccountingLegalFees = '1',
  AdvertisingAndMarketingCosts = '2',
  BankCharges = '3',
  BusinessMotorVehicleExpenses = '4',
  ComputerSubscriptions = '5',
  EducationAndTraining = '6',
  EquipmentRentals = '7',
  Gifts = '8',
  HomeOfficeExpenses = '9',
  Insurance = '10',
  InterestPaid = '11',
  LaundryCharges = '12',
  MealsAndEntertainment = '13',
  OfficeSuppliesAndExpenses = '14',
  ProfessionalMemberships = '15',
  TravelExpenses = '16',
  Other = '17',
}

export enum ExpenseAction {
  Invoice = 'Invoice',
}

export interface ExpenseFilters {
  type?: ExpenseType;
  contact?: string;
  from?: string;
  to?: string;
  action?: ExpenseAction;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

export const expensesApi = {
  async getAll(filters: ExpenseFilters = {}): Promise<ExpenseListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    // Only include filters that have values
    // Don't send "All" type or "-1" contact to API
    if (filters.action) {
      params.append('action', filters.action);
    }
    if (filters.type && filters.type !== 'All types') {
      params.append('type', filters.type);
    }
    if (filters.contact && filters.contact !== '-1' && filters.contact !== '') {
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

    const response = await fetch(`${API_BASE_URL}/expenses?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expenses fetch error:', response.status, errorText);
      throw new Error(`Failed to fetch expenses: ${response.status} ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    // Handle response format from backend (@Paginated decorator returns { data, meta })
    // If backend returns array directly, transform it
    if (Array.isArray(data)) {
      return {
        data,
        meta: {
          total: data.length,
          pageNumber: filters.pageNumber || 1,
          pageSize: filters.pageSize || 100,
        },
      };
    }
    
    // Backend should return { data, meta } format
    return data;
  },

  async getById(id: string): Promise<Expense> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expense');
    }

    return response.json();
  },

  async create(expense: Partial<Expense>): Promise<Expense> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    // Prepare payload matching backend DTOs
    // Backend validates based on expenseType and expects specific fields
    const payload: any = {
      expenseType: expense.expenseType,
      date: expense.date,
      description: expense.description,
      idAttachments: expense.attachments?.map(a => a.id) || [],
    };

    // Add type-specific fields
    if (expense.expenseType === ExpenseType.Business) {
      payload.payee = expense.payee;
      payload.amountInclGst = expense.amountInclGst;
      payload.amountGst = expense.amountGst;
      payload.idCategory = expense.idCategory;
      payload.businessExpenseType = expense.businessExpenseType;
    } else if (expense.expenseType === ExpenseType.Reclaimable) {
      payload.payee = expense.payee;
      payload.amountInclGst = expense.amountInclGst;
      payload.amountGst = expense.amountGst;
      payload.idContact = expense.idContact;
      if (expense.idShift) {
        payload.idShift = expense.idShift;
      }
    } else if (expense.expenseType === ExpenseType.Kilometre) {
      payload.idContact = expense.idContact;
      payload.kmRateAmountExclGst = expense.kmRateAmountExclGst;
      payload.kms = expense.kms;
      payload.isGstFree = expense.isGstFree ?? false;
      if (expense.idShift) {
        payload.idShift = expense.idShift;
      }
    }

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expense create error:', response.status, errorText);
      throw new Error(`Failed to create expense: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async update(id: string, expense: Partial<Expense>): Promise<Expense> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    // Prepare payload matching backend DTOs
    const payload: any = {
      expenseType: expense.expenseType,
      date: expense.date,
      description: expense.description,
      idAttachments: expense.attachments?.map(a => a.id) || [],
    };

    // Add type-specific fields
    if (expense.expenseType === ExpenseType.Business) {
      payload.payee = expense.payee;
      payload.amountInclGst = expense.amountInclGst;
      payload.amountGst = expense.amountGst;
      payload.idCategory = expense.idCategory;
      payload.businessExpenseType = expense.businessExpenseType;
    } else if (expense.expenseType === ExpenseType.Reclaimable) {
      payload.payee = expense.payee;
      payload.amountInclGst = expense.amountInclGst;
      payload.amountGst = expense.amountGst;
      payload.idContact = expense.idContact;
      if (expense.idShift) {
        payload.idShift = expense.idShift;
      }
    } else if (expense.expenseType === ExpenseType.Kilometre) {
      payload.idContact = expense.idContact;
      payload.kmRateAmountExclGst = expense.kmRateAmountExclGst;
      payload.kms = expense.kms;
      payload.isGstFree = expense.isGstFree ?? false;
      if (expense.idShift) {
        payload.idShift = expense.idShift;
      }
    }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expense update error:', response.status, errorText);
      throw new Error(`Failed to update expense: ${response.status} ${errorText || response.statusText}`);
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
  },

  async uploadAttachment(expenseId: string, file: File): Promise<Attachment> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }

    return response.json();
  },

  async deleteAttachment(expenseId: string, attachmentId: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete attachment');
    }
  },
};

export function getExpenseCategoryText(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    [ExpenseCategories.AccountingLegalFees]: 'Accounting & Legal Fees',
    [ExpenseCategories.AdvertisingAndMarketingCosts]: 'Advertising & Marketing Costs',
    [ExpenseCategories.BankCharges]: 'Bank Charges',
    [ExpenseCategories.BusinessMotorVehicleExpenses]: 'Business Motor Vehicle Expenses',
    [ExpenseCategories.ComputerSubscriptions]: 'Computer Subscriptions',
    [ExpenseCategories.EducationAndTraining]: 'Education & Training',
    [ExpenseCategories.EquipmentRentals]: 'Equipment Rentals',
    [ExpenseCategories.Gifts]: 'Gifts',
    [ExpenseCategories.HomeOfficeExpenses]: 'Home Office Expenses',
    [ExpenseCategories.Insurance]: 'Insurance',
    [ExpenseCategories.InterestPaid]: 'Interest Paid',
    [ExpenseCategories.LaundryCharges]: 'Laundry Charges',
    [ExpenseCategories.MealsAndEntertainment]: 'Meals & Entertainment',
    [ExpenseCategories.OfficeSuppliesAndExpenses]: 'Office Supplies & Expenses',
    [ExpenseCategories.ProfessionalMemberships]: 'Professional Memberships',
    [ExpenseCategories.TravelExpenses]: 'Travel Expenses',
    [ExpenseCategories.Other]: 'Other',
  };
  return categoryMap[categoryId] || 'Unknown Category';
}
