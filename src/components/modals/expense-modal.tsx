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
  Expense, 
  ExpenseType, 
  BusinessExpenseType, 
  ExpenseCategories,
  getExpenseCategoryText,
  Attachment 
} from '@/lib/api/expenses-service';
import { useExpenseActions } from '@/hooks/use-expenses';
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
  CheckCircle,
  Plus,
} from 'lucide-react';

// Form validation schema
const expenseSchema = z.object({
  expenseType: z.nativeEnum(ExpenseType),
  businessExpenseType: z.nativeEnum(BusinessExpenseType).optional(),
  idCategory: z.string().optional(),
  payee: z.string().min(1, 'Payee is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  amountInclGst: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  idContact: z.string().optional(),
  kms: z.number().min(0).optional(),
  kmRateAmountExclGst: z.number().min(0).optional(),
  isGstFree: z.boolean().optional(),
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
  const [activeTab, setActiveTab] = useState('details');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const { 
    createExpense, 
    updateExpense, 
    uploadAttachment, 
    deleteAttachment,
    isSaving, 
    isUploading 
  } = useExpenseActions();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseType: ExpenseType.Business,
      businessExpenseType: BusinessExpenseType.General,
      payee: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      amountInclGst: 0,
      paymentMethod: '',
      idContact: '',
      kms: 0,
      kmRateAmountExclGst: 0,
      isGstFree: false,
    },
  });

  // Reset form when expense changes
  useEffect(() => {
    if (expense) {
      form.reset({
        expenseType: expense.expenseType,
        businessExpenseType: expense.businessExpenseType,
        idCategory: expense.idCategory,
        payee: expense.payee,
        description: expense.description,
        date: expense.date.split('T')[0],
        amountInclGst: expense.amountInclGst,
        paymentMethod: expense.paymentMethod,
        idContact: expense.idContact,
        kms: expense.kms,
        kmRateAmountExclGst: expense.kmRateAmountExclGst,
        isGstFree: expense.isGstFree,
      });
      setAttachments(expense.attachments || []);
    } else {
      form.reset();
      setAttachments([]);
    }
  }, [expense, form]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const expenseData = {
        ...data,
        id: expense?.id || Date.now().toString(),
        amountExclGst: data.isGstFree ? data.amountInclGst : data.amountInclGst / 1.1,
        amountGst: data.isGstFree ? 0 : data.amountInclGst - (data.amountInclGst / 1.1),
        attachments,
        createdAt: expense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'new') {
        await createExpense(expenseData);
      } else if (mode === 'edit') {
        await updateExpense(expense!.id, expenseData);
      }

      onSave?.(expenseData as Expense);
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
      const attachment = await uploadAttachment(expense?.id || 'new', file);
      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(expense?.id || '', attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      console.error('Delete attachment error:', error);
    }
  };

  const isReadOnly = mode === 'view';
  const expenseType = form.watch('expenseType');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Expense Type */}
      <div>
        <Label htmlFor="expenseType">Expense Type *</Label>
        <Select
          value={form.watch('expenseType')}
          onValueChange={(value) => form.setValue('expenseType', value as ExpenseType)}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ExpenseType.Business}>Business</SelectItem>
            <SelectItem value={ExpenseType.Reclaimable}>Reclaimable</SelectItem>
            <SelectItem value={ExpenseType.Kilometre}>Kilometre</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.expenseType && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.expenseType.message}</p>
        )}
      </div>

      {/* Business Expense Type */}
      {expenseType === ExpenseType.Business && (
        <div>
          <Label htmlFor="businessExpenseType">Business Expense Type *</Label>
          <Select
            value={form.watch('businessExpenseType')}
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
        </div>
      )}

      {/* Category */}
      {expenseType === ExpenseType.Business && (
        <div>
          <Label htmlFor="idCategory">Category *</Label>
          <Select
            value={form.watch('idCategory')}
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
        </div>
      )}

      {/* Contact */}
      {(expenseType === ExpenseType.Reclaimable || expenseType === ExpenseType.Kilometre) && (
        <div>
          <Label htmlFor="idContact">Contact *</Label>
          <Select
            value={form.watch('idContact')}
            onValueChange={(value) => form.setValue('idContact', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Sarah Johnson</SelectItem>
              <SelectItem value="3">Mike Wilson</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payee">Payee *</Label>
          <Input
            id="payee"
            {...form.register('payee')}
            placeholder="e.g., Office Depot"
            disabled={isReadOnly}
          />
          {form.formState.errors.payee && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.payee.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select
            value={form.watch('paymentMethod')}
            onValueChange={(value) => form.setValue('paymentMethod', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="EFT">EFT</SelectItem>
              <SelectItem value="Reimbursement">Reimbursement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            {...form.register('date')}
            disabled={isReadOnly}
          />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
          )}
        </div>

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
      </div>

      {/* Kilometre-specific fields */}
      {expenseType === ExpenseType.Kilometre && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kms">Kilometres</Label>
            <Input
              id="kms"
              type="number"
              step="0.1"
              min="0"
              {...form.register('kms', { valueAsNumber: true })}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="kmRateAmountExclGst">Rate per KM (excl. GST)</Label>
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
          </div>
        </div>
      )}

      {/* GST Free */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isGstFree"
          checked={form.watch('isGstFree')}
          onCheckedChange={(checked) => form.setValue('isGstFree', checked)}
          disabled={isReadOnly}
        />
        <Label htmlFor="isGstFree">GST Free</Label>
      </div>

      {/* Description */}
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
              disabled={uploadingFile}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadingFile}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isReadOnly && (
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
          {!isReadOnly && (
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

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Receipt className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">{expense?.description}</h3>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                {expense?.expenseType}
              </Badge>
              {expense?.category && (
                <Badge variant="outline">
                  {getExpenseCategoryText(expense.idCategory || '')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Expense Details</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Payee:</strong> {expense?.payee}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Date:</strong> {expense?.date && formatDate(expense.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Amount:</strong> {expense?.amountInclGst && formatCurrency(expense.amountInclGst)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm"><strong>Payment Method:</strong> {expense?.paymentMethod}</span>
            </div>
            {expense?.contact && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Contact:</strong> {expense.contact.fullName}</span>
              </div>
            )}
            {expense?.kms && (
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Kilometres:</strong> {expense.kms} km @ {formatCurrency(expense.kmRateAmountExclGst || 0)}/km</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Attachments ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{attachment.fileName}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(attachment.fileSize)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' && 'Add New Expense'}
            {mode === 'edit' && 'Edit Expense'}
            {mode === 'view' && 'View Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
        {isReadOnly ? (
          renderViewMode()
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              {renderDetailsTab()}
            </TabsContent>
            <TabsContent value="attachments">
              {renderAttachmentsTab()}
            </TabsContent>
          </Tabs>
        )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Expense'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
