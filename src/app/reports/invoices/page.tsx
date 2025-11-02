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
import { useReportInvoice } from '@/hooks/use-reports';
import { useContacts } from '@/hooks/use-contacts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

const invoiceReportSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  idContact: z.string().min(1, 'Contact is required'),
});

type InvoiceReportFormValues = z.infer<typeof invoiceReportSchema>;

export default function InvoicesReportPage() {
  const { loading, obj, generate } = useReportInvoice();
  const { contacts } = useContacts();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const form = useForm<InvoiceReportFormValues>({
    resolver: zodResolver(invoiceReportSchema),
    defaultValues: {
      idContact: '-1',
    },
  });

  const { handleSubmit, setValue, watch, formState: { errors } } = form;

  const handleGenerate = async (values: InvoiceReportFormValues) => {
    try {
      await generate({
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        idContact: values.idContact,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'unpaid':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'written off':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const headerConfig = {
    title: 'Invoice Report',
    subtitle: 'Invoices Report overview',
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact
              </label>
              <Select
                value={watch('idContact')}
                onValueChange={(value) => setValue('idContact', value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">All Contacts</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idContact && (
                <p className="text-red-500 text-sm mt-1">{errors.idContact.message}</p>
              )}
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
              left={
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Paid</span>
                </div>
              }
              right={formatCurrency(obj.summary.paid)}
            />
            <ReportSummaryItem
              left={
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span>Unpaid</span>
                </div>
              }
              right={formatCurrency(obj.summary.unpaid)}
            />
            <ReportSummaryItem
              left={
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>Overdue</span>
                </div>
              }
              right={formatCurrency(obj.summary.overdue)}
            />
            <ReportSummaryItem
              left={
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-gray-600" />
                  <span>Written Off</span>
                </div>
              }
              right={formatCurrency(obj.summary.writtenOff)}
            />
          </ReportSummary>
        )}

        {/* Paid Invoices */}
        {!loading && obj?.paid && obj.paid.length > 0 && (
          <ReportBreakdown
            title="Paid Invoices"
            data={obj.paid}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{item.code}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.totalInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Contact" content={item.contact.fullName} />
                <DescriptionItem title="Invoice Date" content={formatDate(new Date(item.date))} />
                <DescriptionItem title="Due Date" content={formatDate(new Date(item.dueDate))} />
                <DescriptionItem title="Amount Excl. GST" content={formatCurrency(item.totalInclGst - item.totalGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.totalGst)} />
              </>
            )}
          />
        )}

        {/* Unpaid Invoices */}
        {!loading && obj?.unpaid && obj.unpaid.length > 0 && (
          <ReportBreakdown
            title="Unpaid Invoices"
            data={obj.unpaid}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{item.code}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.totalInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Contact" content={item.contact.fullName} />
                <DescriptionItem title="Invoice Date" content={formatDate(new Date(item.date))} />
                <DescriptionItem title="Due Date" content={formatDate(new Date(item.dueDate))} />
                <DescriptionItem title="Amount Excl. GST" content={formatCurrency(item.totalInclGst - item.totalGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.totalGst)} />
              </>
            )}
          />
        )}

        {/* Overdue Invoices */}
        {!loading && obj?.overdue && obj.overdue.length > 0 && (
          <ReportBreakdown
            title="Overdue Invoices"
            data={obj.overdue}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{item.code}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.totalInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Contact" content={item.contact.fullName} />
                <DescriptionItem title="Invoice Date" content={formatDate(new Date(item.date))} />
                <DescriptionItem title="Due Date" content={formatDate(new Date(item.dueDate))} />
                <DescriptionItem title="Amount Excl. GST" content={formatCurrency(item.totalInclGst - item.totalGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.totalGst)} />
              </>
            )}
          />
        )}

        {/* Written Off Invoices */}
        {!loading && obj?.writtenOff && obj.writtenOff.length > 0 && (
          <ReportBreakdown
            title="Written Off Invoices"
            data={obj.writtenOff}
            renderLeft={(item) => (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{item.code}</span>
              </div>
            )}
            renderRight={(item) => formatCurrency(item.totalInclGst)}
            renderItem={(item) => (
              <>
                <DescriptionItem title="Contact" content={item.contact.fullName} />
                <DescriptionItem title="Invoice Date" content={formatDate(new Date(item.date))} />
                <DescriptionItem title="Due Date" content={formatDate(new Date(item.dueDate))} />
                <DescriptionItem title="Amount Excl. GST" content={formatCurrency(item.totalInclGst - item.totalGst)} />
                <DescriptionItem title="GST" content={formatCurrency(item.totalGst)} />
              </>
            )}
          />
        )}

        {/* Empty State */}
        {!loading && (!obj || (obj.paid.length === 0 && obj.unpaid.length === 0 && obj.overdue.length === 0 && obj.writtenOff.length === 0)) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              Generate a report to see invoice data for the selected criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
