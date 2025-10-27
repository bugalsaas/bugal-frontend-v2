/**
 * Mobile-first utility functions and patterns
 * Optimized for Bugal's mobile-heavy user base
 */

import { breakpoints, touchTargets } from './design-tokens';

/**
 * Mobile-first responsive class generator
 * Usage: responsive('text-sm', 'md:text-base', 'lg:text-lg')
 */
export function responsive(...classes: string[]): string {
  return classes.join(' ');
}

/**
 * Touch-friendly button classes
 * Ensures minimum 44px touch targets on mobile
 */
export const touchButton = {
  base: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
  sm: 'min-h-[40px] min-w-[40px] px-3 py-2 text-sm',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2 text-base',
  lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg',
} as const;

/**
 * Mobile-optimized spacing classes
 */
export const mobileSpacing = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-6 sm:py-8 lg:py-12',
  card: 'p-4 sm:p-6',
  button: 'px-4 py-2 sm:px-6 sm:py-3',
} as const;

/**
 * Mobile-first layout patterns
 */
export const mobileLayout = {
  // Stack on mobile, side-by-side on desktop
  stackToSide: 'flex flex-col sm:flex-row',
  // Grid that adapts to screen size
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // Mobile cards, desktop table
  cardToTable: 'block sm:hidden', // Show cards on mobile
  tableToCard: 'hidden sm:block', // Show table on desktop
} as const;

/**
 * Mobile navigation patterns
 */
export const mobileNav = {
  // Bottom navigation for mobile
  bottomNav: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden',
  // Sidebar for desktop
  sidebar: 'hidden sm:block sm:w-64 lg:w-72',
  // Mobile header
  header: 'sticky top-0 z-50 bg-white border-b border-gray-200',
} as const;

/**
 * Mobile-optimized form patterns
 */
export const mobileForm = {
  input: 'w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  error: 'text-sm text-destructive-500 mt-1',
  group: 'space-y-4 sm:space-y-6',
} as const;

/**
 * Mobile card patterns
 */
export const mobileCard = {
  base: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6',
  interactive: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer',
  elevated: 'bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6',
} as const;

/**
 * Mobile list patterns
 */
export const mobileList = {
  // Mobile: cards, Desktop: table rows
  item: 'block sm:table-row',
  // Mobile: vertical stack, Desktop: horizontal
  container: 'space-y-2 sm:space-y-0 sm:table',
  // Mobile: full width, Desktop: table cell
  cell: 'block sm:table-cell p-2 sm:p-4',
} as const;

/**
 * Mobile modal patterns
 */
export const mobileModal = {
  // Full screen on mobile, centered on desktop
  overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center',
  content: 'bg-white w-full sm:w-auto sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-y-auto',
  // Mobile: slide up from bottom, Desktop: fade in
  animation: 'transform transition-transform duration-300 ease-out translate-y-full sm:translate-y-0',
} as const;

/**
 * Mobile gesture patterns
 */
export const mobileGestures = {
  // Swipe indicators
  swipeHint: 'absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 sm:hidden',
  // Pull to refresh
  pullRefresh: 'relative overflow-hidden',
  // Touch feedback
  touchFeedback: 'active:scale-95 transition-transform duration-150',
} as const;

/**
 * Mobile typography patterns
 */
export const mobileTypography = {
  // Mobile: smaller text, Desktop: larger
  heading: 'text-xl sm:text-2xl lg:text-3xl font-bold',
  subheading: 'text-lg sm:text-xl font-semibold',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm text-gray-500',
  // Mobile: single line, Desktop: multi-line
  truncate: 'truncate sm:whitespace-normal',
} as const;

/**
 * Mobile-specific utilities
 */
export const mobileUtils = {
  // Hide on mobile, show on desktop
  hideOnMobile: 'hidden sm:block',
  // Show on mobile, hide on desktop
  showOnMobile: 'block sm:hidden',
  // Safe area for notched devices
  safeArea: 'pb-safe-area-inset-bottom',
  // Prevent zoom on input focus (iOS)
  preventZoom: 'text-base sm:text-sm',
  // Touch callout prevention
  noTouchCallout: 'touch-callout-none',
  // Smooth scrolling
  smoothScroll: 'scroll-smooth',
} as const;

/**
 * Mobile breakpoint helpers
 */
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < parseInt(breakpoints.sm);
export const isTablet = () => typeof window !== 'undefined' && window.innerWidth >= parseInt(breakpoints.sm) && window.innerWidth < parseInt(breakpoints.lg);
export const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= parseInt(breakpoints.lg);

/**
 * Mobile-first responsive hook
 */
export function useResponsive() {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: false };
  }
  
  return {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
  };
}

/**
 * Mobile-optimized class combinations
 */
export const mobileClasses = {
  // Common mobile patterns
  container: `${mobileSpacing.container} max-w-7xl mx-auto`,
  card: mobileCard.base,
  button: `${touchButton.md} ${mobileUtils.touchFeedback}`,
  input: mobileForm.input,
  // Mobile navigation
  navItem: `${touchButton.base} flex-col space-y-1 text-xs`,
  // Mobile list items
  listItem: `${mobileCard.interactive} ${mobileList.item}`,
  // Mobile modals
  modal: `${mobileModal.overlay} ${mobileModal.content}`,
} as const;
