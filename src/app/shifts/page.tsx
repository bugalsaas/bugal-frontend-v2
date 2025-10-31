'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ShiftsList } from '@/components/pages/shifts-list';
import { ShiftModal } from '@/components/modals/shift-modal';
import { Shift } from '@/lib/api/shifts-service';

export default function ShiftsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view' | 'complete' | 'duplicate'>('new');
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();

  const handleAddShift = () => {
    setModalMode('new');
    setSelectedShift(undefined);
    setIsModalOpen(true);
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
    setModalMode('complete');
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleSaveShift = (shift: Shift) => {
    console.log('Shift saved:', shift);
    // The ShiftsList component will refresh automatically via the hook
  };

  const headerConfig = {
    title: "Shifts",
    subtitle: "Shifts overview",
    showSearch: true,
    showFilters: true,
    showAddButton: true,
    addButtonText: "Add Shift",
    searchPlaceholder: "Search shifts...",
    onAddClick: handleAddShift,
    onSearchChange: (value: string) => {
      // This will be handled by the ShiftsList component
      console.log('Search changed:', value);
    },
    onFilterClick: () => {
      // This will be handled by the ShiftsList component
      console.log('Filter clicked');
    },
  };

  return (
    <MainLayout 
      activeNavItem="shifts"
      headerConfig={headerConfig}
      notifications={5}
      user={{ name: "User", initials: "U" }}
    >
          <ShiftsList 
            onAddShift={handleAddShift}
            onEditShift={handleEditShift}
            onViewShift={handleViewShift}
            onDuplicateShift={handleDuplicateShift}
            onCompleteShift={handleCompleteShift}
          />
      
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        shift={selectedShift}
        onSave={handleSaveShift}
      />
    </MainLayout>
  );
}