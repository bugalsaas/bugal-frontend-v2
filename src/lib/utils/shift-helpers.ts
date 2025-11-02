import { Shift } from '@/lib/api/shifts-service';

/**
 * Get color for shift status
 */
export function getShiftStatusColor(shiftStatus: string, startDate?: Date): string {
  const now = new Date();
  
  if (shiftStatus === 'Completed') {
    return '#52c41a'; // GREEN
  }
  if (shiftStatus === 'Cancelled') {
    return '#ff4d4f'; // RED
  }
  if (shiftStatus === 'Pending' && startDate && now > startDate) {
    return '#fa8c16'; // ORANGE
  }
  return '#8c8c8c'; // GRAY
}

/**
 * Get border color for shift status (for left border styling)
 * Returns a hex color value for use with inline styles
 */
export function getStatusBorderColor(shiftStatus: string, startDate?: string): string {
  const startDateObj = startDate ? new Date(startDate) : undefined;
  return getShiftStatusColor(shiftStatus, startDateObj);
}

/**
 * Get badge variant for shift status
 */
export function getShiftStatusBadgeVariant(shiftStatus: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (shiftStatus === 'Completed') {
    return 'default'; // Usually green
  }
  if (shiftStatus === 'Cancelled') {
    return 'destructive'; // Red
  }
  if (shiftStatus === 'Pending') {
    return 'secondary'; // Gray/orange
  }
  return 'outline';
}

/**
 * Group shifts by date key (YYYY-MM-DD format)
 */
export function groupShiftsByDate(shifts: Shift[]): Map<string, Shift[]> {
  const grouped = new Map<string, Shift[]>();
  
  shifts.forEach((shift) => {
    const dateKey = new Date(shift.startDate).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(shift);
  });
  
  return grouped;
}

/**
 * Format date header with day of week, day of month, month, and today indicator
 */
export function formatDateHeader(dateKey: string, timezone?: string): {
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  isToday: boolean;
} {
  const date = new Date(dateKey + 'T00:00:00');
  const today = getTodayInTimezone(timezone);
  const isToday = dateKey === today;
  
  const dayOfWeek = date.toLocaleDateString('en-AU', { weekday: 'short' });
  const dayOfMonth = date.getDate().toString();
  const month = date.toLocaleDateString('en-AU', { month: 'short' });
  
  return {
    dayOfWeek,
    dayOfMonth,
    month,
    isToday,
  };
}

/**
 * Format shift date and time
 */
export function formatShiftDateTime(dateString: string): {
  date: string;
  time: string;
} {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  return {
    date: dateStr,
    time: timeStr,
  };
}

/**
 * Format shift duration (seconds to Xh Ym format)
 */
export function formatShiftDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Get today's date string in YYYY-MM-DD format for the given timezone
 */
export function getTodayInTimezone(timezone?: string): string {
  const now = timezone 
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
