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

export const reportsApi = {
  async getShiftsReport(payload: ReportWithDatesAssigneeAndContactDto): Promise<ShiftReportData> {
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
