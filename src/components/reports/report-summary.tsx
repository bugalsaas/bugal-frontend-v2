'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface ReportSummaryProps {
  children: React.ReactNode;
}

interface ReportSummaryItemProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function ReportSummary({ children }: ReportSummaryProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="space-y-3">
        {children}
      </div>
    </Card>
  );
}

export function ReportSummaryItem({ left, right }: ReportSummaryItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-sm font-medium text-gray-700">
        {left}
      </div>
      <div className="text-sm font-semibold text-gray-900">
        {right}
      </div>
    </div>
  );
}
