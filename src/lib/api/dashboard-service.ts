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

// Mock data for development mode
export const mockDashboardData = {
  stats: {
    todaysShifts: 12,
    pendingShifts: 5,
    unbilledShifts: 8,
    overdueInvoices: 3,
    monthlyRevenue: 12450,
    shiftsChange: "+2 from yesterday",
    invoicesChange: "3 overdue",
    contactsChange: "+5 this week",
    revenueChange: "+8.2%",
  },
  todaysShifts: [
    {
      id: '1',
      title: 'Morning Shift',
      startDate: '2024-10-26T08:00:00Z',
      endDate: '2024-10-26T12:00:00Z',
      status: 'Scheduled',
      client: 'John Smith',
      staff: 'Andrew Giles',
    },
    {
      id: '2',
      title: 'Afternoon Shift',
      startDate: '2024-10-26T13:00:00Z',
      endDate: '2024-10-26T17:00:00Z',
      status: 'Scheduled',
      client: 'Sarah Johnson',
      staff: 'Andrew Giles',
    },
  ],
  summary: {
    period: 'current',
    totalRevenue: 12450,
    totalShifts: 156,
    totalHours: 1248,
    averageHourlyRate: 45.50,
  },
  recentActivity: [
    { id: '1', title: "Shift completed", subtitle: "2 hours ago", value: "8:00 AM - 4:00 PM", badge: "Completed", timestamp: "2024-10-26T14:00:00Z" },
    { id: '2', title: "Invoice #1234 sent", subtitle: "4 hours ago", value: "$450.00", badge: "Sent", timestamp: "2024-10-26T12:00:00Z" },
    { id: '3', title: "New contact added", subtitle: "Yesterday", value: "John Smith", badge: "New", timestamp: "2024-10-25T16:00:00Z" },
    { id: '4', title: "Payment received", subtitle: "2 days ago", value: "$1,200.00", badge: "Paid", timestamp: "2024-10-24T10:00:00Z" },
  ],
  quickActions: [
    { id: 'add-shift', title: "Add New Shift", description: "Create a new shift entry", icon: "Calendar", href: "/shifts/new" },
    { id: 'create-invoice', title: "Create Invoice", description: "Generate a new invoice", icon: "FileText", href: "/invoices/new" },
    { id: 'add-contact', title: "Add Contact", description: "Add a new contact", icon: "Users", href: "/contacts/new" },
    { id: 'view-reports', title: "View Reports", description: "Check your analytics", icon: "TrendingUp", href: "/reports" },
  ],
};
