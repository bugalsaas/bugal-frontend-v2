'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shift, 
  ShiftStatus, 
  ShiftCategory, 
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
  startDate: z.string().min(1, 'Start date and time is required'),
  duration: z.number().min(900, 'Duration must be at least 15 minutes'),
  tz: z.string().min(1, 'Timezone is required'),
  category: z.string().optional(),
  comments: z.string().max(1000, 'Comments must be 1000 characters or less').optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  recurrenceRule: z.string().optional(),
}).refine((data) => {
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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [activeTab, setActiveTab] = useState('details');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [rateAmountExclGst, setRateAmountExclGst] = useState<number>(0);

  const { user } = useAuth();
  const isReadOnly = mode === 'view';
  const hasUsersDataAllScope = user?.scopes?.includes('users:data:all') ?? false;

  const { 
    createShift, 
    updateShift, 
    completeShift, 
    isSaving, 
  } = useShiftActions();
  
  const { getOne, loading: isLoadingShift } = useShift();

  // Default timezone from user's organization or fallback to Melbourne
  const defaultTimezone = user?.organization?.timezone || 'Australia/Melbourne';

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
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
    },
  });

  // Track shift ID to prevent unnecessary reloads
  const shiftIdRef = React.useRef<string | 'new' | undefined>();
  
  useEffect(() => {
    if (!isOpen) {
      shiftIdRef.current = undefined;
      return;
    }

    const currentShiftId = shift?.id || 'new';
    
    // Only update if the shift ID actually changed
    if (currentShiftId !== shiftIdRef.current) {
      shiftIdRef.current = currentShiftId;
      
      if (shift && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
        // Load full shift data if needed
        if (!shift.expenses || !shift.attachments) {
          getOne(shift.id).then((loaded) => {
            setExpenses(loaded.expenses || []);
            setAttachments(loaded.attachments || []);
            setRateAmountExclGst(loaded.rateAmountExclGst || 0);
            if (loaded.contact) {
              setSelectedContact(loaded.contact as any);
            }
          }).catch((error) => {
            console.error('Failed to load shift:', error);
            // Fallback to shift prop data
            setExpenses(shift.expenses || []);
            setAttachments(shift.attachments || []);
            setRateAmountExclGst(shift.rateAmountExclGst || 0);
            if (shift.contact) {
              setSelectedContact(shift.contact as any);
            }
          });
        } else {
          setExpenses(shift.expenses || []);
          setAttachments(shift.attachments || []);
          setRateAmountExclGst(shift.rateAmountExclGst || 0);
          if (shift.contact) {
            setSelectedContact(shift.contact as any);
          }
        }

        const startDate = new Date(shift.startDate);
        form.reset({
          summary: mode === 'duplicate' ? `${shift.summary} (Copy)` : shift.summary,
          idContact: shift.idContact || shift.contact?.id || '',
          idAssignee: shift.idAssignee || shift.assignee?.id || '',
          idRate: shift.idRate || '',
          location: shift.location || '',
          startDate: startDate.toISOString(),
          duration: shift.duration || 3600,
          tz: shift.tz || defaultTimezone,
          category: shift.category || ShiftCategory.AssistanceDailyLife,
          comments: shift.comments || '',
          notes: mode === 'duplicate' ? '' : (shift.notes || ''),
          recurrenceRule: mode === 'duplicate' ? '' : (shift.recurrenceRule || ''),
        });
      } else {
        // New shift
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
      }
    }
  }, [shift?.id, isOpen, mode, defaultTimezone, user?.id, getOne, form]);

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
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tz: data.tz,
        category: data.category,
        comments: data.comments || '',
        notes: data.notes || '',
        recurrenceRule: data.recurrenceRule || '',
      };

      if (mode === 'new') {
        const newShift = await createShift(shiftData as any);
        onSave?.(newShift);
      } else if (mode === 'edit' && shift?.id) {
        const updatedShift = await updateShift(shift.id, shiftData as any);
        onSave?.(updatedShift);
      } else if (mode === 'complete' && shift?.id) {
        const completedShift = await completeShift(shift.id, { isGstFree: false, notes: data.notes });
        onSave?.(completedShift);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
    }
  };

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

  const getRecurrenceLabel = (recurrenceRule: string, startDate: string): string => {
    if (!recurrenceRule || recurrenceRule === '' || recurrenceRule === 'none') {
      return 'Does not repeat';
    }
    try {
      // Simple parsing - could be enhanced with rrule library
      if (recurrenceRule.includes('FREQ=DAILY')) return 'Daily';
      if (recurrenceRule.includes('FREQ=WEEKLY')) return 'Weekly';
      if (recurrenceRule.includes('FREQ=MONTHLY')) return 'Monthly';
      if (recurrenceRule.includes('FREQ=YEARLY')) return 'Yearly';
      return recurrenceRule;
    } catch {
      return recurrenceRule;
    }
  };

  const getModalTitle = () => {
    if (mode === 'new') return 'Add New Shift';
    if (mode === 'edit') return 'Edit Shift';
    if (mode === 'view') return 'View Shift';
    if (mode === 'complete') return 'Complete Shift';
    if (mode === 'duplicate') return 'Duplicate Shift';
    return 'Shift';
  };

  const shiftToDisplay = shift;

  const renderDetailsTab = () => (
    <div className="space-y-6">
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
              <Label htmlFor="idAssignee">Assignee *</Label>
              <UserSelector
                value={form.watch('idAssignee') || user?.id || ''}
                onValueChange={(value) => {
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
            disabled={isReadOnly || (!!shift?.id && mode === 'edit')}
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

  const renderExpensesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expenses</h3>
        {!isReadOnly && (
          <Button variant="outline" size="sm" type="button">
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
                  <Button variant="ghost" size="sm" type="button">
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
          <Button variant="outline" size="sm" type="button">
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
                  <Button variant="ghost" size="sm" type="button">
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm" type="button">
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

  const renderViewMode = () => {
    if (!shiftToDisplay) {
      return <div>No shift data available</div>;
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
  };

  const shouldShowLoading = isLoadingShift && (mode === 'edit' || mode === 'view' || mode === 'duplicate');
  const shouldUseDrawer = !isDesktop;

  if (!isOpen) {
    return null;
  }

  const modalTitle = getModalTitle();
  const modalDescription = mode === 'view' ? 'View shift details' : mode === 'edit' ? 'Edit shift information' : mode === 'duplicate' ? 'Duplicate this shift' : mode === 'complete' ? 'Complete this shift' : 'Create a new shift';

  // Render content
  const renderContent = () => {
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

    if (isReadOnly) {
      return renderViewMode();
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
      </form>
    );
  };

  // Render footer buttons
  const renderFooterButtons = () => (
    <>
      <Button variant="outline" onClick={onClose} type="button">
        {isReadOnly ? 'Close' : 'Cancel'}
      </Button>
      {!isReadOnly && !shouldShowLoading && (
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : mode === 'new' ? 'Create Shift' : 'Save Changes'}
        </Button>
      )}
    </>
  );

  // Render Drawer for view mode on mobile
  if (shouldUseDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{modalTitle}</DrawerTitle>
            <DrawerDescription>{modalDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            {renderContent()}
          </div>
          <DrawerFooter className="flex-row justify-between gap-2 border-t pt-4 flex-wrap">
            {renderFooterButtons()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render Dialog for all other cases
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-4xl w-full sm:w-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
