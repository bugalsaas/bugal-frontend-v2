import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { organizationsApi, Organization, OrganizationUser, OrganizationFilters, OrganizationCreateDto, OrganizationUpdateDto, OrganizationInviteDto, StaffUpdateDto, Role, Country, State, Bank } from '@/lib/api/organizations-service';

// Organizations hooks
export function useOrganizations() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrganizationFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filterCounter, setFilterCounter] = useState(0);

  const loadOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await organizationsApi.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
        text: filters.search,
      });
      
      setData(response.data);
      
      // Update filter counter
      const activeFilters = [
        filters.search && filters.search.length > 0,
        filters.status,
        filters.organizationType,
      ].filter(Boolean).length;
      
      setFilterCounter(activeFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const updateFilter = useCallback((newFilters: Partial<OrganizationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  return {
    organizations: data,
    isLoading,
    error,
    filters,
    setFilters: updateFilter,
    pagination,
    setPagination: updatePagination,
    filterCounter,
    reloadList,
  };
}

// Hook to get current user's organization
export function useCurrentOrganization() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(!user?.organization);
  const [error, setError] = useState<string | null>(null);

  const organization = user?.organization as Organization | undefined;
  
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(false);
      if (!user.organization) {
        setError('No organization found for current user');
      } else {
        setError(null);
      }
    }
  }, [isAuthenticated, user]);

  const refetch = useCallback(async () => {
    // Refetch would reload the /me endpoint through auth context
    if (user) {
      window.location.reload(); // Trigger re-authentication
    }
  }, [user]);

  return {
    organization: organization || null,
    isLoading,
    error,
    refetch,
  };
}

export function useOrganizationActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createOrganization = useCallback(async (data: OrganizationCreateDto): Promise<Organization> => {
    setIsLoading(true);
    try {
      return await organizationsApi.create(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrganization = useCallback(async (id: string, data: OrganizationUpdateDto): Promise<Organization> => {
    setIsLoading(true);
    try {
      return await organizationsApi.update(id, data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteOrganization = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await organizationsApi.delete(id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportOrganizations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await organizationsApi.export();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    exportOrganizations,
  };
}

// Organization Users (Staff) hooks
export function useOrganizationUsers(idOrganization: string) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ search?: string; status?: string }>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filterCounter, setFilterCounter] = useState(0);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await organizationsApi.getAllUsers(idOrganization, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        text: filters.search,
      });
      
      setData(response.data);
      
      // Update filter counter
      const activeFilters = [
        filters.search && filters.search.length > 0,
        filters.status,
      ].filter(Boolean).length;
      
      setFilterCounter(activeFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, idOrganization, pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateFilter = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const reloadList = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users: data,
    isLoading,
    error,
    filters,
    setFilters: updateFilter,
    pagination,
    setPagination: updatePagination,
    filterCounter,
    reloadList,
  };
}

export function useOrganizationUserActions() {
  const [isLoading, setIsLoading] = useState(false);

  const inviteUser = useCallback(async (idOrganization: string, data: OrganizationInviteDto): Promise<OrganizationUser> => {
    setIsLoading(true);
    try {
      return await organizationsApi.inviteUser(idOrganization, data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (idOrganization: string, userId: string, data: StaffUpdateDto): Promise<OrganizationUser> => {
    setIsLoading(true);
    try {
      return await organizationsApi.updateUser(idOrganization, userId, data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableUser = useCallback(async (idOrganization: string, userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await organizationsApi.disableUser(idOrganization, userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableUser = useCallback(async (idOrganization: string, userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await organizationsApi.enableUser(idOrganization, userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    inviteUser,
    updateUser,
    disableUser,
    enableUser,
  };
}

// Reference data hooks
export function useRoles(idOrganization: string) {
  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const roles = await organizationsApi.getRoles(idOrganization);
      setData(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [idOrganization]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles: data,
    isLoading,
    error,
    reloadRoles: loadRoles,
  };
}

export function useCountries() {
  const [data, setData] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const countries = await organizationsApi.getCountries();
      setData(countries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return {
    countries: data,
    isLoading,
    error,
    reloadCountries: loadCountries,
  };
}

export function useStates(idCountry: string) {
  const [data, setData] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStates = useCallback(async () => {
    if (!idCountry) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const states = await organizationsApi.getStates(idCountry);
      setData(states);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load states');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [idCountry]);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  return {
    states: data,
    isLoading,
    error,
    reloadStates: loadStates,
  };
}

export function useBanks() {
  const [data, setData] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const banks = await organizationsApi.getBanks();
      setData(banks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banks');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  return {
    banks: data,
    isLoading,
    error,
    reloadBanks: loadBanks,
  };
}
