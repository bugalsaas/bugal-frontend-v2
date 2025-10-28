'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { incidentsApi, Incident, IncidentFilters, IncidentListResponse } from '@/lib/api/incidents-service';

export interface UseIncidentsOptions {
  defaultFilters?: IncidentFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useIncidents(options: UseIncidentsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filters, setFilters] = useState<IncidentFilters>({
    search: options.defaultFilters?.search || '',
    idShift: options.defaultFilters?.idShift,
    idContact: options.defaultFilters?.idContact,
    startDate: options.defaultFilters?.startDate,
    endDate: options.defaultFilters?.endDate,
  });

  const { isAuthenticated } = useAuth();

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filtersToApply: IncidentFilters = {
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffSearch = filters.search && filters.search.length > 0;
      const diffShift = filters.idShift !== undefined;
      const diffContact = filters.idContact !== undefined;
      const diffDateRange = filters.startDate !== undefined && filters.endDate !== undefined;
      
      const counter = [diffSearch, diffShift, diffContact, diffDateRange].filter(Boolean).length;
      setFilterCounter(counter);

      const response = await incidentsApi.getAll(filtersToApply);

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Incidents fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load incidents');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters, pagination]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const updateFilter = useCallback((newFilter: Partial<IncidentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadIncidents();
  }, [loadIncidents]);

  return {
    loading,
    error,
    data,
    total,
    pagination,
    filterCounter,
    filters,
    setFilters: updateFilter,
    setPagination: updatePagination,
    reloadList,
  };
}

export function useIncidentActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { isDevelopmentMode } = useAuth();

  const createIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'reportedBy'>): Promise<Incident> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newIncident: Incident = {
          ...incident,
          id: Date.now().toString(),
          code: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          reportedBy: {
            id: 'user1',
            fullName: 'Current User',
            email: 'user@example.com',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newIncident;
      } else {
        return await incidentsApi.create(incident);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateIncident = async (id: string, incident: Partial<Incident>): Promise<Incident> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedIncident: Incident = {
          ...incident as Incident,
          id,
          updatedAt: new Date().toISOString(),
        };
        return updatedIncident;
      } else {
        return await incidentsApi.update(id, incident);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteIncident = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete incident:', id);
      } else {
        await incidentsApi.delete(id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const selectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const clearSelection = () => {
    setSelectedIncident(null);
  };

  return {
    isDeleting,
    isSaving,
    selectedIncident,
    createIncident,
    updateIncident,
    deleteIncident,
    selectIncident,
    clearSelection,
  };
}
