'use client';

export enum RateType {
  Hourly = 'Hourly',
  Fixed = 'Fixed',
}

export interface Rate {
  id: string;
  idUser: string;
  name: string;
  description: string;
  amountExclGst: number;
  amountGst: number;
  amountInclGst: number;
  rateType: RateType;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RateFilters {
  search?: string;
  rateType?: RateType;
  isArchived?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface RateListResponse {
  data: Rate[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

// Mock data for development
const mockRatesData: Rate[] = [
  {
    id: 'rate1',
    idUser: 'user1',
    name: 'Standard Hourly Rate',
    description: 'Standard hourly rate for regular shifts',
    amountExclGst: 35.00,
    amountGst: 3.50,
    amountInclGst: 38.50,
    rateType: RateType.Hourly,
    isArchived: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'rate2',
    idUser: 'user1',
    name: 'Weekend Rate',
    description: 'Higher rate for weekend shifts',
    amountExclGst: 45.00,
    amountGst: 4.50,
    amountInclGst: 49.50,
    rateType: RateType.Hourly,
    isArchived: false,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'rate3',
    idUser: 'user1',
    name: 'Fixed Project Rate',
    description: 'Fixed rate for specific projects',
    amountExclGst: 500.00,
    amountGst: 50.00,
    amountInclGst: 550.00,
    rateType: RateType.Fixed,
    isArchived: false,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: 'rate4',
    idUser: 'user1',
    name: 'Overtime Rate',
    description: 'Rate for overtime hours',
    amountExclGst: 52.50,
    amountGst: 5.25,
    amountInclGst: 57.75,
    rateType: RateType.Hourly,
    isArchived: false,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'rate5',
    idUser: 'user1',
    name: 'Old Rate',
    description: 'Deprecated rate',
    amountExclGst: 25.00,
    amountGst: 2.50,
    amountInclGst: 27.50,
    rateType: RateType.Hourly,
    isArchived: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
];

const mockRatesResponse: RateListResponse = {
  data: mockRatesData,
  meta: {
    total: mockRatesData.length,
    pageNumber: 1,
    pageSize: 100,
  },
};

export const ratesApi = {
  async getAll(filters: RateFilters = {}): Promise<RateListResponse> {
    // Check if we're in development mode or if API is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      console.log('Using mock rates data for development');
      
      // Apply client-side filtering for mock data
      let filteredData = [...mockRatesData];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(rate => 
          rate.name.toLowerCase().includes(searchLower) ||
          rate.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.rateType) {
        filteredData = filteredData.filter(rate => rate.rateType === filters.rateType);
      }
      
      if (filters.isArchived !== undefined) {
        filteredData = filteredData.filter(rate => rate.isArchived === filters.isArchived);
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
    if (filters.search) params.append('text', filters.search);
    if (filters.rateType) params.append('rateType', filters.rateType);
    if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }
    return response.json();
  },

  async getById(id: string): Promise<Rate> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const rate = mockRatesData.find(r => r.id === id);
      if (!rate) {
        throw new Error('Rate not found');
      }
      return rate;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rate');
    }
    return response.json();
  },

  async create(rate: Omit<Rate, 'id' | 'createdAt' | 'updatedAt' | 'amountGst' | 'amountInclGst'>): Promise<Rate> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const newRate: Rate = {
        ...rate,
        id: Date.now().toString(),
        amountGst: rate.amountExclGst * 0.1, // 10% GST
        amountInclGst: rate.amountExclGst * 1.1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRatesData.push(newRate);
      return newRate;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rate),
    });
    if (!response.ok) {
      throw new Error('Failed to create rate');
    }
    return response.json();
  },

  async update(id: string, rate: Partial<Rate>): Promise<Rate> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockRatesData.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rate not found');
      }
      
      const updatedRate: Rate = {
        ...mockRatesData[index],
        ...rate,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      // Recalculate GST if amountExclGst changed
      if (rate.amountExclGst !== undefined) {
        updatedRate.amountGst = rate.amountExclGst * 0.1;
        updatedRate.amountInclGst = rate.amountExclGst * 1.1;
      }
      
      mockRatesData[index] = updatedRate;
      return updatedRate;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rate),
    });
    if (!response.ok) {
      throw new Error('Failed to update rate');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockRatesData.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rate not found');
      }
      mockRatesData.splice(index, 1);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete rate');
    }
  },

  async archive(id: string): Promise<Rate> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockRatesData.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rate not found');
      }
      
      const archivedRate: Rate = {
        ...mockRatesData[index],
        isArchived: true,
        updatedAt: new Date().toISOString(),
      };
      
      mockRatesData[index] = archivedRate;
      return archivedRate;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isArchived: true }),
    });
    if (!response.ok) {
      throw new Error('Failed to archive rate');
    }
    return response.json();
  },
};
