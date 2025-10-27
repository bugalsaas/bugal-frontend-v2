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
import { 
  InvoicePayment, 
  PaymentMethod 
} from '@/lib/api/invoices-service';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Form validation schema
const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amountInclGst: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  otherPaymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'payment' | 'writeoff';
  invoiceId: string;
  outstandingAmount: number;
  onSave?: (payment: InvoicePayment) => void;
}

export function PaymentModal({ isOpen, onClose, mode, invoiceId, outstandingAmount, onSave }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amountInclGst: outstandingAmount,
      paymentMethod: PaymentMethod.EFT,
      otherPaymentMethod: '',
      notes: '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        amountInclGst: outstandingAmount,
        paymentMethod: PaymentMethod.EFT,
        otherPaymentMethod: '',
        notes: '',
      });
    }
  }, [isOpen, outstandingAmount, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const paymentData: InvoicePayment = {
        id: Date.now().toString(),
        date: data.date,
        amountExclGst: data.amountInclGst / 1.1, // Assuming 10% GST
        amountInclGst: data.amountInclGst,
        amountGst: data.amountInclGst - (data.amountInclGst / 1.1),
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
      };

      onSave?.(paymentData);
      onClose();
    } catch (error) {
      console.error('Payment save error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const isWriteOff = mode === 'writeoff';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isWriteOff ? 'Write Off Invoice' : 'Record Payment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Outstanding Amount */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Outstanding Amount: {formatCurrency(outstandingAmount)}
              </span>
            </div>
          </Card>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register('date')}
                />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amountInclGst">
                  {isWriteOff ? 'Write-off Amount *' : 'Payment Amount *'}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amountInclGst"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={outstandingAmount}
                    className="pl-10"
                    {...form.register('amountInclGst', { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.amountInclGst && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.amountInclGst.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(outstandingAmount)}
                </p>
              </div>
            </div>

            {!isWriteOff && (
              <>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={form.watch('paymentMethod')}
                    onValueChange={(value) => {
                      form.setValue('paymentMethod', value as PaymentMethod);
                      setPaymentMethod(value as PaymentMethod);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.EFT}>EFT</SelectItem>
                      <SelectItem value={PaymentMethod.Cash}>Cash</SelectItem>
                      <SelectItem value={PaymentMethod.Other}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.paymentMethod.message}</p>
                  )}
                </div>

                {paymentMethod === PaymentMethod.Other && (
                  <div>
                    <Label htmlFor="otherPaymentMethod">Other Payment Method *</Label>
                    <Input
                      id="otherPaymentMethod"
                      {...form.register('otherPaymentMethod')}
                      placeholder="e.g., Cheque, Credit Card"
                    />
                    {form.formState.errors.otherPaymentMethod && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.otherPaymentMethod.message}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder={isWriteOff ? "Reason for write-off..." : "Payment notes..."}
                rows={3}
              />
            </div>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(form.watch('amountInclGst') || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Remaining:</span>
                <span className="font-medium">
                  {formatCurrency(outstandingAmount - (form.watch('amountInclGst') || 0))}
                </span>
              </div>
            </div>
          </Card>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            className={isWriteOff ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isWriteOff ? 'Write Off' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
