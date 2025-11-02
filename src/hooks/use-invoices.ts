'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { invoicesApi, Invoice, InvoiceFilters, InvoiceListResponse, InvoiceStatus, InvoiceCreateDto, InvoiceUpdateDto, NotifyItem } from '@/lib/api/invoices-service';
import { receiptsApi } from '@/lib/api/receipts-service';

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

      // Omit status if it's undefined or 'All' (backend doesn't expect it)
      // Also omit contact if it's '-1' or empty (All contacts)
      const apiFilters: InvoiceFilters = { ...filters };
      if (!apiFilters.status) {
        delete apiFilters.status;
      }
      if (apiFilters.contact === '-1' || apiFilters.contact === '') {
        delete apiFilters.contact;
      }
      
      const response = await invoicesApi.getAll(apiFilters);

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

export function useInvoice() {
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string): Promise<Invoice> => {
    setIsLoading(true);
    setError(null);
    try {
      const invoice = await invoicesApi.getById(id);
      return invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loading, error, load };
}

export function useInvoiceActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const createInvoice = async (invoice: InvoiceCreateDto): Promise<Invoice> => {
    setIsSaving(true);
    try {
      return await invoicesApi.create(invoice);
    } finally {
      setIsSaving(false);
    }
  };

  const updateInvoice = async (id: string, invoice: InvoiceUpdateDto): Promise<Invoice> => {
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

  const notifyInvoice = async (id: string, payload: { recipients: NotifyItem[] }): Promise<void> => {
    await invoicesApi.notify(id, payload);
  };

  const deleteReceipt = async (id: string): Promise<void> => {
    setIsDeletingReceipt(true);
    try {
      await receiptsApi.deleteReceipt(id);
    } finally {
      setIsDeletingReceipt(false);
    }
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
    isDeletingReceipt,
    selectedInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadInvoice,
    notifyInvoice,
    deleteReceipt,
    selectInvoice,
    clearSelection,
  };
}

