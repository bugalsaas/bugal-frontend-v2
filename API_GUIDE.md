# API Integration Guide

## Overview

This guide covers how to integrate with the Bugal backend API using the shared API layer. The shared API layer ensures 100% compatibility between the old and new frontends while maintaining zero backend changes.

## 🔌 Shared API Architecture

### Structure
```
shared/
├── api/                    # API service layer
│   ├── auth.ts            # Authentication endpoints
│   ├── contacts.ts        # Contact management
│   ├── shifts.ts          # Shift management
│   ├── invoices.ts        # Invoice management
│   ├── reports.ts         # Report generation
│   ├── organizations.ts   # Organization management
│   ├── users.ts           # User management
│   ├── expenses.ts        # Expense management
│   ├── incidents.ts       # Incident management
│   ├── rates.ts           # Rate management
│   ├── agreements.ts      # Agreement management
│   ├── subscriptions.ts   # Subscription management
│   └── index.ts           # Re-exports
├── types/                  # TypeScript type definitions
│   ├── auth.ts            # Authentication types
│   ├── contacts.ts        # Contact types
│   ├── shifts.ts          # Shift types
│   ├── invoices.ts        # Invoice types
│   └── index.ts           # Re-exports
└── utils/                  # Shared utilities
    ├── api-client.ts      # Base API client
    ├── error-handling.ts  # Error handling utilities
    └── index.ts           # Re-exports
```

## 🔐 Authentication Integration

### Setup
```typescript
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { authApi } from '@/shared/api/auth';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### Authentication Flow
```typescript
// Login
const { login, user, isAuthenticated } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    // User is now authenticated
  } catch (error) {
    // Handle login error
    console.error('Login failed:', error);
  }
};

// Check authentication status
if (isAuthenticated) {
  console.log('User is logged in:', user);
}
```

### Protected Routes
```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Token Management
```typescript
import { getToken, setToken, removeToken } from '@/contexts/auth-context';

// Get current token
const token = getToken();

// Set token (usually done by auth context)
setToken('your-jwt-token');

// Remove token (logout)
removeToken();
```

## 📡 API Service Usage

### Base API Client
```typescript
import { apiClient } from '@/shared/utils/api-client';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// PUT request
const updated = await apiClient.put('/endpoint', { data });

// DELETE request
await apiClient.delete('/endpoint');
```

### Service-Specific APIs

#### Contacts API
```typescript
import { contactsApi } from '@/shared/api/contacts';

// Get all contacts
const contacts = await contactsApi.getAll();

// Get contact by ID
const contact = await contactsApi.getById('contact-id');

// Create new contact
const newContact = await contactsApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});

// Update contact
const updatedContact = await contactsApi.update('contact-id', {
  name: 'John Smith'
});

// Delete contact
await contactsApi.delete('contact-id');
```

#### Shifts API
```typescript
import { shiftsApi } from '@/shared/api/shifts';

// Get shifts with filters
const shifts = await shiftsApi.getAll({
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  status: 'active'
});

// Create new shift
const newShift = await shiftsApi.create({
  contactId: 'contact-id',
  startTime: '2025-01-15T09:00:00Z',
  endTime: '2025-01-15T17:00:00Z',
  description: 'Regular shift'
});

// Cancel shift
await shiftsApi.cancel('shift-id');

// Notify shift
await shiftsApi.notify('shift-id', {
  recipients: ['email@example.com'],
  message: 'Shift reminder'
});
```

#### Invoices API
```typescript
import { invoicesApi } from '@/shared/api/invoices';

// Get invoices
const invoices = await invoicesApi.getAll({
  status: 'pending',
  page: 1,
  limit: 20
});

// Create invoice
const newInvoice = await invoicesApi.create({
  contactId: 'contact-id',
  items: [
    {
      description: 'Service provided',
      quantity: 1,
      rate: 100.00
    }
  ],
  dueDate: '2025-02-15'
});

// Get invoice PDF
const pdfUrl = await invoicesApi.getPdfUrl('invoice-id');

// Send invoice notification
await invoicesApi.notify('invoice-id', {
  recipients: ['client@example.com'],
  message: 'Invoice attached'
});
```

## 🔄 State Management Integration

### TanStack Query Integration
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/shared/api/contacts';

// Query contacts
function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation for creating contact
function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      // Invalidate and refetch contacts
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Usage in component
function ContactsList() {
  const { data: contacts, isLoading, error } = useContacts();
  const createContact = useCreateContact();

  const handleCreateContact = async (contactData) => {
    try {
      await createContact.mutateAsync(contactData);
      // Contact created successfully
    } catch (error) {
      // Handle error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {contacts?.map(contact => (
        <div key={contact.id}>{contact.name}</div>
      ))}
    </div>
  );
}
```

### Zustand Integration
```typescript
import { create } from 'zustand';
import { contactsApi } from '@/shared/api/contacts';

