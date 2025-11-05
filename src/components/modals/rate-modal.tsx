'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rate, RateType } from '@/lib/api/rates-service';
import { formatCurrency } from '@/lib/utils';
import { 
  Clock, 
  Lock, 
  DollarSign,
  Loader2,
} from 'lucide-react';

const rateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  rateType: z.nativeEnum(RateType, { required_error: 'Rate type is required' }),
  amountExclGst: z.number().min(0, 'Amount must be positive'),
});

type RateFormValues = z.infer<typeof rateSchema>;

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  rate?: Rate | null;
  onSave: (rate: Omit<Rate, 'id' | 'createdAt' | 'updatedAt' | 'amountGst' | 'amountInclGst'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onArchive?: () => Promise<void>;
  isLoading?: boolean;
}

export function RateModal({
  isOpen,
  onClose,
  mode,
  rate,
  onSave,
  onDelete,
  onArchive,
  isLoading = false,
}: RateModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      name: '',
      description: '',
      rateType: RateType.Hourly,
      amountExclGst: 0,
    },
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const watchedAmount = watch('amountExclGst');
  const watchedRateType = watch('rateType');

  // Calculate GST and total
  const gstAmount = watchedAmount * 0.1; // 10% GST
  const totalAmount = watchedAmount + gstAmount;

  useEffect(() => {
    if (rate && mode !== 'new') {
      reset({
        name: rate.name,
        description: rate.description,
        rateType: rate.rateType,
        amountExclGst: rate.amountExclGst,
      });
    } else if (mode === 'new') {
      reset({
        name: '',
        description: '',
        rateType: RateType.Hourly,
        amountExclGst: 0,
      });
    }
  }, [rate, mode, reset]);

  const onSubmit = async (values: RateFormValues) => {
    try {
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Failed to save rate:', error);
    }
  };

  const getRateTypeIcon = (rateType: RateType) => {
    return rateType === RateType.Fixed ? (
      <Lock className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );
  };

  const getRateTypeLabel = (rateType: RateType) => {
    return rateType === RateType.Fixed ? 'Fixed' : 'Hourly';
  };

  const shouldUseDrawer = !isDesktop;
  const modalTitle = (
    <>
      <DollarSign className="h-5 w-5" />
      <span>
        {mode === 'new' && 'New Rate'}
        {mode === 'edit' && 'Edit Rate'}
        {mode === 'view' && 'View Rate'}
      </span>
    </>
  );

  // Render view mode content
  const renderViewMode = () => {
    if (!rate) return null;
    
    return (
          <div className="space-y-6">
            {/* Rate Type */}
            <div className="flex items-center space-x-2">
              {getRateTypeIcon(rate.rateType)}
              <span className="font-medium">{getRateTypeLabel(rate.rateType)} Rate</span>
            </div>

            {/* Rate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="text-lg font-semibold text-gray-900">{rate.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Amount (excl. GST)</Label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(rate.amountExclGst)}</p>
              </div>
            </div>

            {rate.description && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-gray-900">{rate.description}</p>
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Financial Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount (excl. GST)</span>
                  <span className="font-medium">{formatCurrency(rate.amountExclGst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (10%)</span>
                  <span className="font-medium">{formatCurrency(rate.amountGst)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-900">Total (incl. GST)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(rate.amountInclGst)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            {rate.isArchived && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  This rate has been archived and is no longer active.
                </p>
              </div>
            )}
          </div>
    );
  };

  // Render form content
  const renderFormContent = () => (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rate Type */}
            <div className="space-y-2">
              <Label htmlFor="rateType">Rate Type</Label>
              <Select
                value={watchedRateType}
                onValueChange={(value) => setValue('rateType', value as RateType, { shouldValidate: true })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RateType.Hourly}>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Hourly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={RateType.Fixed}>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Fixed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.rateType && (
                <p className="text-red-500 text-sm">{errors.rateType.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter rate name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amountExclGst">Amount (excl. GST)</Label>
              <Input
                id="amountExclGst"
                type="number"
                step="0.01"
                min="0"
                {...form.register('amountExclGst', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.amountExclGst && (
                <p className="text-red-500 text-sm">{errors.amountExclGst.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter rate description (optional)"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Financial Preview */}
            {watchedAmount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Financial Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount (excl. GST)</span>
                    <span className="font-medium">{formatCurrency(watchedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (10%)</span>
                    <span className="font-medium">{formatCurrency(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-900">Total (incl. GST)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
  );

  // Render footer buttons for view mode
  const renderViewFooterButtons = () => {
    if (!rate) return null;
    
    return (
      <>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {!rate.isArchived && onArchive && (
          <Button 
            variant="outline"
            onClick={onArchive}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              'Archive Rate'
            )}
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Rate'
            )}
          </Button>
        )}
      </>
    );
  };

  // Render footer buttons for form mode
  const renderFormFooterButtons = () => (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'new' ? 'Creating...' : 'Saving...'}
          </>
        ) : (
          mode === 'new' ? 'Create Rate' : 'Save Changes'
        )}
      </Button>
    </>
  );

  // Render content
  const renderContent = () => {
    if (mode === 'view' && rate) {
      return renderViewMode();
    }
    return renderFormContent();
  };

  // Render Drawer for all modes on mobile
  if (shouldUseDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              {modalTitle}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            {renderViewMode()}
          </div>
          <DrawerFooter className="flex-row justify-between gap-2 border-t pt-4 flex-wrap">
            {renderViewFooterButtons()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render Dialog for all other cases
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
        {mode === 'view' && rate ? (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            {renderViewFooterButtons()}
          </div>
        ) : (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            {renderFormFooterButtons()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
