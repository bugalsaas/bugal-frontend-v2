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
  Edit,
  Trash2,
  CheckCircle,
  Copy,
  AlertCircle,
  Plus,
  Loader2,
  XCircle,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  groupShiftsByDate, 
  formatDateHeader, 
  formatShiftDateTime, 
  formatShiftDuration,
  getStatusBorderColor,
  getShiftStatusBadgeVariant,
} from '@/lib/utils/shift-helpers';

interface ShiftsListProps {
  onAddShift: () => void;
  onEditShift: (shift: Shift) => void;
  onViewShift: (shift: Shift) => void;
  onDuplicateShift: (shift: Shift) => void;
  onCompleteShift: (shift: Shift) => void;
  onCancelShift?: (shift: Shift) => void;
  onNotifyShift?: (shift: Shift) => void;
}

export function ShiftsList({ onAddShift, onEditShift, onViewShift, onDuplicateShift, onCompleteShift, onCancelShift, onNotifyShift }: ShiftsListProps) {
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
    hasMoreBefore,
    hasMoreAfter,
    loadMoreBefore,
    loadMoreAfter,
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


  const getDateHeaderText = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) return 'Today';
    if (compareDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (compareDate.getTime() === yesterday.getTime()) return 'Yesterday';
    
    return date.toLocaleDateString('en-AU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
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

      {/* Load More Before Button */}
      {hasMoreBefore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => {
              if (hasMoreBefore) {
                const dateKey = shifts && shifts.length > 0 
                  ? new Date(shifts[0].startDate).toISOString().split('T')[0]
                  : hasMoreBefore;
                loadMoreBefore(hasMoreBefore);
              }
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}

      {/* Date-Grouped Shifts Table */}
      <div className="space-y-6">
        {(() => {
          const groupedShifts = groupShiftsByDate(shifts || []);
          const sortedDates = Array.from(groupedShifts.keys()).sort();
          
          if (sortedDates.length === 0) {
            return null;
          }

          return sortedDates.map((dateKey) => {
            const dateShifts = groupedShifts.get(dateKey) || [];
            const dateHeader = formatDateHeader(dateKey);
            const headerText = getDateHeaderText(dateKey);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Header */}
                <div className={`flex items-center gap-4 px-4 py-2 rounded-lg ${
                  dateHeader.isToday ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}>
                  <div className={`flex flex-col items-center justify-center min-w-[80px] ${
                    dateHeader.isToday ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    <div className="text-xs font-medium uppercase">{dateHeader.dayOfWeek}</div>
                    <div className="text-2xl font-bold">{dateHeader.dayOfMonth}</div>
                    <div className="text-xs font-medium">{dateHeader.month}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      dateHeader.isToday ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {headerText}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dateShifts.length} shift{dateShifts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Shifts for this date */}
                <div className="space-y-2 ml-0 md:ml-[100px]">
                  {dateShifts.map((shift) => {
                    const startTime = formatShiftDateTime(shift.startDate);
                    const endTime = formatShiftDateTime(shift.endDate);
                    const borderColor = getStatusBorderColor(shift.shiftStatus, shift.startDate);
                    
                    return (
                      <Card
                        key={shift.id}
                        className={`p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${borderColor}`}
                        onClick={() => handleViewShift(shift)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={getShiftStatusBadgeVariant(shift.shiftStatus)}>
                                {shift.shiftStatus}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {startTime.time} - {endTime.time} ({formatShiftDuration(shift.duration)})
                              </span>
                            </div>
                            
                            <div className="text-base font-semibold text-gray-900 mb-1">
                              {shift.contact?.fullName || shift.client || 'No contact'}
                            </div>
                            
                            {shift.summary && (
                              <div className="text-sm text-gray-600 mb-2">
                                {shift.summary}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              {shift.assignee && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{shift.assignee.fullName || shift.assignee.name}</span>
                                </div>
                              )}
                              {shift.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate max-w-[200px]">{shift.location}</span>
                                </div>
                              )}
                            </div>

                            {(shift.category || shift.totalExclGst) && (
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {shift.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {shift.category}
                                  </Badge>
                                )}
                                {shift.totalExclGst && (
                                  <Badge variant="outline" className="text-xs">
                                    ${Number(shift.totalExclGst).toFixed(2)} excl. GST
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div 
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {shift.shiftStatus !== ShiftStatus.Completed && shift.shiftStatus !== ShiftStatus.Cancelled && (
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
                            {shift.shiftStatus !== ShiftStatus.Cancelled && shift.shiftStatus !== ShiftStatus.Completed && onCancelShift && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCancelShift(shift)}
                                title="Cancel shift"
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {onNotifyShift && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onNotifyShift(shift)}
                                title="Notify shift"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Send className="h-4 w-4" />
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
              </div>
            );
          });
        })()}
      </div>

      {/* Load More After Button */}
      {hasMoreAfter && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => {
              if (hasMoreAfter) {
                loadMoreAfter(hasMoreAfter);
              }
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}

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
