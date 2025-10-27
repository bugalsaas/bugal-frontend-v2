// Dashboard API service
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  period: string;
  totalRevenue: number;
  totalShifts: number;
  totalHours: number;
  averageHourlyRate: number;
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
  async getStats(userId?: string): Promise<DashboardStats> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (userId && userId !== '-1') {
      params.append('user', userId);
    }

    const response = await fetch(`${API_BASE_URL}/dashboards/stats?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  async getTodaysShifts(userId?: string): Promise<DashboardShift[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (userId && userId !== '-1') {
      params.append('user', userId);
    }

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
    if (userId && userId !== '-1') {
      params.append('user', userId);
    }

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
    if (userId && userId !== '-1') {
      params.append('user', userId);
    }

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
    if (userId && userId !== '-1') {
      params.append('user', userId);
    }

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

  async getSummary(period: string = 'current'): Promise<DashboardSummary> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/dashboards/summary?period=${period}`, {
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

  async getRecentActivity(): Promise<RecentActivity[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/dashboards/recent-activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    return response.json();
  },
};
