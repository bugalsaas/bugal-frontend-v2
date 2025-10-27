'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { shiftsApi, Shift, ShiftFilters, ShiftListResponse, ShiftStatus } from '@/lib/api/shifts-service';

export interface UseShiftsOptions {
  defaultFilters?: ShiftFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useShifts(options: UseShiftsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Shift[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filter, setFilter] = useState<ShiftFilters>({
    status: options.defaultFilters?.status || ShiftStatus.All,
    assignee: options.defaultFilters?.assignee || '-1',
    contact: options.defaultFilters?.contact || '',
    before: options.defaultFilters?.before,
    after: options.defaultFilters?.after,
  });

  const { isAuthenticated } = useAuth();

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: ShiftFilters = {
        ...filter,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffStatus = filter.status && filter.status !== ShiftStatus.All;
      const diffAssignee = filter.assignee && filter.assignee !== '-1';
      const diffContact = filter.contact && filter.contact.length > 0;
      const diffBefore = filter.before && filter.before.length > 0;
      const diffAfter = filter.after && filter.after.length > 0;
      
      const counter = [diffStatus, diffAssignee, diffContact, diffBefore, diffAfter].filter(Boolean).length;
      setFilterCounter(counter);

      const response = await shiftsApi.getAll(filters);

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Shifts fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shifts');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const updateFilter = useCallback((newFilter: Partial<ShiftFilters>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadShifts();
  }, [loadShifts]);

  return {
    loading,
    error,
    data,
    total,
    pagination,
    filterCounter,
    filter,
    setFilter: updateFilter,
    setPagination: updatePagination,
    reloadList,
  };
}

export function useShiftActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAmending, setIsAmending] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const { isDevelopmentMode } = useAuth();

  const createShift = async (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newShift: Shift = {
          ...shift,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newShift;
      } else {
        return await shiftsApi.create(shift);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateShift = async (id: string, shift: Partial<Shift>): Promise<Shift> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedShift: Shift = {
          ...shift as Shift,
          id,
          updatedAt: new Date().toISOString(),
        };
        return updatedShift;
      } else {
        return await shiftsApi.update(id, shift);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const completeShift = async (id: string, data: { isGstFree: boolean }): Promise<Shift> => {
    setIsCompleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock completion
        console.log('Mock complete shift:', id, data);
        return mockShiftsResponse.data[0]; // Return first mock shift
      } else {
        return await shiftsApi.complete(id, data);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const cancelShift = async (id: string, data: { cancellationReason: string; cancellationAmountExclGst: number; isGstFree: boolean }): Promise<Shift> => {
    setIsCancelling(true);
    try {
      if (isDevelopmentMode) {
        // Mock cancellation
        console.log('Mock cancel shift:', id, data);
        return mockShiftsResponse.data[0]; // Return first mock shift
      } else {
        return await shiftsApi.cancel(id, data);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const deleteShift = async (id: string, type: 'single' | 'future' | 'all'): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete shift:', id, type);
      } else {
        await shiftsApi.delete(id, type);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const amendShift = async (id: string): Promise<Shift> => {
    setIsAmending(true);
    try {
      if (isDevelopmentMode) {
        // Mock amendment
        console.log('Mock amend shift:', id);
        return mockShiftsResponse.data[0]; // Return first mock shift
      } else {
        return await shiftsApi.amend(id);
      }
    } finally {
      setIsAmending(false);
    }
  };

  const notifyShift = async (id: string, data: { message: string; recipients: string[] }): Promise<void> => {
    setIsNotifying(true);
    try {
      if (isDevelopmentMode) {
        // Mock notification
        console.log('Mock notify shift:', id, data);
      } else {
        await shiftsApi.notify(id, data);
      }
    } finally {
      setIsNotifying(false);
    }
  };

  const selectShift = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const clearSelection = () => {
    setSelectedShift(null);
  };

  return {
    isDeleting,
    isSaving,
    isCompleting,
    isCancelling,
    isAmending,
    isNotifying,
    selectedShift,
    createShift,
    updateShift,
    completeShift,
    cancelShift,
    deleteShift,
    amendShift,
    notifyShift,
    selectShift,
    clearSelection,
  };
}
