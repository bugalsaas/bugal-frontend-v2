'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { RatesList } from '@/components/pages/rates-list';
import { RateModal } from '@/components/modals/rate-modal';
import { useRateActions, useRates } from '@/hooks/use-rates';
import { Rate, RateType } from '@/lib/api/rates-service';
import { DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function RatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get rates data and filters
  const { filterCounter, filters, setFilters } = useRates();

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

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const headerConfig = {
    title: 'Rates',
    subtitle: 'Rates overview',
    icon: DollarSign,
    showSearch: true,
    showAddButton: true,
    addButtonText: 'New',
    searchPlaceholder: 'Start typing to filter results...',
    onSearchChange: handleSearchChange,
    onAddClick: handleAddRate,
    activeFilterCount: filterCounter,
    customFilterComponent: (
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select
          value={filters.rateType || 'all'}
          onValueChange={(v) => setFilters({ rateType: v === 'all' ? undefined : (v as RateType) })}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value={RateType.Hourly}>Hourly</SelectItem>
            <SelectItem value={RateType.Fixed}>Fixed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox
            id="archived"
            checked={!!filters.isArchived}
            onCheckedChange={(v) => setFilters({ isArchived: !!v })}
          />
          <label htmlFor="archived" className="text-sm text-gray-700 cursor-pointer">Show archived</label>
        </div>
      </div>
    ),
  };

  return (
    <MainLayout activeNavItem="rates" headerConfig={headerConfig}>
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
