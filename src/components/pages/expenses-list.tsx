'use client';

import { Expense, ExpenseType } from '@/lib/api/expenses-service';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  Receipt,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Wallet,
  Car,
} from 'lucide-react';

interface ExpensesListProps {
  expenses?: Expense[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  onEditExpense: (expense: Expense) => void;
  onViewExpense: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export function ExpensesList({ 
  expenses = [],
  loading = false,
  error = null,
  total = 0,
  onEditExpense, 
  onViewExpense,
  onDeleteExpense,
}: ExpensesListProps) {
  const { user } = useAuth();

  // Check permissions
  const hasPermissionUpdate = user?.scopes?.includes('expenses:update') ?? false;
  const hasPermissionDelete = user?.scopes?.includes('expenses:delete') ?? false;

  const handleDeleteExpense = (expenseId: string) => {
    if (onDeleteExpense) {
      onDeleteExpense(expenseId);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getExpenseTypeIcon = (type: ExpenseType) => {
    if (type === ExpenseType.Reclaimable) {
      return <Receipt className="h-4 w-4 inline mr-1" />;
    } else if (type === ExpenseType.Kilometre) {
      return <Car className="h-4 w-4 inline mr-1" />;
    } else {
      return <Wallet className="h-4 w-4 inline mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading expenses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Expenses</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No expenses found
        </h3>
        <p className="text-gray-600">
          Get started by adding your first expense
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden xl:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (GST)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewExpense(expense)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {expense.icon || getExpenseTypeIcon(expense.expenseType)}
                    <span className="text-sm text-gray-900">{expense.expenseType}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    {formatDate(expense.date)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(expense.amountInclGst)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(expense.amountGst)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.payee}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.contact?.fullName || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewExpense(expense)}
                      title="View expense"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!expense.idInvoice && hasPermissionUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditExpense(expense)}
                        title="Edit expense"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {!expense.idInvoice && hasPermissionDelete && (
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="xl:hidden space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewExpense(expense)}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {expense.icon || getExpenseTypeIcon(expense.expenseType)}
                <span className="text-sm font-semibold text-gray-900">{expense.expenseType}</span>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewExpense(expense)}
                  title="View expense"
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!expense.idInvoice && hasPermissionUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditExpense(expense)}
                    title="Edit expense"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {!expense.idInvoice && hasPermissionDelete && (
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

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Payee:</span>
                <span>{expense.payee}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                <span>{formatDate(expense.date)}</span>
              </div>
              <div className="flex items-center text-gray-900 font-medium">
                <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                <span>{formatCurrency(expense.amountInclGst)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
