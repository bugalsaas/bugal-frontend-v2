import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { subscriptionApi, PlansResponse, Promo } from '@/lib/api/subscription-service';

export function usePlans() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<PlansResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const plans = await subscriptionApi.getPlans();
      setData(plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return {
    data,
    isLoading,
    error,
    reloadList: loadPlans,
  };
}

export function usePromo() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<Promo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const promo = await subscriptionApi.getPromo();
      setData(promo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promo');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPromo();
  }, [loadPromo]);

  return {
    data,
    isLoading,
    error,
  };
}

export function useSubscriptionActions() {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const checkout = async (planId: string, frequency: 'Monthly' | 'Yearly'): Promise<{ id: string }> => {
    setIsSaving(true);
    try {
      const result = await subscriptionApi.getCheckoutUrl(planId, frequency);
      return result;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsSaving(true);
    try {
      const result = await subscriptionApi.getCustomerPortalUrl();
      window.location.href = result.url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const changePlan = async (code: string): Promise<void> => {
    setIsSaving(true);
    try {
      await subscriptionApi.changePlan(code);
    } catch (error) {
      console.error('Failed to change plan:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    checkout,
    openCustomerPortal,
    changePlan,
  };
}
