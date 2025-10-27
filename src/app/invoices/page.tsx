'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { InvoicesList } from '@/components/pages/invoices-list';
import { InvoiceModal } from '@/components/modals/invoice-modal';
import { PaymentModal } from '@/components/modals/payment-modal';
import { NotifyModal } from '@/components/modals/notify-modal';
import { Invoice } from '@/lib/api/invoices-service';

export default function InvoicesPage() {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [invoiceModalMode, setInvoiceModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [paymentModalMode, setPaymentModalMode] = useState<'payment' | 'writeoff'>('payment');

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

  const handleSaveInvoice = (invoice: Invoice) => {
    console.log('Invoice saved:', invoice);
    // The InvoicesList component will refresh automatically via the hook
  };

  const handleSavePayment = (payment: any) => {
    console.log('Payment saved:', payment);
    // The InvoicesList component will refresh automatically via the hook
  };

  const handleNotifyInvoice = (recipients: any[]) => {
    console.log('Invoice notified to:', recipients);
    // The InvoicesList component will refresh automatically via the hook
  };

  const handleDownloadInvoice = () => {
    console.log('Download invoice:', selectedInvoice?.id);
  };

  const headerConfig = {
    title: "Invoices",
    subtitle: "Manage your invoices and billing",
    showSearch: true,
    showFilters: true,
    showAddButton: true,
    addButtonText: "Add Invoice",
    searchPlaceholder: "Search invoices...",
    onAddClick: handleAddInvoice,
    onSearchChange: (value: string) => {
      // This will be handled by the InvoicesList component
      console.log('Search changed:', value);
    },
    onFilterClick: () => {
      // This will be handled by the InvoicesList component
      console.log('Filter clicked');
    },
  };

  return (
    <MainLayout 
      activeNavItem="invoices"
      headerConfig={headerConfig}
      notifications={5}
      user={{ name: "User", initials: "U" }}
    >
      <InvoicesList 
        onAddInvoice={handleAddInvoice}
        onEditInvoice={handleEditInvoice}
        onViewInvoice={handleViewInvoice}
        onAddPayment={handleAddPayment}
        onWriteOff={handleWriteOff}
        onNotify={handleNotify}
      />
      
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        mode={invoiceModalMode}
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        mode={paymentModalMode}
        invoiceId={selectedInvoice?.id || ''}
        outstandingAmount={selectedInvoice?.outstandingInclGst || 0}
        onSave={handleSavePayment}
      />

      {selectedInvoice && (
        <NotifyModal
          isOpen={isNotifyModalOpen}
          onClose={() => setIsNotifyModalOpen(false)}
          invoice={selectedInvoice}
          onNotify={handleNotifyInvoice}
          onDownload={handleDownloadInvoice}
        />
      )}
    </MainLayout>
  );
}