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
import { useShiftActions, useShift } from '@/hooks/use-shifts';
import { DateTimePickerField } from '@/components/form/date-time-picker-field';
import { ContactSelector } from '@/components/form/contact-selector';
import { RateSelector } from '@/components/form/rate-selector';
import { TimezoneSelector } from '@/components/form/timezone-selector';
import { DurationSelector } from '@/components/form/duration-selector';
import { RecurrenceSelector } from '@/components/form/recurrence-selector';
import { UserSelector } from '@/components/ui/user-selector';
import { Contact } from '@/lib/api/contacts-service';
import { useAuth } from '@/contexts/auth-context';
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
  Repeat,
  Loader2,
  Link2
} from 'lucide-react';

// Form validation schema matching backend ShiftDto
const shiftSchema = z.object({
  summary: z.string().min(1, 'Summary is required').max(255, 'Summary must be 255 characters or less'),
  idContact: z.string().min(1, 'Contact is required'),
  idAssignee: z.string().min(1, 'Assignee is required'),
  idRate: z.string().min(1, 'Rate is required'),
  location: z.string().min(1, 'Location is required').max(255, 'Location must be 255 characters or less'),
  startDate: z.string().min(1, 'Start date and time is required'), // ISO DateTime string
  duration: z.number().min(900, 'Duration must be at least 15 minutes'), // Duration in seconds
  tz: z.string().min(1, 'Timezone is required'),
  category: z.string().optional(),
  comments: z.string().max(1000, 'Comments must be 1000 characters or less').optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  recurrenceRule: z.string().optional(),
}).refine((data) => {
  // Ensure assignee is set before submission
  return data.idAssignee && data.idAssignee.length > 0;
}, {
  message: 'Assignee is required',
  path: ['idAssignee'],
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
  // CRITICAL: Log at the very start of component
  console.log('=== ShiftModal FUNCTION CALLED ===', { isOpen, mode });
  
  const [activeTab, setActiveTab] = useState('details');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fetchedShift, setFetchedShift] = useState<Shift | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [rateAmountExclGst, setRateAmountExclGst] = useState<number>(0);

  const { user } = useAuth();
  const isReadOnly = mode === 'view';
  const isCompleteMode = mode === 'complete';
  const hasUsersDataAllScope = user?.scopes?.includes('users:data:all') ?? false;

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('ShiftModal opened:', { isOpen, mode, hasShift: !!shift });
    }
  }, [isOpen, mode, shift]);

  const { 
    createShift, 
    updateShift, 
    completeShift, 
    cancelShift, 
    deleteShift,
    isSaving, 
    isCompleting 
  } = useShiftActions();
  
  const { getOne, loading: isLoadingShift } = useShift();

  // Default timezone from user's organization or fallback to Melbourne
  const defaultTimezone = user?.organization?.timezone || 'Australia/Melbourne';

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    mode: 'onChange',
    defaultValues: {
      summary: '',
      idContact: '',
      idAssignee: user?.id || '',
      idRate: '',
      location: '',
      startDate: '',
      duration: 3600, // 1 hour in seconds
      tz: defaultTimezone,
      category: ShiftCategory.AssistanceDailyLife,
      comments: '',
      notes: '',
      recurrenceRule: '',
    },
  });

  // Log form state for debugging
  useEffect(() => {
    if (isOpen && mode === 'new') {
      console.log('Form initialized for new shift:', {
        idAssignee: form.getValues('idAssignee'),
        user: user?.id,
        formErrors: form.formState.errors,
      });
    }
  }, [isOpen, mode, user?.id]); // Removed form from dependencies

  // Ensure assignee is set when user is available
  useEffect(() => {
    if (isOpen && mode === 'new' && user?.id) {
      const currentAssignee = form.getValues('idAssignee');
      if (!currentAssignee || currentAssignee === '') {
        form.setValue('idAssignee', user.id, { shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id, mode]); // Removed form from dependencies to prevent infinite loop

  // Fetch full shift details when modal opens in edit/view/duplicate modes
  useEffect(() => {
    if (isOpen && shift?.id && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      const fetchShiftData = async () => {
        try {
          setFetchError(null);
          const fullShift = await getOne(shift.id);
          setFetchedShift(fullShift);
        } catch (error) {
          console.error('Failed to fetch shift:', error);
          setFetchError(error instanceof Error ? error.message : 'Failed to load shift');
          // Fallback to the shift prop if fetch fails
          setFetchedShift(shift);
        }
      };
      
      fetchShiftData();
    } else if (isOpen && mode === 'new') {
      // For new mode, reset everything
      setFetchedShift(null);
      setFetchError(null);
      // Don't call form.reset() here - let the other useEffect handle it to prevent infinite loops
      setExpenses([]);
      setAttachments([]);
    } else if (!isOpen) {
      // Reset when modal closes
      setFetchedShift(null);
      setFetchError(null);
    }
  }, [isOpen, shift?.id, mode, getOne]);

  // Track last reset to prevent infinite loops
  const lastResetRef = React.useRef<string>('');
  
  // Reset form when fetched shift data changes
  useEffect(() => {
    // Use fetchedShift if available, otherwise fallback to shift prop
    const shiftToUse = fetchedShift || shift;
    
    // Create a unique key for this reset operation
    const resetKey = `${shiftToUse?.id || 'new'}-${mode}-${isOpen}`;
    
    // Skip if we've already reset for this combination
    if (lastResetRef.current === resetKey) {
      return;
    }
    
    if (shiftToUse) {
      const startDate = new Date(shiftToUse.startDate);
      const formData = {
        summary: mode === 'duplicate' ? `${shiftToUse.summary} (Copy)` : shiftToUse.summary,
        idContact: shiftToUse.idContact || shiftToUse.contact?.id || '',
        idAssignee: shiftToUse.idAssignee || shiftToUse.assignee?.id || '',
        idRate: shiftToUse.idRate || '',
        location: shiftToUse.location || '',
        startDate: startDate.toISOString(), // Full ISO DateTime string
        duration: shiftToUse.duration || 3600, // Duration in seconds
        tz: shiftToUse.tz || defaultTimezone,
        category: shiftToUse.category || ShiftCategory.AssistanceDailyLife,
        comments: shiftToUse.comments || '',
        notes: mode === 'duplicate' ? '' : (shiftToUse.notes || ''), // Clear notes for duplicate
        recurrenceRule: mode === 'duplicate' ? '' : (shiftToUse.recurrenceRule || ''), // Clear recurrence for duplicate
      };
      
      form.reset(formData);
      setRateAmountExclGst(shiftToUse.rateAmountExclGst || 0);
      
      // For duplicate mode, clear expenses and attachments
      if (mode === 'duplicate') {
        setExpenses([]);
        setAttachments([]);
        setSelectedContact(undefined);
      } else {
        setExpenses(shiftToUse.expenses || []);
        setAttachments(shiftToUse.attachments || []);
        // Set selected contact if available
        if (shiftToUse.contact) {
          setSelectedContact(shiftToUse.contact as any);
        }
      }
      
      lastResetRef.current = resetKey;
    } else if (isOpen && mode === 'new') {
      // Only reset for new mode when modal is actually open
      if (lastResetRef.current !== resetKey) {
        // Reset form for new mode
        form.reset({
          summary: '',
          idContact: '',
          idAssignee: user?.id || '',
          idRate: '',
          location: '',
          startDate: '',
          duration: 3600,
          tz: defaultTimezone,
          category: ShiftCategory.AssistanceDailyLife,
          comments: '',
          notes: '',
          recurrenceRule: '',
        });
        setExpenses([]);
        setAttachments([]);
        setSelectedContact(undefined);
        setRateAmountExclGst(0);
        
        lastResetRef.current = resetKey;
      }
    } else if (!isOpen) {
      // When modal closes, just update the ref but don't reset (to avoid unnecessary re-renders)
      if (lastResetRef.current !== resetKey) {
        lastResetRef.current = resetKey;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedShift, shift, mode, isOpen, defaultTimezone, user?.id]); // Removed form from dependencies to prevent infinite loop

  // CRITICAL: Log after all hooks
  console.log('=== AFTER ALL HOOKS ===', { isOpen, mode });

  const onSubmit = async (data: ShiftFormData) => {
    try {
      // Calculate endDate from startDate + duration
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate.getTime() + data.duration * 1000);

      // Format data for backend ShiftDto
      const shiftData = {
        summary: data.summary,
        idContact: data.idContact,
        idAssignee: data.idAssignee,
        idRate: data.idRate,
        location: data.location,
        startDate: startDate.toISOString(), // Backend expects ISO DateTime string
        endDate: endDate.toISOString(), // Backend expects ISO DateTime string
        tz: data.tz,
        category: data.category,
        comments: data.comments || '',
        notes: data.notes || '',
        recurrenceRule: data.recurrenceRule || '',
      };

      if (mode === 'new') {
        const newShift = await createShift(shiftData as any);
        onSave?.(newShift);
      } else if (mode === 'edit' && (fetchedShift?.id || shift?.id)) {
        const shiftId = fetchedShift?.id || shift?.id;
        if (!shiftId) {
          throw new Error('Shift ID is required for editing');
        }
        const updatedShift = await updateShift(shiftId, shiftData as any);
        onSave?.(updatedShift);
      } else if (mode === 'complete' && shift?.id) {
        const completedShift = await completeShift(shift.id, { isGstFree: false, notes: data.notes });
        onSave?.(completedShift);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
      // TODO: Show error toast/notification to user
    }
  };

  // Handle "Use contact's address" button click
  const handleUseContactAddress = () => {
    if (!selectedContact) return;
    
    const addressParts = [
      selectedContact.addressLine1,
      selectedContact.addressLine2,
      typeof selectedContact.state === 'string' ? selectedContact.state : selectedContact.state?.name,
      selectedContact.postcode,
    ].filter(Boolean);
    
    const location = addressParts.join(', ');
    if (location) {
      form.setValue('location', location);
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

  // CRITICAL: Log before render functions
  console.log('=== BEFORE RENDER FUNCTIONS ===', { isOpen, mode });

  console.log('=== DEFINING renderDetailsTab ===');
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch('category') || ShiftCategory.AssistanceDailyLife}
              onValueChange={(value) => form.setValue('category', value)}
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
          <ContactSelector
            label="Contact"
            id="idContact"
            value={form.watch('idContact')}
            onValueChange={(value) => form.setValue('idContact', value)}
            onContactChange={setSelectedContact}
            error={form.formState.errors.idContact}
            disabled={isReadOnly}
            required
          />

          {hasUsersDataAllScope ? (
            <div>
              <Label htmlFor="idAssignee">
                Assignee *
              </Label>
              <UserSelector
                value={form.watch('idAssignee') || user?.id || ''}
                onValueChange={(value) => {
                  // Don't allow selecting "All users" (-1) for shift assignee
                  if (value !== '-1') {
                    form.setValue('idAssignee', value);
                  }
                }}
                className="w-full"
              />
              {form.formState.errors.idAssignee && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.idAssignee.message}</p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="idAssignee">Assignee *</Label>
              <Input
                id="idAssignee"
                value={user?.id || ''}
                disabled
                readOnly
              />
              {form.formState.errors.idAssignee && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.idAssignee.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimePickerField
            label="Start date and time *"
            dateId="startDate"
            timeId="startTime"
            value={form.watch('startDate')}
            onChange={(value) => form.setValue('startDate', value)}
            error={form.formState.errors.startDate}
            disabled={isReadOnly}
          />

          <DurationSelector
            label="Duration *"
            id="duration"
            value={form.watch('duration')}
            onValueChange={(value) => form.setValue('duration', value)}
            error={form.formState.errors.duration}
            disabled={isReadOnly}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TimezoneSelector
            label="Timezone *"
            id="tz"
            value={form.watch('tz')}
            onValueChange={(value) => form.setValue('tz', value)}
            error={form.formState.errors.tz}
            disabled={isReadOnly}
            required
          />
        </div>
      </div>

      {/* Rate & Pricing */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rate & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RateSelector
            label="Rate *"
            id="idRate"
            value={form.watch('idRate')}
            onValueChange={(value) => form.setValue('idRate', value)}
            onRateChange={(rate) => {
              if (rate) {
                setRateAmountExclGst(rate.amountExclGst);
              }
            }}
            error={form.formState.errors.idRate}
            disabled={isReadOnly}
            required
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...form.register('location')}
                disabled={isReadOnly}
                placeholder="Shift location"
              />
              {form.formState.errors.location && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>
            {selectedContact && !isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseContactAddress}
                className="mb-0"
                title="Use contact's address"
              >
                <Link2 className="h-4 w-4 mr-1" />
                Use address
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recurrence</h3>
        <div>
          <RecurrenceSelector
            label="Repeat Pattern"
            id="recurrenceRule"
            value={form.watch('recurrenceRule')}
            onValueChange={(value) => form.setValue('recurrenceRule', value)}
            startDate={form.watch('startDate')}
            disabled={isReadOnly || (!!(fetchedShift?.id || shift?.id) && mode === 'edit')}
          />
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
            {form.formState.errors.comments && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.comments.message}</p>
            )}
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
            {form.formState.errors.notes && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  console.log('=== renderDetailsTab DEFINED ===');

  console.log('=== DEFINING renderExpensesTab ===');
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
  console.log('=== renderExpensesTab DEFINED ===');

  console.log('=== DEFINING renderAttachmentsTab ===');
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
  console.log('=== renderAttachmentsTab DEFINED ===');

  // Helper function to format recurrence label for display
  const getRecurrenceLabel = (recurrenceRule: string, startDate: string): string => {
    if (!recurrenceRule || recurrenceRule === '' || recurrenceRule === 'none') {
      return 'Does not repeat';
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

  console.log('=== DEFINING renderViewMode ===');
  const renderViewMode = () => {
    // Use fetchedShift if available, otherwise fallback to shift prop
    const shiftToDisplay = fetchedShift || shift;
    
    if (!shiftToDisplay) {
      return null;
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold">{shiftToDisplay.summary}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(shiftToDisplay.shiftStatus || ShiftStatus.Pending)} flex items-center gap-1`}>
                  {getStatusIcon(shiftToDisplay.shiftStatus || ShiftStatus.Pending)}
                  {shiftToDisplay.shiftStatus}
                </Badge>
                <Badge variant="outline">{shiftToDisplay.category}</Badge>
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
                <span className="text-sm"><strong>Contact:</strong> {shiftToDisplay.contact?.fullName || shiftToDisplay.contact?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Assignee:</strong> {shiftToDisplay.assignee?.fullName || shiftToDisplay.assignee?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Time:</strong> {(() => {
                    const dt = formatDateTime(shiftToDisplay.startDate || '');
                    return `${dt.date} ${dt.time}`;
                  })()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Duration:</strong> {formatDuration(shiftToDisplay.duration || 0)}</span>
              </div>
              {shiftToDisplay.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Location:</strong> {shiftToDisplay.location}</span>
                </div>
              )}
              {shiftToDisplay.recurrenceRule && (
                <div className="flex items-center space-x-2">
                  <Repeat className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Recurrence:</strong> {getRecurrenceLabel(shiftToDisplay.recurrenceRule, shiftToDisplay.startDate)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Rate:</strong> {shiftToDisplay.rateName || 'N/A'} - ${(shiftToDisplay.rateAmountExclGst || 0).toFixed(2)} excl. GST</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Total:</strong> ${(shiftToDisplay.totalInclGst || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(shiftToDisplay.comments || shiftToDisplay.notes) && (
            <div>
              <h4 className="font-semibold mb-3">Comments & Notes</h4>
              <div className="space-y-2">
                {shiftToDisplay.comments && (
                  <div>
                    <p className="text-sm"><strong>Comments:</strong></p>
                    <p className="text-sm text-gray-600">{shiftToDisplay.comments}</p>
                  </div>
                )}
                {shiftToDisplay.notes && (
                  <div>
                    <p className="text-sm"><strong>Notes:</strong></p>
                    <p className="text-sm text-gray-600">{shiftToDisplay.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      {expenses.length > 0 || attachments.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="attachments">Attachments ({attachments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses">{renderExpensesTab()}</TabsContent>
          <TabsContent value="attachments">{renderAttachmentsTab()}</TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
  console.log('=== renderViewMode DEFINED ===');

  // CRITICAL: Log after all render functions are defined
  console.log('=== AFTER ALL RENDER FUNCTIONS DEFINED ===', { isOpen, mode });

  // CRITICAL: Log before computing render values
  console.log('=== BEFORE COMPUTING RENDER VALUES ===', { isOpen, mode });
  
  // Determine which shift to use for display
  const shiftToUse = fetchedShift || shift;

  // For new mode, we don't need to wait for loading
  const shouldShowLoading = isLoadingShift && (mode === 'edit' || mode === 'view' || mode === 'duplicate');
  const shouldShowContent = !shouldShowLoading;

  console.log('=== AFTER COMPUTING RENDER VALUES ===', { shouldShowLoading, shouldShowContent, shiftToUse: !!shiftToUse });

  // Render form content with error handling
  const renderFormContent = () => {
    try {
      console.log('renderFormContent called');
    } catch (e) {
      console.error('Error in renderFormContent log:', e);
    }
    
    if (shouldShowLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading shift details...</p>
          </div>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load shift</p>
              <p className="text-sm text-red-600">{fetchError}</p>
              <p className="text-xs text-red-500 mt-1">Using cached data if available.</p>
            </div>
          </div>
        </div>
      );
    }

    try {
      return (
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
      );
    } catch (error) {
      console.error('Error rendering form content:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Error rendering form</p>
          <p className="text-xs text-red-600 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="text-xs text-red-500 mt-2">Check console for details</p>
        </div>
      );
    }
  };

  // CRITICAL: Log before return
  console.log('=== ABOUT TO RETURN JSX ===', { isOpen, mode, shouldShowContent });
  
  // Early return test - if this doesn't work, the issue is with Dialog itself
  if (!isOpen) {
    console.log('=== EARLY RETURN: isOpen is false ===');
    return null;
  }

  console.log('=== RENDERING DIALOG ===');

  // TEMPORARY: Minimal test to see if Dialog renders at all
  try {
    const dialogJSX = (
      <Dialog open={isOpen} onOpenChange={(open) => {
        console.log('Dialog onOpenChange called:', open);
        if (!open) {
          onClose();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-4xl w-full sm:w-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'new' && 'Add New Shift'}
              {mode === 'edit' && 'Edit Shift'}
              {mode === 'view' && 'View Shift'}
              {mode === 'complete' && 'Complete Shift'}
              {mode === 'duplicate' && 'Duplicate Shift'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Debug info - remove after testing */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 mb-4 text-xs">
            <p><strong>DEBUG:</strong> Modal isOpen: {String(isOpen)}, Mode: {mode}</p>
            <p>ShouldShowContent: {String(shouldShowContent)}, ShouldShowLoading: {String(shouldShowLoading)}</p>
          </div>

          {/* TEMPORARY: Test with minimal content first */}
          <div className="p-4">
            <p className="text-lg font-bold text-green-600">MODAL IS RENDERING! If you see this, Dialog works.</p>
            <p className="mt-2">Now let's test the form...</p>
          </div>

          {renderFormContent()}
        </DialogContent>
      </Dialog>
    );
    
    console.log('=== DIALOG JSX CREATED SUCCESSFULLY ===');
    return dialogJSX;
  } catch (error) {
    console.error('FATAL ERROR rendering Dialog:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h2 className="text-lg font-bold text-red-600 mb-2">Render Error</h2>
          <p className="text-sm text-gray-700">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="text-xs text-gray-500 mt-2">Check console for full error</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}
