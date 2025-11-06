'use client';

import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { ShiftsList } from '@/components/pages/shifts-list';
import { ShiftModal } from '@/components/modals/shift-modal';
import { CompleteShiftModal } from '@/components/modals/complete-shift-modal';
import { CancelShiftModal } from '@/components/modals/cancel-shift-modal';
import { NotifyShiftModal } from '@/components/modals/notify-shift-modal';
import { Shift, ShiftStatus } from '@/lib/api/shifts-service';
import { useShifts } from '@/hooks/use-shifts';
import { ErrorBoundary } from '@/components/error-boundary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSelector } from '@/components/ui/user-selector';
import { useContacts } from '@/hooks/use-contacts';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShiftsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view' | 'duplicate'>('new');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const shiftsHook = useShifts();
  const { reloadList, filter, setFilter, filterCounter, loading: shiftsLoading, error: shiftsError, data: shifts, total: shiftsTotal, hasMoreBefore, hasMoreAfter, loadMoreBefore, loadMoreAfter } = shiftsHook;
  const { data: contacts } = useContacts({ pageSize: 100 });

  // Applied filters (what's actually filtering the data)
  // Initialize with default values, then sync with filter from hook
  const [statusFilter, setStatusFilter] = useState<ShiftStatus>(ShiftStatus.All);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('-1');
  const [contactFilter, setContactFilter] = useState<string>('');

  // Sync local filter state with hook's filter state when it changes
  React.useEffect(() => {
    if (filter.status !== undefined) {
      setStatusFilter(filter.status || ShiftStatus.All);
    }
    if (filter.assignee !== undefined) {
      setAssigneeFilter(filter.assignee || '-1');
    }
    if (filter.contact !== undefined) {
      setContactFilter(filter.contact || '');
    }
  }, [filter.status, filter.assignee, filter.contact]);

  // Local state for drawer filters (not applied until Apply is clicked)
  const [drawerStatusFilter, setDrawerStatusFilter] = useState<ShiftStatus>(ShiftStatus.All);
  const [drawerAssigneeFilter, setDrawerAssigneeFilter] = useState<string>('-1');
  const [drawerContactFilter, setDrawerContactFilter] = useState<string>('');

  // Update filter when applied filter values change
  React.useEffect(() => {
    const newFilter: Partial<ShiftFilters> = {};
    
    // Only set status if it's not All
    if (statusFilter !== ShiftStatus.All) {
      newFilter.status = statusFilter;
    }
    
    // Only set assignee if it's not the default
    if (assigneeFilter !== '-1') {
      newFilter.assignee = assigneeFilter;
    }
    
    // Only set contact if it's not empty
    if (contactFilter && contactFilter.trim() !== '') {
      newFilter.contact = contactFilter;
    }
    
    setFilter(newFilter);
  }, [statusFilter, assigneeFilter, contactFilter, setFilter]);

  const handleAddShift = () => {
    console.log('handleAddShift called');
    setModalMode('new');
    setSelectedShift(null);
    setIsModalOpen(true);
    console.log('Modal state set to open');
  };

  const handleEditShift = (shift: Shift) => {
    setModalMode('edit');
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleViewShift = (shift: Shift) => {
    setModalMode('view');
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleDuplicateShift = (shift: Shift) => {
    setModalMode('duplicate');
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleCompleteShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsCompleteModalOpen(true);
  };

  const handleCancelShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsCancelModalOpen(true);
  };

  const handleNotifyShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsNotifyModalOpen(true);
  };

  const handleSaveShift = () => {
    reloadList();
    setIsModalOpen(false);
  };

  const handleCompleteShiftSuccess = () => {
    reloadList();
    setIsCompleteModalOpen(false);
    setSelectedShift(null);
  };

  const handleCancelShiftSuccess = () => {
    reloadList();
    setIsCancelModalOpen(false);
    setSelectedShift(null);
  };

  const handleNotifyShiftSuccess = () => {
    reloadList();
    setIsNotifyModalOpen(false);
    setSelectedShift(null);
  };

  const handleDrawerStatusFilterChange = (value: ShiftStatus) => {
    setDrawerStatusFilter(value);
  };

  const handleDrawerAssigneeFilterChange = (value: string) => {
    setDrawerAssigneeFilter(value);
  };

  const handleDrawerContactFilterChange = (value: string) => {
    // Update drawer filter value (not applied yet)
    setDrawerContactFilter(value === 'all' ? '' : value);
  };

  const handleApply = () => {
    setStatusFilter(drawerStatusFilter);
    setAssigneeFilter(drawerAssigneeFilter);
    setContactFilter(drawerContactFilter);
  };

  const handleClear = () => {
    setDrawerStatusFilter(ShiftStatus.All);
    setDrawerAssigneeFilter('-1');
    setDrawerContactFilter('');
    setStatusFilter(ShiftStatus.All);
    setAssigneeFilter('-1');
    setContactFilter('');
  };

  // Sync drawer values when drawer opens
  const handleDrawerOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      // When drawer opens, sync drawer values with current filter values
      setDrawerStatusFilter(statusFilter);
      setDrawerAssigneeFilter(assigneeFilter);
      setDrawerContactFilter(contactFilter || '');
    }
  }, [statusFilter, assigneeFilter, contactFilter]);

  // Calculate active filter count based on actual applied filters
  const activeFilterCount = (() => {
    let count = 0;
    if (statusFilter !== ShiftStatus.All) count++;
    if (assigneeFilter !== '-1') count++;
    if (contactFilter && contactFilter !== '') count++;
    return count;
  })();

  const headerConfig = {
    title: "Shifts",
    subtitle: "Shifts overview",
    showSearch: false,
    showFilters: true, // Show filters in drawer
    showAddButton: false, // We handle buttons separately
    showAddButtonInDrawer: false,
    onApply: handleApply,
    onClear: handleClear,
    onDrawerOpenChange: handleDrawerOpenChange,
    activeFilterCount,
    customFilterComponent: (
      <div className="flex flex-col gap-3 w-full">
        <Select
          value={drawerStatusFilter}
          onValueChange={handleDrawerStatusFilterChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ShiftStatus.All}>All statuses</SelectItem>
            <SelectItem value={ShiftStatus.Pending}>Pending</SelectItem>
            <SelectItem value={ShiftStatus.Completed}>Completed</SelectItem>
            <SelectItem value={ShiftStatus.Cancelled}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <UserSelector
          value={drawerAssigneeFilter}
          onValueChange={handleDrawerAssigneeFilterChange}
          className="w-full"
        />
        <Select
          value={drawerContactFilter || 'all'}
          onValueChange={(value) => handleDrawerContactFilterChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All contacts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All contacts</SelectItem>
            {contacts?.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.firstName && contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.organisationName || contact.email || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
  };

  return (
    <MainLayout 
      activeNavItem="shifts"
      headerConfig={headerConfig}
    >
      {/* Fixed Action Buttons Bar - Mobile only */}
      <div className="md:hidden fixed top-[56px] left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            // Scroll to today - dispatch event that ShiftsList will listen for
            const event = new CustomEvent('scrollToToday');
            window.dispatchEvent(event);
          }}
          className="relative p-0 h-10 w-10 flex flex-col items-center justify-center"
          title="Jump to today"
        >
          <Calendar className="h-9 w-9 text-gray-600 absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          <span className="relative z-10 text-xs font-bold text-gray-800" style={{ marginTop: '2px' }}>
            {new Date().getDate()}
          </span>
        </Button>
        <Button 
          type="button"
          onClick={handleAddShift} 
          className="flex-1 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          New Shift
        </Button>
      </div>

      <ShiftsList 
        shifts={shifts}
        loading={shiftsLoading}
        error={shiftsError}
        total={shiftsTotal}
        hasMoreBefore={hasMoreBefore}
        hasMoreAfter={hasMoreAfter}
        loadMoreBefore={loadMoreBefore}
        loadMoreAfter={loadMoreAfter}
        filter={filter}
        setFilter={setFilter}
        filterCounter={filterCounter}
        reloadList={reloadList}
        onAddShift={handleAddShift}
        onEditShift={handleEditShift}
        onViewShift={handleViewShift}
        onDuplicateShift={handleDuplicateShift}
        onCompleteShift={handleCompleteShift}
        onCancelShift={handleCancelShift}
        onNotifyShift={handleNotifyShift}
      />
      
      <ErrorBoundary>
        <ShiftModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedShift(null);
          }}
          mode={modalMode}
          shift={selectedShift || undefined}
          onSave={handleSaveShift}
        />
      </ErrorBoundary>

      <CompleteShiftModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onComplete={handleCompleteShiftSuccess}
      />

      <CancelShiftModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onCancel={handleCancelShiftSuccess}
      />

      <NotifyShiftModal
        isOpen={isNotifyModalOpen}
        onClose={() => {
          setIsNotifyModalOpen(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onNotify={handleNotifyShiftSuccess}
      />
    </MainLayout>
  );
}