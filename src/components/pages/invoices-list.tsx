'use client';

import { useState } from 'react';
import { useInvoices, useInvoiceActions } from '@/hooks/use-invoices';
import { Invoice, InvoiceStatus } from '@/lib/api/invoices-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoicesListProps {
  onAddInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onAddPayment: (invoice: Invoice) => void;
  onWriteOff: (invoice: Invoice) => void;
  onNotify: (invoice: Invoice) => void;
}

export function InvoicesList({ 
  onAddInvoice, 
  onEditInvoice, 
  onViewInvoice, 
  onAddPayment, 
  onWriteOff, 
  onNotify 
}: InvoicesListProps) {
  const router = useRouter();

  const {
    data: invoices,
    loading,
    error,
    total,
    filterCounter,
    filter,
    setFilter,
    reloadList,
  } = useInvoices();

  const { deleteInvoice, selectInvoice } = useInvoiceActions();

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoiceId);
        reloadList(); // Refresh the list after deletion
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    onViewInvoice(invoice);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    onEditInvoice(invoice);
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
        return <CheckCircle className="h-3 w-3" />;
      case InvoiceStatus.Overdue:
        return <AlertCircle className="h-3 w-3" />;
      case InvoiceStatus.WrittenOff:
        return <XCircle className="h-3 w-3" />;
      case InvoiceStatus.Unpaid:
      default:
        return <Clock className="h-3 w-3" />;
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Error: {error}</p>
        <Button onClick={reloadList} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select
            value={filter.status || 'all'}
            onValueChange={(value) => setFilter({ status: value === 'all' ? undefined : (value as InvoiceStatus) })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={InvoiceStatus.Unpaid}>Unpaid</SelectItem>
              <SelectItem value={InvoiceStatus.Paid}>Paid</SelectItem>
              <SelectItem value={InvoiceStatus.Overdue}>Overdue</SelectItem>
              <SelectItem value={InvoiceStatus.WrittenOff}>Written Off</SelectItem>
            </SelectContent>
          </Select>
          
          {filterCounter > 0 && (
            <Button variant="ghost" onClick={() => setFilter({ status: undefined, contact: '', from: undefined, to: undefined })}>
              Clear Filters ({filterCounter})
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total} invoice{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {invoices?.map((invoice) => (
          <Card key={invoice.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
              {/* Invoice Info Column (3 cols) */}
              <div className="col-span-6 md:col-span-3">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {invoice.code}
                  </h3>
                </div>
                <Badge className={`${getStatusColor(invoice.invoiceStatus)} flex items-center gap-1 text-xs w-fit`}>
                  {getStatusIcon(invoice.invoiceStatus)}
                  {invoice.invoiceStatus}
                </Badge>
                {/* Outstanding Amount */}
                {invoice.outstandingInclGst > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                      Outstanding: {formatCurrency(invoice.outstandingInclGst)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Contact Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="truncate">{invoice.contact.fullName}</span>
                </div>
              </div>

              {/* Invoice Date Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(invoice.date)}</span>
                </div>
              </div>

              {/* Due Date Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(invoice.dueDate)}</span>
                </div>
              </div>

              {/* Amount Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{formatCurrency(invoice.totalInclGst)}</span>
                </div>
              </div>

              {/* Actions Column (1 col) */}
              <div className="col-span-12 md:col-span-1">
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewInvoice(invoice)}
                    title="View invoice"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditInvoice(invoice)}
                    title="Edit invoice"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {invoice.outstandingInclGst > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddPayment(invoice)}
                      title="Add payment"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNotify(invoice)}
                    title="Notify invoice"
                    className="h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    title="Delete invoice"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {invoices?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No invoices found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first invoice
          </p>
          <Button onClick={onAddInvoice} className="flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
