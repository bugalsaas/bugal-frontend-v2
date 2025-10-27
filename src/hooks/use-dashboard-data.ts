'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { dashboardApi, DashboardStats, DashboardShift, DashboardSummary, RecentActivity, QuickAction } from '@/lib/api/dashboard-service';

export function useDashboardData(userId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
        statsData,
        todaysShiftsData,
        pendingShiftsData,
        unbilledShiftsData,
        overdueInvoicesData,
        summaryData,
        recentActivityData,
      ] = await Promise.all([
        dashboardApi.getStats(userId),
        dashboardApi.getTodaysShifts(userId),
        dashboardApi.getPendingShifts(userId),
        dashboardApi.getUnbilledShifts(userId),
        dashboardApi.getOverdueInvoices(userId),
        dashboardApi.getSummary('current'),
        dashboardApi.getRecentActivity(),
      ]);

      setStats(statsData);
      setTodaysShifts(todaysShiftsData);
      setPendingShifts(pendingShiftsData);
      setUnbilledShifts(unbilledShiftsData);
      setOverdueInvoices(overdueInvoicesData);
      setSummary(summaryData);
      setRecentActivity(recentActivityData);
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
    stats,
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