interface ContactsStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  addContact: (contact: CreateContactRequest) => Promise<void>;
}

const useContactsStore = create<ContactsStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await contactsApi.getAll();
      set({ contacts, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addContact: async (contactData) => {
    try {
      const newContact = await contactsApi.create(contactData);
      set(state => ({
        contacts: [...state.contacts, newContact]
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
```

## 🛡️ Error Handling

### API Error Types
```typescript
interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Error handling utility
export function handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      code: error.response.data.code,
      details: error.response.data.details
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error - please check your connection',
      status: 0
    };
  } else {
    // Other error
    return {
      message: error.message || 'Unknown error occurred',
      status: 0
    };
  }
}
```

### Component Error Handling
```typescript
import { useState } from 'react';
import { contactsApi } from '@/shared/api/contacts';
import { handleApiError } from '@/shared/utils/error-handling';

function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: ContactFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await contactsApi.create(formData);
      // Success handling
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-600 text-sm mb-4">
          {error}
        </div>
      )}
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Contact'}
      </button>
    </form>
  );
}
```

## 🔍 Data Fetching Patterns

### Pagination
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { contactsApi } from '@/shared/api/contacts';

function useInfiniteContacts() {
  return useInfiniteQuery({
    queryKey: ['contacts', 'infinite'],
    queryFn: ({ pageParam = 1 }) => contactsApi.getAll({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
}

// Usage
function ContactsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteContacts();

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.contacts.map(contact => (
            <div key={contact.id}>{contact.name}</div>
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Search and Filtering
```typescript
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/shared/api/contacts';

function useContactsSearch(searchTerm: string, filters: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', 'search', searchTerm, filters],
    queryFn: () => contactsApi.search(searchTerm, filters),
    enabled: searchTerm.length > 2, // Only search if term is long enough
  });
}

// Usage
function ContactSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ContactFilters>({});
  
  const { data: contacts, isLoading } = useContactsSearch(searchTerm, filters);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search contacts..."
      />
      
      {isLoading && <div>Searching...</div>}
      
      {contacts?.map(contact => (
        <div key={contact.id}>{contact.name}</div>
      ))}
    </div>
  );
}
```

## 📊 Real-time Updates

### Polling
```typescript
import { useQuery } from '@tanstack/react-query';
import { shiftsApi } from '@/shared/api/shifts';

function useLiveShifts() {
  return useQuery({
    queryKey: ['shifts', 'live'],
    queryFn: () => shiftsApi.getAll({ status: 'active' }),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
  });
}
```

### Optimistic Updates
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '@/shared/api/shifts';

function useUpdateShift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: shiftsApi.update,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shifts'] });
      
      // Snapshot previous value
      const previousShifts = queryClient.getQueryData(['shifts']);
      
      // Optimistically update
      queryClient.setQueryData(['shifts'], (old: any) => ({
        ...old,
        shifts: old.shifts.map((shift: any) =>
          shift.id === variables.id ? { ...shift, ...variables.data } : shift
        )
      }));
      
      return { previousShifts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['shifts'], context?.previousShifts);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
```

### API Client Configuration
```typescript
// shared/utils/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      removeToken();
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing API Integration

### Mock API for Testing
```typescript
// __mocks__/api-client.ts
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Test setup
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Component Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContactsList } from './ContactsList';

test('displays contacts list', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ContactsList />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 📚 Best Practices

### 1. Error Handling
- Always handle API errors gracefully
- Provide meaningful error messages to users
- Log errors for debugging
- Implement retry logic for network errors

### 2. Loading States
- Show loading indicators during API calls
- Use skeleton screens for better UX
- Implement optimistic updates where appropriate

### 3. Caching Strategy
- Use appropriate cache times for different data types
- Implement cache invalidation after mutations
- Use background refetching for real-time data

### 4. Performance
- Implement pagination for large datasets
- Use debouncing for search inputs
- Minimize API calls with proper caching
- Implement request deduplication

### 5. Security
- Never expose API keys in client-side code
- Validate all user inputs
- Use HTTPS for all API communications
- Implement proper authentication checks

### 6. Library Constraints
- **Minimal Dependencies**: Only essential libraries to reduce bundle size
- **Developer Constraint**: "On the libraries subject, please try to keep them at a minimum and only really bring the ones needed"
- **Bundle Size Monitoring**: Regular analysis to prevent bloat
- **Essential Only**: Each library must provide significant value

## 🔗 Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Overall system architecture
- [Design System Guide](./DESIGN_SYSTEM.md) - UI components and patterns
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [API Compatibility Matrix](../API_COMPATIBILITY.md) - Backend compatibility status

---

**Note**: This API integration maintains 100% compatibility with the existing backend while providing a modern, type-safe interface for the new frontend.
