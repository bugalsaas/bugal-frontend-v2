/**
 * Navigation Configuration
 * Centralized navigation items for consistent layout across all pages
 */

import { 
  Home as HomeIcon,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Receipt,
  DollarSign,
  FileCheck,
  Building2,
  Bell,
  Search,
  Filter,
  Plus
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number | null;
  isActive?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: HomeIcon, 
    href: '/', 
    badge: null 
  },
  { 
    id: 'contacts', 
    label: 'Contacts', 
    icon: Users, 
    href: '/contacts', 
    badge: null 
  },
  { 
    id: 'shifts', 
    label: 'Shifts', 
    icon: Calendar, 
    href: '/shifts', 
    badge: null 
  },
  { 
    id: 'expenses', 
    label: 'Expenses', 
    icon: Receipt, 
    href: '/expenses', 
    badge: null 
  },
  { 
    id: 'rates', 
    label: 'Rates', 
    icon: DollarSign, 
    href: '/rates', 
    badge: null 
  },
  { 
    id: 'agreements', 
    label: 'Agreements', 
    icon: FileCheck, 
    href: '/agreements', 
    badge: null 
  },
  { 
    id: 'organizations', 
    label: 'Organizations', 
    icon: Building2, 
    href: '/organizations', 
    badge: null 
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: Users, 
    href: '/users', 
    badge: null 
  },
  { 
    id: 'invoices', 
    label: 'Invoiced', 
    icon: FileText, 
    href: '/invoices', 
    badge: null 
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: TrendingUp, 
    href: '/reports', 
    badge: null 
  },
];

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  searchPlaceholder?: string;
}

export interface MainLayoutProps {
  children: React.ReactNode;
  activeNavItem: string;
  headerConfig: PageHeaderConfig;
  notifications?: number;
  user?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
}
