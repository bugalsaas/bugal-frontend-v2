'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { agreementsApi, Agreement, AgreementFilters, AgreementListResponse, AgreementStatus } from '@/lib/api/agreements-service';

export interface UseAgreementsOptions {
  defaultFilters?: AgreementFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useAgreements(options: UseAgreementsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Agreement[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filters, setFilters] = useState<AgreementFilters>({
    search: options.defaultFilters?.search || '',
    idContact: options.defaultFilters?.idContact,
    status: options.defaultFilters?.status || AgreementStatus.All,
    startDate: options.defaultFilters?.startDate,
    endDate: options.defaultFilters?.endDate,
  });

  const { isDevelopmentMode, isAuthenticated } = useAuth();

  const loadAgreements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filtersToApply: AgreementFilters = {
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffSearch = filters.search && filters.search.length > 0;
      const diffContact = filters.idContact !== undefined && filters.idContact !== '-1';
      const diffStatus = filters.status !== AgreementStatus.All;
      const diffDateRange = filters.startDate !== undefined && filters.endDate !== undefined;
      
      const counter = [diffSearch, diffContact, diffStatus, diffDateRange].filter(Boolean).length;
      setFilterCounter(counter);

      let response: AgreementListResponse;

      // Always use mock data for now to ensure we can test the UI
      console.log('Using mock agreements data for testing');
      response = await agreementsApi.getAll(filtersToApply);

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Agreements fetch error:', error);
      
      // Fallback to mock data on API error
      console.log('API error, falling back to mock data');
      try {
        const fallbackResponse = await agreementsApi.getAll(filters);
        setData(fallbackResponse.data);
        setTotal(fallbackResponse.meta.total);
      } catch (fallbackError) {
        setData([]);
        setTotal(0);
      }
      
      setError(error instanceof Error ? error.message : 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDevelopmentMode, filters, pagination]);

  useEffect(() => {
    loadAgreements();
  }, [loadAgreements]);

  const updateFilter = useCallback((newFilter: Partial<AgreementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadAgreements();
  }, [loadAgreements]);

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

export function useAgreementActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);

  const { isDevelopmentMode } = useAuth();

  const createAgreement = async (agreement: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'user'>): Promise<Agreement> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newAgreement: Agreement = {
          ...agreement,
          id: Date.now().toString(),
          code: `AGR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          user: {
            id: 'user1',
            fullName: 'Current User',
            email: 'user@example.com',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newAgreement;
      } else {
        return await agreementsApi.create(agreement);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateAgreement = async (id: string, agreement: Partial<Agreement>): Promise<Agreement> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedAgreement: Agreement = {
          ...agreement as Agreement,
          id,
          updatedAt: new Date().toISOString(),
        };
        return updatedAgreement;
      } else {
        return await agreementsApi.update(id, agreement);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAgreement = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete agreement:', id);
      } else {
        await agreementsApi.delete(id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const completeAgreement = async (id: string): Promise<Agreement> => {
    setIsCompleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock completion
        const completedAgreement: Agreement = {
          id,
          user: { id: 'user1', fullName: 'Current User', email: 'user@example.com' },
          idUser: 'user1',
          userResponsibilities: [],
          contact: { id: 'contact1', fullName: 'Test Contact', email: 'contact@example.com' },
          idContact: 'contact1',
          contactResponsibilities: [],
          code: 'AGR-2024-001',
          agreementStatus: AgreementStatus.Completed,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          reviewDate: new Date().toISOString(),
          amendmentDays: 7,
          sendInvoicesAfter: 14,
          supportItems: [],
          canChargeCancellation: true,
          attachments: [],
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return completedAgreement;
      } else {
        return await agreementsApi.complete(id);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const draftAgreement = async (id: string): Promise<Agreement> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock draft reversion
        const draftAgreement: Agreement = {
          id,
          user: { id: 'user1', fullName: 'Current User', email: 'user@example.com' },
          idUser: 'user1',
          userResponsibilities: [],
          contact: { id: 'contact1', fullName: 'Test Contact', email: 'contact@example.com' },
          idContact: 'contact1',
          contactResponsibilities: [],
          code: 'AGR-2024-001',
          agreementStatus: AgreementStatus.Draft,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          reviewDate: new Date().toISOString(),
          amendmentDays: 7,
          sendInvoicesAfter: 14,
          supportItems: [],
          canChargeCancellation: true,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return draftAgreement;
      } else {
        return await agreementsApi.draft(id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const notifyAgreement = async (id: string, recipients: string[]): Promise<void> => {
    setIsNotifying(true);
    try {
      if (isDevelopmentMode) {
        // Mock notification
        console.log('Mock notify agreement:', id, 'to recipients:', recipients);
      } else {
        await agreementsApi.notify(id, recipients);
      }
    } finally {
      setIsNotifying(false);
    }
  };

  const selectAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
  };

  const clearSelection = () => {
    setSelectedAgreement(null);
  };

  return {
    isDeleting,
    isSaving,
    isCompleting,
    isNotifying,
    selectedAgreement,
    createAgreement,
    updateAgreement,
    deleteAgreement,
    completeAgreement,
    draftAgreement,
    notifyAgreement,
    selectAgreement,
    clearSelection,
  };
}
