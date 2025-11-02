'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { expensesApi, Expense, ExpenseFilters, ExpenseListResponse, ExpenseType, ExpenseAction } from '@/lib/api/expenses-service';
import { Wallet, Receipt, Car } from 'lucide-react';
import { ReactElement } from 'react';

export interface UseExpensesOptions {
  defaultFilters?: ExpenseFilters;
  pageNumber?: number;
  pageSize?: number;
}

// Default filters matching original frontend
export const defaultExpensesFilters: ExpenseFilters = {
  type: ExpenseType.All,
  contact: '-1',
  from: undefined,
  to: undefined,
};

// Format date to YYYY-MM-DD (API format)
function formatDateForAPI(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') {
    // If already a string in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Otherwise parse it
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    date = d;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Map expense to add icons and normalize data
export function mapExpense(obj: Expense): Expense & { icon?: ReactElement; dateFormatted?: Date } {
  let icon: ReactElement | undefined;
  if (obj.expenseType === ExpenseType.Reclaimable) {
    icon = <Receipt className="h-4 w-4 inline mr-1" />;
  } else if (obj.expenseType === ExpenseType.Kilometre) {
    icon = <Car className="h-4 w-4 inline mr-1" />;
  } else {
    icon = <Wallet className="h-4 w-4 inline mr-1" />;
  }
  
  // Parse date string to Date object for easier handling
  const dateFormatted = obj.date ? new Date(obj.date) : undefined;
  
  return {
    ...obj,
    icon,
    dateFormatted,
    isGstFree: obj.amountGst === 0,
    // Ensure attachments is always an array
    attachments: obj.attachments || [],
  };
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filter, setFilter] = useState<ExpenseFilters>({
    type: options.defaultFilters?.type ?? defaultExpensesFilters.type,
    contact: options.defaultFilters?.contact ?? defaultExpensesFilters.contact,
    from: options.defaultFilters?.from,
    to: options.defaultFilters?.to,
  });

  const { isAuthenticated } = useAuth();

  const loadExpenses = useCallback(async () => {
    if (!isAuthenticated) {
      setData([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare filters for API call
      const apiFilters: ExpenseFilters = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        type: filter.type,
        contact: filter.contact,
        from: formatDateForAPI(filter.from),
        to: formatDateForAPI(filter.to),
      };

      // Calculate filter counter by comparing against defaults
      const diffType = filter.type !== defaultExpensesFilters.type;
      const diffContact = filter.contact !== defaultExpensesFilters.contact;
      const diffFrom = filter.from !== defaultExpensesFilters.from;
      const diffTo = filter.to !== defaultExpensesFilters.to;
      
      const counter = [diffType, diffContact, diffFrom, diffTo].filter(Boolean).length;
      setFilterCounter(counter);

      const response = await expensesApi.getAll(apiFilters);
      
      // Map expenses to add icons and normalize data
      const mappedData = (response.data || []).map(mapExpense);
      setData(mappedData);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error('Expenses fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load expenses');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination, isAuthenticated]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const updateFilter = useCallback((newFilter: Partial<ExpenseFilters>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses: data,
    isLoading: loading,
    error,
    total,
    pagination,
    filterCounter,
    filters: filter,
    setFilters: updateFilter,
    setPagination: updatePagination,
    reloadList,
  };
}

export function useExpenseActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const createExpense = async (expense: Partial<Expense>): Promise<Expense> => {
    setIsSaving(true);
    try {
      return await expensesApi.create(expense);
    } finally {
      setIsSaving(false);
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    setIsSaving(true);
    try {
      return await expensesApi.update(id, expense);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await expensesApi.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadAttachment = async (expenseId: string, file: File): Promise<any> => {
    setIsUploading(true);
    try {
      return await expensesApi.uploadAttachment(expenseId, file);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (expenseId: string, attachmentId: string): Promise<void> => {
    await expensesApi.deleteAttachment(expenseId, attachmentId);
  };

  const selectExpense = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const clearSelection = () => {
    setSelectedExpense(null);
  };

  return {
    isDeleting,
    isSaving,
    isUploading,
    selectedExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    uploadAttachment,
    deleteAttachment,
    selectExpense,
    clearSelection,
  };
}

export function useExpense() {
  const [loading, setIsLoading] = useState(false);

  const load = useCallback(async (id: string): Promise<Expense> => {
    setIsLoading(true);
    try {
      const obj = await expensesApi.getById(id);
      return mapExpense(obj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loading, load };
}

export function useExpensesToInvoice() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<Expense[]>([]);
  const { isAuthenticated } = useAuth();

  const load = useCallback(async (contactId: string) => {
    if (!isAuthenticated || !contactId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await expensesApi.getAll({
        action: ExpenseAction.Invoice,
        contact: contactId,
      });
      // Response has structure { data: Expense[], meta: {...} }
      // Map expenses to add icons and normalize data
      const mappedData = (response.data || []).map(mapExpense);
      setData(mappedData);
    } catch (err) {
      console.error('Failed to load expenses for invoicing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
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
