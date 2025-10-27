'use client';

import React from 'react';
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
  const { data: rates, loading, error, total, filterCounter, filters, setFilters } = useRates();

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
      {/* Filter Summary */}
      {filterCounter > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Showing {rates.length} of {total} rates</span>
          <Badge variant="secondary">{filterCounter} filter{filterCounter > 1 ? 's' : ''} applied</Badge>
        </div>
      )}

      {/* Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewRate(rate)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getRateTypeIcon(rate.rateType)}
                <Badge className={getRateTypeColor(rate.rateType)}>
                  {rate.rateType}
                </Badge>
              </div>
              {rate.isArchived && (
                <Badge variant="outline" className="text-gray-500">
                  Archived
                </Badge>
              )}
            </div>

            {/* Rate Details */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{rate.name}</h3>
                {rate.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{rate.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Amount (excl. GST)</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(rate.amountExclGst)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total (incl. GST)</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(rate.amountInclGst)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRate(rate);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditRate(rate);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {!rate.isArchived && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveRate(rate);
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRate(rate);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Info */}
      {total > rates.length && (
        <div className="text-center text-sm text-gray-600">
          Showing {rates.length} of {total} rates
        </div>
      )}
    </div>
  );
}
