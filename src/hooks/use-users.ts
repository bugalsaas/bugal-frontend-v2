import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usersApi, UserManagement, UserFilters, UserListResponse } from '@/lib/api/users-service';

export function useUsers() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
  });
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 100 });
  const [filterCounter, setFilterCounter] = useState(0);
  const [total, setTotal] = useState(0);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: UserListResponse = await usersApi.getAll({ ...filters, ...pagination });
      setData(response.data);
      setTotal(response.meta.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination, isAuthenticated]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const activeFilters = Object.values(filters).filter(value => value !== '' && value !== undefined).length;
    setFilterCounter(activeFilters);
  }, [filters]);

  const updateFilter = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageNumber: 1 })); // Reset to first page on filter change
  };

  const updatePagination = (newPagination: { pageNumber?: number; pageSize?: number }) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const reloadList = () => {
    loadUsers();
  };

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilter,
    pagination,
    updatePagination,
    filterCounter,
    reloadList,
    total,
  };
}

export function useUserActions() {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const impersonateUser = async (userId: string) => {
    setIsSaving(true);
    try {
      const result = await usersApi.impersonate(userId);
      // Store impersonation token
      if (result.token) {
        localStorage.setItem('impersonation-token', result.token);
        // Redirect to dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to impersonate user:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const resendConfirmationEmail = async (userId: string) => {
    setIsSaving(true);
    try {
      await usersApi.resendConfirmationEmail(userId);
    } catch (error) {
      console.error('Failed to resend confirmation email:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const exportUsers = async () => {
    setIsSaving(true);
    try {
      await usersApi.export();
    } catch (error) {
      console.error('Failed to export users:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    impersonateUser,
    resendConfirmationEmail,
    exportUsers,
  };
}
