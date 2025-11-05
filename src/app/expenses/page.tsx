'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { ExpensesList } from '@/components/pages/expenses-list';
import { ExpenseModal } from '@/components/modals/expense-modal';
import { Expense, ExpenseType } from '@/lib/api/expenses-service';
import { useExpenses, useExpenseActions, defaultExpensesFilters } from '@/hooks/use-expenses';
import { useContacts } from '@/hooks/use-contacts';
import { useAuth } from '@/contexts/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerInputField } from '@/components/form/date-picker-input-field';
import { Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  // Filter states
  const [typeFilter, setTypeFilter] = useState<ExpenseType | undefined>(defaultExpensesFilters.type);
  const [contactFilter, setContactFilter] = useState<string>(defaultExpensesFilters.contact || '-1');
  const [dateFromFilter, setDateFromFilter] = useState<string | undefined>(undefined);
  const [dateToFilter, setDateToFilter] = useState<string | undefined>(undefined);

  // Fetch expenses with filters
  const {
    expenses,
    isLoading,
    error,
    total,
    filterCounter,
    setFilters,
    reloadList,
  } = useExpenses({
    defaultFilters: {
      type: typeFilter,
      contact: contactFilter,
      from: dateFromFilter,
      to: dateToFilter,
    },
  });

  // Fetch contacts for filter dropdown
  const { data: contacts = [], loading: contactsLoading, error: contactsError } = useContacts({ pageSize: 100 });

  const { user } = useAuth();
  const { deleteExpense } = useExpenseActions();

  // Check permissions
  const hasPermissionCreate = user?.scopes?.includes('expenses:create') ?? false;
  const hasPermissionUpdate = user?.scopes?.includes('expenses:update') ?? false;
  const hasPermissionDelete = user?.scopes?.includes('expenses:delete') ?? false;
  const hasPermissionBusiness = user?.scopes?.includes('expenses:type:business') ?? false;
  const hasPermissionReclaimable = user?.scopes?.includes('expenses:type:reclaimable') ?? false;
  const hasPermissionKilometre = user?.scopes?.includes('expenses:type:kilometre') ?? false;

  // Update filters when filter states change
  useEffect(() => {
    setFilters({
      type: typeFilter,
      contact: contactFilter,
      from: dateFromFilter,
      to: dateToFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, contactFilter, dateFromFilter, dateToFilter]);

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

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
        reloadList();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleSaveExpense = (expense: Expense) => {
    setIsModalOpen(false);
    setSelectedExpense(undefined);
    reloadList();
  };

  const handleClearFilters = () => {
    setTypeFilter(defaultExpensesFilters.type);
    setContactFilter(defaultExpensesFilters.contact || '-1');
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
  };

  const headerConfig = {
    title: 'Expenses',
    subtitle: 'Expenses overview',
    icon: Receipt,
    showAddButton: hasPermissionCreate,
    onAddClick: handleAddExpense,
    addButtonText: 'New',
    activeFilterCount: filterCounter,
    customFilterComponent: (
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select
          value={typeFilter === ExpenseType.All || !typeFilter ? 'all' : typeFilter}
          onValueChange={(value) => setTypeFilter(value === 'all' ? ExpenseType.All : (value as ExpenseType))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {hasPermissionBusiness && (
              <SelectItem value={ExpenseType.Business}>Business</SelectItem>
            )}
            {hasPermissionReclaimable && (
              <SelectItem value={ExpenseType.Reclaimable}>Reclaimable</SelectItem>
            )}
            {hasPermissionKilometre && (
              <SelectItem value={ExpenseType.Kilometre}>Kilometre</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select
          value={contactFilter || 'all'}
          onValueChange={(value) => setContactFilter(value === 'all' ? '-1' : value)}
          disabled={contactsLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={contactsLoading ? "Loading..." : contactsError ? "Error loading contacts" : "Contact"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All contacts</SelectItem>
            {contactsError ? (
              <div className="px-2 py-1.5 text-sm text-red-600">Failed to load contacts</div>
            ) : contacts.length === 0 && !contactsLoading ? (
              <div className="px-2 py-1.5 text-sm text-gray-500">No contacts available</div>
            ) : (
              contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <DatePickerInputField
          label=""
          id="dateFrom"
          value={dateFromFilter}
          onChange={(value) => setDateFromFilter(value || undefined)}
          placeholder="From Date"
        />

        <DatePickerInputField
          label=""
          id="dateTo"
          value={dateToFilter}
          onChange={(value) => setDateToFilter(value || undefined)}
          placeholder="To Date"
        />

        {filterCounter > 0 && (
          <Button variant="ghost" onClick={handleClearFilters} size="sm">
            Clear ({filterCounter})
          </Button>
        )}
      </div>
    ),
  };

  return (
    <MainLayout activeNavItem="expenses" headerConfig={headerConfig}>
      <ExpensesList
        expenses={expenses}
        loading={isLoading}
        error={error}
        total={total}
        onEditExpense={handleEditExpense}
        onViewExpense={handleViewExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(undefined);
        }}
        mode={modalMode}
        expense={selectedExpense}
        onSave={handleSaveExpense}
      />
    </MainLayout>
  );
}
