'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    </div>
  );
}
