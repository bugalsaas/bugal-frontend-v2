'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardPeriod } from '@/lib/api/dashboard-service';

interface PeriodSelectorProps {
  value: DashboardPeriod | string;
  onChange: (value: DashboardPeriod | string) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={DashboardPeriod.Current}>Current FY</SelectItem>
        <SelectItem value={DashboardPeriod.Previous}>Previous FY</SelectItem>
        <SelectItem value={DashboardPeriod.All}>All</SelectItem>
      </SelectContent>
    </Select>
  );
}

