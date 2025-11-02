import { Shift, ShiftStatus } from '@/lib/api/shifts-service';

export function getStatusColor(status: ShiftStatus): string {
  switch (status) {
    case ShiftStatus.Completed:
      return 'border-l-green-500';
    case ShiftStatus.Cancelled:
      return 'border-l-red-500';
    case ShiftStatus.Pending:
      return 'border-l-orange-500';
    default:
      return 'border-l-gray-300';
  }
}

export function getStatusBorderColor(status: ShiftStatus, startDate: string): string {
  const now = new Date();
  const shiftDate = new Date(startDate);
  
  if (status === ShiftStatus.Completed) {
    return 'border-l-green-500';
  }
  if (status === ShiftStatus.Cancelled) {
    return 'border-l-red-500';
  }
  if (status === ShiftStatus.Pending && now > shiftDate) {
    return 'border-l-orange-500';
  }
  return 'border-l-gray-300';
}

export function formatShiftDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function formatShiftDateTime(dateString: string): {
  date: string;
  time: string;
  datetime: string;
} {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return {
    date: dateStr,
    time: timeStr,
    datetime: `${dateStr} ${timeStr}`,
  };
}

/**
 * Get today's date string (YYYY-MM-DD) in a specific timezone
 * @param timezone - IANA timezone string (e.g., 'Australia/Sydney')
 * @returns Date string in YYYY-MM-DD format for today in the specified timezone
 */
export function getTodayInTimezone(timezone?: string): string {
  const now = new Date();
  
  if (!timezone) {
    // Fallback to browser's local timezone
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }
  
  // Get the current date string in the specified timezone (YYYY-MM-DD)
  // en-CA locale gives YYYY-MM-DD format
  return now.toLocaleDateString('en-CA', { timeZone: timezone });
}

export function formatDateHeader(dateString: string, timezone?: string): {
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  isToday: boolean;
} {
  const date = new Date(dateString);
  const todayStr = getTodayInTimezone(timezone);
  
  // Get the date string for the given date in the specified timezone
  const dateStr = timezone
    ? date.toLocaleDateString('en-CA', { timeZone: timezone })
    : date.toISOString().split('T')[0];
  
  const isToday = dateStr === todayStr;
  
  // Format the date display using the timezone if provided
  const baseOptions: Intl.DateTimeFormatOptions = timezone
    ? { timeZone: timezone }
    : {};
  
  const dayOfWeek = date.toLocaleDateString('en-AU', { ...baseOptions, weekday: 'short' });
  const dayOfMonth = date.toLocaleDateString('en-AU', { ...baseOptions, day: 'numeric' });
  const month = date.toLocaleDateString('en-AU', { ...baseOptions, month: 'short' });
  
  return {
    dayOfWeek,
    dayOfMonth,
    month,
    isToday,
  };
}

export function getShiftStatusBadgeVariant(status: ShiftStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case ShiftStatus.Completed:
      return 'default';
    case ShiftStatus.Cancelled:
      return 'destructive';
    case ShiftStatus.Pending:
      return 'secondary';
    default:
      return 'outline';
  }
}

export function groupShiftsByDate(shifts: Shift[]): Map<string, Shift[]> {
  const grouped = new Map<string, Shift[]>();
  
  for (const shift of shifts) {
    const dateKey = new Date(shift.startDate).toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, shift]);
  }
  
  return grouped;
}

