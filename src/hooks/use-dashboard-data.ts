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
      
      const results = await Promise.allSettled([
        dashboardApi.getTodaysShifts(userId),
        dashboardApi.getPendingShifts(userId),
        dashboardApi.getUnbilledShifts(userId),
        dashboardApi.getOverdueInvoices(userId),
        dashboardApi.getSummary(period || DashboardPeriod.Current, userId),
      ]);

      // Handle each result separately
      if (results[0].status === 'fulfilled') {
        setTodaysShifts(results[0].value);
      } else {
        console.error('Failed to fetch today\'s shifts:', results[0].reason);
        setTodaysShifts([]);
      }

      if (results[1].status === 'fulfilled') {
        setPendingShifts(results[1].value);
      } else {
        console.error('Failed to fetch pending shifts:', results[1].reason);
        setPendingShifts(0);
      }

      if (results[2].status === 'fulfilled') {
        setUnbilledShifts(results[2].value);
      } else {
        console.error('Failed to fetch unbilled shifts:', results[2].reason);
        setUnbilledShifts(0);
      }

      if (results[3].status === 'fulfilled') {
        setOverdueInvoices(results[3].value);
      } else {
        console.error('Failed to fetch overdue invoices:', results[3].reason);
        setOverdueInvoices(0);
      }

      if (results[4].status === 'fulfilled') {
        setSummary(results[4].value);
      } else {
        console.error('Failed to fetch summary:', results[4].reason);
        setSummary(null);
      }

      setRecentActivity([]); // Static for now - no backend endpoint
      setQuickActions([]); // Static for now
      
      // Only set error state if ALL endpoints failed
      const allFailed = results.every(result => result.status === 'rejected');
      if (allFailed) {
        setError('Failed to load dashboard data. Please try again.');
      } else {
        setError(null);
      }
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