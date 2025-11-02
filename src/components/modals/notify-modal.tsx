'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { 
  Invoice,
  NotifyItem
} from '@/lib/api/invoices-service';
import { invoicesApi } from '@/lib/api/invoices-service';
import { useInvoiceActions } from '@/hooks/use-invoices';
import { 
  Mail, 
  Download, 
  Send,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

// Form validation schema
const notifySchema = z.object({
  recipients: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).min(1, 'At least one recipient is required'),
});

type NotifyFormData = z.infer<typeof notifySchema>;

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onNotify?: () => void;
  onDownload?: () => void;
}

export function NotifyModal({ isOpen, onClose, invoice, onNotify, onDownload }: NotifyModalProps) {
  const [recipients, setRecipients] = useState<NotifyItem[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<NotifyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyInvoice, downloadInvoice } = useInvoiceActions();

  const form = useForm<NotifyFormData>({
    resolver: zodResolver(notifySchema),
    defaultValues: {
      recipients: [],
    },
  });

  // Fetch recipients when modal opens
  useEffect(() => {
    if (isOpen && invoice?.id) {
      setIsLoadingRecipients(true);
      setError(null);
      invoicesApi.getRecipients(invoice.id)
        .then((data) => {
          setRecipients(data);
          // Pre-select all recipients
          setSelectedRecipients(data);
          form.setValue('recipients', data);
        })
        .catch((err) => {
          console.error('Failed to fetch recipients:', err);
          setError(err instanceof Error ? err.message : 'Failed to load recipients');
        })
        .finally(() => {
          setIsLoadingRecipients(false);
        });
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedRecipients([]);
      setRecipients([]);
      form.reset({ recipients: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, invoice?.id]);

  const handleRecipientToggle = (recipient: NotifyItem, checked: boolean) => {
    let newSelection: NotifyItem[];
    if (checked) {
      newSelection = [...selectedRecipients, recipient];
    } else {
      newSelection = selectedRecipients.filter(r => r.email !== recipient.email);
    }
    
    setSelectedRecipients(newSelection);
    form.setValue('recipients', newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
      form.setValue('recipients', []);
    } else {
      setSelectedRecipients(recipients);
      form.setValue('recipients', recipients);
    }
  };

  const onSubmit = async (data: NotifyFormData) => {
    if (!invoice?.id || !data.recipients || data.recipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      // Ensure recipients have the correct structure (name and email)
      const recipientsPayload = data.recipients.map(r => ({
        name: r.name || r.email,
        email: r.email,
      }));
      
      await notifyInvoice(invoice.id, { recipients: recipientsPayload });
      onNotify?.();
      // Don't close immediately - let the parent handle it
    } catch (error) {
      console.error('Notify error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice?.id) return;
    try {
      await downloadInvoice(invoice.id);
      onDownload?.();
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Failed to download invoice');
    }
  };

  // Guard clause to prevent rendering when invoice is undefined
  if (!invoice) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Notify Invoice: {invoice.code}</span>
          </DialogTitle>
          <DialogDescription>
            Select recipients to send this invoice to via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Invoice Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{invoice.code}</h3>
                <p className="text-sm text-blue-700">{invoice.contact.fullName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-900">
                  ${invoice.totalInclGst.toFixed(2)}
                </p>
                <p className="text-sm text-blue-700">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {/* Recipients Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Recipients</h3>
              {recipients.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading || isLoadingRecipients}
                >
                  {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {isLoadingRecipients ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading recipients...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>{error}</p>
              </div>
            ) : recipients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No recipients available for this invoice.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipients.map((recipient, index) => {
                  const isSelected = selectedRecipients.some(r => r.email === recipient.email);
                  return (
                    <Card 
                      key={`${recipient.email}-${index}`} 
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleRecipientToggle(recipient, !isSelected)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleRecipientToggle(recipient, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                          disabled={isLoading || isLoadingRecipients}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{recipient.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{recipient.email}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {form.formState.errors.recipients && (
              <div className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{form.formState.errors.recipients.message}</span>
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedRecipients.length > 0 && (
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </Card>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || isLoadingRecipients}>
            Cancel
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleDownload}
            disabled={isLoading || isLoadingRecipients}
          >
            <Download className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || isLoadingRecipients || selectedRecipients.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification ({selectedRecipients.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
