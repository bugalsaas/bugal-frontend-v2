import { getToken } from '@/contexts/auth-context';
import { apiConfig, apiCall } from './config';

export interface PlansResponse {
  id: string;
  name: string;
  highlight: string;
  originalMonthlyPrice: number;
  monthlyPrice: number;
  originalYearlyPrice: number;
  yearlyPrice: number;
  benefits: string[];
}

export interface Promo {
  name: string;
  code: string;
  description: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'past_due' | 'unsubscribed' | 'free' | 'trial';
  currentPlan: string;
  daysFreeTrialLeft?: number;
  endDate?: string;
  billingPeriod?: 'monthly' | 'yearly';
}

// API functions
export const subscriptionApi = {
  getPlans: async (): Promise<PlansResponse[]> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<PlansResponse[]>('/subscriptions/plans');
  },

  getPromo: async (): Promise<Promo | null> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    try {
      return await apiCall<Promo>('/subscriptions/promo');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('404') || message.includes('Failed to fetch')) {
        return null;
      }
      throw error;
    }
  },

  getCheckoutUrl: async (planId: string, frequency: 'Monthly' | 'Yearly'): Promise<{ id: string }> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<{ id: string }>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ idPlanOffer: planId, frequency }),
    });
  },

  getCustomerPortalUrl: async (): Promise<{ url: string }> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<{ url: string }>('/subscriptions/portal');
  },

  changePlan: async (code: string): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    return apiCall<void>('/subscriptions/change', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};
