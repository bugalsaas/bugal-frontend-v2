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

export function formatDateHeader(dateString: string): {
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  isToday: boolean;
} {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  const isToday = compareDate.getTime() === today.getTime();
  
  return {
    dayOfWeek: date.toLocaleDateString('en-AU', { weekday: 'short' }),
    dayOfMonth: date.getDate().toString(),
    month: date.toLocaleDateString('en-AU', { month: 'short' }),
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

