'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { shiftsApi, Shift, ShiftFilters, ShiftListResponse, ShiftStatus, DeleteShiftType, NotifyItem, ShiftAction } from '@/lib/api/shifts-service';

export interface UseShiftsOptions {
  defaultFilters?: ShiftFilters;
  pageNumber?: number;
  pageSize?: number;
  onLoad?: () => void;
}

export function useShifts(options: UseShiftsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Shift[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMoreBefore, setHasMoreBefore] = useState<string | undefined>();
  const [hasMoreAfter, setHasMoreAfter] = useState<string | undefined>();
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
  
  // Use ref to store onLoad callback to avoid recreating loadShifts
  const onLoadRef = useRef(options.onLoad);
  useEffect(() => {
    onLoadRef.current = options.onLoad;
  }, [options.onLoad]);
  
  // Use ref to track if a fetch is in progress to prevent duplicate requests
  const isFetchingRef = useRef(false);
  // Use ref to track last fetch parameters to prevent unnecessary refetches
  const lastFetchParamsRef = useRef<string>('');

  const loadShifts = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(null);
      setData([]);
      setTotal(0);
      setHasMoreBefore(undefined);
      setHasMoreAfter(undefined);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters: ShiftFilters = {
        ...filter,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // If neither before nor after is provided, default to after today
      if (!filters.before && !filters.after) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.after = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

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
      setHasMoreBefore(response.hasMoreBefore);
      setHasMoreAfter(response.hasMoreAfter);
      // Backend doesn't return total count, so use data length
      // Note: This is the count for the current page/range, not total count
      setTotal(response.data.length);

      // Call onLoad callback if provided
      onLoadRef.current?.();
    } catch (error) {
      console.error('Shifts fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shifts');
      setData([]);
      setTotal(0);
      setHasMoreBefore(undefined);
      setHasMoreAfter(undefined);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination, isAuthenticated]);

  const loadMoreBefore = useCallback(async (before: string) => {
    if (!isAuthenticated) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const filters: ShiftFilters = {
        ...filter,
        before,
        after: undefined, // Clear after when loading before
      };

      const response = await shiftsApi.getAll(filters);
      setData(prevData => [...response.data, ...prevData]);
      setHasMoreBefore(response.hasMoreBefore);
    } catch (error) {
      console.error('Load more before error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more shifts');
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated]);

  const loadMoreAfter = useCallback(async (after: string) => {
    if (!isAuthenticated) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const filters: ShiftFilters = {
        ...filter,
        before: undefined, // Clear before when loading after
        after,
      };

      const response = await shiftsApi.getAll(filters);
      setData(prevData => [...prevData, ...response.data]);
      setHasMoreAfter(response.hasMoreAfter);
    } catch (error) {
      console.error('Load more after error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more shifts');
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(null);
      setData([]);
      setTotal(0);
      setHasMoreBefore(undefined);
      setHasMoreAfter(undefined);
      lastFetchParamsRef.current = '';
      return;
    }

    // Create a stable key for the current fetch parameters
    const fetchKey = JSON.stringify({
      status: filter.status,
      assignee: filter.assignee,
      contact: filter.contact,
      before: filter.before,
      after: filter.after,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    // Skip if this exact fetch was already initiated
    if (lastFetchParamsRef.current === fetchKey) {
      return;
    }

    // Prevent duplicate fetches that are in progress
    if (isFetchingRef.current) {
      return;
    }

    let isCancelled = false;
    isFetchingRef.current = true;
    lastFetchParamsRef.current = fetchKey;

    // Inline loadShifts logic to avoid dependency on the callback
    const fetchShifts = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters: ShiftFilters = {
          ...filter,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        };

        // If neither before nor after is provided, default to after today
        if (!filters.before && !filters.after) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filters.after = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        // Calculate filter counter
        const diffStatus = filter.status && filter.status !== ShiftStatus.All;
        const diffAssignee = filter.assignee && filter.assignee !== '-1';
        const diffContact = filter.contact && filter.contact.length > 0;
        const diffBefore = filter.before && filter.before.length > 0;
        const diffAfter = filter.after && filter.after.length > 0;
        
        const counter = [diffStatus, diffAssignee, diffContact, diffBefore, diffAfter].filter(Boolean).length;
        setFilterCounter(counter);

        const response = await shiftsApi.getAll(filters);

        // Check if this request was cancelled
        if (isCancelled) {
          return;
        }

        setData(response.data);
        setHasMoreBefore(response.hasMoreBefore);
        setHasMoreAfter(response.hasMoreAfter);
        setTotal(response.data.length);

        // Call onLoad callback if provided
        onLoadRef.current?.();
      } catch (error) {
        // Don't set error if request was cancelled
        if (isCancelled) {
          return;
        }
        console.error('Shifts fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load shifts');
        setData([]);
        setTotal(0);
        setHasMoreBefore(undefined);
        setHasMoreAfter(undefined);
      } finally {
        isFetchingRef.current = false;
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchShifts();

    // Cleanup: mark as cancelled if the effect runs again
    return () => {
      isCancelled = true;
      isFetchingRef.current = false;
    };
    // Note: filter and pagination are objects, so we need to depend on their values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.status,
    filter.assignee,
    filter.contact,
    filter.before,
    filter.after,
    pagination.pageNumber,
    pagination.pageSize,
    isAuthenticated,
  ]);

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
    hasMoreBefore,
    hasMoreAfter,
    pagination,
    filterCounter,
    filter,
    setFilter: updateFilter,
    setPagination: updatePagination,
    reloadList,
    loadMoreBefore,
    loadMoreAfter,
  };
}

