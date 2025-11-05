'use client';

import React from 'react';
import { useInvoiceActions } from '@/hooks/use-invoices';
import { Invoice, InvoiceStatus } from '@/lib/api/invoices-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  total: number;
  onAddInvoice?: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onAddPayment?: (invoice: Invoice) => void;
  onWriteOff?: (invoice: Invoice) => void;
  onNotify?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

export function InvoicesList({ 
  invoices,
  loading,
  error,
  total,
  onAddInvoice,
  onViewInvoice, 
  onEditInvoice,
  onAddPayment,
  onWriteOff,
  onNotify,
  onDeleteInvoice,
}: InvoicesListProps) {
  const router = useRouter();

  const { deleteInvoice } = useInvoiceActions();

  const handleDeleteInvoice = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        if (onDeleteInvoice) {
          onDeleteInvoice(invoice);
        } else {
          await deleteInvoice(invoice.id);
        }
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const handleRowClick = (invoice: Invoice) => {
    onViewInvoice(invoice);
  };

  const handleEditClick = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (onEditInvoice) {
      onEditInvoice(invoice);
    }
  };

  const handlePaymentClick = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (onAddPayment) {
      onAddPayment(invoice);
    }
  };

  const handleNotifyClick = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (onNotify) {
      onNotify(invoice);
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary with New button */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {invoices.length} of {total} invoice{total !== 1 ? 's' : ''}
          </p>
          {onAddInvoice && (
            <Button onClick={onAddInvoice} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Error: {error}</p>
        </div>
      )}

      {/* Only show content if not loading and no error */}
      {!loading && !error && (
        <>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {invoices?.map((invoice) => (
          <Card 
            key={invoice.id} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleRowClick(invoice)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{invoice.code}</h3>
                </div>
                <Badge className={`${getStatusColor(getEffectiveStatus(invoice))} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(getEffectiveStatus(invoice))}
                  {getEffectiveStatus(invoice)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="truncate">{invoice.contact.fullName}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices?.map((invoice) => (
              <tr 
                key={invoice.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(invoice)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{invoice.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge className={`${getStatusColor(getEffectiveStatus(invoice))} flex items-center gap-1 text-xs w-fit`}>
                    {getStatusIcon(getEffectiveStatus(invoice))}
                    {getEffectiveStatus(invoice)}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {invoice.contact.fullName}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(invoice.date)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(invoice.dueDate)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(invoice.totalInclGst)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {invoice.outstandingInclGst > 0 ? (
                    <span className="font-medium text-orange-600">{formatCurrency(invoice.outstandingInclGst)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {onEditInvoice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(invoice, e)}
                        title="Edit invoice"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.outstandingInclGst > 0 && onAddPayment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handlePaymentClick(invoice, e)}
                        title="Add payment"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    )}
                    {onNotify && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleNotifyClick(invoice, e)}
                        title="Notify invoice"
                        className="h-8 w-8 p-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteInvoice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteInvoice(invoice, e)}
                        title="Delete invoice"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {/* Empty State */}
          {invoices?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600">
                Get started by creating your first invoice
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
