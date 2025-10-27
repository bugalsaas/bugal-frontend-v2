'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { expensesApi, mockExpensesResponse, Expense, ExpenseFilters, ExpenseListResponse, ExpenseType } from '@/lib/api/expenses-service';

export interface UseExpensesOptions {
  defaultFilters?: ExpenseFilters;
  pageNumber?: number;
  pageSize?: number;
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
    type: options.defaultFilters?.type,
    contact: options.defaultFilters?.contact || '',
    from: options.defaultFilters?.from,
    to: options.defaultFilters?.to,
  });

  const { isDevelopmentMode, isAuthenticated } = useAuth();

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await expensesApi.getAll(filter);
      setData(response.expenses);
      setTotal(response.total);
      setFilterCounter(0);
    } catch (error) {
      console.error('Expenses fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filter]);

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

  const { isDevelopmentMode } = useAuth();

  const createExpense = async (expense: Partial<Expense>): Promise<Expense> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newExpense: Expense = {
          ...expense as Expense,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newExpense;
      } else {
        return await expensesApi.create(expense);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedExpense: Expense = {
          ...expense as Expense,
          id,
          updatedAt: new Date().toISOString(),
        };
        return updatedExpense;
      } else {
        return await expensesApi.update(id, expense);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete expense:', id);
      } else {
        await expensesApi.delete(id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadAttachment = async (expenseId: string, file: File): Promise<any> => {
    setIsUploading(true);
    try {
      if (isDevelopmentMode) {
        // Mock upload
        const mockAttachment = {
          id: Date.now().toString(),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        };
        return mockAttachment;
      } else {
        return await expensesApi.uploadAttachment(expenseId, file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (expenseId: string, attachmentId: string): Promise<void> => {
    if (isDevelopmentMode) {
      console.log('Mock delete attachment:', expenseId, attachmentId);
    } else {
      await expensesApi.deleteAttachment(expenseId, attachmentId);
    }
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
