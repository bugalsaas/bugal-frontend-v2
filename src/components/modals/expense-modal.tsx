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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Expense, 
  ExpenseType, 
  BusinessExpenseType, 
  ExpenseCategories,
  getExpenseCategoryText,
  Attachment 
} from '@/lib/api/expenses-service';
import { useExpenseActions, useExpense } from '@/hooks/use-expenses';
import { useContacts } from '@/hooks/use-contacts';
import { useAuth } from '@/contexts/auth-context';
import { attachmentsApi } from '@/lib/api/attachments-service';
import { 
  Receipt, 
  DollarSign, 
  Calendar, 
  User, 
  Building,
  Car,
  FileText,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  Info,
  Wallet,
} from 'lucide-react';
import { DatePickerInputField } from '@/components/form/date-picker-input-field';

// Base expense schema - matches ExpenseBaseDto
const baseExpenseSchema = z.object({
  expenseType: z.nativeEnum(ExpenseType),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  idShift: z.string().optional(),
});

// Conditional schema based on expense type - matches backend DTOs
const expenseSchema = baseExpenseSchema.extend({
  // Business expense fields
  businessExpenseType: z.nativeEnum(BusinessExpenseType).optional(),
  idCategory: z.string().optional(),
  payee: z.string().optional(),
  amountInclGst: z.number().min(0.01, 'Amount must be greater than 0').optional(),
  amountGst: z.number().min(0, 'GST amount must be 0 or greater').optional(),
  
  // Reclaimable expense fields
  idContact: z.string().optional(),
  
  // Kilometre expense fields
  kmRateAmountExclGst: z.number().min(0, 'Rate must be 0 or greater').optional(),
  kms: z.number().int().min(1, 'Kilometres must be at least 1').optional(),
  isGstFree: z.boolean().optional(),
}).refine((data) => {
  // Business expense validation
  if (data.expenseType === ExpenseType.Business) {
    return data.businessExpenseType && data.idCategory && data.payee && 
           data.amountInclGst !== undefined && data.amountGst !== undefined;
  }
  return true;
}, {
  message: 'Business expenses require: business expense type, category, payee, amounts',
  path: ['businessExpenseType'],
}).refine((data) => {
  // Reclaimable expense validation
  if (data.expenseType === ExpenseType.Reclaimable) {
    return data.idContact && data.payee && data.amountInclGst !== undefined && data.amountGst !== undefined;
  }
  return true;
}, {
  message: 'Reclaimable expenses require: contact, payee, amounts',
  path: ['idContact'],
}).refine((data) => {
  // Kilometre expense validation
  if (data.expenseType === ExpenseType.Kilometre) {
    return data.idContact && data.kmRateAmountExclGst !== undefined && 
           data.kms !== undefined && data.isGstFree !== undefined;
  }
  return true;
}, {
  message: 'Kilometre expenses require: contact, rate, kilometres, GST free flag',
  path: ['idContact'],
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  expense?: Expense;
  onSave?: (expense: Expense) => void;
}

export function ExpenseModal({ isOpen, onClose, mode, expense, onSave }: ExpenseModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [activeTab, setActiveTab] = useState('details');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  // Initialize expense type - will be set properly in useEffect
  const [expenseType, setExpenseType] = useState<ExpenseType>(ExpenseType.Business);
  const [idShift, setIdShift] = useState<string | undefined>();
  const { user } = useAuth();

  // Check permissions
  const hasPermissionAttachmentsRead = user?.scopes?.includes('attachments:read') ?? false;
  const hasPermissionAttachmentsDelete = user?.scopes?.includes('attachments:delete') ?? false;
  const hasPermissionBusiness = user?.scopes?.includes('expenses:type:business') ?? false;
  const hasPermissionReclaimable = user?.scopes?.includes('expenses:type:reclaimable') ?? false;
  const hasPermissionKilometre = user?.scopes?.includes('expenses:type:kilometre') ?? false;

  const { 
    createExpense, 
    updateExpense, 
    isSaving, 
  } = useExpenseActions();
  
  const { load: loadExpense, loading: loadingExpense } = useExpense();
  const { data: contacts = [], loading: contactsLoading } = useContacts({ pageSize: 100 });

  // Default isGstFree based on organization GST registration
  const defaultIsGstFree = !user?.organization?.isGstRegistered;

  // Determine default expense type based on permissions
  const defaultExpenseType = useMemo((): ExpenseType => {
    if (hasPermissionBusiness) return ExpenseType.Business;
    if (hasPermissionReclaimable) return ExpenseType.Reclaimable;
    if (hasPermissionKilometre) return ExpenseType.Kilometre;
    return ExpenseType.Business; // Fallback
  }, [hasPermissionBusiness, hasPermissionReclaimable, hasPermissionKilometre]);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseType: defaultExpenseType,
      businessExpenseType: BusinessExpenseType.General,
      date: new Date().toISOString().split('T')[0],
      description: '',
      payee: '',
      amountInclGst: 0,
      amountGst: 0,
      idContact: '',
      kmRateAmountExclGst: 0,
      kms: 0,
      isGstFree: defaultIsGstFree,
    },
  });

  const watchedExpenseType = form.watch('expenseType');
  const watchedKmRate = form.watch('kmRateAmountExclGst');
  const watchedKms = form.watch('kms');
  const watchedIsGstFree = form.watch('isGstFree');

  // Calculate amounts for kilometre expenses
  useEffect(() => {
    if (watchedExpenseType === ExpenseType.Kilometre && watchedKmRate && watchedKms) {
      const amountExclGst = watchedKmRate * watchedKms;
      const amountInclGst = watchedIsGstFree ? amountExclGst : amountExclGst * 1.1;
      const amountGst = watchedIsGstFree ? 0 : amountExclGst * 0.1;
      
      form.setValue('amountInclGst', Number(amountInclGst.toFixed(2)));
      form.setValue('amountGst', Number(amountGst.toFixed(2)));
    }
  }, [watchedExpenseType, watchedKmRate, watchedKms, watchedIsGstFree, form]);

  // Reset form when expense changes
  // Track the expense ID to prevent unnecessary reloads
  const expenseIdRef = React.useRef<string | 'new' | undefined>();
  
  useEffect(() => {
    if (!isOpen) {
      expenseIdRef.current = undefined;
      return;
    }

    const currentExpenseId = expense?.id || 'new';
    
    // Only update if the expense ID actually changed
    if (currentExpenseId !== expenseIdRef.current) {
      expenseIdRef.current = currentExpenseId;
      
      if (expense) {
        // Load full expense data if we don't have attachments
        if (!expense.attachments || expense.attachments.length === 0) {
          loadExpense(expense.id).then((loaded) => {
            setAttachments(loaded.attachments || []);
          }).catch(console.error);
        } else {
          setAttachments(expense.attachments || []);
        }

        const dateStr = expense.date.includes('T') ? expense.date.split('T')[0] : expense.date;
        setExpenseType(expense.expenseType);
        setIdShift(expense.idShift);

        form.reset({
          expenseType: expense.expenseType,
          businessExpenseType: expense.businessExpenseType || BusinessExpenseType.General,
          idCategory: expense.idCategory,
          payee: expense.payee || '',
          description: expense.description,
          date: dateStr,
          amountInclGst: expense.amountInclGst,
          amountGst: expense.amountGst,
          idContact: expense.idContact || '',
          kmRateAmountExclGst: expense.kmRateAmountExclGst || 0,
          kms: expense.kms || 0,
          isGstFree: expense.isGstFree ?? defaultIsGstFree,
          idShift: expense.idShift,
        });
      } else {
        // New expense
        form.reset({
          expenseType: defaultExpenseType,
          businessExpenseType: BusinessExpenseType.General,
          date: new Date().toISOString().split('T')[0],
          description: '',
          payee: '',
          amountInclGst: 0,
          amountGst: 0,
          idContact: '',
          kmRateAmountExclGst: 0,
          kms: 0,
          isGstFree: defaultIsGstFree,
        });
        setAttachments([]);
        setExpenseType(defaultExpenseType);
        setIdShift(undefined);
      }
    }
  }, [expense?.id, isOpen, defaultIsGstFree, defaultExpenseType, loadExpense, form]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const expenseData: Partial<Expense> = {
        expenseType: data.expenseType,
        date: data.date,
        description: data.description,
        idAttachments: attachments.map(a => a.id),
      };

      if (data.idShift) {
        expenseData.idShift = data.idShift;
      }

      // Add type-specific fields
      if (data.expenseType === ExpenseType.Business) {
        expenseData.businessExpenseType = data.businessExpenseType;
        expenseData.idCategory = data.idCategory;
        expenseData.payee = data.payee;
        expenseData.amountInclGst = data.amountInclGst;
        expenseData.amountGst = data.amountGst;
      } else if (data.expenseType === ExpenseType.Reclaimable) {
        expenseData.idContact = data.idContact;
        expenseData.payee = data.payee;
        expenseData.amountInclGst = data.amountInclGst;
        expenseData.amountGst = data.amountGst;
      } else if (data.expenseType === ExpenseType.Kilometre) {
        expenseData.idContact = data.idContact;
        expenseData.kmRateAmountExclGst = data.kmRateAmountExclGst;
        expenseData.kms = data.kms;
        expenseData.isGstFree = data.isGstFree ?? false;
        // Calculate amounts (already done in useEffect but ensure they're set)
        const amountExclGst = data.kmRateAmountExclGst! * data.kms!;
        expenseData.amountInclGst = data.isGstFree ? amountExclGst : amountExclGst * 1.1;
        expenseData.amountGst = data.isGstFree ? 0 : amountExclGst * 0.1;
        expenseData.amountExclGst = amountExclGst;
      }

      let savedExpense: Expense;
      if (mode === 'new') {
        savedExpense = await createExpense(expenseData);
      } else {
        savedExpense = await updateExpense(expense!.id, expenseData);
      }

      // Reload expense to get full data including attachments
      const reloaded = await loadExpense(savedExpense.id);
      onSave?.(reloaded);
      onClose();
    } catch (error) {
      console.error('Expense save error:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      // Always upload to /attachments endpoint (matches original frontend pattern)
      const attachment = await attachmentsApi.upload(file);
      setAttachments(prev => [...prev, attachment]);
      
      // If expense exists, update it to link the attachment
      if (expense?.id) {
        const currentAttachmentIds = attachments.map(a => a.id);
        await updateExpense(expense.id, {
          ...expense,
          idAttachments: [...currentAttachmentIds, attachment.id],
        });
        // Reload expense to get updated attachment list
        const reloaded = await loadExpense(expense.id);
        setAttachments(reloaded.attachments || []);
      }
      // For new expenses, attachment is already in local state and will be included in idAttachments when saving
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      // Get signed URL
      const url = await attachmentsApi.getUrl(attachment.id);
      // Open in new window
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download attachment error:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      // Remove from local state first
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      // If expense exists, update it to remove the attachment link
      if (expense?.id) {
        const updatedAttachmentIds = attachments
          .filter(a => a.id !== attachmentId)
          .map(a => a.id);
        await updateExpense(expense.id, {
          ...expense,
          idAttachments: updatedAttachmentIds,
        });
        // Reload expense to get updated attachment list
        const reloaded = await loadExpense(expense.id);
        setAttachments(reloaded.attachments || []);
      }
      // For new expenses, just removing from local state is enough
      // Note: We don't delete the attachment file itself - it will be orphaned if expense is never saved
      // This matches the original frontend behavior (attachments are only linked on save)
    } catch (error) {
      console.error('Delete attachment error:', error);
      // Restore attachment on error
      if (expense?.id) {
        const reloaded = await loadExpense(expense.id);
        setAttachments(reloaded.attachments || []);
      }
    }
  };

  const isReadOnly = mode === 'view';
  const displayExpense = expense;

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      {displayExpense?.idInvoice && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Expense invoiced.</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Expense type</Label>
          <p className="mt-1">{displayExpense?.expenseType}</p>
        </div>

        {expenseType === ExpenseType.Business && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-500">Business expense type</Label>
              <p className="mt-1">{displayExpense?.businessExpenseType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Category</Label>
              <p className="mt-1">{displayExpense?.idCategory ? getExpenseCategoryText(displayExpense.idCategory) : '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Payee</Label>
              <p className="mt-1">{displayExpense?.payee}</p>
            </div>
          </>
        )}

        {expenseType === ExpenseType.Reclaimable && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-500">Contact</Label>
              <p className="mt-1">{displayExpense?.contact?.fullName || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Payee</Label>
              <p className="mt-1">{displayExpense?.payee}</p>
            </div>
          </>
        )}

        {expenseType === ExpenseType.Kilometre && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-500">Contact</Label>
              <p className="mt-1">{displayExpense?.contact?.fullName || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Rate/Km (excl. GST)</Label>
              <p className="mt-1">{formatCurrency(displayExpense?.kmRateAmountExclGst)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Kilometres</Label>
              <p className="mt-1">{displayExpense?.kms || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">GST free</Label>
              <p className="mt-1">{displayExpense?.isGstFree ? 'Yes' : 'No'}</p>
            </div>
          </>
        )}

        <div>
          <Label className="text-sm font-medium text-gray-500">Description</Label>
          <p className="mt-1">{displayExpense?.description}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">Date</Label>
          <p className="mt-1">{displayExpense?.date ? formatDate(displayExpense.date) : '-'}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">Amount (incl. GST)</Label>
          <p className="mt-1">{formatCurrency(displayExpense?.amountInclGst)}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">Amount (GST)</Label>
          <p className="mt-1">{formatCurrency(displayExpense?.amountGst)}</p>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Attachments</h4>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{attachment.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                  </div>
                </div>
                {hasPermissionAttachmentsRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment)}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      {idShift && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Expense linked to a shift. Expense type and Contact can't be changed.</AlertDescription>
        </Alert>
      )}

      <input type="hidden" {...form.register('idShift')} />

      {/* Expense Type - Radio buttons */}
      <div>
        <Label>Expense type *</Label>
        <RadioGroup
          value={expenseType}
          onValueChange={(value) => {
            const newType = value as ExpenseType;
            setExpenseType(newType);
            form.setValue('expenseType', newType);
            // Reset type-specific fields when changing type
            if (newType !== ExpenseType.Business) {
              form.setValue('businessExpenseType', undefined);
              form.setValue('idCategory', undefined);
            }
            if (newType !== ExpenseType.Reclaimable && newType !== ExpenseType.Kilometre) {
              form.setValue('idContact', '');
            }
            if (newType !== ExpenseType.Kilometre) {
              form.setValue('kmRateAmountExclGst', 0);
              form.setValue('kms', 0);
              form.setValue('isGstFree', defaultIsGstFree);
            }
          }}
          disabled={isReadOnly || !!idShift}
          className="mt-2"
        >
          {hasPermissionBusiness && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExpenseType.Business} id="type-business" />
              <Label htmlFor="type-business" className="font-normal cursor-pointer">Business</Label>
            </div>
          )}
          {hasPermissionReclaimable && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExpenseType.Reclaimable} id="type-reclaimable" />
              <Label htmlFor="type-reclaimable" className="font-normal cursor-pointer">Reclaimable</Label>
            </div>
          )}
          {hasPermissionKilometre && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExpenseType.Kilometre} id="type-kilometre" />
              <Label htmlFor="type-kilometre" className="font-normal cursor-pointer">Kilometre</Label>
            </div>
          )}
        </RadioGroup>
        {form.formState.errors.expenseType && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.expenseType.message}</p>
        )}
      </div>

      {/* Business Expense Type */}
      {expenseType === ExpenseType.Business && (
        <>
          <div>
            <Label htmlFor="businessExpenseType">Business expense type *</Label>
            <Select
              value={form.watch('businessExpenseType') || ''}
              onValueChange={(value) => form.setValue('businessExpenseType', value as BusinessExpenseType)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business expense type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BusinessExpenseType.Capital}>Capital</SelectItem>
                <SelectItem value={BusinessExpenseType.General}>General</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.businessExpenseType && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessExpenseType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="idCategory">Category *</Label>
            <Select
              value={form.watch('idCategory') || ''}
              onValueChange={(value) => form.setValue('idCategory', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ExpenseCategories).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {getExpenseCategoryText(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.idCategory && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.idCategory.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="payee">Payee *</Label>
            <Input
              id="payee"
              {...form.register('payee')}
              placeholder="e.g., Office Depot"
              disabled={isReadOnly}
            />
            {form.formState.errors.payee && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.payee?.message}</p>
            )}
          </div>

          <DatePickerInputField
            label="Date *"
            id="date"
            value={form.watch('date')}
            onChange={(value) => form.setValue('date', value)}
            error={form.formState.errors.date}
            disabled={isReadOnly}
          />

          <div>
            <Label htmlFor="amountInclGst">Amount (incl. GST) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amountInclGst"
                type="number"
                step="0.01"
                min="0.01"
                className="pl-10"
                {...form.register('amountInclGst', { valueAsNumber: true })}
                disabled={isReadOnly}
              />
            </div>
            {form.formState.errors.amountInclGst && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountInclGst.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amountGst">Amount (GST) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amountGst"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                {...form.register('amountGst', { valueAsNumber: true })}
                disabled={isReadOnly}
              />
            </div>
            {form.formState.errors.amountGst && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountGst.message}</p>
            )}
          </div>
        </>
      )}

      {/* Reclaimable Expense Fields */}
      {expenseType === ExpenseType.Reclaimable && (
        <>
          <div>
            <Label htmlFor="idContact">Contact *</Label>
            <Select
              value={form.watch('idContact') || ''}
              onValueChange={(value) => form.setValue('idContact', value)}
              disabled={isReadOnly || !!idShift || contactsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={contactsLoading ? "Loading contacts..." : "Select contact"} />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.idContact && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.idContact.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="payee">Payee *</Label>
            <Input
              id="payee"
              {...form.register('payee')}
              placeholder="e.g., Office Depot"
              disabled={isReadOnly}
            />
            {form.formState.errors.payee && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.payee?.message}</p>
            )}
          </div>

          <DatePickerInputField
            label="Date *"
            id="date"
            value={form.watch('date')}
            onChange={(value) => form.setValue('date', value)}
            error={form.formState.errors.date}
            disabled={isReadOnly}
          />

          <div>
            <Label htmlFor="amountInclGst">Amount (incl. GST) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amountInclGst"
                type="number"
                step="0.01"
                min="0.01"
                className="pl-10"
                {...form.register('amountInclGst', { valueAsNumber: true })}
                disabled={isReadOnly}
              />
            </div>
            {form.formState.errors.amountInclGst && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountInclGst.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amountGst">Amount (GST) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amountGst"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                {...form.register('amountGst', { valueAsNumber: true })}
                disabled={isReadOnly}
              />
            </div>
            {form.formState.errors.amountGst && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountGst.message}</p>
            )}
          </div>
        </>
      )}

      {/* Kilometre Expense Fields */}
      {expenseType === ExpenseType.Kilometre && (
        <>
          <div>
            <Label htmlFor="idContact">Contact *</Label>
            <Select
              value={form.watch('idContact') || ''}
              onValueChange={(value) => form.setValue('idContact', value)}
              disabled={isReadOnly || !!idShift || contactsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={contactsLoading ? "Loading contacts..." : "Select contact"} />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.idContact && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.idContact.message}</p>
            )}
          </div>

          <DatePickerInputField
            label="Date *"
            id="date"
            value={form.watch('date')}
            onChange={(value) => form.setValue('date', value)}
            error={form.formState.errors.date}
            disabled={isReadOnly}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kmRateAmountExclGst">Rate/Km (excl. GST) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="kmRateAmountExclGst"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  {...form.register('kmRateAmountExclGst', { valueAsNumber: true })}
                  disabled={isReadOnly}
                />
              </div>
              {form.formState.errors.kmRateAmountExclGst && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.kmRateAmountExclGst.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="kms">Kilometres *</Label>
              <Input
                id="kms"
                type="number"
                step="1"
                min="1"
                {...form.register('kms', { valueAsNumber: true })}
                disabled={isReadOnly}
              />
              {form.formState.errors.kms && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.kms.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isGstFree"
              checked={form.watch('isGstFree') ?? false}
              onCheckedChange={(checked) => form.setValue('isGstFree', checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="isGstFree" className="font-normal cursor-pointer">Is this expense GST free? *</Label>
          </div>
          {form.formState.errors.isGstFree && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.isGstFree.message}</p>
          )}

          {/* Display calculated amounts */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Amount (incl. GST):</Label>
              <span className="font-medium">{formatCurrency(form.watch('amountInclGst'))}</span>
            </div>
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Amount (GST):</Label>
              <span className="font-medium">{formatCurrency(form.watch('amountGst'))}</span>
            </div>
          </div>
        </>
      )}

      {/* Description - Common to all types */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe the expense..."
          disabled={isReadOnly}
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Receipts & Attachments</h3>
        {!isReadOnly && (
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploadingFile || (mode === 'new' && !expense?.id)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadingFile || (mode === 'new' && !expense?.id)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </Button>
            {mode === 'new' && !expense?.id && (
              <p className="text-xs text-gray-500 mt-1">Save expense first to upload attachments</p>
            )}
          </div>
        )}
      </div>

      {attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{attachment.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                {hasPermissionAttachmentsRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment)}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {!isReadOnly && hasPermissionAttachmentsDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    title="Delete file"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No attachments yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload receipts and supporting documents
          </p>
          {!isReadOnly && mode !== 'new' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload First File
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const getModalTitle = () => {
    if (mode === 'view') return 'View expense';
    if (mode === 'edit') return 'Edit expense';
    return 'New expense';
  };

  const shouldUseDrawer = !isDesktop;
  const modalTitle = getModalTitle();
  const modalDescription = mode === 'view' ? 'View expense details' : mode === 'edit' ? 'Edit expense information' : 'Create a new expense';

  // Render content
  const renderContent = () => {
    if (isReadOnly) {
      return renderViewMode();
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            {renderEditMode()}
          </TabsContent>
          <TabsContent value="attachments">
            {renderAttachmentsTab()}
          </TabsContent>
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
      {!isReadOnly && (
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving || loadingExpense}
        >
          {isSaving ? 'Saving...' : 'Save Expense'}
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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