'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { RatesList } from '@/components/pages/rates-list';
import { RateModal } from '@/components/modals/rate-modal';
import { useRateActions } from '@/hooks/use-rates';
import { Rate } from '@/lib/api/rates-service';
import { DollarSign } from 'lucide-react';

export default function RatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    createRate, 
    updateRate, 
    deleteRate, 
    archiveRate,
    isSaving,
    isDeleting,
    isArchiving,
  } = useRateActions();

  const handleAddRate = () => {
    setSelectedRate(null);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditRate = (rate: Rate) => {
    setSelectedRate(rate);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewRate = (rate: Rate) => {
    setSelectedRate(rate);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteRate = (rate: Rate) => {
    setSelectedRate(rate);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleArchiveRate = (rate: Rate) => {
    setSelectedRate(rate);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveRate = async (rateData: Omit<Rate, 'id' | 'createdAt' | 'updatedAt' | 'amountGst' | 'amountInclGst'>) => {
    setIsLoading(true);
    try {
      if (modalMode === 'new') {
        await createRate(rateData);
      } else if (modalMode === 'edit' && selectedRate) {
        await updateRate(selectedRate.id, rateData);
      }
    } catch (error) {
      console.error('Failed to save rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRate) return;
    
    setIsLoading(true);
    try {
      await deleteRate(selectedRate.id);
      setIsModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error('Failed to delete rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedRate) return;
    
    setIsLoading(true);
    try {
      await archiveRate(selectedRate.id);
      setIsModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error('Failed to archive rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRate(null);
  };

  const headerConfig = {
    title: 'Rates',
    subtitle: 'Rates overview',
    icon: DollarSign,
    showAddButton: true,
    onAddClick: handleAddRate,
  };

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="space-y-6">
        <RatesList
          onViewRate={handleViewRate}
          onEditRate={handleEditRate}
          onDeleteRate={handleDeleteRate}
          onArchiveRate={handleArchiveRate}
        />
      </div>

      <RateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        rate={selectedRate}
        onSave={handleSaveRate}
        onDelete={modalMode === 'view' ? handleDelete : undefined}
        onArchive={modalMode === 'view' ? handleArchive : undefined}
        isLoading={isLoading || isSaving || isDeleting || isArchiving}
      />
    </MainLayout>
  );
}
