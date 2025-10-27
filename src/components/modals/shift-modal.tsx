'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shift, 
  ShiftStatus, 
  ShiftCategory, 
  ExpenseType, 
  RateType,
  Expense,
  Attachment 
} from '@/lib/api/shifts-service';
import { useShiftActions } from '@/hooks/use-shifts';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Download,
  Upload,
  Repeat
} from 'lucide-react';

// Form validation schema
const shiftSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  contact: z.string().min(1, 'Contact is required'),
  assignee: z.string().min(1, 'Assignee is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  location: z.string().optional(),
  category: z.nativeEnum(ShiftCategory),
  rate: z.string().optional(),
  rateAmount: z.number().min(0, 'Rate amount must be positive').optional(),
  comments: z.string().optional(),
  notes: z.string().optional(),
  isGstFree: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
});

type ShiftFormData = z.infer<typeof shiftSchema>;

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view' | 'complete' | 'duplicate';
  shift?: Shift;
  onSave?: (shift: Shift) => void;
}

export function ShiftModal({ isOpen, onClose, mode, shift, onSave }: ShiftModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const isReadOnly = mode === 'view';
  const isCompleteMode = mode === 'complete';

  const { 
    createShift, 
    updateShift, 
    completeShift, 
    cancelShift, 
    deleteShift,
    isSaving, 
    isCompleting 
  } = useShiftActions();

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      summary: '',
      contact: '',
      assignee: '',
      startDate: '',
      startTime: '',
      duration: 1,
      location: '',
      category: ShiftCategory.AssistanceDailyLife,
      rate: '',
      rateAmount: 0,
      comments: '',
      notes: '',
      isGstFree: false,
      recurrenceRule: '',
    },
  });

  // Reset form when shift changes
  useEffect(() => {
    if (shift) {
      const startDate = new Date(shift.startDate);
      const formData = {
        summary: mode === 'duplicate' ? `${shift.summary} (Copy)` : shift.summary,
        contact: shift.contact.fullName,
        assignee: shift.assignee.name,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        duration: Math.floor(shift.duration / 3600), // Convert seconds to hours
        location: shift.location || '',
        category: shift.category,
        rate: shift.rate || '',
        rateAmount: shift.rateAmountExclGst || 0,
        comments: shift.comments || '',
        notes: mode === 'duplicate' ? '' : (shift.notes || ''), // Clear notes for duplicate
        isGstFree: shift.isGstFree || false,
        recurrenceRule: mode === 'duplicate' ? '' : (shift.recurrenceRule || ''), // Clear recurrence for duplicate
      };
      
      form.reset(formData);
      
      // For duplicate mode, clear expenses and attachments
      if (mode === 'duplicate') {
        setExpenses([]);
        setAttachments([]);
      } else {
        setExpenses(shift.expenses || []);
        setAttachments(shift.attachments || []);
      }
    } else {
      form.reset();
      setExpenses([]);
      setAttachments([]);
    }
  }, [shift, mode, form]);

  const onSubmit = async (data: ShiftFormData) => {
    try {
      const shiftData = {
        ...data,
        id: shift?.id || Date.now().toString(),
        createdAt: shift?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add other required fields
        endDate: '', // Will be calculated
        duration: data.duration * 3600, // Convert hours to seconds
        shiftStatus: ShiftStatus.Pending,
        isComplete: false,
        isDuplicate: false,
        incidentsCount: 0,
        totalExclGst: 0,
        totalInclGst: 0,
        rateAmountExclGst: 0,
        rateName: '',
        rateType: RateType.Hourly,
        tz: 'Australia/Melbourne',
        client: data.contact,
        expenses: expenses,
        attachments: attachments,
      };

      if (mode === 'new') {
        const newShift = await createShift(shiftData as any);
        onSave?.(newShift);
      } else if (mode === 'edit' && shift?.id) {
        const updatedShift = await updateShift(shift.id, shiftData as any);
        onSave?.(updatedShift);
      } else if (mode === 'complete' && shift?.id) {
        const completedShift = await completeShift(shift.id, { isGstFree: data.isGstFree || false });
        onSave?.(completedShift);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
    }
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

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="summary">Summary *</Label>
            <Input
              id="summary"
              {...form.register('summary')}
              disabled={isReadOnly}
              placeholder="Brief description of the shift"
            />
            {form.formState.errors.summary && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.summary.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value as ShiftCategory)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ShiftCategory.AssistanceDailyLife}>Assistance with daily life</SelectItem>
                <SelectItem value={ShiftCategory.AssistanceSocialCommunity}>Assistance with social and community participation</SelectItem>
                <SelectItem value={ShiftCategory.Transport}>Transport</SelectItem>
                <SelectItem value={ShiftCategory.SupportCoordination}>Support Coordination</SelectItem>
                <SelectItem value={ShiftCategory.IncreasedSocialcommunity}>Increased social and community participation</SelectItem>
                <SelectItem value={ShiftCategory.FindingKeepingJob}>Finding and keeping a job</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact and Assignee */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact & Assignee</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact">Contact *</Label>
            <Input
              id="contact"
              {...form.register('contact')}
              disabled={isReadOnly}
              placeholder="Contact name"
            />
            {form.formState.errors.contact && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.contact.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="assignee">Assignee *</Label>
            <Input
              id="assignee"
              {...form.register('assignee')}
              disabled={isReadOnly}
              placeholder="Staff member name"
            />
            {form.formState.errors.assignee && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.assignee.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...form.register('startDate')}
              disabled={isReadOnly}
            />
            {form.formState.errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.startDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              {...form.register('startTime')}
              disabled={isReadOnly}
            />
            {form.formState.errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.startTime.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (hours) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              step="0.5"
              {...form.register('duration', { valueAsNumber: true })}
              disabled={isReadOnly}
            />
            {form.formState.errors.duration && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rate & Pricing */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rate & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rate">Rate</Label>
            <Select
              value={form.watch('rate')}
              onValueChange={(value) => form.setValue('rate', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard-hourly">Standard Hourly Rate</SelectItem>
                <SelectItem value="transport-hourly">Transport Hourly Rate</SelectItem>
                <SelectItem value="coordination-hourly">Coordination Hourly Rate</SelectItem>
                <SelectItem value="weekend-hourly">Weekend Hourly Rate</SelectItem>
                <SelectItem value="public-holiday-hourly">Public Holiday Hourly Rate</SelectItem>
                <SelectItem value="overtime-hourly">Overtime Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rateAmount">Rate Amount (excl. GST)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="rateAmount"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                placeholder="0.00"
                disabled={isReadOnly}
                {...form.register('rateAmount', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...form.register('location')}
            disabled={isReadOnly}
            placeholder="Shift location"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recurrence</h3>
        <div>
          <Label htmlFor="recurrenceRule">Repeat Pattern</Label>
          {renderRecurrenceOptions()}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              {...form.register('comments')}
              disabled={isReadOnly}
              placeholder="Additional comments about the shift"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              disabled={isReadOnly}
              placeholder="Internal notes"
              rows={3}
            />
          </div>

          {!isReadOnly && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isGstFree"
                checked={form.watch('isGstFree')}
                onCheckedChange={(checked) => form.setValue('isGstFree', checked)}
              />
              <Label htmlFor="isGstFree">GST Free</Label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expenses</h3>
        {!isReadOnly && (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-4" />
          <p>No expenses added</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    {expense.expenseType} • ${expense.amountInclGst.toFixed(2)}
                  </p>
                </div>
                {!isReadOnly && (
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attachments</h3>
        {!isReadOnly && (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>No attachments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">{attachment.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      {(attachment.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const getRecurrenceOptions = () => {
    const startDate = form.watch('startDate');
    const date = startDate ? new Date(startDate) : null;

    if (!date) {
      return [];
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfWeekShort = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const dayOfMonth = date.getDate();

    return [
      { value: 'none', label: 'Does not repeat' },
      { value: 'RRULE:FREQ=DAILY', label: 'Daily' },
      { value: 'RRULE:FREQ=WEEKLY', label: `Weekly on ${dayOfWeek}` },
      { value: `RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=${dayOfWeekShort}`, label: 'Fortnightly' },
      { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
      { value: 'RRULE:FREQ=YEARLY', label: `Yearly on ${monthName} ${dayOfMonth}` },
      { value: 'RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU,WE,TH,FR', label: 'Every weekday (Monday to Friday)' },
    ];
  };

  const getRecurrenceLabel = (recurrenceRule: string, startDate: string): string => {
    if (!recurrenceRule || recurrenceRule === '' || recurrenceRule === 'none') {
      return 'Does not repeat';
    }

    const options = getRecurrenceOptions();
    const option = options.find(opt => opt.value === recurrenceRule);
    
    if (option) {
      return option.label;
    }

    // Fallback to parsing the RRULE
    if (recurrenceRule.includes('FREQ=DAILY')) return 'Daily';
    if (recurrenceRule.includes('FREQ=WEEKLY')) {
      if (recurrenceRule.includes('BYDAY=MO,TU,WE,TH,FR')) return 'Every weekday (Monday to Friday)';
      if (recurrenceRule.includes('INTERVAL=2')) return 'Fortnightly';
      if (startDate) {
        const date = new Date(startDate);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        return `Weekly on ${dayOfWeek}`;
      }
      return 'Weekly';
    }
    if (recurrenceRule.includes('FREQ=MONTHLY')) return 'Monthly';
    if (recurrenceRule.includes('FREQ=YEARLY')) {
      if (startDate) {
        const date = new Date(startDate);
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const dayOfMonth = date.getDate();
        return `Yearly on ${monthName} ${dayOfMonth}`;
      }
      return 'Yearly';
    }

    return recurrenceRule;
  };

  const renderRecurrenceOptions = () => {
    const options = getRecurrenceOptions();
    const currentValue = form.watch('recurrenceRule') || '';
    // Convert empty string to 'none' for display, and 'none' back to empty string for form
    const displayValue = currentValue === '' ? 'none' : currentValue;
    // Only disabled if the shift already has an ID (existing shift) - not on new or duplicate
    const isExistingShift = shift?.id && mode === 'edit';

    return (
      <Select
        value={displayValue}
        onValueChange={(value) => form.setValue('recurrenceRule', value === 'none' ? '' : value)}
        disabled={isReadOnly || isExistingShift}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recurrence pattern" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">{shift?.summary}</h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(shift?.shiftStatus || ShiftStatus.Pending)} flex items-center gap-1`}>
                {getStatusIcon(shift?.shiftStatus || ShiftStatus.Pending)}
                {shift?.shiftStatus}
              </Badge>
              <Badge variant="outline">{shift?.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Shift Details</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Contact:</strong> {shift?.contact.fullName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Assignee:</strong> {shift?.assignee.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Time:</strong> {formatDateTime(shift?.startDate || '').date} {formatDateTime(shift?.startDate || '').time}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Duration:</strong> {formatDuration(shift?.duration || 0)}</span>
            </div>
            {shift?.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Location:</strong> {shift.location}</span>
              </div>
            )}
            {shift?.recurrenceRule && (
              <div className="flex items-center space-x-2">
                <Repeat className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Recurrence:</strong> {getRecurrenceLabel(shift.recurrenceRule, shift.startDate)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Rate:</strong> {shift?.rateName} - ${shift?.rateAmountExclGst.toFixed(2)} excl. GST</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Total:</strong> ${shift?.totalInclGst.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(shift?.comments || shift?.notes) && (
          <div>
            <h4 className="font-semibold mb-3">Comments & Notes</h4>
            <div className="space-y-2">
              {shift?.comments && (
                <div>
                  <p className="text-sm"><strong>Comments:</strong></p>
                  <p className="text-sm text-gray-600">{shift.comments}</p>
                </div>
              )}
              {shift?.notes && (
                <div>
                  <p className="text-sm"><strong>Notes:</strong></p>
                  <p className="text-sm text-gray-600">{shift.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(expenses.length > 0 || attachments.length > 0) && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="attachments">Attachments ({attachments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses">{renderExpensesTab()}</TabsContent>
          <TabsContent value="attachments">{renderAttachmentsTab()}</TabsContent>
        </Tabs>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' && 'Add New Shift'}
            {mode === 'edit' && 'Edit Shift'}
            {mode === 'view' && 'View Shift'}
            {mode === 'complete' && 'Complete Shift'}
            {mode === 'duplicate' && 'Duplicate Shift'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isReadOnly ? (
            renderViewMode()
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
                <TabsTrigger value="attachments">Attachments ({attachments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="details">{renderDetailsTab()}</TabsContent>
              <TabsContent value="expenses">{renderExpensesTab()}</TabsContent>
              <TabsContent value="attachments">{renderAttachmentsTab()}</TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
            </div>

            <div className="flex space-x-2">
              {!isReadOnly && (
                <Button type="submit" disabled={isSaving || isCompleting}>
                  {isSaving || isCompleting ? 'Saving...' : 
                   mode === 'new' ? 'Create Shift' : 
                   mode === 'complete' ? 'Complete Shift' : 'Save Changes'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
