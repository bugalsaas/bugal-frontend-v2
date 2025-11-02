'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentFYDates, getLastFYDates, getLastMonthDates, getCurrentMonthDates, OrganizationForFiscalYear } from '@/lib/utils/fiscal-year';

interface DateRangeInputProps {
  disabled: boolean;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
}

export function DateRangeInput({ 
  disabled, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeInputProps) {
  const { user } = useAuth();
  
  // Build organization object for fiscal year calculation
  const organization: OrganizationForFiscalYear = {
    country: user?.organization ? {
      // Note: country info might need to be fetched separately if not in user object
      // For now, defaulting to Australian fiscal year (July 1)
      fyStartMonth: 7,
      fyStartDay: 1,
    } : undefined,
    timezone: user?.organization?.timezone,
  };

  const handleLastFY = () => {
    const { fyStart, fyEnd } = getLastFYDates(organization);
    onStartDateChange?.(fyStart);
    onEndDateChange?.(fyEnd);
  };

  const handleCurrentFY = () => {
    const { fyStart, fyEnd } = getCurrentFYDates(organization);
    onStartDateChange?.(fyStart);
    onEndDateChange?.(fyEnd);
  };

  const handleLastMonth = () => {
    const { start, end } = getLastMonthDates();
    onStartDateChange?.(start);
    onEndDateChange?.(end);
  };

  const handleCurrentMonth = () => {
    const { start, end } = getCurrentMonthDates();
    onStartDateChange?.(start);
    onEndDateChange?.(end);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-auto p-0 z-50 border bg-white shadow-md">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                captionLayout="dropdown"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
                disabled={disabled}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-auto p-0 z-50 border bg-white shadow-md">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                captionLayout="dropdown"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {!disabled && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleLastFY}
            disabled={disabled}
          >
            Last FY
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCurrentFY}
            disabled={disabled}
          >
            This FY
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleLastMonth}
            disabled={disabled}
          >
            Last Month
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCurrentMonth}
            disabled={disabled}
          >
            This Month
          </Button>
        </div>
      )}
    </div>
  );
}
