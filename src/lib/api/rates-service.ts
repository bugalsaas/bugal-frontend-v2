'use client';

import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

// All data is sourced from the real API

export const ratesApi = {
  async getAll(filters: RateFilters = {}): Promise<RateListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (filters.search) params.append('text', filters.search);
    if (filters.rateType) params.append('rateType', filters.rateType);
    if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/rates?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }
    return response.json();
  },

  async getById(id: string): Promise<Rate> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/rates/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
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
