'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Invoice, 
  InvoiceStatus, 
  Receipt,
  ReceiptType,
  PaymentMethod,
  InvoiceShift,
  InvoiceExpense,
  InvoiceNotification,
  InvoiceCreateDto,
  InvoiceUpdateDto
} from '@/lib/api/invoices-service';
import { useInvoiceActions, useInvoice } from '@/hooks/use-invoices';
import { useContacts } from '@/hooks/use-contacts';
import { useShiftsToInvoice } from '@/hooks/use-shifts';
import { useExpensesToInvoice } from '@/hooks/use-expenses';
import { useAuth } from '@/contexts/auth-context';
import { Shift } from '@/lib/api/shifts-service';
import { Expense, ExpenseType } from '@/lib/api/expenses-service';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Mail,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Car,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { DatePickerInputField } from '@/components/form/date-picker-input-field';
import { formatShiftDuration } from '@/lib/utils/shift-helpers';

// Form validation schema - different for new vs edit
const createInvoiceSchema = (isNew: boolean) => {
  if (isNew) {
    return z.object({
      contactId: z.string().min(1, 'Contact is required'),
      date: z.string().min(1, 'Date is required'),
      dueDate: z.string().min(1, 'Due date is required'),
      shiftIds: z.array(z.string()).default([]),
      expenseIds: z.array(z.string()).default([]),
    });
  } else {
    // Edit mode - only allow date changes
    return z.object({
      date: z.string().min(1, 'Date is required'),
      dueDate: z.string().min(1, 'Due date is required'),
    });
  }
};

type InvoiceFormData = z.infer<ReturnType<typeof createInvoiceSchema>>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  invoice?: Invoice;
  onSave?: (invoice: Invoice) => void;
}

