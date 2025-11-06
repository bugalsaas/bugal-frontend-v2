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
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface RatesListProps {
  rates?: Rate[];
  total?: number;
  onAddRate?: () => void;
  onViewRate?: (rate: Rate) => void;
  onEditRate?: (rate: Rate) => void;
  onDeleteRate?: (rate: Rate) => void;
  onArchiveRate?: (rate: Rate) => void;
  // Search and filter props
  searchValue?: string;
  rateTypeFilter?: RateType | undefined;
  isArchivedFilter?: boolean;
  onSearchChange?: (value: string) => void;
  onRateTypeFilterChange?: (value: RateType | undefined) => void;
  onArchivedFilterChange?: (value: boolean) => void;
}

export function RatesList({ 
  rates: ratesProp,
  total: totalProp,
  onAddRate,
  onViewRate, 
  onEditRate, 
  onDeleteRate, 
  onArchiveRate,
  searchValue,
  rateTypeFilter,
  isArchivedFilter,
  onSearchChange,
  onRateTypeFilterChange,
  onArchivedFilterChange,
}: RatesListProps) {
  // Always use hook (parent controls filters via setFilters)
  const ratesHook = useRates();
  const rates = ratesProp ?? ratesHook.data ?? [];
  const total = totalProp ?? ratesHook.total ?? 0;
  const loading = ratesProp === undefined ? ratesHook.loading : false;
  const error = ratesProp === undefined ? ratesHook.error : null;
  const filterCounter = ratesProp === undefined ? ratesHook.filterCounter : 0;
  const filters = ratesProp === undefined ? ratesHook.filters : { search: '', rateType: undefined, isArchived: false };
  const setFilters = ratesProp === undefined ? ratesHook.setFilters : () => {};
  const pagination = ratesProp === undefined ? ratesHook.pagination : { pageNumber: 1, pageSize: 100 };
  const setPagination = ratesProp === undefined ? ratesHook.setPagination : () => {};

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

  // Use props if provided, otherwise fall back to hook filters
  const effectiveSearchValue = searchValue !== undefined ? searchValue : filters.search || '';
  const effectiveRateTypeFilter = rateTypeFilter !== undefined ? rateTypeFilter : filters.rateType;
  const effectiveIsArchivedFilter = isArchivedFilter !== undefined ? isArchivedFilter : filters.isArchived || false;

  return (
    <div className="space-y-4">
      {/* Results Summary with Consolidated Controls Row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {rates.length} of {total} rate{total !== 1 ? 's' : ''}
        </p>
        {/* Consolidated controls row - Desktop only, aligned to the right */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* Search input */}
          {onSearchChange && (
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Start typing to filter results..."
                className="pl-10 w-full"
                value={effectiveSearchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {/* Type dropdown */}
          {onRateTypeFilterChange && (
            <Select
              value={effectiveRateTypeFilter || 'all'}
              onValueChange={(v) => onRateTypeFilterChange(v === 'all' ? undefined : (v as RateType))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value={RateType.Hourly}>Hourly</SelectItem>
                <SelectItem value={RateType.Fixed}>Fixed</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/* Show archived checkbox */}
          {onArchivedFilterChange && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="archived-desktop"
                checked={effectiveIsArchivedFilter}
                onCheckedChange={(v) => onArchivedFilterChange(!!v)}
              />
              <label htmlFor="archived-desktop" className="text-sm text-gray-700 cursor-pointer whitespace-nowrap">Show archived</label>
            </div>
          )}
          {/* New Rate button */}
          {onAddRate && (
            <Button 
              onClick={onAddRate}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Rate
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {rates.map((rate) => (
          <Card
            key={rate.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewRate(rate)}
          >
            <div className="space-y-2">
              {/* Top row: Name left, Type right */}
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium text-gray-900 truncate">
                  {rate.name}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getRateTypeIcon(rate.rateType)}
                  <Badge className={getRateTypeColor(rate.rateType)}>{rate.rateType}</Badge>
                  {rate.isArchived && (
                    <Badge variant="outline" className="text-gray-500">Archived</Badge>
                  )}
                </div>
              </div>

              {/* Description (optional) */}
              {rate.description && (
                <div className="text-sm text-gray-500 truncate">{rate.description}</div>
              )}

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
