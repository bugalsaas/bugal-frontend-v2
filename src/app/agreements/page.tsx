'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AgreementsList } from '@/components/pages/agreements-list';
import { useAgreementActions } from '@/hooks/use-agreements';
import { Agreement } from '@/lib/api/agreements-service';
import { FileText } from 'lucide-react';

export default function AgreementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDraftAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleNotifyAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDuplicateAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleSaveAgreement = async (agreementData: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'user'>) => {
    setIsLoading(true);
    try {
      if (modalMode === 'new') {
        await createAgreement(agreementData);
      } else if (modalMode === 'edit' && selectedAgreement) {
        await updateAgreement(selectedAgreement.id, agreementData);
      }
    } catch (error) {
      console.error('Failed to save agreement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAgreement) return;
    
    setIsLoading(true);
    try {
      await deleteAgreement(selectedAgreement.id);
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to delete agreement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedAgreement) return;
    
    setIsLoading(true);
    try {
      await completeAgreement(selectedAgreement.id);
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to complete agreement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraft = async () => {
    if (!selectedAgreement) return;
    
    setIsLoading(true);
    try {
      await draftAgreement(selectedAgreement.id);
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to revert agreement to draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotify = async (recipients: string[]) => {
    if (!selectedAgreement) return;
    
    setIsLoading(true);
    try {
      await notifyAgreement(selectedAgreement.id, recipients);
      setIsModalOpen(false);
      setSelectedAgreement(null);
    } catch (error) {
      console.error('Failed to notify agreement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgreement(null);
  };

  const headerConfig = {
    title: 'Agreements',
    subtitle: 'Manage service agreements and contracts',
    icon: FileText,
    showAddButton: true,
    onAddClick: handleAddAgreement,
  };

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="space-y-6">
        <AgreementsList
          onViewAgreement={handleViewAgreement}
          onEditAgreement={handleEditAgreement}
          onDeleteAgreement={handleDeleteAgreement}
          onCompleteAgreement={handleCompleteAgreement}
          onDraftAgreement={handleDraftAgreement}
          onNotifyAgreement={handleNotifyAgreement}
          onDuplicateAgreement={handleDuplicateAgreement}
        />
      </div>

      {/* TODO: Add Agreement Modal Components */}
      {/* <AgreementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        agreement={selectedAgreement}
        onSave={handleSaveAgreement}
        onDelete={modalMode === 'view' ? handleDelete : undefined}
        onComplete={modalMode === 'view' ? handleComplete : undefined}
        onDraft={modalMode === 'view' ? handleDraft : undefined}
        onNotify={modalMode === 'view' ? handleNotify : undefined}
        isLoading={isLoading || isSaving || isDeleting || isCompleting || isNotifying}
      /> */}
    </MainLayout>
  );
}
