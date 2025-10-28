// Dashboard API service
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Dashboard period enum
export enum DashboardPeriod {
  All = 'all',
  Current = 'current',
  Previous = 'previous',
}

// Types for dashboard data
export interface DashboardStats {
  todaysShifts: number;
  pendingShifts: number;
  unbilledShifts: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  shiftsChange: string;
  invoicesChange: string;
  contactsChange: string;
  revenueChange: string;
}

export interface DashboardShift {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  client: string;
  staff: string;
}

export interface DashboardSummary {
  shiftsCompleted: number;
  timeWorked: string;
  totalDuration: number;
  estimatedTax: number;
  estimatedSuper: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  badge: string;
  timestamp: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
}

// API service functions
export const dashboardApi = {

  async getTodaysShifts(userId?: string): Promise<DashboardShift[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    // Always pass user parameter - use '-1' for all users if no specific user provided
    params.append('user', userId || '-1');

    const response = await fetch(`${API_BASE_URL}/dashboards/shifts/today?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch today\'s shifts');
    }

    return response.json();
  },

  async getPendingShifts(userId?: string): Promise<number> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    // Always pass user parameter - use '-1' for all users if no specific user provided
    params.append('user', userId || '-1');

    const response = await fetch(`${API_BASE_URL}/dashboards/shifts/incomplete?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending shifts');
    }

    const data = await response.json();
    return data.count || data;
  },

  async getUnbilledShifts(userId?: string): Promise<number> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    // Always pass user parameter - use '-1' for all users if no specific user provided
    params.append('user', userId || '-1');

    const response = await fetch(`${API_BASE_URL}/dashboards/shifts/unbilled?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unbilled shifts');
    }

    const data = await response.json();
    return data.count || data;
  },

  async getOverdueInvoices(userId?: string): Promise<number> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    // Always pass user parameter - use '-1' for all users if no specific user provided
    params.append('user', userId || '-1');

    const response = await fetch(`${API_BASE_URL}/dashboards/invoices/overdue?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue invoices');
    }

    const data = await response.json();
    return data.count || data;
  },

  async getSummary(period: DashboardPeriod | string = DashboardPeriod.Current, userId?: string): Promise<DashboardSummary> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    params.append('period', period);
    // Always pass user parameter - use '-1' for all users if no specific user provided
    params.append('user', userId || '-1');

    const response = await fetch(`${API_BASE_URL}/dashboards/summary?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary');
    }

    return response.json();
  },
};
