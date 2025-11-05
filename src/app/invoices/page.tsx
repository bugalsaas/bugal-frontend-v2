'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { InvoicesList } from '@/components/pages/invoices-list';
import { InvoiceModal } from '@/components/modals/invoice-modal';
import { PaymentModal } from '@/components/modals/payment-modal';
import { NotifyModal } from '@/components/modals/notify-modal';
import { Invoice, InvoicePayment, InvoiceStatus } from '@/lib/api/invoices-service';
import { useInvoices, useInvoiceActions } from '@/hooks/use-invoices';
import { useContacts } from '@/hooks/use-contacts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerInputField } from '@/components/form/date-picker-input-field';

export default function InvoicesPage() {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [invoiceModalMode, setInvoiceModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [paymentModalMode, setPaymentModalMode] = useState<'payment' | 'writeoff'>('payment');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();
  const [contactFilter, setContactFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // Fetch invoices with filters
  const {
    data: invoices,
    loading,
    error,
    total,
    filterCounter,
    setFilter,
    reloadList,
  } = useInvoices();

  // Fetch contacts for filter dropdown (only when authenticated)
  // Note: API max pageSize is 100, so we use 100
  const { data: contacts = [], loading: contactsLoading, error: contactsError } = useContacts({ pageSize: 100 });

  // Update filters when filter states change
  useEffect(() => {
    setFilter({
      status: statusFilter,
      contact: contactFilter || undefined,
      from: dateFromFilter || undefined,
      to: dateToFilter || undefined,
    });
  }, [statusFilter, contactFilter, dateFromFilter, dateToFilter, setFilter]);

  const handleAddInvoice = () => {
    setInvoiceModalMode('new');
    setSelectedInvoice(undefined);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setInvoiceModalMode('edit');
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setInvoiceModalMode('view');
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleAddPayment = (invoice: Invoice) => {
    setPaymentModalMode('payment');
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleWriteOff = (invoice: Invoice) => {
    setPaymentModalMode('writeoff');
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleNotify = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsNotifyModalOpen(true);
  };

  const { deleteInvoice } = useInvoiceActions();

  const handleSaveInvoice = (invoice: Invoice) => {
    setIsInvoiceModalOpen(false);
    reloadList();
  };

  const handleSavePayment = (payment: InvoicePayment) => {
    setIsPaymentModalOpen(false);
    reloadList();
  };

  const handleNotifyInvoice = (recipients: Array<{ email: string; role: string }>) => {
    setIsNotifyModalOpen(false);
    reloadList();
  };

  const handleDownloadInvoice = () => {
    // Handled in NotifyModal
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await deleteInvoice(invoice.id);
      reloadList();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setContactFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const headerConfig = {
    title: "Invoices",
    subtitle: "Invoices overview",
    showSearch: false,
    showAddButton: true,
    addButtonText: "New Invoice",
    onAddClick: handleAddInvoice,
    activeFilterCount: filterCounter,
    customFilterComponent: (
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select
          value={statusFilter || 'all'}
          onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as InvoiceStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={InvoiceStatus.Unpaid}>Unpaid</SelectItem>
            <SelectItem value={InvoiceStatus.Paid}>Paid</SelectItem>
            <SelectItem value={InvoiceStatus.Overdue}>Overdue</SelectItem>
            <SelectItem value={InvoiceStatus.WrittenOff}>Written Off</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={contactFilter || 'all'}
          onValueChange={(value) => setContactFilter(value === 'all' ? '' : value)}
          disabled={contactsLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={contactsLoading ? "Loading..." : contactsError ? "Error loading contacts" : "Contact"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contacts</SelectItem>
            {contactsError ? (
              <div className="px-2 py-1.5 text-sm text-red-600">Failed to load contacts</div>
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

        <DatePickerInputField
          label=""
          id="dateFrom"
          value={dateFromFilter}
          onChange={(value) => setDateFromFilter(value)}
          placeholder="From Date"
        />

        <DatePickerInputField
          label=""
          id="dateTo"
          value={dateToFilter}
          onChange={(value) => setDateToFilter(value)}
          placeholder="To Date"
        />

        {filterCounter > 0 && (
          <Button variant="ghost" onClick={handleClearFilters} size="sm">
            Clear ({filterCounter})
          </Button>
        )}
      </div>
    ),
  };

  return (
    <MainLayout 
      activeNavItem="invoices"
      headerConfig={headerConfig}
    >
      <InvoicesList 
        invoices={invoices}
        loading={loading}
        error={error}
        total={total}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEditInvoice}
        onAddPayment={handleAddPayment}
        onWriteOff={handleWriteOff}
        onNotify={handleNotify}
        onDeleteInvoice={handleDeleteInvoice}
      />
      
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoice(undefined);
        }}
        mode={invoiceModalMode}
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          reloadList(); // Reload in case payment was added
        }}
        mode={paymentModalMode}
        invoiceId={selectedInvoice?.id || ''}
        outstandingAmount={selectedInvoice?.outstandingInclGst || 0}
        onSave={handleSavePayment}
      />

      {selectedInvoice && (
        <NotifyModal
          isOpen={isNotifyModalOpen}
          onClose={() => {
            setIsNotifyModalOpen(false);
            setSelectedInvoice(undefined);
          }}
          invoice={selectedInvoice}
          onNotify={handleNotifyInvoice}
          onDownload={handleDownloadInvoice}
        />
      )}
    </MainLayout>
  );
}