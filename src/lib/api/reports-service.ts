import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Report request interfaces
export interface ReportWithDatesAssigneeAndContactDto {
  startDate: string;
  endDate: string;
  idAssignee: string;
  idContact: string;
}

export interface ReportIncidentCreateDto {
  startDate: string;
  endDate: string;
  idContact: string;
}

export interface ReportInvoiceCreateDto {
  startDate: string;
  endDate: string;
  idContact: string;
}

export interface ReportTaxCreateDto {
  startDate: string;
  endDate: string;
}

// Report data interfaces
export interface ShiftReportItem {
  id: string;
  isExpense: boolean;
  date: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  shiftStatus?: string;
  summary?: string;
  category?: string;
  location?: string;
  notes?: string;
  tz?: string;
  amountInclGst?: number;
  amountGst?: number;
  totalInclGst?: number;
  contact: {
    id: string;
    fullName: string;
  };
  assignee?: {
    id: string;
    fullName: string;
  };
  expenses?: Array<{
    id: string;
    amountInclGst: number;
  }>;
  attachments?: Array<{
    id: string;
    url: string;
  }>;
}

export interface ShiftReportData {
  summary: {
    shiftsCount: number;
    shiftsDuration: number;
    shiftsTotalExclGst: number;
    shiftsTotalGst: number;
    shiftsTotalInclGst: number;
    expensesCount: number;
    expensesTotalExclGst: number;
    expensesTotalGst: number;
    expensesTotalInclGst: number;
    total: number;
  };
  data: Array<ShiftReportItem>;
}

export interface IncidentReportItem {
  id: string;
  code: string;
  date: string;
  location: string;
  description: string;
  immediateActionsTaken: string;
  hadOtherIndividualsInvolved: boolean;
  otherIndividualsInvolved?: string;
  wasParticipantInjured: boolean;
  participantInjuryDescription?: string;
  requiredMedicalAttention: boolean;
  requiredEmergencyAttention: boolean;
  witnesses?: Array<{
    name: string;
    contact: string;
    statement?: string;
  }>;
  wasSupervisorReported: boolean;
  supervisorName?: string;
  supervisorReportDate?: string;
  wasRiskAssessmentConducted: boolean;
  preventativeMeasuresOrRecommendations?: string;
  isNDISReportable: boolean;
  wasNDISReported: boolean;
  dateNDISReport?: string;
  reportedBy: {
    id: string;
    fullName: string;
  };
  contact: {
    id: string;
    fullName: string;
  };
}

export interface IncidentReportData {
  summary: {
    count: number;
  };
  data: Array<IncidentReportItem>;
}

export interface KmsReportData {
  summary: {
    count: number;
    kms: number;
    totalExclGst: number;
    totalGst: number;
    totalInclGst: number;
  };
  data: Array<{
    id: string;
    date: string;
    payee: string;
    description: string;
    kms: number;
    kmRateAmountExclGst: number;
    amountExclGst: number;
    amountGst: number;
    amountInclGst: number;
    contact: {
      id: string;
      fullName: string;
    };
  }>;
}

export interface TaxReportReceiptItem {
  id: string;
  date: string;
  amountExclGst: number;
  amountGst: number;
  amountInclGst: number;
  invoice: {
    id: string;
    code: string;
  };
}

export interface TaxReportExpenseItem {
  id: string;
  date: string;
  expenseType: 'Business' | 'Reclaimable' | 'Kilometre';
  category: string;
  payee: string;
  description: string;
  amountExclGst: number;
  amountGst: number;
  amountInclGst: number;
}

export interface TaxReportData {
  summary: {
    receiptsTotalExclGst: number;
    receiptsTotalGst: number;
    receiptsTotalInclGst: number;
    expensesTotalExclGst: number;
    expensesTotalGst: number;
    expensesTotalInclGst: number;
    netTotalExclGst: number;
    netTotalGst: number;
    netTotalInclGst: number;
  };
  receipts: Array<TaxReportReceiptItem>;
  expenses: Array<TaxReportExpenseItem>;
}

export interface InvoiceReportItem {
  id: string;
  code: string;
  date: string;
  dueDate: string;
  totalInclGst: number;
  totalGst: number;
  contact: {
    id: string;
    fullName: string;
  };
}

export interface InvoiceReportData {
  summary: {
    paid: number;
    unpaid: number;
    overdue: number;
    writtenOff: number;
  };
  paid: Array<InvoiceReportItem>;
  unpaid: Array<InvoiceReportItem>;
  overdue: Array<InvoiceReportItem>;
  writtenOff: Array<InvoiceReportItem>;
}

// Mock data for development
export const mockShiftReportData: ShiftReportData = {
  summary: {
    shiftsCount: 12,
    shiftsDuration: 4800, // 80 hours in minutes
    shiftsTotalExclGst: 2400,
    shiftsTotalGst: 240,
    shiftsTotalInclGst: 2640,
    expensesCount: 8,
    expensesTotalExclGst: 400,
    expensesTotalGst: 40,
    expensesTotalInclGst: 440,
    total: 3080,
  },
  data: [
    {
      id: 'shift1',
      isExpense: false,
      startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      duration: 480, // 8 hours
      shiftStatus: 'Completed',
      summary: 'Morning support session',
      category: 'Personal Care',
      location: 'Client Home',
      notes: 'Regular morning routine assistance',
      tz: 'Australia/Sydney',
      totalInclGst: 220,
      contact: {
        id: 'contact1',
        fullName: 'John Smith',
      },
      assignee: {
        id: 'user1',
        fullName: 'Sarah Johnson',
      },
      expenses: [
        { id: 'exp1', amountInclGst: 25 },
        { id: 'exp2', amountInclGst: 15 },
      ],
    },
    {
      id: 'exp1',
      isExpense: true,
      date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
      amountInclGst: 50,
      amountGst: 5,
      contact: {
        id: 'contact1',
        fullName: 'John Smith',
      },
    },
  ],
};

