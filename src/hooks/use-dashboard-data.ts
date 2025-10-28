'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { dashboardApi, DashboardStats, DashboardShift, DashboardSummary, RecentActivity, QuickAction } from '@/lib/api/dashboard-service';

export function useDashboardData(userId?: string) {
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
      
      const [
        todaysShiftsData,
        pendingShiftsData,
        unbilledShiftsData,
        overdueInvoicesData,
        summaryData,
      ] = await Promise.all([
        dashboardApi.getTodaysShifts(userId),
        dashboardApi.getPendingShifts(userId),
        dashboardApi.getUnbilledShifts(userId),
        dashboardApi.getOverdueInvoices(userId),
        dashboardApi.getSummary('current'),
      ]);

      setTodaysShifts(todaysShiftsData);
      setPendingShifts(pendingShiftsData);
      setUnbilledShifts(unbilledShiftsData);
      setOverdueInvoices(overdueInvoicesData);
      setSummary(summaryData);
      setRecentActivity([]); // Static for now - no backend endpoint
      setQuickActions([]); // Static for now
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

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