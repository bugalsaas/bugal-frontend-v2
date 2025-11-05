'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Shift } from '@/lib/api/shifts-service';
import { useShiftActions } from '@/hooks/use-shifts';
import { Loader2 } from 'lucide-react';
import { formatShiftDateTime, formatShiftDuration } from '@/lib/utils/shift-helpers';
import { Badge } from '@/components/ui/badge';

const completeShiftSchema = z.object({
  isGstFree: z.boolean(),
  notes: z.string().max(5000, 'Notes must be less than 5000 characters').optional(),
});

type CompleteShiftFormData = z.infer<typeof completeShiftSchema>;

interface CompleteShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onComplete?: () => void;
}

export function CompleteShiftModal({ isOpen, onClose, shift, onComplete }: CompleteShiftModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { completeShift, isCompleting } = useShiftActions();
  const [notesLength, setNotesLength] = useState(0);

  const form = useForm<CompleteShiftFormData>({
    resolver: zodResolver(completeShiftSchema),
    defaultValues: {
      isGstFree: false,
      notes: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = form;
  const notes = watch('notes');

  useEffect(() => {
    if (notes !== undefined) {
      setNotesLength(notes.length);
    }
  }, [notes]);

  useEffect(() => {
    if (isOpen && shift) {
      reset({
        isGstFree: shift.isGstFree || false,
        notes: shift.notes || '',
      });
    }
  }, [isOpen, shift, reset]);

  const onSubmit = async (data: CompleteShiftFormData) => {
    if (!shift) return;

    try {
      await completeShift(shift.id, {
        isGstFree: data.isGstFree,
        notes: data.notes || undefined,
      });
      
      onComplete?.();
      handleClose();
    } catch (error) {
      console.error('Failed to complete shift:', error);
    }
  };

  const handleClose = () => {
    reset();
    setNotesLength(0);
    onClose();
  };

  if (!shift) return null;

  const startTime = formatShiftDateTime(shift.startDate);
  const endTime = formatShiftDateTime(shift.endDate);

  // Render content
  const renderContent = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shift Details */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Shift Details</h3>
              <Badge variant="outline">{shift.shiftStatus}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Contact:</span>
                <span className="ml-2 font-medium">{shift.contact?.fullName || shift.client || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Assignee:</span>
                <span className="ml-2 font-medium">{shift.assignee?.fullName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Summary:</span>
                <span className="ml-2 font-medium">{shift.summary || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{shift.category || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{startTime.date}</span>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium">
                  {startTime.time} - {endTime.time} ({formatShiftDuration(shift.duration)})
                </span>
              </div>
              {shift.location && (
                <div className="col-span-2">
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{shift.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Completion Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Completion</h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="isGstFree"
                checked={form.watch('isGstFree')}
                onCheckedChange={(checked) => form.setValue('isGstFree', checked)}
                disabled={isCompleting}
              />
              <Label htmlFor="isGstFree" className="text-sm font-medium">
                Is this shift GST free?
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes
                <span className="ml-2 text-sm text-gray-500">
                  ({notesLength}/5000)
                </span>
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="e.g. Client found a recipe suitable for the ingredients purchased and followed to completion."
                rows={4}
                maxLength={5000}
                disabled={isCompleting}
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </form>
  );

  // Render footer buttons
  const renderFooterButtons = () => (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isCompleting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isCompleting}
      >
        {isCompleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Completing...
          </>
        ) : (
          'Complete Shift'
        )}
      </Button>
    </>
  );

  // Render Drawer on mobile
  if (!isDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Complete Shift</DrawerTitle>
            <DrawerDescription>
              Complete this shift and add any completion notes.
            </DrawerDescription>
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

  // Render Dialog on desktop
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Shift</DialogTitle>
          <DialogDescription>
            Complete this shift and add any completion notes.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

