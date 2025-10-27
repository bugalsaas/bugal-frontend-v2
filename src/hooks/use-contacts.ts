'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { contactsApi, Contact, ContactFilters, ContactListResponse, ContactType, ContactStatus } from '@/lib/api/contacts-service';

export interface UseContactsOptions {
  defaultFilters?: ContactFilters;
  pageNumber?: number;
  pageSize?: number;
}

export function useContacts(options: UseContactsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: options.pageNumber || 1,
    pageSize: options.pageSize || 100,
  });
  const [filterCounter, setFilterCounter] = useState(0);
  const [filter, setFilter] = useState<ContactFilters>({
    type: options.defaultFilters?.type || ContactType.All,
    search: options.defaultFilters?.search || '',
    status: options.defaultFilters?.status,
  });

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: ContactFilters = {
        ...filter,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Calculate filter counter
      const diffType = filter.type !== ContactType.All;
      const diffSearch = filter.search && filter.search.length > 0;
      const diffStatus = filter.status !== undefined;
      
      const counter = [diffType, diffSearch, diffStatus].filter(Boolean).length;
      setFilterCounter(counter);

      const response = await contactsApi.getAll(filters);

      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Contacts fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const updateFilter = useCallback((newFilter: Partial<ContactFilters>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadContacts();
  }, [loadContacts]);

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

export function useContactActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const createContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    setIsSaving(true);
    try {
      return await contactsApi.create(contact);
    } finally {
      setIsSaving(false);
    }
  };

  const updateContact = async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    setIsSaving(true);
    try {
      return await contactsApi.update(id, contact);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContact = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await contactsApi.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const clearSelection = () => {
    setSelectedContact(null);
  };

  return {
    isDeleting,
    isSaving,
    selectedContact,
    createContact,
    updateContact,
    deleteContact,
    selectContact,
    clearSelection,
  };
}
