import { startOfDay, setMonth, setDate, addYears, subYears, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Organization with country information for fiscal year calculation
 */
export interface OrganizationForFiscalYear {
  country?: {
    fyStartMonth?: number; // 1-12 (January = 1, July = 7)
    fyStartDay?: number; // 1-31
  };
  timezone?: string;
}

/**
 * Get current fiscal year dates based on organization settings
 * Matches the logic from the original frontend implementation
 * @param organization - Organization with country fiscal year settings
 * @returns Fiscal year start, end, and current date information
 */
export function getCurrentFYDates(organization: OrganizationForFiscalYear) {
  const now = new Date();
  const startOfToday = startOfDay(now);
  
  // Default to July 1st if not specified (Australian fiscal year)
  const fyStartMonth = organization.country?.fyStartMonth ?? 7; // 1-based month (July = 7)
  const fyStartDay = organization.country?.fyStartDay ?? 1;
  
  // Get current month (1-based for comparison) and year
  const currentMonth = now.getMonth() + 1; // Convert to 1-based
  const currentYear = now.getFullYear();
  
  // Determine fiscal year: if current month is before FY start month, use previous year
  const fyYear = currentMonth >= fyStartMonth ? currentYear : currentYear - 1;
  
  // Calculate fiscal year start date (fyStartMonth is 1-based, so subtract 1 for Date constructor)
  const fyStart = startOfDay(setDate(setMonth(new Date(fyYear, fyStartMonth - 1, 1), fyStartDay), fyStartDay));
  
  // Calculate fiscal year end date (1 millisecond before next FY start)
  const nextFYStart = addYears(fyStart, 1);
  const fyEnd = new Date(nextFYStart.getTime() - 1);
  
  return {
    fyStart,
    fyEnd,
    now,
    startOfDay: startOfToday,
  };
}

/**
 * Get previous fiscal year dates
 */
export function getLastFYDates(organization: OrganizationForFiscalYear) {
  const currentFY = getCurrentFYDates(organization);
  const lastFYStart = subYears(currentFY.fyStart, 1);
  const lastFYEnd = subYears(currentFY.fyEnd, 1);
  
  return {
    fyStart: lastFYStart,
    fyEnd: lastFYEnd,
  };
}

/**
 * Get last month dates
 */
export function getLastMonthDates() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  
  return {
    start: lastMonthStart,
    end: lastMonthEnd,
  };
}

/**
 * Get current month dates
 */
export function getCurrentMonthDates() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  
  return {
    start: currentMonthStart,
    end: currentMonthEnd,
  };
}
