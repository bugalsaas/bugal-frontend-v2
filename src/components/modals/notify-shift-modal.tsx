'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shift, NotifyItem } from '@/lib/api/shifts-service';
import { useShiftActions, useRecipientsShift } from '@/hooks/use-shifts';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send, User, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface NotifyShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onNotify?: () => void;
}

export function NotifyShiftModal({ isOpen, onClose, shift, onNotify }: NotifyShiftModalProps) {
  const { notifyShift, isNotifying } = useShiftActions();
  const { loading: loadingRecipients, data: recipients, error } = useRecipientsShift(shift?.id);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && recipients && recipients.length > 0) {
      // Pre-select all recipients
      setSelectedRecipients(recipients.map(r => r.email));
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedRecipients([]);
    }
  }, [isOpen, recipients]);

  const handleToggleRecipient = (email: string) => {
    setSelectedRecipients(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (!recipients) return;
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.email));
    }
  };

  const handleNotify = async () => {
    if (!shift || selectedRecipients.length === 0 || !recipients) return;

    try {
      const selectedRecipientObjects = recipients.filter(r =>
        selectedRecipients.includes(r.email)
      );
      await notifyShift(shift.id, selectedRecipientObjects);
      onNotify?.();
      setSelectedRecipients([]);
      onClose();
    } catch (err) {
      console.error('Failed to notify shift:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notify Shift</DialogTitle>
          <DialogDescription>
            Select recipients to notify about this shift.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loadingRecipients ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading recipients...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          ) : !recipients || recipients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No recipients available
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Recipients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isNotifying}
                >
                  {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.map((recipient) => (
                  <Card
                    key={recipient.email}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRecipients.includes(recipient.email)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleRecipient(recipient.email)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedRecipients.includes(recipient.email)}
                        onCheckedChange={() => handleToggleRecipient(recipient.email)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isNotifying}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <p className="font-medium">{recipient.name}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-600">{recipient.email}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedRecipients.length === 0 && (
                <p className="text-sm text-red-600">Please select at least one recipient</p>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isNotifying}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleNotify}
            disabled={isNotifying || selectedRecipients.length === 0 || loadingRecipients || !recipients}
          >
            {isNotifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Notify ({selectedRecipients.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

