'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { ShiftsList } from '@/components/pages/shifts-list';
import { ShiftModal } from '@/components/modals/shift-modal';
import { CompleteShiftModal } from '@/components/modals/complete-shift-modal';
import { CancelShiftModal } from '@/components/modals/cancel-shift-modal';
import { NotifyShiftModal } from '@/components/modals/notify-shift-modal';
import { Shift } from '@/lib/api/shifts-service';
import { useShifts } from '@/hooks/use-shifts';

export default function ShiftsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view' | 'duplicate'>('new');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const { reloadList } = useShifts();

  const handleAddShift = () => {
    setModalMode('new');
    setSelectedShift(null);
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

  const headerConfig = {
    title: "Shifts",
    subtitle: "Shifts overview",
    showSearch: false,
    showAddButton: false,
  };

  return (
    <MainLayout 
      activeNavItem="shifts"
      headerConfig={headerConfig}
    >
          <ShiftsList 
            onAddShift={handleAddShift}
            onEditShift={handleEditShift}
            onViewShift={handleViewShift}
            onDuplicateShift={handleDuplicateShift}
            onCompleteShift={handleCompleteShift}
            onCancelShift={handleCancelShift}
            onNotifyShift={handleNotifyShift}
          />
      
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