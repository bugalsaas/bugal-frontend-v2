import { User } from '@/contexts/auth-context';
import { Country, State, Bank } from './organizations-service';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  initials: string;
  color: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  idCountry?: string;
  idState?: string;
  postcode?: string;
  timezone?: string;
  bankName?: string;
  bankNameOther?: string;
  bankBsb?: string;
  bankAccountNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailConfirmed: boolean;
  emailConfirmedAt?: string;
  completed: boolean;
  country?: Country;
  state?: State;
}

export interface ProfileUpdateDto {
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  idCountry?: string;
  idState?: string;
  postcode?: string;
  bankName?: string;
  bankNameOther?: string;
  bankBsb?: string;
  bankAccountNumber?: string;
}

// Mock data for development
const mockProfile: Profile = {
  id: '1',
  firstName: 'Andrew',
  lastName: 'Giles',
  fullName: 'Andrew Giles',
  email: 'andrew@example.com',
  initials: 'AG',
  color: '#3B82F6',
  gender: 'Male',
  dob: '1990-01-01',
  phoneNumber: '+61 2 1234 5678',
  addressLine1: '123 Main Street',
  addressLine2: 'Apt 4B',
  idCountry: '1',
  idState: '1',
  postcode: '2000',
  timezone: 'Australia/Sydney',
  bankName: '1',
  bankBsb: '062-000',
  bankAccountNumber: '12345678',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-12-15T12:00:00Z',
  isEmailConfirmed: true,
  emailConfirmedAt: '2024-01-01T00:00:00Z',
  completed: true,
  country: {
    id: '1',
    name: 'Australia',
    code: 'AU',
  },
  state: {
    id: '1',
    name: 'New South Wales',
    code: 'NSW',
  },
};

// API functions
export const profileApi = {
  getMe: async (): Promise<Profile> => {
    // Always use mock data in development for testing
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      console.log('Loading mock profile data');
      return mockProfile;
    }
    
    const response = await fetch('/api/me', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateMe: async (data: ProfileUpdateDto): Promise<Profile> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return {
        ...mockProfile,
        ...data,
      };
    }
    
    const response = await fetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  patchMe: async (data: { firstName: string; lastName: string }): Promise<Profile> => {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return {
        ...mockProfile,
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      };
    }
    
    const response = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
};
