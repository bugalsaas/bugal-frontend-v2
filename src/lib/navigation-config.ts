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
    id: 'agreements', 
    label: 'Service agreements', 
    icon: FileCheck, 
    href: '/agreements', 
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
    id: 'shifts', 
    label: 'Shifts', 
    icon: Calendar, 
    href: '/shifts', 
    badge: null 
  },
  { 
    id: 'invoices', 
    label: 'Invoices', 
    icon: FileText, 
    href: '/invoices', 
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
  customFilterComponent?: React.ReactNode; // Custom filter component to render in header row
  activeFilterCount?: number; // Number of active filters for badge indicator
  drawerTitle?: string; // Optional custom title for drawer (defaults to "Search & Filters")
  showAddButtonInDrawer?: boolean; // Whether to show Add button in drawer (default: true if showAddButton is true)
  onApply?: () => void; // Callback for Apply button (if provided, shows Apply/Clear instead of Add button)
  onClear?: () => void; // Callback for Clear button
  onDrawerOpenChange?: (isOpen: boolean) => void; // Callback when drawer open state changes
  // Desktop-only visibility controls (mobile drawer unaffected)
  hideSearchInDesktop?: boolean;
  hideCustomFilterInDesktop?: boolean;
  hideFiltersButtonInDesktop?: boolean; // Hide Filters button from desktop MainLayout header
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
