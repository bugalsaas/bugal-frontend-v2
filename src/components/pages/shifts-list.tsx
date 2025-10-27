'use client';

import { useState } from 'react';
import { useShifts, useShiftActions } from '@/hooks/use-shifts';
import { Shift, ShiftStatus, ShiftCategory } from '@/lib/api/shifts-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShiftsListProps {
  onAddShift: () => void;
  onEditShift: (shift: Shift) => void;
  onViewShift: (shift: Shift) => void;
  onDuplicateShift: (shift: Shift) => void;
  onCompleteShift: (shift: Shift) => void;
}

export function ShiftsList({ onAddShift, onEditShift, onViewShift, onDuplicateShift, onCompleteShift }: ShiftsListProps) {
  const router = useRouter();

  const {
    data: shifts,
    loading,
    error,
    total,
    filterCounter,
    filter,
    setFilter,
    reloadList,
  } = useShifts();

  const { deleteShift, selectShift } = useShiftActions();

  const handleDeleteShift = async (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(shiftId, 'single');
        reloadList();
      } catch (error) {
        console.error('Failed to delete shift:', error);
      }
    }
  };

  const handleViewShift = (shift: Shift) => {
    onViewShift(shift);
  };

  const handleEditShift = (shift: Shift) => {
    onEditShift(shift);
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.Completed:
        return 'bg-green-100 text-green-800';
      case ShiftStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case ShiftStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.Completed:
        return <CheckCircle className="h-4 w-4" />;
      case ShiftStatus.Cancelled:
        return <XCircle className="h-4 w-4" />;
      case ShiftStatus.Pending:
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading shifts...</p>
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
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full md:max-w-xs">
          <Select
            value={filter.status || ShiftStatus.All}
            onValueChange={(value) => setFilter({ status: value as ShiftStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ShiftStatus.All}>All Statuses</SelectItem>
              <SelectItem value={ShiftStatus.Pending}>Pending</SelectItem>
              <SelectItem value={ShiftStatus.Completed}>Completed</SelectItem>
              <SelectItem value={ShiftStatus.Cancelled}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {filterCounter > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setFilter({
                  status: ShiftStatus.All,
                  assignee: '-1',
                  contact: '',
                  before: undefined,
                  after: undefined,
                });
              }}
            >
              Clear Filters ({filterCounter})
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total} shift{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Shifts List */}
      <div className="space-y-3">
        {shifts?.map((shift) => {
          const startTime = formatDateTime(shift.startDate);
          const endTime = formatDateTime(shift.endDate);
          
          return (
            <Card key={shift.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {shift.summary}
                      </h3>
                      <p className="text-sm text-gray-600">{shift.client}</p>
                    </div>
                    <Badge className={`${getStatusColor(shift.shiftStatus)} flex items-center gap-1`}>
                      {getStatusIcon(shift.shiftStatus)}
                      {shift.shiftStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {startTime.date} {startTime.time} - {endTime.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(shift.duration)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{shift.assignee.name}</span>
                    </div>

                    {shift.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{shift.location}</span>
                      </div>
                    )}
                  </div>

                  {shift.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{shift.comments}</p>
                    </div>
                  )}

                  {shift.notes && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        <strong>Notes:</strong> {shift.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {shift.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ${shift.totalExclGst.toFixed(2)} excl. GST
                    </Badge>
                    {shift.incidentsCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {shift.incidentsCount} incident{shift.incidentsCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewShift(shift)}
                    title="View shift"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {shift.status !== ShiftStatus.Completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCompleteShift(shift)}
                      title="Complete shift"
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditShift(shift)}
                    title="Edit shift"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateShift(shift)}
                    title="Duplicate shift"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteShift(shift.id)}
                    title="Delete shift"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {shifts?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No shifts found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first shift
          </p>
          <Button onClick={onAddShift} className="flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      )}
    </div>
  );
}
