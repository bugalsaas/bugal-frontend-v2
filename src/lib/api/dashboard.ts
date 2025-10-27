// Dashboard API services
import { getToken } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

// Note: Dashboard API uses the dashboard-service.ts file
// This file is kept for type exports only
