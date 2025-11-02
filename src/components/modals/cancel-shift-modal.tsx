'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Shift } from '@/lib/api/shifts-service';
import { useShiftActions } from '@/hooks/use-shifts';
import { Loader2 } from 'lucide-react';

const cancelShiftSchema = z.object({
  cancellationReason: z.string().min(1, 'Cancellation reason is required'),
  hasCancellationFee: z.boolean(),
  cancellationAmountExclGst: z.number().min(0, 'Amount must be positive').optional(),
  isGstFree: z.boolean().optional(),
}).refine((data) => {
  if (data.hasCancellationFee) {
    return data.cancellationAmountExclGst !== undefined && data.cancellationAmountExclGst >= 0;
  }
  return true;
}, {
  message: 'Cancellation amount is required when adding a cancellation fee',
  path: ['cancellationAmountExclGst'],
});

type CancelShiftFormData = z.infer<typeof cancelShiftSchema>;

interface CancelShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onCancel?: () => void;
}

export function CancelShiftModal({ isOpen, onClose, shift, onCancel }: CancelShiftModalProps) {
  const { cancelShift, isCancelling } = useShiftActions();
  const [hasCancellationFee, setHasCancellationFee] = useState(false);

  const form = useForm<CancelShiftFormData>({
    resolver: zodResolver(cancelShiftSchema),
    defaultValues: {
      cancellationReason: '',
      hasCancellationFee: false,
      cancellationAmountExclGst: undefined,
      isGstFree: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form;

  useEffect(() => {
    if (isOpen && shift) {
      reset({
        cancellationReason: '',
        hasCancellationFee: false,
        cancellationAmountExclGst: undefined,
        isGstFree: shift.isGstFree || false,
      });
      setHasCancellationFee(false);
    }
  }, [isOpen, shift, reset]);

  const onSubmit = async (data: CancelShiftFormData) => {
    if (!shift) return;

    try {
      await cancelShift(shift.id, {
        cancellationReason: data.cancellationReason,
        cancellationAmountExclGst: data.hasCancellationFee ? (data.cancellationAmountExclGst || 0) : 0,
        isGstFree: data.hasCancellationFee ? (data.isGstFree || false) : false,
      });
      
      onCancel?.();
      handleClose();
    } catch (error) {
      console.error('Failed to cancel shift:', error);
    }
  };

  const handleClose = () => {
    reset();
    setHasCancellationFee(false);
    onClose();
  };

  const handleHasFeeChange = (checked: boolean) => {
    setHasCancellationFee(checked);
    setValue('hasCancellationFee', checked);
    if (!checked) {
      setValue('cancellationAmountExclGst', undefined);
      setValue('isGstFree', false);
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cancel Shift</DialogTitle>
          <DialogDescription>
            Cancel this shift and provide a reason. You may optionally add a cancellation fee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cancellationReason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancellationReason"
              {...register('cancellationReason')}
              placeholder="Enter the reason for cancellation"
              rows={4}
              disabled={isCancelling}
              className={errors.cancellationReason ? 'border-red-500' : ''}
            />
            {errors.cancellationReason && (
              <p className="text-sm text-red-500">{errors.cancellationReason.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="hasCancellationFee"
              checked={hasCancellationFee}
              onCheckedChange={handleHasFeeChange}
              disabled={isCancelling}
            />
            <Label htmlFor="hasCancellationFee" className="text-sm font-medium">
              Add cancellation fee?
            </Label>
          </div>

          {hasCancellationFee && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              <div className="space-y-2">
                <Label htmlFor="cancellationAmountExclGst">
                  Amount (excl. GST) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cancellationAmountExclGst"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cancellationAmountExclGst', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isCancelling}
                  className={errors.cancellationAmountExclGst ? 'border-red-500' : ''}
                />
                {errors.cancellationAmountExclGst && (
                  <p className="text-sm text-red-500">{errors.cancellationAmountExclGst.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGstFree"
                  checked={form.watch('isGstFree') || false}
                  onCheckedChange={(checked) => setValue('isGstFree', checked)}
                  disabled={isCancelling}
                />
                <Label htmlFor="isGstFree" className="text-sm font-medium">
                  Is this shift GST free?
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCancelling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Shift'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

