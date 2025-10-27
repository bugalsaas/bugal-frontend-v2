'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { contactsApi, mockContactsResponse, Contact, ContactFilters, ContactListResponse, ContactType, ContactStatus } from '@/lib/api/contacts-service';

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

  const { isDevelopmentMode, isAuthenticated } = useAuth();

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

      let response: ContactListResponse;

      // Always use mock data for now to ensure we can test the UI
      console.log('Using mock contacts data for testing');
      response = mockContactsResponse;
      
      // Apply client-side filtering for mock data
      let filteredData = [...mockContactsResponse.data];
      
      if (filter.type && filter.type !== ContactType.All) {
        filteredData = filteredData.filter(contact => contact.contactType === filter.type);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredData = filteredData.filter(contact => 
          contact.fullName.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.includes(filter.search)
        );
      }
      
      if (filter.status) {
        filteredData = filteredData.filter(contact => contact.status === filter.status);
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
      console.error('Contacts fetch error:', error);
      
      // Fallback to mock data on API error
      console.log('API error, falling back to mock data');
      setData(mockContactsResponse.data);
      setTotal(mockContactsResponse.meta.total);
      
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDevelopmentMode, filter, pagination]);

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

  const { isDevelopmentMode } = useAuth();

  const createContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock creation
        const newContact: Contact = {
          ...contact,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newContact;
      } else {
        return await contactsApi.create(contact);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateContact = async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    setIsSaving(true);
    try {
      if (isDevelopmentMode) {
        // Mock update
        const updatedContact: Contact = {
          ...contact as Contact,
          id,
          updatedAt: new Date().toISOString(),
        };
        return updatedContact;
      } else {
        return await contactsApi.update(id, contact);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContact = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      if (isDevelopmentMode) {
        // Mock deletion
        console.log('Mock delete contact:', id);
      } else {
        await contactsApi.delete(id);
      }
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
