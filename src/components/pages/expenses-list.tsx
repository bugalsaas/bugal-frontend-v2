'use client';

import { useState } from 'react';
import { useExpenses, useExpenseActions } from '@/hooks/use-expenses';
import { Expense, ExpenseType, getExpenseCategoryText } from '@/lib/api/expenses-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Receipt,
  DollarSign,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Loader2,
  FileText,
  Car,
  Building,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExpensesListProps {
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onViewExpense: (expense: Expense) => void;
}

export function ExpensesList({ onAddExpense, onEditExpense, onViewExpense }: ExpensesListProps) {
  const router = useRouter();

  const {
    expenses,
    isLoading,
    error,
    total,
    filterCounter,
    filters,
    setFilters,
    reloadList,
  } = useExpenses();

  const { deleteExpense, selectExpense } = useExpenseActions();

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
        reloadList(); // Refresh the list after deletion
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleViewExpense = (expense: Expense) => {
    onViewExpense(expense);
  };

  const handleEditExpense = (expense: Expense) => {
    onEditExpense(expense);
  };

  const getExpenseTypeColor = (type: ExpenseType) => {
    switch (type) {
      case ExpenseType.Business:
        return 'bg-blue-100 text-blue-800';
      case ExpenseType.Reclaimable:
        return 'bg-green-100 text-green-800';
      case ExpenseType.Kilometre:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpenseTypeIcon = (type: ExpenseType) => {
    switch (type) {
      case ExpenseType.Business:
        return <Building className="h-3 w-3" />;
      case ExpenseType.Reclaimable:
        return <Receipt className="h-3 w-3" />;
      case ExpenseType.Kilometre:
        return <Car className="h-3 w-3" />;
      default:
        return <Receipt className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading expenses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Error: {error}</p>
        <Button onClick={reloadList} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => setFilters({ type: value === 'all' ? undefined : (value as ExpenseType) })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ExpenseType.Business}>Business</SelectItem>
              <SelectItem value={ExpenseType.Reclaimable}>Reclaimable</SelectItem>
              <SelectItem value={ExpenseType.Kilometre}>Kilometre</SelectItem>
            </SelectContent>
          </Select>
          
          {filterCounter > 0 && (
            <Button variant="ghost" onClick={() => setFilters({ type: undefined, contact: '', from: undefined, to: undefined })}>
              Clear Filters ({filterCounter})
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total} expense{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses?.map((expense) => (
          <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
              {/* Expense Info Column (3 cols) */}
              <div className="col-span-6 md:col-span-3">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <Receipt className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {expense.description}
                  </h3>
                </div>
                <Badge className={`${getExpenseTypeColor(expense.expenseType)} flex items-center gap-1 text-xs w-fit`}>
                  {getExpenseTypeIcon(expense.expenseType)}
                  {expense.expenseType}
                </Badge>
                {expense.category && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getExpenseCategoryText(expense.idCategory || '')}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Payee Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="truncate">{expense.payee}</span>
                </div>
              </div>

              {/* Date Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>

              {/* Amount Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{formatCurrency(expense.amountInclGst)}</span>
                </div>
              </div>

              {/* Attachments Column (2 cols) */}
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{expense.attachments?.length || 0} file{(expense.attachments?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Actions Column (1 col) */}
              <div className="col-span-12 md:col-span-1">
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewExpense(expense)}
                    title="View expense"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!expense.idInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExpense(expense)}
                      title="Edit expense"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {!expense.idInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      title="Delete expense"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(expense.contact || expense.kms || expense.attachments?.length) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {expense.contact && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Contact: {expense.contact.fullName}</span>
                    </div>
                  )}
                  {expense.kms && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{expense.kms} km @ {formatCurrency(expense.kmRateAmountExclGst || 0)}/km</span>
                    </div>
                  )}
                  {expense.attachments && expense.attachments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>
                        {expense.attachments.map(att => att.fileName).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {expenses?.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No expenses found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first expense
          </p>
          <Button onClick={onAddExpense} className="flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )}
    </div>
  );
}
