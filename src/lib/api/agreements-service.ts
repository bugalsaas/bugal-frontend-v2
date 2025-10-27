'use client';

export enum AgreementStatus {
  Draft = 'Draft',
  Completed = 'Completed',
  All = 'All',
}

export enum DaysOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export interface Frequency {
  duration: number;
  dayOfWeek: DaysOfWeek;
}

export interface AgreementSupportItem {
  NDISName: string;
  NDISNumber: string;
  description: string;
  amountExclGst: number;
  frequency: Frequency[];
  location?: string;
}

export interface Agreement {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  idUser: string;
  userResponsibilities: string[];
  contact: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    state?: string;
    postcode?: string;
  };
  idContact: string;
  contactResponsibilities: string[];
  code: string;
  agreementStatus: AgreementStatus;
  startDate: string;
  endDate: string;
  reviewDate: string;
  amendmentDays: number;
  sendInvoicesAfter: number;
  supportItems: AgreementSupportItem[];
  canChargeCancellation: boolean;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementFilters {
  search?: string;
  idContact?: string;
  status?: AgreementStatus;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AgreementListResponse {
  data: Agreement[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

// Mock data for development
const mockAgreementsData: Agreement[] = [
  {
    id: 'agreement1',
    user: {
      id: 'user1',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
    },
    idUser: 'user1',
    userResponsibilities: [
      'Provide support services as outlined in the agreement',
      'Maintain accurate records of services provided',
      'Ensure participant safety and wellbeing',
      'Follow NDIS guidelines and regulations',
    ],
    contact: {
      id: 'contact1',
      fullName: 'Julie Smith',
      email: 'julie.smith@example.com',
      phone: '0412 345 678',
      addressLine1: '123 Main Street',
      addressLine2: 'Unit 5',
      state: 'NSW',
      postcode: '2000',
    },
    idContact: 'contact1',
    contactResponsibilities: [
      'Provide accurate information about support needs',
      'Notify provider of any changes in circumstances',
      'Participate in service planning and review meetings',
      'Provide feedback on service quality',
    ],
    code: 'AGR-2024-001',
    agreementStatus: AgreementStatus.Draft,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    reviewDate: '2024-06-01T00:00:00Z',
    amendmentDays: 7,
    sendInvoicesAfter: 14,
    supportItems: [
      {
        NDISName: 'Assistance with Daily Activities',
        NDISNumber: '01_001_0107_1_1',
        description: 'Support with personal care and daily living activities',
        amountExclGst: 45.00,
        frequency: [
          { duration: 2, dayOfWeek: DaysOfWeek.Monday },
          { duration: 2, dayOfWeek: DaysOfWeek.Wednesday },
          { duration: 2, dayOfWeek: DaysOfWeek.Friday },
        ],
        location: '123 Main Street, Unit 5, NSW 2000',
      },
      {
        NDISName: 'Community Participation',
        NDISNumber: '09_001_0107_1_1',
        description: 'Support to participate in community activities',
        amountExclGst: 35.00,
        frequency: [
          { duration: 4, dayOfWeek: DaysOfWeek.Saturday },
        ],
        location: 'Community venues',
      },
    ],
    canChargeCancellation: true,
    attachments: [],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'agreement2',
    user: {
      id: 'user1',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
    },
    idUser: 'user1',
    userResponsibilities: [
      'Provide support services as outlined in the agreement',
      'Maintain accurate records of services provided',
      'Ensure participant safety and wellbeing',
      'Follow NDIS guidelines and regulations',
    ],
    contact: {
      id: 'contact2',
      fullName: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '0423 456 789',
      addressLine1: '456 Oak Avenue',
      state: 'VIC',
      postcode: '3000',
    },
    idContact: 'contact2',
    contactResponsibilities: [
      'Provide accurate information about support needs',
      'Notify provider of any changes in circumstances',
      'Participate in service planning and review meetings',
      'Provide feedback on service quality',
    ],
    code: 'AGR-2024-002',
    agreementStatus: AgreementStatus.Completed,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-12-15T23:59:59Z',
    reviewDate: '2024-07-15T00:00:00Z',
    amendmentDays: 14,
    sendInvoicesAfter: 7,
    supportItems: [
      {
        NDISName: 'Assistance with Daily Activities',
        NDISNumber: '01_001_0107_1_1',
        description: 'Support with personal care and daily living activities',
        amountExclGst: 50.00,
        frequency: [
          { duration: 3, dayOfWeek: DaysOfWeek.Tuesday },
          { duration: 3, dayOfWeek: DaysOfWeek.Thursday },
        ],
        location: '456 Oak Avenue, VIC 3000',
      },
    ],
    canChargeCancellation: false,
    attachments: [],
    completedAt: '2024-01-20T14:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
];

const mockAgreementsResponse: AgreementListResponse = {
  data: mockAgreementsData,
  meta: {
    total: mockAgreementsData.length,
    pageNumber: 1,
    pageSize: 100,
  },
};

export const agreementsApi = {
  async getAll(filters: AgreementFilters = {}): Promise<AgreementListResponse> {
    // Check if we're in development mode or if API is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      console.log('Using mock agreements data for development');
      
      // Apply client-side filtering for mock data
      let filteredData = [...mockAgreementsData];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(agreement => 
          agreement.code.toLowerCase().includes(searchLower) ||
          agreement.contact.fullName.toLowerCase().includes(searchLower) ||
          agreement.user.fullName.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.idContact && filters.idContact !== '-1') {
        filteredData = filteredData.filter(agreement => agreement.idContact === filters.idContact);
      }
      
      if (filters.status && filters.status !== AgreementStatus.All) {
        filteredData = filteredData.filter(agreement => agreement.agreementStatus === filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        filteredData = filteredData.filter(agreement => {
          const agreementStartDate = new Date(agreement.startDate);
          const filterStartDate = new Date(filters.startDate!);
          const filterEndDate = new Date(filters.endDate!);
          return agreementStartDate >= filterStartDate && agreementStartDate <= filterEndDate;
        });
      }
      
      return {
        data: filteredData,
        meta: {
          total: filteredData.length,
          pageNumber: filters.pageNumber || 1,
          pageSize: filters.pageSize || 100,
        },
      };
    }

    // Real API call would go here
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.idContact) params.append('idContact', filters.idContact);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agreements');
    }
    return response.json();
  },

  async getById(id: string): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const agreement = mockAgreementsData.find(a => a.id === id);
      if (!agreement) {
        throw new Error('Agreement not found');
      }
      return agreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agreement');
    }
    return response.json();
  },

  async create(agreement: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'user'>): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const newAgreement: Agreement = {
        ...agreement,
        id: Date.now().toString(),
        code: `AGR-${new Date().getFullYear()}-${String(mockAgreementsData.length + 1).padStart(3, '0')}`,
        user: {
          id: 'user1',
          fullName: 'Current User',
          email: 'user@example.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockAgreementsData.push(newAgreement);
      return newAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      throw new Error('Failed to create agreement');
    }
    return response.json();
  },

  async update(id: string, agreement: Partial<Agreement>): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const updatedAgreement: Agreement = {
        ...mockAgreementsData[index],
        ...agreement,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = updatedAgreement;
      return updatedAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      throw new Error('Failed to update agreement');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      mockAgreementsData.splice(index, 1);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete agreement');
    }
  },

  async complete(id: string): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const completedAgreement: Agreement = {
        ...mockAgreementsData[index],
        agreementStatus: AgreementStatus.Completed,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = completedAgreement;
      return completedAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to complete agreement');
    }
    return response.json();
  },

  async draft(id: string): Promise<Agreement> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockAgreementsData.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Agreement not found');
      }
      
      const draftAgreement: Agreement = {
        ...mockAgreementsData[index],
        agreementStatus: AgreementStatus.Draft,
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      
      mockAgreementsData[index] = draftAgreement;
      return draftAgreement;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/draft`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to revert agreement to draft');
    }
    return response.json();
  },

  async notify(id: string, recipients: string[]): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      console.log('Mock notify agreement:', id, 'to recipients:', recipients);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agreements/${id}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients }),
    });
    if (!response.ok) {
      throw new Error('Failed to notify agreement');
    }
  },
};
