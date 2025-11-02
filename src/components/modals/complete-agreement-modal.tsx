'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Agreement } from '@/lib/api/agreements-service';
import { attachmentsApi } from '@/lib/api/attachments-service';
import { Info, Upload, FileText, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface CompleteAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement | null;
  onComplete: () => void;
  isLoading?: boolean;
}

export function CompleteAgreementModal({
  isOpen,
  onClose,
  agreement,
  onComplete,
  isLoading = false,
}: CompleteAgreementModalProps) {
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !agreement) return;

    setUploading(true);
    setUploadError(null);

    try {
      const attachment = await attachmentsApi.upload(file, agreement.id);
      setAttachments(prev => [...prev, { id: attachment.id, name: attachment.name, size: attachment.size }]);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleComplete = async () => {
    if (!agreement) return;
    
    try {
      await onComplete();
      // Reset state on successful completion
      setAttachments([]);
      setUploadError(null);
    } catch (error) {
      console.error('Failed to complete agreement:', error);
    }
  };

  const handleClose = () => {
    setAttachments([]);
    setUploadError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Agreement {agreement?.code || ''}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              We recommend uploading the signed agreement for future reference.
            </AlertDescription>
          </Alert>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Upload Signed Agreement (Optional)
              </Label>
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading || isLoading || !agreement}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading || isLoading || !agreement}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>

            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2 mt-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Agreement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

