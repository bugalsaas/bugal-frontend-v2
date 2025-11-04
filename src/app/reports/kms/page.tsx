'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeInput } from '@/components/reports/date-range-input';
import { ReportSummary, ReportSummaryItem } from '@/components/reports/report-summary';
import { ReportBreakdown } from '@/components/reports/report-breakdown';
import { DescriptionItem } from '@/components/reports/description-item';
import { useReportKm } from '@/hooks/use-reports';
import { useContacts } from '@/hooks/use-contacts';
import { UserSelector } from '@/components/ui/user-selector';
import { formatCurrency, formatDate } from '@/lib/utils';
import { format as formatDateFns } from 'date-fns';
import { 
  FileText, 
  Car, 
  AlertCircle,
  Loader2,
} from 'lucide-react';

const kmsReportSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  idAssignee: z.string().min(1, 'Assignee is required'),
  idContact: z.string().min(1, 'Contact is required'),
});

type KmsReportFormValues = z.infer<typeof kmsReportSchema>;

export default function KmsReportPage() {
  const { loading, obj, generate } = useReportKm();
  const { data: contacts } = useContacts();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const form = useForm<KmsReportFormValues>({
    resolver: zodResolver(kmsReportSchema),
    defaultValues: {
      idAssignee: '-1',
      idContact: '-1',
    },
  });

  const { handleSubmit, setValue, watch, formState: { errors } } = form;

  const handleGenerate = async (values: KmsReportFormValues) => {
    try {
      await generate({
        startDate: formatDateFns(values.startDate, 'yyyy-MM-dd'),
        endDate: formatDateFns(values.endDate, 'yyyy-MM-dd'),
        idAssignee: values.idAssignee,
        idContact: values.idContact,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const headerConfig = {
    title: 'Kilometres Report',
    subtitle: 'KMS Report overview',
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee *
                </label>
                <UserSelector
                  value={watch('idAssignee')}
                  onValueChange={(value) => setValue('idAssignee', value, { shouldValidate: true })}
                />
                {errors.idAssignee && (
                  <p className="text-red-500 text-sm mt-1">{errors.idAssignee.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact *
                </label>
                <Select
                  value={watch('idContact')}
                  onValueChange={(value) => setValue('idContact', value, { shouldValidate: true })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">All Contacts</SelectItem>
                    {(contacts || []).map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idContact && (
                  <p className="text-red-500 text-sm mt-1">{errors.idContact.message}</p>
                )}
              </div>
            </div>

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
              left="Number of expenses"
              right={obj.summary.count.toString()}
            />
            <ReportSummaryItem
              left="Kilometres"
              right={obj.summary.kms.toString()}
            />
            <ReportSummaryItem
              left="Total"
              right={formatCurrency(obj.summary.totalInclGst)}
            />
          </ReportSummary>
        )}

        {/* Report Breakdown */}
        {!loading && obj?.data && obj.data.length > 0 && (
          <ReportBreakdown
            title="Breakdown"
            data={obj.data}
            renderLeft={(item) => (
              <span>{formatDate(new Date(item.date))}</span>
            )}
            renderRight={(item) => formatCurrency(item.amountInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Contact" content={item.contact?.fullName || '-'} />
                <DescriptionItem title="Assignee" content={item.shift?.assignee?.fullName || '-'} />
                <DescriptionItem title="Kilometres" content={item.kms?.toString() || '0'} />
                <DescriptionItem title="Amount GST" content={formatCurrency(item.amountGst || 0)} />
              </>
            )}
          />
        )}

        {/* Empty State */}
        {!loading && (!obj || obj.data.length === 0) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              Generate a report to see kilometre expense data for the selected criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
