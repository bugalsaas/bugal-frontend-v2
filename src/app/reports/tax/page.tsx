'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Button } from '@/components/ui/button';
import { DateRangeInput } from '@/components/reports/date-range-input';
import { ReportSummary, ReportSummaryItem } from '@/components/reports/report-summary';
import { ReportBreakdown } from '@/components/reports/report-breakdown';
import { DescriptionItem } from '@/components/reports/description-item';
import { useReportTax } from '@/hooks/use-reports';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText, 
  Receipt, 
  Wallet,
  AlertCircle,
  Loader2,
  Briefcase,
  Repeat,
} from 'lucide-react';

const taxReportSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
});

type TaxReportFormValues = z.infer<typeof taxReportSchema>;

export default function TaxReportPage() {
  const { loading, obj, generate } = useReportTax();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const form = useForm<TaxReportFormValues>({
    resolver: zodResolver(taxReportSchema),
  });

  const { handleSubmit, setValue, formState: { errors } } = form;

  const handleGenerate = async (values: TaxReportFormValues) => {
    try {
      await generate({
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const renderExpenseType = (expenseType: string) => {
    const icon = expenseType === 'Reclaimable' ? 
      <Repeat className="h-4 w-4 inline mr-2" /> : 
      <Briefcase className="h-4 w-4 inline mr-2" />;
    
    return (
      <div className="flex items-center">
        {icon}
        <span>{expenseType}</span>
      </div>
    );
  };

  const headerConfig = {
    title: 'Tax Report',
    subtitle: 'Tax Report overview',
    icon: FileText,
    showAddButton: false,
  };

  return (
    <MainLayout activeNavItem="reports" headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Report Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
            <DateRangeInput
              disabled={loading}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(date) => {
                setStartDate(date);
                setValue('startDate', date || new Date(), { shouldValidate: true });
              }}
              onEndDateChange={(date) => {
                setEndDate(date);
                setValue('endDate', date || new Date(), { shouldValidate: true });
              }}
            />

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </div>

        {/* Report Summary */}
        {!loading && obj?.summary && (
          <ReportSummary>
            <ReportSummaryItem
              left={
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>Receipts</span>
                </div>
              }
              right={formatCurrency(obj.summary.receiptsTotalInclGst)}
            />
            <ReportSummaryItem
              left={
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Expenses</span>
                </div>
              }
              right={formatCurrency(obj.summary.expensesTotalInclGst)}
            />
            <ReportSummaryItem
              left={null}
              right={<strong>{formatCurrency(obj.summary.netTotalInclGst)}</strong>}
            />
          </ReportSummary>
        )}

        {/* Receipts Breakdown */}
        {!loading && obj?.receipts && obj.receipts.length > 0 && (
          <ReportBreakdown
            title="Receipts"
            data={obj.receipts}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>{item.invoice.code}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.amountInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Date" content={formatDate(new Date(item.date))} />
                <DescriptionItem title="Excl. GST" content={formatCurrency(item.amountExclGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.amountGst)} />
              </>
            )}
          />
        )}

        {/* Expenses Breakdown */}
        {!loading && obj?.expenses && obj.expenses.length > 0 && (
          <ReportBreakdown
            title="Expenses"
            data={obj.expenses}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>{formatDate(new Date(item.date))}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.amountInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Type" content={renderExpenseType(item.expenseType)} />
                <DescriptionItem title="Category" content={item.category} />
                <DescriptionItem title="Payee" content={item.payee} />
                <DescriptionItem title="Description" content={item.description} />
                <DescriptionItem title="Excl. GST" content={formatCurrency(item.amountExclGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.amountGst)} />
              </>
            )}
          />
        )}

        {/* Empty State */}
        {!loading && (!obj || (obj.receipts.length === 0 && obj.expenses.length === 0)) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              Generate a report to see tax data for the selected period.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
