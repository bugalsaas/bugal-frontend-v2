import { Home, Users, FileText, DollarSign, CalendarDays, Receipt, BarChartBig } from 'lucide-react';
import { ComponentType } from 'react';

export interface MobileNavConfigItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  requiresAdmin?: boolean;
}

export const mobileNavItems: MobileNavConfigItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'contacts', label: 'Contacts', href: '/contacts', icon: Users },
  { id: 'agreements', label: 'Service agreements', href: '/agreements', icon: FileText },
  { id: 'rates', label: 'Rates', href: '/rates', icon: DollarSign },
  { id: 'shifts', label: 'Shifts', href: '/shifts', icon: CalendarDays },
  { id: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText },
  { id: 'expenses', label: 'Expenses', href: '/expenses', icon: Receipt },
  { id: 'reports', label: 'Reports', href: '/reports', icon: BarChartBig },
];

export function filterMobileNavItems(items: MobileNavConfigItem[], { isAdmin }: { isAdmin?: boolean } = {}) {
  return items.filter((i) => (i.requiresAdmin ? !!isAdmin : true));
}


