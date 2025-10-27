'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { invoicesApi, Invoice, InvoiceFilters, InvoiceListResponse, InvoiceStatus } from '@/lib/api/invoices-service';

export interface UseInvoicesOptions {
  defaultFilters?: InvoiceFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filter, setFilter] = useState<InvoiceFilters>({
    status: options.defaultFilters?.status,
    contact: options.defaultFilters?.contact || '',
    from: options.defaultFilters?.from,
    to: options.defaultFilters?.to,
  });

  const { isAuthenticated } = useAuth();

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: InvoiceFilters = {
        ...filter,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffStatus = filter.status !== undefined;
      const diffContact = filter.contact && filter.contact.length > 0;
      const diffFrom = filter.from && filter.from.length > 0;
      const diffTo = filter.to && filter.to.length > 0;
      
      const counter = [diffStatus, diffContact, diffFrom, diffTo].filter(Boolean).length;
      setFilterCounter(counter);

      const response = await invoicesApi.getAll(filters);

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Invoices fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load invoices');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const updateFilter = useCallback((newFilter: Partial<InvoiceFilters>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadInvoices();
  }, [loadInvoices]);

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

export function useInvoiceActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
    setIsSaving(true);
    try {
      return await invoicesApi.create(invoice);
    } finally {
      setIsSaving(false);
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    setIsSaving(true);
    try {
      return await invoicesApi.update(id, invoice);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await invoicesApi.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadInvoice = async (id: string): Promise<void> => {
    await invoicesApi.download(id);
  };

  const notifyInvoice = async (id: string, payload: { recipients: any[] }): Promise<void> => {
    await invoicesApi.notify(id, payload);
  };

  const selectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const clearSelection = () => {
    setSelectedInvoice(null);
  };

  return {
    isDeleting,
    isSaving,
    selectedInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadInvoice,
    notifyInvoice,
    selectInvoice,
    clearSelection,
  };
}

