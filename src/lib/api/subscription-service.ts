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

// Mock data for development
const mockPlansData: PlansResponse[] = [
  {
    id: '1',
    name: 'Basic',
    highlight: 'Perfect for small teams',
    originalMonthlyPrice: 29,
    monthlyPrice: 29,
    originalYearlyPrice: 290,
    yearlyPrice: 290,
    benefits: [
      'Up to 5 team members',
      '100 contacts',
      '500 shifts per month',
      'Email support',
      'Basic reporting',
    ],
  },
  {
    id: '2',
    name: 'Professional',
    highlight: 'Most popular',
    originalMonthlyPrice: 99,
    monthlyPrice: 79,
    originalYearlyPrice: 990,
    yearlyPrice: 790,
    benefits: [
      'Unlimited team members',
      'Unlimited contacts',
      'Unlimited shifts',
      'Priority support',
      'Advanced reporting',
      'Custom integrations',
      'API access',
    ],
  },
  {
    id: '3',
    name: 'Enterprise',
    highlight: 'For large organizations',
    originalMonthlyPrice: 299,
    monthlyPrice: 199,
    originalYearlyPrice: 2990,
    yearlyPrice: 1990,
    benefits: [
      'Everything in Professional',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom development',
      'SLA guarantee',
      'On-site training',
    ],
  },
];

const mockPromoData: Promo = {
  name: 'Limited Time Offer',
  code: 'WELCOME2024',
  description: 'Get 50% off your first year! Use code WELCOME2024 at checkout.',
};

// API functions
export const subscriptionApi = {
  getPlans: async (): Promise<PlansResponse[]> => {
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      return mockPlansData;
    }
    
    const response = await fetch('/api/subscriptions/plans', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch plans');
    return response.json();
  },

  getPromo: async (): Promise<Promo | null> => {
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      return mockPromoData;
    }
    
    const response = await fetch('/api/subscriptions/promo', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch promo');
    }
    return response.json();
  },

  getCheckoutUrl: async (planId: string, frequency: 'Monthly' | 'Yearly'): Promise<{ id: string }> => {
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      // Mock Stripe session ID
      return { id: 'mock_session_id' };
    }
    
    const response = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idPlanOffer: planId, frequency }),
    });
    
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  },

  getCustomerPortalUrl: async (): Promise<{ url: string }> => {
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      return { url: 'https://mock-portal-url.stripe.com' };
    }
    
    const response = await fetch('/api/subscriptions/portal', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to get customer portal URL');
    return response.json();
  },

  changePlan: async (code: string): Promise<void> => {
    const isDevelopment = typeof window !== 'undefined' && 
      (!process.env.NEXT_PUBLIC_API_BASE_URL || window.location.hostname === 'localhost');
    
    if (isDevelopment) {
      // Mock change plan
      return Promise.resolve();
    }
    
    const response = await fetch('/api/subscriptions/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) throw new Error('Failed to change plan');
  },
};
