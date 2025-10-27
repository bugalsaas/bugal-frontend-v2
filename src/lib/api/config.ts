/**
 * API Configuration
 * Centralized configuration for API calls with authentication and error handling
 */

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('@bugal-token');
};

interface ApiError {
  message?: string | string[];
}

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bugal.com.au',
  timeout: 30000,
  
  getHeaders: () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Cache-Control': 'no-cache',
    };
  },

  handleError: (error: any): string => {
    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        return error.response.data.message.join('\n');
      }
      return error.response.data.message;
    }
    return error.message || 'An error occurred';
  },

  handle401: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@bugal-token');
      localStorage.removeItem('@bugal-user');
      window.location.href = '/sign-in';
    }
  },
};

export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = apiConfig.getHeaders();
  
  const response = await fetch(`${apiConfig.baseURL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    apiConfig.handle401();
    throw new Error('Unauthorized');
  }

  // Handle other error statuses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall<T>(`${url}${queryString}`, {
      method: 'GET',
    });
  },

  post: <T>(url: string, data?: any): Promise<T> => {
    return apiCall<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: <T>(url: string, data?: any): Promise<T> => {
    return apiCall<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: <T>(url: string, data?: any): Promise<T> => {
    return apiCall<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: <T>(url: string): Promise<T> => {
    return apiCall<T>(url, {
      method: 'DELETE',
    });
  },
};

