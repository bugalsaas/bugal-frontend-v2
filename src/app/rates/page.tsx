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

  // Applied filters (what's actually filtering the data)
  const [searchValue, setSearchValue] = useState('');
  const [rateTypeFilter, setRateTypeFilter] = useState<RateType | undefined>(undefined);
  const [isArchivedFilter, setIsArchivedFilter] = useState<boolean>(false);

  // Local state for drawer filters (not applied until Apply is clicked)
  const [drawerSearchValue, setDrawerSearchValue] = useState('');
  const [drawerRateTypeFilter, setDrawerRateTypeFilter] = useState<RateType | undefined>(undefined);
  const [drawerIsArchivedFilter, setDrawerIsArchivedFilter] = useState<boolean>(false);

  // Get rates data and filters
  const { filterCounter, filters, setFilters, data: rates, total } = useRates();

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

  // Update filters when applied filter values change
  React.useEffect(() => {
    setFilters({
      search: searchValue,
      rateType: rateTypeFilter,
      isArchived: isArchivedFilter,
    });
  }, [searchValue, rateTypeFilter, isArchivedFilter, setFilters]);

  const handleSearchChange = (value: string) => {
    // Update drawer search value (not applied yet)
    setDrawerSearchValue(value);
  };

  const handleDrawerRateTypeChange = (value: string) => {
    // Update drawer filter value (not applied yet)
    setDrawerRateTypeFilter(value === 'all' ? undefined : (value as RateType));
  };

  const handleDrawerArchivedChange = (checked: boolean) => {
    // Update drawer filter value (not applied yet)
    setDrawerIsArchivedFilter(checked);
  };

  const handleApply = () => {
    // Apply the drawer values to actual filters
    setSearchValue(drawerSearchValue);
    setRateTypeFilter(drawerRateTypeFilter);
    setIsArchivedFilter(drawerIsArchivedFilter);
  };

  const handleClear = () => {
    // Clear drawer values
    setDrawerSearchValue('');
    setDrawerRateTypeFilter(undefined);
    setDrawerIsArchivedFilter(false);
    // Also clear actual filters
    setSearchValue('');
    setRateTypeFilter(undefined);
    setIsArchivedFilter(false);
  };

  // Sync drawer values when drawer opens
  const handleDrawerOpenChange = React.useCallback((isOpen: boolean) => {
    if (isOpen) {
      // When drawer opens, sync drawer values with current filter values
      setDrawerSearchValue(searchValue);
      setDrawerRateTypeFilter(rateTypeFilter);
      setDrawerIsArchivedFilter(isArchivedFilter);
      // Also trigger onSearchChange to sync the drawer's internal search value
      handleSearchChange(searchValue);
    }
  }, [searchValue, rateTypeFilter, isArchivedFilter]);

  // Calculate active filter count based on actual applied filters
  const activeFilterCount = (() => {
    let count = 0;
    if (searchValue && searchValue.length > 0) count++;
    if (rateTypeFilter !== undefined) count++;
    if (isArchivedFilter) count++;
    return count;
  })();

  const headerConfig = {
    title: 'Rates',
    subtitle: 'Rates overview',
    icon: DollarSign,
    showSearch: true, // Keep for mobile drawer
    hideSearchInDesktop: true, // Hide from MainLayout desktop row
    showAddButton: false, // Hide from header - moved to list row
    hideCustomFilterInDesktop: true, // Hide filters from MainLayout desktop row
    addButtonText: 'New',
    showAddButtonInDrawer: false, // Don't show in drawer on mobile
    searchPlaceholder: 'Start typing to filter results...',
    onSearchChange: handleSearchChange,
    onAddClick: handleAddRate,
    onApply: handleApply,
    onClear: handleClear,
    onDrawerOpenChange: handleDrawerOpenChange,
    activeFilterCount,
    customFilterComponent: (
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select
          value={drawerRateTypeFilter || 'all'}
          onValueChange={handleDrawerRateTypeChange}
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
            checked={drawerIsArchivedFilter}
            onCheckedChange={handleDrawerArchivedChange}
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
          rates={rates}
          total={total}
          onAddRate={handleAddRate}
          onViewRate={handleViewRate}
          onEditRate={handleEditRate}
          onDeleteRate={handleDeleteRate}
          onArchiveRate={handleArchiveRate}
          // Add search and filter props
          searchValue={searchValue}
          rateTypeFilter={rateTypeFilter}
          isArchivedFilter={isArchivedFilter}
          onSearchChange={(value: string) => setSearchValue(value)}
          onRateTypeFilterChange={(value: RateType | undefined) => setRateTypeFilter(value)}
          onArchivedFilterChange={(value: boolean) => setIsArchivedFilter(value)}
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