export const mockIncidentReportData: IncidentReportData = {
  summary: {
    count: 2,
  },
  data: [
    {
      id: 'incident1',
      code: 'INC-2024-001',
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      location: 'Client Home',
      description: 'Minor fall during transfer',
      immediateActionsTaken: 'Assisted client to safety, checked for injuries',
      hadOtherIndividualsInvolved: false,
      wasParticipantInjured: false,
      requiredMedicalAttention: false,
      requiredEmergencyAttention: false,
      wasSupervisorReported: true,
      supervisorName: 'Jane Manager',
      supervisorReportDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      wasRiskAssessmentConducted: true,
      preventativeMeasuresOrRecommendations: 'Review transfer techniques',
      isNDISReportable: false,
      wasNDISReported: false,
      reportedBy: {
        id: 'user1',
        fullName: 'Sarah Johnson',
      },
      contact: {
        id: 'contact1',
        fullName: 'John Smith',
      },
    },
  ],
};

export const mockKmsReportData: KmsReportData = {
  summary: {
    count: 5,
    kms: 250,
    totalExclGst: 175,
    totalGst: 0,
    totalInclGst: 175,
  },
  data: [
    {
      id: 'exp1',
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      payee: 'Self',
      description: 'Client visit - 50km round trip',
      kms: 50,
      kmRateAmountExclGst: 0.70,
      amountExclGst: 35,
      amountGst: 0,
      amountInclGst: 35,
      contact: {
        id: 'contact1',
        fullName: 'John Smith',
      },
    },
  ],
};

export const mockTaxReportData: TaxReportData = {
  summary: {
    receiptsTotalExclGst: 1200,
    receiptsTotalGst: 120,
    receiptsTotalInclGst: 1320,
    expensesTotalExclGst: 800,
    expensesTotalGst: 80,
    expensesTotalInclGst: 880,
    netTotalExclGst: 400,
    netTotalGst: 40,
    netTotalInclGst: 440,
  },
  receipts: [
    {
      id: 'receipt1',
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      amountExclGst: 600,
      amountGst: 60,
      amountInclGst: 660,
      invoice: {
        id: 'inv1',
        code: 'INV-2024-001',
      },
    },
  ],
  expenses: [
    {
      id: 'exp1',
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      expenseType: 'Business',
      category: 'Office Supplies & Expenses',
      payee: 'Officeworks',
      description: 'Printer supplies',
      amountExclGst: 100,
      amountGst: 10,
      amountInclGst: 110,
    },
  ],
};

export const mockInvoiceReportData: InvoiceReportData = {
  summary: {
    paid: 1200,
    unpaid: 800,
    overdue: 300,
    writtenOff: 100,
  },
  paid: [
    {
      id: 'inv1',
      code: 'INV-2024-001',
      date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      totalInclGst: 600,
      totalGst: 60,
      contact: {
        id: 'contact1',
        fullName: 'John Smith',
      },
    },
  ],
  unpaid: [
    {
      id: 'inv2',
      code: 'INV-2024-002',
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      totalInclGst: 400,
      totalGst: 40,
      contact: {
        id: 'contact2',
        fullName: 'Sarah Johnson',
      },
    },
  ],
  overdue: [
    {
      id: 'inv3',
      code: 'INV-2024-003',
      date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      totalInclGst: 300,
      totalGst: 30,
      contact: {
        id: 'contact3',
        fullName: 'Mike Wilson',
      },
    },
  ],
  writtenOff: [
    {
      id: 'inv4',
      code: 'INV-2024-004',
      date: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      totalInclGst: 100,
      totalGst: 10,
      contact: {
        id: 'contact4',
        fullName: 'Lisa Brown',
      },
    },
  ],
};

export const reportsApi = {
  async getShiftsReport(payload: ReportWithDatesAssigneeAndContactDto): Promise<ShiftReportData> {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock shifts report data for development');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return mockShiftReportData;
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/reports/shifts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate shifts report');
    }

    return response.json();
  },

  async getIncidentReport(payload: ReportIncidentCreateDto): Promise<IncidentReportData> {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock incident report data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockIncidentReportData;
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/reports/incidents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate incident report');
    }

    return response.json();
  },

  async getKmsReport(payload: ReportWithDatesAssigneeAndContactDto): Promise<KmsReportData> {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock kms report data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockKmsReportData;
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/reports/kms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate kms report');
    }

    return response.json();
  },

  async getTaxReport(payload: ReportTaxCreateDto): Promise<TaxReportData> {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock tax report data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockTaxReportData;
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/reports/tax`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate tax report');
    }

    return response.json();
  },

  async getInvoiceReport(payload: ReportInvoiceCreateDto): Promise<InvoiceReportData> {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.log('Using mock invoice report data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockInvoiceReportData;
    }

    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/reports/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate invoice report');
    }

    return response.json();
  },
};
