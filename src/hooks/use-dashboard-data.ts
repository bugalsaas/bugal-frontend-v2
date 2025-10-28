'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { dashboardApi, DashboardStats, DashboardShift, DashboardSummary, DashboardPeriod, RecentActivity, QuickAction } from '@/lib/api/dashboard-service';

export function useDashboardData(userId?: string, period?: DashboardPeriod | string) {
  const [todaysShifts, setTodaysShifts] = useState<DashboardShift[]>([]);
  const [pendingShifts, setPendingShifts] = useState<number>(0);
  const [unbilledShifts, setUnbilledShifts] = useState<number>(0);
  const [overdueInvoices, setOverdueInvoices] = useState<number>(0);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch real data from API
      console.log('Fetching real dashboard data');
      
      try {
        const [
          todaysShiftsData,
          pendingShiftsData,
          unbilledShiftsData,
          overdueInvoicesData,
        ] = await Promise.all([
          dashboardApi.getTodaysShifts(userId),
          dashboardApi.getPendingShifts(userId),
          dashboardApi.getUnbilledShifts(userId),
          dashboardApi.getOverdueInvoices(userId),
        ]);

        setTodaysShifts(todaysShiftsData);
        setPendingShifts(pendingShiftsData);
        setUnbilledShifts(unbilledShiftsData);
        setOverdueInvoices(overdueInvoicesData);

        // Try to fetch summary, but don't fail if it errors
        try {
          const summaryData = await dashboardApi.getSummary(period || DashboardPeriod.Current, userId);
          setSummary(summaryData);
        } catch (summaryError) {
          console.warn('Failed to fetch summary data:', summaryError);
          setSummary(null);
        }
      } catch (mainError) {
        console.error('Error fetching dashboard data:', mainError);
        throw mainError;
      }
      
      setRecentActivity([]); // Static for now - no backend endpoint
      setQuickActions([]); // Static for now
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshData = async () => {
    await fetchDashboardData();
  };

  return {
    todaysShifts,
    pendingShifts,
    unbilledShifts,
    overdueInvoices,
    summary,
    recentActivity,
    quickActions,
    isLoading,
    error,
    refreshData,
  };
}