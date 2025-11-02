'use client';

import { useState, useRef } from 'react';
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
  getTodayInTimezone,
} from '@/lib/utils/shift-helpers';
import { useAuth } from '@/contexts/auth-context';
import { useContacts } from '@/hooks/use-contacts';
import { UserSelector } from '@/components/ui/user-selector';

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
  const { user } = useAuth();
  const organizationTimezone = user?.organization?.timezone;
  const todayDateRef = useRef<HTMLDivElement>(null);

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

  // Fetch contacts for the contact filter
  const { data: contacts } = useContacts({ pageSize: 100 });

  const { deleteShift, selectShift } = useShiftActions();

  // Get today's date number for the calendar icon
  const getTodayDateNumber = () => {
    const todayStr = getTodayInTimezone(organizationTimezone);
    const today = new Date(todayStr + 'T00:00:00');
    return today.getDate();
  };

  // Scroll to today's date - centered on the page
  const scrollToToday = () => {
    if (todayDateRef.current) {
      todayDateRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      // Highlight briefly
      todayDateRef.current.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        todayDateRef.current?.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    }
  };

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
      {/* Sticky Header with Filters and New Button */}
      <div className="sticky top-[76px] z-30 bg-white border-b border-gray-200 shadow-sm py-4 mb-6 -mx-6 px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Filters Row */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="w-full">
              <Select
                value={filter.status || ShiftStatus.All}
                onValueChange={(value) => setFilter({ status: value as ShiftStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ShiftStatus.All}>All statuses</SelectItem>
                  <SelectItem value={ShiftStatus.Pending}>Pending</SelectItem>
                  <SelectItem value={ShiftStatus.Completed}>Completed</SelectItem>
                  <SelectItem value={ShiftStatus.Cancelled}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="w-full">
              <UserSelector
                value={filter.assignee || '-1'}
                onValueChange={(value) => setFilter({ assignee: value })}
                className="w-full"
              />
            </div>

            {/* Contact Filter */}
            <div className="w-full">
              <Select
                value={filter.contact || 'all'}
                onValueChange={(value) => setFilter({ contact: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All contacts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All contacts</SelectItem>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName && contact.lastName
                        ? `${contact.firstName} ${contact.lastName}`
                        : contact.organisationName || contact.email || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 flex-shrink-0">
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
                className="whitespace-nowrap"
              >
                Clear ({filterCounter})
              </Button>
            )}
            
            {/* Today Button with Calendar Icon */}
            <Button
              variant="outline"
              onClick={scrollToToday}
              className="relative p-1.5 h-10 w-10 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 group"
              title="Jump to today"
            >
              {/* Calendar Icon Outline */}
              <Calendar className="h-5 w-5 text-gray-600 group-hover:text-blue-600 absolute inset-0 m-auto" />
              {/* Date Number Overlay */}
              <span className="relative z-10 text-xs font-bold text-gray-800 group-hover:text-blue-700 mt-0.5">
                {getTodayDateNumber()}
              </span>
            </Button>
            
            {/* New Shift Button */}
            <Button onClick={onAddShift} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              New Shift
            </Button>
          </div>
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
          
          // Ensure "Today" is always included (using organization timezone)
          const todayKey = getTodayInTimezone(organizationTimezone);
          
          // Add today to grouped shifts if it doesn't exist
          if (!groupedShifts.has(todayKey)) {
            groupedShifts.set(todayKey, []);
          }
          
          const sortedDates = Array.from(groupedShifts.keys()).sort();
          
          return sortedDates.map((dateKey) => {
            const dateShifts = groupedShifts.get(dateKey) || [];
            const dateHeader = formatDateHeader(dateKey, organizationTimezone);
            const [firstShift, ...restShifts] = dateShifts;
            const hasNoShifts = dateShifts.length === 0;
            const isToday = dateHeader.isToday;

            return (
              <div key={dateKey} className="space-y-2" ref={isToday ? todayDateRef : null}>
                {/* Date Header with First Shift or Empty State */}
                <div className="flex gap-4 items-start">
                  {/* Date Header */}
                  <div className={`flex flex-col items-center justify-center min-w-[80px] px-4 py-2 rounded-lg ${
                    dateHeader.isToday ? 'bg-blue-600 text-white' : 'bg-gray-50'
                  }`}>
                    <div className={`flex flex-col items-center justify-center ${
                      dateHeader.isToday ? 'text-white' : 'text-gray-700'
                    }`}>
                      <div className={`text-xs font-medium uppercase ${dateHeader.isToday ? 'text-white' : ''}`}>
                        {dateHeader.dayOfWeek}
                      </div>
                      <div className={`text-2xl font-bold ${dateHeader.isToday ? 'text-white' : ''}`}>
                        {dateHeader.dayOfMonth}
                      </div>
                      <div className={`text-xs font-medium ${dateHeader.isToday ? 'text-white' : ''}`}>
                        {dateHeader.month}
                      </div>
                    </div>
                  </div>

                  {/* First Shift or Empty State */}
                  <div className="flex-1">
                    {hasNoShifts ? (
                      <Card className="p-4 bg-gray-50 border border-gray-200">
                        <p className="text-gray-600">
                          {dateHeader.isToday ? 'No shifts for today yet.' : 'No shifts for this date.'}
                        </p>
                      </Card>
                    ) : firstShift ? (() => {
                        const startTime = formatShiftDateTime(firstShift.startDate);
                        const endTime = formatShiftDateTime(firstShift.endDate);
                        const borderColor = getStatusBorderColor(firstShift.shiftStatus, firstShift.startDate);
                        
                        return (
                          <Card
                            key={firstShift.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                            style={{ borderLeftColor: borderColor }}
                            onClick={() => handleViewShift(firstShift)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant={getShiftStatusBadgeVariant(firstShift.shiftStatus)}>
                                    {firstShift.shiftStatus}
                                  </Badge>
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {startTime.time} - {endTime.time} ({formatShiftDuration(firstShift.duration)})
                                  </span>
                                </div>
                                
                                <div className="text-base font-semibold text-gray-900 mb-1">
                                  {firstShift.contact?.fullName || firstShift.client || 'No contact'}
                                </div>
                                
                                {firstShift.summary && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    {firstShift.summary}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                  {firstShift.assignee && (
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      <span>{firstShift.assignee.fullName || firstShift.assignee.name}</span>
                                    </div>
                                  )}
                                  {firstShift.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span className="truncate max-w-[200px]">{firstShift.location}</span>
                                    </div>
                                  )}
                                </div>

                                {(firstShift.category || firstShift.totalExclGst) && (
                                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {firstShift.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {firstShift.category}
                                      </Badge>
                                    )}
                                    {firstShift.totalExclGst && (
                                      <Badge variant="outline" className="text-xs">
                                        ${Number(firstShift.totalExclGst).toFixed(2)} excl. GST
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div 
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {firstShift.shiftStatus !== ShiftStatus.Completed && firstShift.shiftStatus !== ShiftStatus.Cancelled && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCompleteShift(firstShift)}
                                    title="Complete shift"
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {firstShift.shiftStatus !== ShiftStatus.Cancelled && firstShift.shiftStatus !== ShiftStatus.Completed && onCancelShift && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCancelShift(firstShift)}
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
                                    onClick={() => onNotifyShift(firstShift)}
                                    title="Notify shift"
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditShift(firstShift)}
                                  title="Edit shift"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDuplicateShift(firstShift)}
                                  title="Duplicate shift"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteShift(firstShift.id)}
                                  title="Delete shift"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })() : null}
                  </div>
                </div>

                {/* Remaining Shifts for this date */}
                {restShifts.length > 0 && (
                  <div className="space-y-2 ml-[100px]">
                    {restShifts.map((shift) => {
                    const startTime = formatShiftDateTime(shift.startDate);
                    const endTime = formatShiftDateTime(shift.endDate);
                    const borderColor = getStatusBorderColor(shift.shiftStatus, shift.startDate);
                    
                    return (
                      <Card
                        key={shift.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                        style={{ borderLeftColor: borderColor }}
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
                )}
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
