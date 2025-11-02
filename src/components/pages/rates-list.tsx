'use client';

import React, { useMemo } from 'react';
import { useRates } from '@/hooks/use-rates';
import { Rate, RateType } from '@/lib/api/rates-service';
import { formatCurrency } from '@/lib/utils';
import { 
  Clock, 
  Lock, 
  Eye, 
  Edit, 
  Trash2, 
  Archive,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface RatesListProps {
  onViewRate?: (rate: Rate) => void;
  onEditRate?: (rate: Rate) => void;
  onDeleteRate?: (rate: Rate) => void;
  onArchiveRate?: (rate: Rate) => void;
}

export function RatesList({ 
  onViewRate, 
  onEditRate, 
  onDeleteRate, 
  onArchiveRate 
}: RatesListProps) {
  const { data: rates, loading, error, total, filterCounter, filters, setFilters, pagination, setPagination } = useRates();

  const currentPage = pagination.pageNumber || 1;
  const pageSize = pagination.pageSize || 100;

  const totalPages = useMemo(() => {
    if (!total || !pageSize) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const handleViewRate = (rate: Rate) => {
    if (onViewRate) {
      onViewRate(rate);
    }
  };

  const handleEditRate = (rate: Rate) => {
    if (onEditRate) {
      onEditRate(rate);
    }
  };

  const handleDeleteRate = (rate: Rate) => {
    if (onDeleteRate) {
      onDeleteRate(rate);
    }
  };

  const handleArchiveRate = (rate: Rate) => {
    if (onArchiveRate) {
      onArchiveRate(rate);
    }
  };

  const getRateTypeIcon = (rateType: RateType) => {
    return rateType === RateType.Fixed ? (
      <Lock className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );
  };

  const getRateTypeColor = (rateType: RateType) => {
    return rateType === RateType.Fixed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading rates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Rates</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!rates || rates.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rates Found</h3>
        <p className="text-gray-600">
          {filterCounter > 0 
            ? 'No rates match your current filters. Try adjusting your search criteria.'
            : 'Get started by creating your first rate.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="md:w-72">
            <label className="block text-xs text-gray-600 mb-1">Search</label>
            <Input
              placeholder="Start typing to filter results"
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
          <div className="md:w-48">
            <label className="block text-xs text-gray-600 mb-1">Type</label>
            <Select
              value={filters.rateType || 'all'}
              onValueChange={(v) => setFilters({ rateType: v === 'all' ? undefined : (v as RateType) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value={RateType.Hourly}>Hourly</SelectItem>
                <SelectItem value={RateType.Fixed}>Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-1 md:mt-0">
            <Checkbox
              id="archived"
              checked={!!filters.isArchived}
              onCheckedChange={(v) => setFilters({ isArchived: !!v })}
            />
            <label htmlFor="archived" className="text-sm text-gray-700">Show archived</label>
          </div>
        </div>
        <div className="flex gap-2">
          {filterCounter > 0 && (
            <Button variant="secondary" onClick={() => setFilters({ search: '', rateType: undefined, isArchived: false })}>Clear</Button>
          )}
        </div>
      </div>
      {/* Filter Summary */}
      {filterCounter > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Showing {rates.length} of {total} rates</span>
          <Badge variant="secondary">{filterCounter} filter{filterCounter > 1 ? 's' : ''} applied</Badge>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {rates.map((rate) => (
          <Card
            key={rate.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewRate(rate)}
          >
            <div className="space-y-3">
              {/* Type */}
              <div className="flex items-center gap-2">
                {getRateTypeIcon(rate.rateType)}
                <Badge className={getRateTypeColor(rate.rateType)}>{rate.rateType}</Badge>
                {rate.isArchived && (
                  <Badge variant="outline" className="text-gray-500">Archived</Badge>
                )}
              </div>

              {/* Name */}
              <div>
                <div className="font-medium text-gray-900">{rate.name}</div>
                {rate.description && (
                  <div className="text-sm text-gray-500 mt-1">{rate.description}</div>
                )}
              </div>

              {/* Amount */}
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(rate.amountExclGst)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rates Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (excl. GST)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rates.map((rate) => (
              <tr key={rate.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getRateTypeIcon(rate.rateType)}
                    <Badge className={getRateTypeColor(rate.rateType)}>{rate.rateType}</Badge>
                    {rate.isArchived && (
                      <Badge variant="outline" className="text-gray-500">Archived</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{rate.name}</div>
                  {rate.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">{rate.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(rate.amountExclGst)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewRate(rate)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRate(rate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!rate.isArchived && (
                      <Button variant="ghost" size="sm" onClick={() => handleArchiveRate(rate)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRate(rate)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {rates.length} of {total} rates
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPagination({ pageNumber: currentPage - 1 })}
          >
            Prev
          </Button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPagination({ pageNumber: currentPage + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
