// Dashboard API services
// import { getToken } from '@/contexts/auth-context';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types for dashboard data
export interface DashboardStats {
  todaysShifts: number;
  pendingInvoices: number;
  activeContacts: number;
  monthlyRevenue: number;
  shiftsChange: string;
  invoicesChange: string;
  contactsChange: string;
  revenueChange: string;
}

export interface RecentActivity {
  id: string;
  type: 'shift' | 'invoice' | 'contact' | 'payment';
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

// API service functions (commented out for now)
/*
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        if (response.status === 0 || !response.status) {
          throw new Error('Backend server is not running');
        }
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server');
      }
      throw error;
    }
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        if (response.status === 0 || !response.status) {
          throw new Error('Backend server is not running');
        }
        throw new Error('Failed to fetch recent activity');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server');
      }
      throw error;
    }
  },

  async getQuickActions(): Promise<QuickAction[]> {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/quick-actions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        if (response.status === 0 || !response.status) {
          throw new Error('Backend server is not running');
        }
        throw new Error('Failed to fetch quick actions');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server');
      }
      throw error;
    }
  },
};
*/

// Mock data for development mode
export const mockDashboardData = {
  stats: {
    todaysShifts: 12,
    pendingInvoices: 8,
    activeContacts: 156,
    monthlyRevenue: 12450,
    shiftsChange: '+2 from yesterday',
    invoicesChange: '3 overdue',
    contactsChange: '+5 this week',
    revenueChange: '+8.2%',
  } as DashboardStats,

  recentActivity: [
    {
      id: '1',
      type: 'shift' as const,
      title: 'Shift completed',
      subtitle: '2 hours ago',
      value: '8:00 AM - 4:00 PM',
      badge: 'Completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'invoice' as const,
      title: 'Invoice #1234 sent',
      subtitle: '4 hours ago',
      value: '$450.00',
      badge: 'Sent',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'contact' as const,
      title: 'New contact added',
      subtitle: 'Yesterday',
      value: 'John Smith',
      badge: 'New',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'payment' as const,
      title: 'Payment received',
      subtitle: '2 days ago',
      value: '$1,200.00',
      badge: 'Paid',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ] as RecentActivity[],

  quickActions: [
    {
      id: 'add-shift',
      title: 'Add New Shift',
      description: 'Create a new shift entry',
      icon: 'Calendar',
      href: '/shifts/new',
    },
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: 'FileText',
      href: '/invoices/new',
    },
    {
      id: 'add-contact',
      title: 'Add Contact',
      description: 'Add a new contact',
      icon: 'Users',
      href: '/contacts/new',
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Check your analytics',
      icon: 'TrendingUp',
      href: '/reports',
    },
  ] as QuickAction[],
};
