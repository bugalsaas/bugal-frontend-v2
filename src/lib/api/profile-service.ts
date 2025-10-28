import { User } from '@/contexts/auth-context';
import { Country, State, Bank } from './organizations-service';
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

// API functions
export const profileApi = {
  getMe: async (): Promise<Profile> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  updateMe: async (data: ProfileUpdateDto): Promise<Profile> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },

  patchMe: async (data: { firstName: string; lastName: string }): Promise<Profile> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },
};
