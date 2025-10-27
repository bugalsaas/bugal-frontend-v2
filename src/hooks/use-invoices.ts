'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { invoicesApi, mockInvoicesResponse, Invoice, InvoiceFilters, InvoiceListResponse, InvoiceStatus } from '@/lib/api/invoices-service';

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

  const { isDevelopmentMode, isAuthenticated } = useAuth();

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

      let response: InvoiceListResponse;

      // Always use mock data for now to ensure we can test the UI
      console.log('Using mock invoices data for testing');
      response = mockInvoicesResponse;
      
      // Apply client-side filtering for mock data
      let filteredData = [...mockInvoicesResponse.data];
      
      if (filter.status) {
        filteredData = filteredData.filter(invoice => invoice.invoiceStatus === filter.status);
      }
      
      if (filter.contact) {
        filteredData = filteredData.filter(invoice => 
          invoice.contact.fullName.toLowerCase().includes(filter.contact!.toLowerCase()) ||
          invoice.contact.email?.toLowerCase().includes(filter.contact!.toLowerCase())
        );
      }
      
      if (filter.from) {
        const fromDate = new Date(filter.from);
        filteredData = filteredData.filter(invoice => new Date(invoice.date) >= fromDate);
      }
      
      if (filter.to) {
        const toDate = new Date(filter.to);
        filteredData = filteredData.filter(invoice => new Date(invoice.date) <= toDate);
      }
      
      response = {
        data: filteredData,
        meta: {
          total: filteredData.length,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        },
      };

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Invoices fetch error:', error);
      
      // Fallback to mock data on API error
      console.log('API error, falling back to mock data');
      setData(mockInvoicesResponse.data);
      setTotal(mockInvoicesResponse.meta.total);
      
      setError(error instanceof Error ? error.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDevelopmentMode, filter, pagination]);

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

  const { isDevelopmentMode } = useAuth();

  const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newInvoice: Invoice = {
          ...invoice as Invoice,
          id: Date.now().toString(),
        };
        return newInvoice;
      } else {
        return await invoicesApi.create(invoice);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedInvoice: Invoice = {
          ...invoice as Invoice,
          id,
        };
        return updatedInvoice;
      } else {
        return await invoicesApi.update(id, invoice);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete invoice:', id);
      } else {
        await invoicesApi.delete(id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadInvoice = async (id: string): Promise<void> => {
    if (isDevelopmentMode) {
      console.log('Mock download invoice:', id);
    } else {
      await invoicesApi.download(id);
    }
  };

  const notifyInvoice = async (id: string, payload: { recipients: any[] }): Promise<void> => {
    if (isDevelopmentMode) {
      console.log('Mock notify invoice:', id, payload);
    } else {
      await invoicesApi.notify(id, payload);
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

