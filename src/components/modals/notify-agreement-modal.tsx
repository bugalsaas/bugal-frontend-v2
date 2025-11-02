'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Agreement, NotifyItem } from '@/lib/api/agreements-service';
import { agreementsApi } from '@/lib/api/agreements-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send, User, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotifyAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement | null;
  onNotify: () => void;
  isLoading?: boolean;
}

export function NotifyAgreementModal({
  isOpen,
  onClose,
  agreement,
  onNotify,
  isLoading = false,
}: NotifyAgreementModalProps) {
  const [recipients, setRecipients] = useState<NotifyItem[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && agreement) {
      loadRecipients();
    } else {
      // Reset state when modal closes
      setRecipients([]);
      setSelectedRecipients([]);
      setError(null);
    }
  }, [isOpen, agreement]);

  const loadRecipients = async () => {
    if (!agreement) return;

    setLoadingRecipients(true);
    setError(null);

    try {
      const data = await agreementsApi.getRecipients(agreement.id);
      setRecipients(data);
      // Pre-select all recipients
      setSelectedRecipients(data.map(r => r.email));
    } catch (err) {
      console.error('Failed to load recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleToggleRecipient = (email: string) => {
    setSelectedRecipients(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.email));
    }
  };

  const handleNotify = async () => {
    if (!agreement || selectedRecipients.length === 0) return;

    try {
      const selectedRecipientObjects = recipients.filter(r =>
        selectedRecipients.includes(r.email)
      );
      await agreementsApi.notify(agreement.id, selectedRecipientObjects);
      onNotify();
      // Reset state
      setSelectedRecipients([]);
      onClose();
    } catch (err) {
      console.error('Failed to notify agreement:', err);
      setError(err instanceof Error ? err.message : 'Failed to notify agreement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notify Agreement: {agreement?.code || ''}</DialogTitle>
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
              <Button
                type="button"
                variant="outline"
                onClick={loadRecipients}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : recipients.length === 0 ? (
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleNotify}
            disabled={isLoading || selectedRecipients.length === 0 || loadingRecipients}
          >
            {isLoading ? (
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

