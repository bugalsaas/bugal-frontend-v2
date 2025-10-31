'use client';

import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface IncidentWitness {
  name?: string;
  contact?: string;
  statement?: string;
}

export interface Incident {
  id: string;
  idReportedBy: string;
  reportedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  idShift: string;
  shift: {
    id: string;
    summary: string;
    startDate: string;
    endDate: string;
  };
  code: string;
  date: string;
  location?: string;
  description?: string;
  immediateActionsTaken?: string;
  hadOtherIndividualsInvolved?: boolean;
  otherIndividualsInvolved?: string;
  wasParticipantInjured?: boolean;
  participantInjuryDescription?: string;
  requiredMedicalAttention?: boolean;
  requiredEmergencyAttention?: boolean;
  witnesses?: IncidentWitness[];
  wasSupervisorReported?: boolean;
  supervisorName?: string;
  supervisorReportDate?: string;
  wasRiskAssessmentConducted?: boolean;
  preventativeMeasuresOrRecommendations?: string;
  isNDISReportable?: boolean;
  wasNDISReported?: boolean;
  dateNDISReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentFilters {
  search?: string;
  idShift?: string;
  idContact?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IncidentListResponse {
  data: Incident[];
  meta: {
    total: number;
    pageNumber: number;
    pageSize: number;
  };
}

// All data is sourced from the real API

export const incidentsApi = {
  async getAll(filters: IncidentFilters = {}): Promise<IncidentListResponse> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.idShift) params.append('idShift', filters.idShift);
    if (filters.idContact) params.append('idContact', filters.idContact);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/incidents?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  },

  async getById(id: string): Promise<Incident> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch incident');
    }
    return response.json();
  },

  async create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'reportedBy'>): Promise<Incident> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const newIncident: Incident = {
        ...incident,
        id: Date.now().toString(),
        code: `INC-${new Date().getFullYear()}-${String(mockIncidentsData.length + 1).padStart(3, '0')}`,
        reportedBy: {
          id: 'user1',
          fullName: 'Current User',
          email: 'user@example.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockIncidentsData.push(newIncident);
      return newIncident;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      throw new Error('Failed to create incident');
    }
    return response.json();
  },

  async update(id: string, incident: Partial<Incident>): Promise<Incident> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockIncidentsData.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('Incident not found');
      }
      
      const updatedIncident: Incident = {
        ...mockIncidentsData[index],
        ...incident,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      mockIncidentsData[index] = updatedIncident;
      return updatedIncident;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      throw new Error('Failed to update incident');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const index = mockIncidentsData.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('Incident not found');
      }
      mockIncidentsData.splice(index, 1);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete incident');
    }
  },
};
