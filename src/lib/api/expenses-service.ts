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

export interface ExpenseFilters {
  type?: ExpenseType;
  contact?: string;
  from?: string;
  to?: string;
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
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock expenses data for development');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      let filteredExpenses = mockExpensesData;
      
      // Apply filters to mock data
      if (filters.type) {
        filteredExpenses = filteredExpenses.filter(exp => exp.expenseType === filters.type);
      }
      if (filters.contact) {
        filteredExpenses = filteredExpenses.filter(exp => exp.idContact === filters.contact);
      }
      if (filters.from) {
        filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) >= new Date(filters.from!));
      }
      if (filters.to) {
        filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) <= new Date(filters.to!));
      }
      
      return {
        data: filteredExpenses,
        meta: {
          total: filteredExpenses.length,
          pageNumber: filters.pageNumber || 1,
          pageSize: filters.pageSize || 100,
        },
      };
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    
    if (filters.type) {
      params.append('type', filters.type);
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

    const response = await fetch(`${API_BASE_URL}/expenses?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    return response.json();
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

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      throw new Error('Failed to create expense');
    }

    return response.json();
  },

  async update(id: string, expense: Partial<Expense>): Promise<Expense> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      throw new Error('Failed to update expense');
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

export const mockExpensesData: Expense[] = [
  {
    id: '1',
    expenseType: ExpenseType.Business,
    businessExpenseType: BusinessExpenseType.General,
    idCategory: ExpenseCategories.OfficeSuppliesAndExpenses,
    category: 'Office Supplies and Expenses',
    payee: 'Office Depot',
    description: 'Stationery and office supplies',
    date: '2024-10-20T00:00:00Z',
    amountExclGst: 45.45,
    amountInclGst: 50.00,
    amountGst: 4.55,
    paymentMethod: 'Credit Card',
    attachments: [
      {
        id: 'att1',
        fileName: 'receipt_office_depot.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        uploadedAt: '2024-10-20T10:30:00Z',
      },
    ],
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: '2',
    expenseType: ExpenseType.Reclaimable,
    payee: 'John Smith',
    description: 'Client transport costs',
    date: '2024-10-19T00:00:00Z',
    amountExclGst: 27.27,
    amountInclGst: 30.00,
    amountGst: 2.73,
    paymentMethod: 'Cash',
    idContact: '1',
    contact: {
      id: '1',
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+61 412 345 678',
    },
    createdAt: '2024-10-19T09:00:00Z',
    updatedAt: '2024-10-19T09:00:00Z',
  },
  {
    id: '3',
    expenseType: ExpenseType.Kilometre,
    payee: 'Sarah Johnson',
    description: 'Travel to client location',
    date: '2024-10-18T00:00:00Z',
    amountExclGst: 18.18,
    amountInclGst: 20.00,
    amountGst: 1.82,
    paymentMethod: 'Reimbursement',
    idContact: '2',
    contact: {
      id: '2',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+61 423 456 789',
    },
    kms: 20,
    kmRateAmountExclGst: 0.91,
    isGstFree: false,
    createdAt: '2024-10-18T08:00:00Z',
    updatedAt: '2024-10-18T08:00:00Z',
  },
  {
    id: '4',
    expenseType: ExpenseType.Business,
    businessExpenseType: BusinessExpenseType.Capital,
    idCategory: ExpenseCategories.EquipmentRentals,
    category: 'Equipment Rentals',
    payee: 'Tech Rentals Pty Ltd',
    description: 'Laptop rental for project',
    date: '2024-10-17T00:00:00Z',
    amountExclGst: 181.82,
    amountInclGst: 200.00,
    amountGst: 18.18,
    paymentMethod: 'EFT',
    attachments: [
      {
        id: 'att2',
        fileName: 'rental_agreement.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadedAt: '2024-10-17T14:20:00Z',
      },
    ],
    createdAt: '2024-10-17T07:00:00Z',
    updatedAt: '2024-10-17T07:00:00Z',
  },
];

export const mockExpensesResponse: ExpenseListResponse = {
  data: mockExpensesData,
  meta: {
    total: mockExpensesData.length,
    pageNumber: 1,
    pageSize: 100,
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
