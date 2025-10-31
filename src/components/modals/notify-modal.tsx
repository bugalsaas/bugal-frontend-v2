'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Invoice 
} from '@/lib/api/invoices-service';
import { 
  Mail, 
  Download, 
  Send,
  User,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Form validation schema
const notifySchema = z.object({
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
});

type NotifyFormData = z.infer<typeof notifySchema>;

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onNotify?: (recipients: Recipient[]) => void;
  onDownload?: () => void;
}

export function NotifyModal({ isOpen, onClose, invoice, onNotify, onDownload }: NotifyModalProps) {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotifyFormData>({
    resolver: zodResolver(notifySchema),
    defaultValues: {
      recipients: [],
    },
  });

  // Mock recipients data - in real app, this would come from API
  const mockRecipients: Recipient[] = [
    {
      id: '1',
      name: invoice.contact.fullName,
      email: invoice.contact.email || '',
      role: 'Primary Contact',
    },
    {
      id: '2',
      name: 'Finance Team',
      email: 'finance@company.com',
      role: 'Finance',
    },
    {
      id: '3',
      name: 'Accounts Payable',
      email: 'ap@company.com',
      role: 'Accounts Payable',
    },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRecipients([]);
      form.reset({ recipients: [] });
    }
  }, [isOpen, form]);

  const handleRecipientToggle = (recipientId: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedRecipients, recipientId];
    } else {
      newSelection = selectedRecipients.filter(id => id !== recipientId);
    }
    
    setSelectedRecipients(newSelection);
    form.setValue('recipients', newSelection);
  };

  const onSubmit = async (data: NotifyFormData) => {
    try {
      setIsLoading(true);
      const selectedRecipientObjects = mockRecipients.filter(r => 
        data.recipients.includes(r.id)
      );
      
      onNotify?.(selectedRecipientObjects);
      onClose();
    } catch (error) {
      console.error('Notify error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    onDownload?.();
  };

  // Guard clause to prevent rendering when invoice is undefined
  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Notify Invoice: {invoice.code}</span>
          </DialogTitle>
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
            <h3 className="text-lg font-semibold mb-4">Select Recipients</h3>
            <div className="space-y-3">
              {mockRecipients.map((recipient) => (
                <Card key={recipient.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={recipient.id}
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={(checked) => 
                        handleRecipientToggle(recipient.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{recipient.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {recipient.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{recipient.email}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || selectedRecipients.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
