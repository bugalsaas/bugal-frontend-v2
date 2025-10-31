'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ratesApi, Rate, RateFilters, RateListResponse, RateType } from '@/lib/api/rates-service';

export interface UseRatesOptions {
  defaultFilters?: RateFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useRates(options: UseRatesOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Rate[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filters, setFilters] = useState<RateFilters>({
    search: options.defaultFilters?.search || '',
    rateType: options.defaultFilters?.rateType,
    isArchived: options.defaultFilters?.isArchived || false,
  });

  const { isAuthenticated } = useAuth();

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filtersToApply: RateFilters = {
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffSearch = filters.search && filters.search.length > 0;
      const diffRateType = filters.rateType !== undefined;
      const diffArchived = filters.isArchived !== false;
      
      const counter = [diffSearch, diffRateType, diffArchived].filter(Boolean).length;
      setFilterCounter(counter);

      const response: RateListResponse = await ratesApi.getAll(filtersToApply);

      // Apply client-side filtering for fields not supported by backend query
      let filtered = response.data;
      if (filters.rateType) {
        filtered = filtered.filter(r => r.rateType === filters.rateType);
      }
      if (filters.isArchived === false || filters.isArchived === undefined) {
        filtered = filtered.filter(r => !r.isArchived);
      }

      setData(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error('Rates fetch error:', error);
      
      setData([]);
      setTotal(0);
      
      setError(error instanceof Error ? error.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters, pagination]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const updateFilter = useCallback((newFilter: Partial<RateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadRates();
  }, [loadRates]);

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

export function useRateActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);


  const createRate = async (rate: Omit<Rate, 'id' | 'createdAt' | 'updatedAt' | 'amountGst' | 'amountInclGst'>): Promise<Rate> => {
    setIsSaving(true);
    try {
      return await ratesApi.create(rate);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRate = async (id: string, rate: Partial<Rate>): Promise<Rate> => {
    setIsSaving(true);
    try {
      return await ratesApi.update(id, rate);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRate = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await ratesApi.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const archiveRate = async (id: string): Promise<Rate> => {
    setIsArchiving(true);
    try {
      return await ratesApi.archive(id);
    } finally {
      setIsArchiving(false);
    }
  };

  const selectRate = (rate: Rate) => {
    setSelectedRate(rate);
  };

  const clearSelection = () => {
    setSelectedRate(null);
  };

  return {
    isDeleting,
    isSaving,
    isArchiving,
    selectedRate,
    createRate,
    updateRate,
    deleteRate,
    archiveRate,
    selectRate,
    clearSelection,
  };
}