export function InvoiceModal({ isOpen, onClose, mode, invoice, onSave }: InvoiceModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isNew = mode === 'new';
  const isReadOnly = mode === 'view';
  const invoiceSchema = createInvoiceSchema(isNew);
  
  const [activeTab, setActiveTab] = useState('details');
  const [payments, setPayments] = useState<Receipt[]>([]);
  const [fetchedInvoice, setFetchedInvoice] = useState<Invoice | null>(null);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const { user, isOrganizationAdmin, isAuthenticated } = useAuth();
  
  // Load contacts for the dropdown (only in new mode)
  // Note: API max pageSize is 100, so we use 100
  const { data: contacts = [], loading: contactsLoading, error: contactsError } = useContacts(
    isNew ? { pageSize: 100 } : {}
  );
  
  const { loading: shiftsLoading, data: availableShifts, load: loadShifts, reset: resetShifts } = useShiftsToInvoice();
  const { loading: expensesLoading, data: availableExpenses, load: loadExpenses, reset: resetExpenses } = useExpensesToInvoice();
  const { loading: invoiceLoading, load: loadInvoice } = useInvoice();

  const { 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    downloadInvoice, 
    notifyInvoice,
    deleteReceipt,
    isSaving, 
    isDeleting,
    isDeletingReceipt
  } = useInvoiceActions();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: isNew ? {
      contactId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      shiftIds: [],
      expenseIds: [],
    } : {
      date: '',
      dueDate: '',
    },
  });

  // Fetch full invoice data when in view/edit mode
  useEffect(() => {
    if (isOpen && invoice?.id && (mode === 'view' || mode === 'edit')) {
      loadInvoice(invoice.id)
        .then(setFetchedInvoice)
        .catch((err) => {
          console.error('Failed to load invoice:', err);
          setFetchedInvoice(invoice);
        });
    } else if (isOpen && !invoice?.id) {
      setFetchedInvoice(null);
    }
  }, [isOpen, invoice?.id, mode, loadInvoice]);

  // Reset form when invoice changes
  useEffect(() => {
    const invoiceToUse = fetchedInvoice || invoice;
    
    if (invoiceToUse) {
      if (isNew) {
        form.reset({
          contactId: invoiceToUse.contact.id,
          date: invoiceToUse.date.split('T')[0],
          dueDate: invoiceToUse.dueDate.split('T')[0],
          shiftIds: [],
          expenseIds: [],
        });
      } else {
        form.reset({
          date: invoiceToUse.date.split('T')[0],
          dueDate: invoiceToUse.dueDate.split('T')[0],
        });
      }
      setPayments(invoiceToUse.receipts || []);
    } else if (isNew) {
      form.reset({
        contactId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        shiftIds: [],
        expenseIds: [],
      });
      setPayments([]);
      setSelectedShiftIds([]);
      setSelectedExpenseIds([]);
      resetShifts();
      resetExpenses();
    }
  }, [fetchedInvoice, invoice, form, isNew, resetShifts, resetExpenses]);

  // Load shifts and expenses when contact changes in new mode
  const handleContactChange = (contactId: string) => {
    form.setValue('contactId', contactId);
    if (contactId && isNew) {
      // Determine assignee - use '-1' for all users if admin or has users:data:all scope, otherwise current user
      const hasAllUsersAccess = user?.isAdmin || isOrganizationAdmin || (user?.scopes && Array.isArray(user.scopes) && user.scopes.includes('users:data:all'));
      const assignee = hasAllUsersAccess ? '-1' : user?.id || '-1';
      loadShifts(contactId, assignee);
      loadExpenses(contactId);
      setSelectedShiftIds([]);
      setSelectedExpenseIds([]);
    } else {
      resetShifts();
      resetExpenses();
      setSelectedShiftIds([]);
      setSelectedExpenseIds([]);
    }
  };

  // Sync selected IDs with form
  useEffect(() => {
    if (isNew) {
      form.setValue('shiftIds', selectedShiftIds);
      form.setValue('expenseIds', selectedExpenseIds);
    }
  }, [selectedShiftIds, selectedExpenseIds, form, isNew]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      if (isNew) {
        const createData: InvoiceCreateDto = {
          date: data.date,
          dueDate: data.dueDate,
          idContact: data.contactId,
          shiftIds: data.shiftIds || [],
          expenseIds: data.expenseIds || [],
        };
        const newInvoice = await createInvoice(createData);
        onSave?.(newInvoice);
      } else if (mode === 'edit' && invoice?.id) {
        const updateData: InvoiceUpdateDto = {
          date: data.date,
          dueDate: data.dueDate,
        };
        const updatedInvoice = await updateInvoice(invoice.id, updateData);
        onSave?.(updatedInvoice);
      }
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

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!invoice?.id) return;
    try {
      await deleteReceipt(receiptId);
      // Refresh invoice data
      if (onSave) {
        // Optionally reload invoice here if we add a reload function
        onSave(invoice);
      }
    } catch (error) {
      console.error('Failed to delete receipt:', error);
    }
  };

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

  // Helper function to determine if an invoice is overdue
  const getEffectiveStatus = (invoice: Invoice): InvoiceStatus => {
    // If invoice status is Unpaid and due date has passed, it's Overdue
    if (invoice.invoiceStatus === InvoiceStatus.Unpaid) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today && invoice.outstandingInclGst > 0) {
        return InvoiceStatus.Overdue;
      }
    }
    return invoice.invoiceStatus;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExpenseIcon = (expenseType: string) => {
    if (expenseType === ExpenseType.Reclaimable) {
      return <Car className="h-4 w-4 text-blue-600" />;
    }
    if (expenseType === ExpenseType.Kilometre) {
      return <Car className="h-4 w-4 text-green-600" />;
    }
    return <DollarSign className="h-4 w-4 text-gray-500" />;
  };

  const invoiceToDisplay = fetchedInvoice || invoice;

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isNew && (
            <div>
              <Label htmlFor="contactId">Contact *</Label>
              <Select
                value={form.watch('contactId') || ''}
                onValueChange={handleContactChange}
                disabled={isReadOnly || contactsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={contactsLoading ? "Loading contacts..." : contactsError ? "Error loading contacts" : "Select contact"} />
                </SelectTrigger>
                <SelectContent>
                  {contactsError ? (
                    <div className="px-2 py-1.5 text-sm text-red-600">Failed to load contacts. Please try again.</div>
                  ) : contacts.length === 0 && !contactsLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No contacts available</div>
                  ) : (
                    contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.contactId && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactId.message}</p>
              )}
              {contactsError && (
                <p className="text-red-500 text-sm mt-1">{contactsError}</p>
              )}
            </div>
          )}

          <DatePickerInputField
            label="Invoice Date *"
            id="date"
            value={form.watch('date')}
            onChange={(value) => form.setValue('date', value)}
            error={form.formState.errors.date}
            disabled={isReadOnly}
          />

          <DatePickerInputField
            label="Due Date *"
            id="dueDate"
            value={form.watch('dueDate')}
            onChange={(value) => form.setValue('dueDate', value)}
            error={form.formState.errors.dueDate}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Shifts Selection (only in new mode) */}
      {isNew && form.watch('contactId') && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Shifts</h3>
          {shiftsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading shifts...</span>
            </div>
          ) : availableShifts.length === 0 ? (
            <Alert>
              <AlertDescription>No shifts available for invoicing for this contact.</AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <Checkbox
                        checked={selectedShiftIds.length === availableShifts.length && availableShifts.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedShiftIds(availableShifts.map(s => s.id));
                          } else {
                            setSelectedShiftIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableShifts.map((shift) => (
                    <tr 
                      key={shift.id}
                      className={`hover:bg-gray-50 ${selectedShiftIds.includes(shift.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Checkbox
                          checked={selectedShiftIds.includes(shift.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedShiftIds([...selectedShiftIds, shift.id]);
                            } else {
                              setSelectedShiftIds(selectedShiftIds.filter(id => id !== shift.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(shift.startDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatShiftDuration(shift.duration)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{shift.summary}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(shift.totalInclGst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expenses Selection (only in new mode) */}
      {isNew && form.watch('contactId') && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Expenses</h3>
          {expensesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading expenses...</span>
            </div>
          ) : availableExpenses.length === 0 ? (
            <Alert>
              <AlertDescription>No expenses available for invoicing for this contact.</AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <Checkbox
                        checked={selectedExpenseIds.length === availableExpenses.length && availableExpenses.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExpenseIds(availableExpenses.map(e => e.id));
                          } else {
                            setSelectedExpenseIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableExpenses.map((expense) => (
                    <tr 
                      key={expense.id}
                      className={`hover:bg-gray-50 ${selectedExpenseIds.includes(expense.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Checkbox
                          checked={selectedExpenseIds.includes(expense.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExpenseIds([...selectedExpenseIds, expense.id]);
                            } else {
                              setSelectedExpenseIds(selectedExpenseIds.filter(id => id !== expense.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {getExpenseIcon(expense.expenseType)}
                          <span>{expense.expenseType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(expense.amountInclGst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPaymentsTab = () => {
    const receiptsToShow = invoiceToDisplay?.receipts || payments;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Receipts &amp; Write-offs</h3>
        </div>

        {receiptsToShow.length > 0 ? (
          <div className="space-y-3">
            {receiptsToShow.map((receipt) => (
              <Card key={receipt.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <ReceiptIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formatCurrency(receipt.amountInclGst)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{formatDate(receipt.date)}</span>
                    </div>
                    {receipt.receiptType === ReceiptType.InvoiceReceipt && receipt.paymentMethod && (
                      <Badge variant="outline">{receipt.paymentMethod}</Badge>
                    )}
                    {receipt.receiptType === ReceiptType.InvoiceWriteOff && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">Write-off</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isReadOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                        disabled={isDeletingReceipt}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {receipt.notes && (
                  <p className="text-sm text-gray-600 mt-2">{receipt.notes}</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No receipts yet</h3>
            <p className="text-gray-600 mb-4">Receipts and write-offs will appear here once they are recorded</p>
          </div>
        )}
      </div>
    );
  };

  const renderViewMode = () => {
    if (invoiceLoading && !invoiceToDisplay) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading invoice...</span>
        </div>
      );
    }

    if (!invoiceToDisplay) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invoice not found</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {/* Last notification alert */}
        {invoiceToDisplay.notifications && invoiceToDisplay.notifications.length > 0 && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Last emailed on {formatDateTime(invoiceToDisplay.notifications[invoiceToDisplay.notifications.length - 1].createdAt)}.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold">{invoiceToDisplay.code}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(getEffectiveStatus(invoiceToDisplay))} flex items-center gap-1`}>
                  {getStatusIcon(getEffectiveStatus(invoiceToDisplay))}
                  {getEffectiveStatus(invoiceToDisplay)}
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
                <span className="text-sm"><strong>Contact:</strong> {invoiceToDisplay.contact.fullName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Date:</strong> {formatDate(invoiceToDisplay.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Due Date:</strong> {formatDate(invoiceToDisplay.dueDate)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Totals</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total (incl. GST):</span>
                <span className="text-sm font-medium">{formatCurrency(invoiceToDisplay.totalInclGst)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Paid (incl. GST):</span>
                <span className="text-sm font-medium">{formatCurrency(invoiceToDisplay.paidInclGst)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Written Off (incl. GST):</span>
                <span className="text-sm font-medium">{formatCurrency(invoiceToDisplay.writtenOffInclGst)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Outstanding (incl. GST):</span>
                <span className="text-sm font-semibold">{formatCurrency(invoiceToDisplay.outstandingInclGst)}</span>
              </div>
            </div>
          </div>
        </div>

        {(invoiceToDisplay.shifts?.length || 0) > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Shifts ({invoiceToDisplay.shifts.length})</h4>
            <div className="space-y-2">
              {invoiceToDisplay.shifts.map((shift) => (
                <Card key={shift.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{shift.summary}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{formatDate(shift.startDate)}</span>
                        {shift.duration && <span>Duration: {formatShiftDuration(shift.duration)}</span>}
                        {shift.assignee && <span>Staff: {shift.assignee.fullName}</span>}
                      </div>
                    </div>
                    <span className="font-medium ml-4">{formatCurrency(shift.totalInclGst)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(invoiceToDisplay.expenses?.length || 0) > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Expenses ({invoiceToDisplay.expenses.length})</h4>
            <div className="space-y-2">
              {invoiceToDisplay.expenses.map((expense) => (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getExpenseIcon(expense.expenseType)}
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <span className="font-medium ml-4">{formatCurrency(expense.amountInclGst)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const shouldUseDrawer = !isDesktop;
  const modalTitle = mode === 'new' ? 'Add New Invoice' : mode === 'edit' ? 'Edit Invoice' : 'View Invoice';
  const modalDescription = mode === 'new' ? 'Create a new invoice by selecting a contact, date, and items to invoice.' : mode === 'edit' ? 'Update invoice details and dates.' : 'View invoice details, payments, and history.';

  // Render content
  const renderContent = () => {
    if (isReadOnly) {
      return renderViewMode();
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payments">
              Receipts ({(invoiceToDisplay?.receipts || payments).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {renderDetailsTab()}
          </TabsContent>
          
          <TabsContent value="payments">
            {renderPaymentsTab()}
          </TabsContent>
        </Tabs>
      </form>
    );
  };

  // Render footer buttons
  const renderFooterButtons = () => (
    <>
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
    </>
  );

  // Render Drawer for view mode on mobile
  if (shouldUseDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{modalTitle}</DrawerTitle>
            <DrawerDescription>{modalDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            {renderContent()}
          </div>
          <DrawerFooter className="flex-row justify-between gap-2 border-t pt-4 flex-wrap">
            {renderFooterButtons()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render Dialog for all other cases
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
