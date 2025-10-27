'use client';

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

// Mock data for development
const mockIncidentsData: Incident[] = [
  {
    id: 'incident1',
    idReportedBy: 'user1',
    reportedBy: {
      id: 'user1',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
    },
    idShift: 'shift1',
    shift: {
      id: 'shift1',
      summary: 'Morning Support Session',
      startDate: '2024-01-15T09:00:00Z',
      endDate: '2024-01-15T17:00:00Z',
    },
    code: 'INC-2024-001',
    date: '2024-01-15T14:30:00Z',
    location: 'Living room',
    description: 'Julie was observed losing balance and falling while walking in the living area. I was present and responded immediately.',
    immediateActionsTaken: 'I assisted Julie to a seated position and assessed for any immediate injuries. An ice pack was applied to the affected area, and comfort was provided.',
    hadOtherIndividualsInvolved: false,
    wasParticipantInjured: true,
    participantInjuryDescription: 'Minor swelling and redness observed on the left knee. No visible cuts or bleeding. Ice packs applied, and Julie monitored for signs of discomfort.',
    requiredMedicalAttention: false,
    requiredEmergencyAttention: false,
    witnesses: [
      {
        name: 'David Smith',
        contact: 'david.smith@example.com',
        statement: 'David, who was also present at the time, reported that Julie tripped over a rug and fell forward, landing heavily on her left knee.',
      },
    ],
    wasSupervisorReported: true,
    supervisorName: 'Jane Wilson',
    supervisorReportDate: '2024-01-15T15:00:00Z',
    wasRiskAssessmentConducted: true,
    preventativeMeasuresOrRecommendations: 'It was recommended to ensure all walkways are free of tripping hazards at all times.',
    isNDISReportable: false,
    wasNDISReported: false,
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T15:00:00Z',
  },
  {
    id: 'incident2',
    idReportedBy: 'user2',
    reportedBy: {
      id: 'user2',
      fullName: 'Mike Wilson',
      email: 'mike.wilson@example.com',
    },
    idShift: 'shift2',
    shift: {
      id: 'shift2',
      summary: 'Evening Support Session',
      startDate: '2024-01-16T18:00:00Z',
      endDate: '2024-01-16T22:00:00Z',
    },
    code: 'INC-2024-002',
    date: '2024-01-16T20:15:00Z',
    location: 'Kitchen',
    description: 'Participant became agitated during meal preparation and threw a plate, causing minor damage to kitchen cabinet.',
    immediateActionsTaken: 'Immediately removed participant from kitchen area, ensured safety of all present, and provided calming support.',
    hadOtherIndividualsInvolved: true,
    otherIndividualsInvolved: 'Kitchen staff member present during incident',
    wasParticipantInjured: false,
    requiredMedicalAttention: false,
    requiredEmergencyAttention: false,
    witnesses: [],
    wasSupervisorReported: true,
    supervisorName: 'Jane Wilson',
    supervisorReportDate: '2024-01-16T20:30:00Z',
    wasRiskAssessmentConducted: true,
    preventativeMeasuresOrRecommendations: 'Review meal preparation routine and consider alternative approaches to reduce participant stress.',
    isNDISReportable: true,
    wasNDISReported: true,
    dateNDISReport: '2024-01-17T09:00:00Z',
    createdAt: '2024-01-16T20:15:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
];

const mockIncidentsResponse: IncidentListResponse = {
  data: mockIncidentsData,
  meta: {
    total: mockIncidentsData.length,
    pageNumber: 1,
    pageSize: 100,
  },
};

export const incidentsApi = {
  async getAll(filters: IncidentFilters = {}): Promise<IncidentListResponse> {
    // Check if we're in development mode or if API is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      console.log('Using mock incidents data for development');
      
      // Apply client-side filtering for mock data
      let filteredData = [...mockIncidentsData];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(incident => 
          incident.description?.toLowerCase().includes(searchLower) ||
          incident.location?.toLowerCase().includes(searchLower) ||
          incident.code.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.idShift) {
        filteredData = filteredData.filter(incident => incident.idShift === filters.idShift);
      }
      
      if (filters.startDate && filters.endDate) {
        filteredData = filteredData.filter(incident => {
          const incidentDate = new Date(incident.date);
          const startDate = new Date(filters.startDate!);
          const endDate = new Date(filters.endDate!);
          return incidentDate >= startDate && incidentDate <= endDate;
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
    if (filters.idShift) params.append('idShift', filters.idShift);
    if (filters.idContact) params.append('idContact', filters.idContact);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  },

  async getById(id: string): Promise<Incident> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isDevelopmentMode) {
      const incident = mockIncidentsData.find(i => i.id === id);
      if (!incident) {
        throw new Error('Incident not found');
      }
      return incident;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents/${id}`);
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
