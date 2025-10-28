'use client';

import { Card } from '@/components/ui/card';
import { DashboardSummary as DashboardSummaryType } from '@/lib/api/dashboard-service';
import { formatCurrency } from '@/lib/utils';

interface DashboardSummaryProps {
  summary: DashboardSummaryType | null;
  isAdmin: boolean;
  organizationType?: string;
  isLoading?: boolean;
}

export function DashboardSummary({ summary, isAdmin, organizationType, isLoading }: DashboardSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(isAdmin ? 6 : 2)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-gray-500">
        No summary data available
      </div>
    );
  }

  const isCompany = organizationType === 'Company';

  // Cards shown to all users
  const commonCards = [
    {
      label: 'COMPLETED',
      value: `${summary.shiftsCompleted || 0} Shifts`,
      color: 'bg-[#1ED283]',
      textColor: 'text-white',
    },
    {
      label: 'HOURS WORKED',
      value: summary.timeWorked || '0h 0m',
      color: 'bg-[#8425FF]',
      textColor: 'text-white',
    },
  ];

  // Additional cards shown only to admin users
  const adminCards = [
    {
      label: 'EST. INCOME TAX',
      value: formatCurrency(summary.estimatedTax || 0),
      color: 'bg-[#FC505D]',
      textColor: 'text-white',
    },
    {
      label: 'EST. SUPER A.',
      value: isCompany ? 'N/A' : formatCurrency(summary.estimatedSuper || 0),
      color: 'bg-[#389EFF]',
      textColor: 'text-white',
    },
    {
      label: 'INCOME',
      value: formatCurrency(summary.totalIncome || 0),
      color: 'bg-[#E9F4FF]',
      textColor: 'text-[#43A2FB]',
      border: 'border-[3px] border-[#43A2FB]',
    },
    {
      label: 'EXPENSES',
      value: formatCurrency(summary.totalExpenses || 0),
      color: 'bg-[#f5dcdc]',
      textColor: 'text-[#FC474F]',
      border: 'border-[3px] border-[#FC474F]',
    },
  ];

  const cardsToDisplay = isAdmin ? [...commonCards, ...adminCards] : commonCards;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-2'} gap-4`}>
      {cardsToDisplay.map((card, index) => (
        <div
          key={index}
          className={`${card.color} ${card.textColor} ${card.border || ''} rounded-[10px] p-4 text-center`}
        >
          <div className="text-lg font-bold mb-1">
            {card.value}
          </div>
          <div className="text-sm">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}