export function useShift() {
  const [loading, setLoading] = useState(false);

  const getOne = useCallback(async (id: string): Promise<Shift> => {
    setLoading(true);
    try {
      return await shiftsApi.getOne(id);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, getOne };
}

export function useRecipientsShift(shiftId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NotifyItem[]>([]);

  const load = useCallback(async () => {
    if (!shiftId) return;
    
    setLoading(true);
    setError(null);
    try {
      const recipients = await shiftsApi.getRecipients(shiftId);
      setData(recipients);
    } catch (error) {
      console.error('Get recipients error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recipients');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, data, reloadList: load };
}

export function useShiftActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAmending, setIsAmending] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);


  const createShift = async (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> => {
    setIsSaving(true);
    try {
      return await shiftsApi.create(shift);
    } finally {
      setIsSaving(false);
    }
  };

  const updateShift = async (id: string, shift: Partial<Shift>): Promise<Shift> => {
    setIsSaving(true);
    try {
      return await shiftsApi.update(id, shift);
    } finally {
      setIsSaving(false);
    }
  };

  const completeShift = async (id: string, data: { isGstFree: boolean; notes?: string }): Promise<Shift> => {
    setIsCompleting(true);
    try {
      return await shiftsApi.complete(id, data);
    } finally {
      setIsCompleting(false);
    }
  };

  const cancelShift = async (id: string, data: { cancellationReason: string; cancellationAmountExclGst: number; isGstFree: boolean }): Promise<Shift> => {
    setIsCancelling(true);
    try {
      return await shiftsApi.cancel(id, data);
    } finally {
      setIsCancelling(false);
    }
  };

  const deleteShift = async (id: string, type: DeleteShiftType = DeleteShiftType.Single): Promise<void> => {
    setIsDeleting(true);
    try {
      await shiftsApi.delete(id, type);
    } finally {
      setIsDeleting(false);
    }
  };

  const amendShift = async (id: string): Promise<Shift> => {
    setIsAmending(true);
    try {
      return await shiftsApi.amend(id);
    } finally {
      setIsAmending(false);
    }
  };

  const notifyShift = async (id: string, recipients: NotifyItem[]): Promise<void> => {
    setIsNotifying(true);
    try {
      await shiftsApi.notify(id, recipients);
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

export function useShiftsToInvoice() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<Shift[]>([]);
  const { isAuthenticated } = useAuth();

  const load = useCallback(async (contactId: string, assignee: string) => {
    if (!isAuthenticated || !contactId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await shiftsApi.getAll({
        action: ShiftAction.Invoice,
        contact: contactId,
        assignee,
      });
      setData(response.data);
    } catch (err) {
      console.error('Failed to load shifts for invoicing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shifts');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const reset = useCallback(() => {
    setData([]);
    setError(undefined);
  }, []);

  return { loading, data, error, load, reset };
}
