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

  // Applied filter states
  const [typeFilter, setTypeFilter] = useState<ExpenseType | undefined>(defaultExpensesFilters.type);
  const [contactFilter, setContactFilter] = useState<string>(defaultExpensesFilters.contact || '-1');
  const [dateFromFilter, setDateFromFilter] = useState<string | undefined>(undefined);
  const [dateToFilter, setDateToFilter] = useState<string | undefined>(undefined);

  // Drawer filter states (not applied until Apply)
  const [drawerTypeFilter, setDrawerTypeFilter] = useState<ExpenseType | 'all'>(ExpenseType.All);
  const [drawerContactFilter, setDrawerContactFilter] = useState<string>('all');
  const [drawerFromDate, setDrawerFromDate] = useState<string | undefined>(undefined);
  const [drawerToDate, setDrawerToDate] = useState<string | undefined>(undefined);

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
    // Clear drawer + applied
    setDrawerTypeFilter('all');
    setDrawerContactFilter('all');
    setDrawerFromDate(undefined);
    setDrawerToDate(undefined);
    setTypeFilter(defaultExpensesFilters.type);
    setContactFilter(defaultExpensesFilters.contact || '-1');
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
  };

  const handleApply = () => {
    setTypeFilter(drawerTypeFilter === 'all' ? ExpenseType.All : (drawerTypeFilter as ExpenseType));
    setContactFilter(drawerContactFilter === 'all' ? '-1' : drawerContactFilter);
    setDateFromFilter(drawerFromDate);
    setDateToFilter(drawerToDate);
  };

  const handleDrawerOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDrawerTypeFilter(typeFilter && typeFilter !== ExpenseType.All ? typeFilter : 'all');
      setDrawerContactFilter(contactFilter && contactFilter !== '-1' ? contactFilter : 'all');
      setDrawerFromDate(dateFromFilter);
      setDrawerToDate(dateToFilter);
    }
  };

  const headerConfig = {
    title: 'Expenses',
    subtitle: 'Expenses overview',
    icon: Receipt,
    showAddButton: hasPermissionCreate, // desktop header
    onAddClick: handleAddExpense,
    addButtonText: 'New',
    showAddButtonInDrawer: false,
    onApply: handleApply,
    onClear: handleClearFilters,
    onDrawerOpenChange: handleDrawerOpenChange,
    activeFilterCount: filterCounter,
    customFilterComponent: (
      <div className="grid grid-cols-2 gap-3 items-start w-full">
        <Select
          value={drawerTypeFilter || 'all'}
          onValueChange={(value) => setDrawerTypeFilter(value === 'all' ? 'all' : (value as ExpenseType))}
        >
          <SelectTrigger className="w-full">
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
          value={drawerContactFilter || 'all'}
          onValueChange={(value) => setDrawerContactFilter(value)}
          disabled={contactsLoading}
        >
          <SelectTrigger className="w-full">
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

        <div className="col-span-2">
          <DatePickerInputField
            label=""
            id="dateFrom"
            value={drawerFromDate}
            onChange={(value) => setDrawerFromDate(value || undefined)}
            placeholder="From Date"
          />
        </div>

        <div className="col-span-2">
          <DatePickerInputField
            label=""
            id="dateTo"
            value={drawerToDate}
            onChange={(value) => setDrawerToDate(value || undefined)}
            placeholder="To Date"
          />
        </div>
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
        onAddExpense={hasPermissionCreate ? handleAddExpense : undefined}
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
