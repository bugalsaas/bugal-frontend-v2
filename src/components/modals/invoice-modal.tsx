'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Invoice, 
  InvoiceStatus, 
  InvoicePayment, 
  PaymentMethod 
} from '@/lib/api/invoices-service';
import { useInvoiceActions } from '@/hooks/use-invoices';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Mail,
  Download,
  Send,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';

// Form validation schema
const invoiceSchema = z.object({
  code: z.string().min(1, 'Invoice code is required'),
  contactId: z.string().min(1, 'Contact is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  invoice?: Invoice;
  onSave?: (invoice: Invoice) => void;
}

export function InvoiceModal({ isOpen, onClose, mode, invoice, onSave }: InvoiceModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [payments, setPayments] = useState<InvoicePayment[]>([]);

  const { 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    downloadInvoice, 
    notifyInvoice,
    isSaving, 
    isDeleting 
  } = useInvoiceActions();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      code: '',
      contactId: '',
      date: '',
      dueDate: '',
      notes: '',
    },
  });

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      form.reset({
        code: invoice.code,
        contactId: invoice.contact.id,
        date: invoice.date.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        notes: '',
      });
      setPayments(invoice.payments || []);
    } else {
      form.reset();
      setPayments([]);
    }
  }, [invoice, form]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        id: invoice?.id || Date.now().toString(),
        contact: { id: data.contactId },
        totalExclGst: 0,
        totalInclGst: 0,
        totalGst: 0,
        paidExclGst: 0,
        paidInclGst: 0,
        writtenOffExclGst: 0,
        writtenOffInclGst: 0,
        outstandingExclGst: 0,
        outstandingInclGst: 0,
        invoiceStatus: InvoiceStatus.Unpaid,
        shifts: [],
        expenses: [],
        notifications: [],
        payments: [],
      };

      if (mode === 'new') {
        await createInvoice(invoiceData);
      } else if (mode === 'edit') {
        await updateInvoice(invoice!.id, invoiceData);
      }

      onSave?.(invoiceData as Invoice);
      onClose();
    } catch (error) {
      console.error('Invoice save error:', error);
    }
  };

  const handleDownload = async () => {
    if (invoice?.id) {
      await downloadInvoice(invoice.id);
    }
  };

  const handleNotify = async () => {
    if (invoice?.id) {
      await notifyInvoice(invoice.id, { recipients: [] });
    }
  };

  const isReadOnly = mode === 'view';

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.Overdue:
        return 'bg-red-100 text-red-800';
      case InvoiceStatus.WrittenOff:
        return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.Unpaid:
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid:
        return <CheckCircle className="h-4 w-4" />;
      case InvoiceStatus.Overdue:
        return <AlertCircle className="h-4 w-4" />;
      case InvoiceStatus.WrittenOff:
        return <XCircle className="h-4 w-4" />;
      case InvoiceStatus.Unpaid:
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Invoice Code *</Label>
            <Input
              id="code"
              {...form.register('code')}
              placeholder="e.g., INV-2024-001"
              disabled={isReadOnly}
            />
            {form.formState.errors.code && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactId">Contact *</Label>
            <Select
              value={form.watch('contactId')}
              onValueChange={(value) => form.setValue('contactId', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Smith</SelectItem>
                <SelectItem value="2">Sarah Johnson</SelectItem>
                <SelectItem value="3">Mike Wilson</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.contactId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Invoice Date *</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
              disabled={isReadOnly}
            />
            {form.formState.errors.date && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register('dueDate')}
              disabled={isReadOnly}
            />
            {form.formState.errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.dueDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...form.register('notes')}
            placeholder="Add any additional notes..."
            disabled={isReadOnly}
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payments</h3>
        {!isReadOnly && (
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        )}
      </div>

      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatCurrency(payment.amountInclGst)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formatDate(payment.date)}</span>
                  </div>
                  <Badge variant="outline">{payment.paymentMethod}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {payment.notes && (
                <p className="text-sm text-gray-600 mt-2">{payment.notes}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-600 mb-4">Payments will appear here once they are recorded</p>
          {!isReadOnly && (
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">{invoice?.code}</h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(invoice?.invoiceStatus || InvoiceStatus.Unpaid)} flex items-center gap-1`}>
                {getStatusIcon(invoice?.invoiceStatus || InvoiceStatus.Unpaid)}
                {invoice?.invoiceStatus}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleNotify}>
            <Send className="h-4 w-4 mr-2" />
            Notify
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Invoice Details</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Contact:</strong> {invoice?.contact.fullName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Date:</strong> {invoice?.date && formatDate(invoice.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Due Date:</strong> {invoice?.dueDate && formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Total:</strong> {invoice?.totalInclGst && formatCurrency(invoice.totalInclGst)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Outstanding:</strong> {invoice?.outstandingInclGst && formatCurrency(invoice.outstandingInclGst)}</span>
            </div>
          </div>
        </div>
      </div>

      {(invoice?.shifts?.length || 0) > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Shifts ({invoice.shifts.length})</h4>
          <div className="space-y-2">
            {invoice.shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{shift.summary}</p>
                  <p className="text-sm text-gray-600">{formatDate(shift.startDate)}</p>
                </div>
                <span className="font-medium">{formatCurrency(shift.totalInclGst)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(invoice?.expenses?.length || 0) > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Expenses ({invoice.expenses.length})</h4>
          <div className="space-y-2">
            {invoice.expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                </div>
                <span className="font-medium">{formatCurrency(expense.amountInclGst)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' && 'Add New Invoice'}
            {mode === 'edit' && 'Edit Invoice'}
            {mode === 'view' && 'View Invoice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isReadOnly ? (
            renderViewMode()
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                {renderDetailsTab()}
              </TabsContent>
              
              <TabsContent value="payments">
                {renderPaymentsTab()}
              </TabsContent>
            </Tabs>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Invoice'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
