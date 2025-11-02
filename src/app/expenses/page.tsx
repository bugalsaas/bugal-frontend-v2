'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { ExpensesList } from '@/components/pages/expenses-list';
import { ExpenseModal } from '@/components/modals/expense-modal';
import { Expense } from '@/lib/api/expenses-service';
import { Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    console.log('Expense deleted:', id);
    // The list will automatically refresh due to the hook's state management
  };

  const handleSaveExpense = (expense: Expense) => {
    console.log('Expense saved:', expense);
    // The list will automatically refresh due to the hook's state management
  };

  const headerConfig = {
    title: 'Expenses',
    subtitle: 'Expenses overview',
    icon: Receipt,
    showAddButton: true,
    onAddClick: handleAddExpense,
    addButtonText: 'Add Expense',
  };

  return (
    <MainLayout activeNavItem="expenses" headerConfig={headerConfig}>
      <ExpensesList
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
        onViewExpense={handleViewExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        expense={selectedExpense}
        onSave={handleSaveExpense}
      />
    </MainLayout>
  );
}
