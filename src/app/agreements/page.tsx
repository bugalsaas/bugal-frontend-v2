'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { AgreementsList } from '@/components/pages/agreements-list';
import { AgreementModal } from '@/components/modals/agreement-modal';
import { CompleteAgreementModal } from '@/components/modals/complete-agreement-modal';
import { NotifyAgreementModal } from '@/components/modals/notify-agreement-modal';
import { useAgreementActions, useAgreements } from '@/hooks/use-agreements';
import { Agreement, AgreementStatus } from '@/lib/api/agreements-service';
import { useContacts } from '@/hooks/use-contacts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

export default function AgreementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [statusFilter, setStatusFilter] = useState<AgreementStatus>(AgreementStatus.All);
  const [contactFilter, setContactFilter] = useState<string>('');

  // Local state for drawer filters (not applied until Apply is clicked)
  const [drawerStatusFilter, setDrawerStatusFilter] = useState<AgreementStatus>(AgreementStatus.All);
  const [drawerContactFilter, setDrawerContactFilter] = useState<string>('');

  const { setFilters, data: agreements, loading, error, total, reloadList, filterCounter } = useAgreements();
  const { data: contacts } = useContacts({ pageSize: 100 });
  const { 
    createAgreement, 
    updateAgreement, 
    deleteAgreement,
    completeAgreement,
    draftAgreement,
    notifyAgreement,
    isSaving,
    isDeleting,
    isCompleting,
    isNotifying,
  } = useAgreementActions();

  // Update filter when status or contact changes (only for applied filters)
  useEffect(() => {
    setFilters({ 
      status: statusFilter !== AgreementStatus.All ? statusFilter : undefined,
      idContact: contactFilter && contactFilter !== '-1' ? contactFilter : undefined,
    });
  }, [statusFilter, contactFilter, setFilters]);

  const handleAddAgreement = () => {
    setSelectedAgreement(null);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCompleteAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setIsCompleteModalOpen(true);
  };

  const handleDraftAgreement = async (agreement: Agreement) => {
    try {
      await draftAgreement(agreement.id);
      reloadList();
    } catch (error) {
      console.error('Failed to revert agreement to draft:', error);
    }
  };

  const handleNotifyAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setIsNotifyModalOpen(true);
  };

  const handleDuplicateAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleSaveAgreement = async (agreement: Agreement) => {
    try {
      reloadList();
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to save agreement:', error);
    }
  };

  const handleDelete = async (agreementId: string) => {
    try {
      await deleteAgreement(agreementId);
      reloadList();
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to delete agreement:', error);
      throw error;
    }
  };

  const handleComplete = async () => {
    if (!selectedAgreement) return;
    try {
      await completeAgreement(selectedAgreement.id);
      reloadList();
      setIsCompleteModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to complete agreement:', error);
      throw error;
    }
  };

  const handleNotify = async () => {
    if (!selectedAgreement) return;
    try {
      reloadList();
      setIsNotifyModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to notify agreement:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgreement(null);
  };

  const handleDrawerStatusFilterChange = (value: AgreementStatus) => {
    // Update drawer filter value (not applied yet)
    setDrawerStatusFilter(value);
  };

  const handleDrawerContactFilterChange = (value: string) => {
    // Update drawer filter value (not applied yet)
    setDrawerContactFilter(value);
  };

  const handleApply = () => {
    // Apply the drawer values to actual filters
    setStatusFilter(drawerStatusFilter);
    setContactFilter(drawerContactFilter);
  };

  const handleClear = () => {
    // Clear drawer values
    setDrawerStatusFilter(AgreementStatus.All);
    setDrawerContactFilter('');
    // Also clear actual filters
    setStatusFilter(AgreementStatus.All);
    setContactFilter('');
  };

  // Sync drawer values when drawer opens
  const handleDrawerOpenChange = React.useCallback((isOpen: boolean) => {
    if (isOpen) {
      // When drawer opens, sync drawer values with current filter values
      setDrawerStatusFilter(statusFilter);
      setDrawerContactFilter(contactFilter);
    }
  }, [statusFilter, contactFilter]);

  // Calculate active filter count based on actual applied filters
  const activeFilterCount = (() => {
    let count = 0;
    if (statusFilter !== AgreementStatus.All) count++;
    if (contactFilter && contactFilter !== '-1' && contactFilter !== '') count++;
    return count;
  })();

  const headerConfig = {
    title: 'Agreements',
    subtitle: 'Agreements overview',
    icon: FileText,
    showAddButton: false, // Hide from header - moved to list row
    showAddButtonInDrawer: false, // Don't show in drawer on mobile
    onApply: handleApply,
    onClear: handleClear,
    onDrawerOpenChange: handleDrawerOpenChange,
    activeFilterCount,
    customFilterComponent: (
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Select
          value={drawerStatusFilter}
          onValueChange={handleDrawerStatusFilterChange}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AgreementStatus.All}>All</SelectItem>
            <SelectItem value={AgreementStatus.Draft}>Draft</SelectItem>
            <SelectItem value={AgreementStatus.Completed}>Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={drawerContactFilter || '-1'}
          onValueChange={handleDrawerContactFilterChange}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
            <SelectValue placeholder="Filter by contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">All Contacts</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
  };

  return (
    <MainLayout activeNavItem="agreements" headerConfig={headerConfig}>
      <div className="space-y-6">
        <AgreementsList
          agreements={agreements}
          loading={loading}
          error={error}
          total={total}
          onAddAgreement={handleAddAgreement}
          onViewAgreement={handleViewAgreement}
          onEditAgreement={handleEditAgreement}
          onDeleteAgreement={handleDeleteAgreement}
          onCompleteAgreement={handleCompleteAgreement}
          onDraftAgreement={handleDraftAgreement}
          onNotifyAgreement={handleNotifyAgreement}
          onDuplicateAgreement={handleDuplicateAgreement}
          // Filter props (desktop uses applied filters, mobile uses drawer)
          statusFilter={statusFilter}
          contactFilter={contactFilter}
          onStatusFilterChange={(value) => setStatusFilter(value)}
          onContactFilterChange={(value) => setContactFilter(value === '-1' ? '' : value)}
          contacts={contacts}
        />
      </div>

      <AgreementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        agreement={selectedAgreement || undefined}
        onSave={handleSaveAgreement}
        onEdit={handleEditAgreement}
        onDelete={modalMode === 'view' ? handleDelete : undefined}
      />

      <CompleteAgreementModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedAgreement(null);
        }}
        agreement={selectedAgreement}
        onComplete={handleComplete}
        isLoading={isCompleting}
      />

      <NotifyAgreementModal
        isOpen={isNotifyModalOpen}
        onClose={() => {
          setIsNotifyModalOpen(false);
          setSelectedAgreement(null);
        }}
        agreement={selectedAgreement}
        onNotify={handleNotify}
        isLoading={isNotifying}
      />
    </MainLayout>
  );
}
