'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Agreement, AgreementStatus, AgreementCreateDto, AgreementUpdateDto } from '@/lib/api/agreements-service';
import { Contact } from '@/lib/api/contacts-service';
import { useContacts } from '@/hooks/use-contacts';
import { DatePickerInputField } from '@/components/form/date-picker-input-field';
import { defaultProviderResponsibilities, defaultParticipantResponsibilities } from '@/lib/constants/agreement-responsibilities';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  Upload,
  Download,
  AlertCircle,
  Info,
  Edit,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Form validation schema
const agreementSchema = z.object({
  idContact: z.string().min(1, 'Contact is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reviewDate: z.string().min(1, 'Review date is required'),
  amendmentDays: z.number().min(1).max(365),
  sendInvoicesAfter: z.number().max(365).optional(),
  supportItems: z.array(z.object({
    NDISNumber: z.string().min(1, 'NDIS item number is required'),
    NDISName: z.string().min(1, 'NDIS item name is required'),
    description: z.string().min(1, 'Description is required'),
    amountExclGst: z.string().min(1, 'Rate is required'),
    location: z.string().min(1, 'Location is required'),
  })).min(1, 'At least one support item is required'),
  userResponsibilities: z.array(z.object({
    text: z.string().min(1, 'Responsibility text is required'),
  })).min(1, 'At least one user responsibility is required'),
  contactResponsibilities: z.array(z.object({
    text: z.string().min(1, 'Responsibility text is required'),
  })).min(1, 'At least one contact responsibility is required'),
  canChargeCancellation: z.boolean().optional(),
  idAttachments: z.array(z.string()).optional(),
});

type AgreementFormData = z.infer<typeof agreementSchema>;

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  agreement?: Agreement;
  onSave?: (agreement: Agreement) => void;
  onEdit?: (agreement: Agreement) => void;
  onDelete?: (agreementId: string) => void;
}

export function AgreementModal({ isOpen, onClose, mode, agreement, onSave, onEdit, onDelete }: AgreementModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { data: contacts } = useContacts({ pageSize: 100 });

  const isReadOnly = mode === 'view';

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      idContact: '',
      startDate: '',
      endDate: '',
      reviewDate: '',
      amendmentDays: 7,
      sendInvoicesAfter: 14,
      supportItems: [],
      userResponsibilities: [],
      contactResponsibilities: [],
      canChargeCancellation: true,
      idAttachments: [],
    },
  });

  const {
    fields: supportItemsFields,
    append: appendSupportItem,
    remove: removeSupportItem,
  } = useFieldArray({
    control: form.control,
    name: 'supportItems',
  });

  const {
    fields: userRespFields,
    append: appendUserResp,
    remove: removeUserResp,
  } = useFieldArray({
    control: form.control,
    name: 'userResponsibilities',
  });

  const {
    fields: contactRespFields,
    append: appendContactResp,
    remove: removeContactResp,
  } = useFieldArray({
    control: form.control,
    name: 'contactResponsibilities',
  });

  // Initialize form when agreement changes
  useEffect(() => {
    if (agreement && mode !== 'new') {
      // Find contact
      const contact = contacts.find(c => c.id === agreement.idContact);
      setSelectedContact(contact || null);

      // Parse dates to YYYY-MM-DD format
      const formatDateToString = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        idContact: agreement.idContact,
        startDate: formatDateToString(agreement.startDate),
        endDate: formatDateToString(agreement.endDate),
        reviewDate: formatDateToString(agreement.reviewDate),
        amendmentDays: agreement.amendmentDays,
        sendInvoicesAfter: agreement.sendInvoicesAfter,
        supportItems: agreement.supportItems.map(item => ({
          NDISNumber: item.NDISNumber,
          NDISName: item.NDISName,
          description: item.description,
          amountExclGst: typeof item.amountExclGst === 'string' ? item.amountExclGst : String(item.amountExclGst || '0'),
          location: item.location || '',
        })),
        userResponsibilities: agreement.userResponsibilities.map(text => ({ text })),
        contactResponsibilities: agreement.contactResponsibilities.map(text => ({ text })),
        canChargeCancellation: agreement.canChargeCancellation,
        idAttachments: agreement.attachments?.map(att => att.id) || [],
      });
    } else if (mode === 'new') {
      // Reset to defaults with pre-populated responsibilities
      form.reset({
        idContact: '',
        startDate: '',
        endDate: '',
        reviewDate: '',
        amendmentDays: 7,
        sendInvoicesAfter: 14,
        supportItems: [],
        userResponsibilities: defaultProviderResponsibilities.map(text => ({ text })),
        contactResponsibilities: defaultParticipantResponsibilities.map(text => ({ text })),
        canChargeCancellation: true,
        idAttachments: [],
      });
    }
  }, [agreement, mode, form, contacts]);

  const onSubmit = async (data: AgreementFormData) => {
    try {
      const agreementData: AgreementCreateDto = {
        idContact: data.idContact,
        startDate: data.startDate,
        endDate: data.endDate,
        reviewDate: data.reviewDate,
        amendmentDays: data.amendmentDays,
        sendInvoicesAfter: data.sendInvoicesAfter,
        supportItems: data.supportItems.map(item => ({
          NDISNumber: item.NDISNumber,
          NDISName: item.NDISName,
          description: item.description,
          amountExclGst: item.amountExclGst,
          location: item.location,
          frequency: [],
        })),
        userResponsibilities: data.userResponsibilities.map(item => item.text),
        contactResponsibilities: data.contactResponsibilities.map(item => item.text),
        canChargeCancellation: data.canChargeCancellation,
        idAttachments: data.idAttachments || [],
      };

      if (mode === 'new') {
        const { agreementsApi } = await import('@/lib/api/agreements-service');
        const newAgreement = await agreementsApi.create(agreementData);
        onSave?.(newAgreement);
      } else if (mode === 'edit' && agreement?.id) {
        const { agreementsApi } = await import('@/lib/api/agreements-service');
        const updatedAgreement = await agreementsApi.update(agreement.id, {
          ...agreementData,
          id: agreement.id,
        });
        onSave?.(updatedAgreement);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save agreement:', error);
    }
  };

  const handleContactChange = (contactId: string) => {
    form.setValue('idContact', contactId);
    const contact = contacts.find(c => c.id === contactId);
    setSelectedContact(contact || null);
  };

  const handleUseContactAddress = (index: number) => {
    if (!selectedContact) return;
    const location = [
      selectedContact.addressLine1,
      selectedContact.addressLine2,
      selectedContact.state,
      selectedContact.postcode,
    ].filter(Boolean).join(', ');
    form.setValue(`supportItems.${index}.location`, location);
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="idContact">Contact *</Label>
        <Select
          value={form.watch('idContact') || ''}
          onValueChange={handleContactChange}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.organisationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.idContact && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.idContact.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-gray-700">Dates</h4>
        <DatePickerInputField
          label="When does the agreement start? *"
          id="startDate"
          value={form.watch('startDate')}
          onChange={(value) => form.setValue('startDate', value)}
          error={form.formState.errors.startDate}
          disabled={isReadOnly}
        />
        <DatePickerInputField
          label="When does the agreement end? *"
          id="endDate"
          value={form.watch('endDate')}
          onChange={(value) => form.setValue('endDate', value)}
          error={form.formState.errors.endDate}
          disabled={isReadOnly}
        />
        <DatePickerInputField
          label="When would you like to review this agreement? *"
          id="reviewDate"
          value={form.watch('reviewDate')}
          onChange={(value) => form.setValue('reviewDate', value)}
          error={form.formState.errors.reviewDate}
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-gray-700">Terms</h4>
        <div>
          <Label htmlFor="amendmentDays">How many days notice is to be given for any amendments to this agreement? *</Label>
          <Input
            id="amendmentDays"
            type="number"
            min="1"
            max="365"
            {...form.register('amendmentDays', { valueAsNumber: true })}
            disabled={isReadOnly}
          />
          {form.formState.errors.amendmentDays && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.amendmentDays.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="sendInvoicesAfter">What are the invoice payment terms in days?</Label>
          <Input
            id="sendInvoicesAfter"
            type="number"
            min="0"
            max="365"
            {...form.register('sendInvoicesAfter', { valueAsNumber: true })}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );

  const renderSupportItemsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-gray-700">Support Items</h4>
        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSupportItem({ NDISNumber: '', NDISName: '', description: '', amountExclGst: '', location: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Support Item
          </Button>
        )}
      </div>

      {supportItemsFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No support items yet. Click "Add Support Item" to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {supportItemsFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`supportItems.${index}.NDISNumber`}>NDIS item number *</Label>
                    <Input
                      {...form.register(`supportItems.${index}.NDISNumber`)}
                      disabled={isReadOnly}
                    />
                    {form.formState.errors.supportItems?.[index]?.NDISNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.supportItems[index]?.NDISNumber?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`supportItems.${index}.NDISName`}>NDIS item name *</Label>
                    <Input
                      {...form.register(`supportItems.${index}.NDISName`)}
                      disabled={isReadOnly}
                    />
                    {form.formState.errors.supportItems?.[index]?.NDISName && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.supportItems[index]?.NDISName?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`supportItems.${index}.description`}>Description *</Label>
                  <Textarea
                    {...form.register(`supportItems.${index}.description`)}
                    disabled={isReadOnly}
                    rows={3}
                  />
                  {form.formState.errors.supportItems?.[index]?.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.supportItems[index]?.description?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`supportItems.${index}.amountExclGst`}>Rate *</Label>
                  <Input
                    {...form.register(`supportItems.${index}.amountExclGst`)}
                    disabled={isReadOnly}
                    placeholder="0.00"
                  />
                  {form.formState.errors.supportItems?.[index]?.amountExclGst && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.supportItems[index]?.amountExclGst?.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`supportItems.${index}.location`}>Location *</Label>
                    {selectedContact && !isReadOnly && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => handleUseContactAddress(index)}
                      >
                        Use contact's address
                      </Button>
                    )}
                  </div>
                  <Input
                    {...form.register(`supportItems.${index}.location`)}
                    disabled={isReadOnly}
                  />
                  {form.formState.errors.supportItems?.[index]?.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.supportItems[index]?.location?.message}
                    </p>
                  )}
                </div>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSupportItem(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Support Item
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderResponsibilitiesTab = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-gray-700">User's Responsibilities</h4>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendUserResp({ text: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsibility
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {userRespFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Textarea
                {...form.register(`userResponsibilities.${index}.text`)}
                disabled={isReadOnly}
                rows={2}
                className="flex-1"
              />
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeUserResp(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-gray-700">Participant's Responsibilities</h4>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendContactResp({ text: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsibility
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {contactRespFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Textarea
                {...form.register(`contactResponsibilities.${index}.text`)}
                disabled={isReadOnly}
                rows={2}
                className="flex-1"
              />
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeContactResp(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClausesTab = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          It is advised that the User includes a Cancellation Policy. However, it is not compulsory.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            1. Cancellations are where a provider has a Short Notice Cancellation (or no show) they are able to claim 100% of the agreed fee associated with the activity from the participant's plan, subject to this Price Guide and the terms of the service agreement with the participant.
          </div>
          <div>
            2. A cancellation is a short notice cancellation if the participant:
          </div>
          <div className="ml-4 space-y-1">
            <div>a) does not show up for a scheduled support within a reasonable time, or is not present at the agreed place and within a reasonable time when the provider is travelling to deliver the support; or</div>
            <div>
              b) has given less than two (2) clear business days' notice for a support that meets both of the following conditions:
              <div className="ml-4 space-y-1 mt-1">
                <div>i. the support is less than 8 hours continuous duration; AND</div>
                <div>ii. the agreed total price for the support is less than $1000; or</div>
              </div>
            </div>
            <div>c) has given less than five (5) clear business days' notice for any other support.</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={form.watch('canChargeCancellation') || false}
            onCheckedChange={(checked) => form.setValue('canChargeCancellation', checked)}
            disabled={isReadOnly}
          />
          <Label htmlFor="canChargeCancellation">Include cancellation clause?</Label>
        </div>
      </div>
    </div>
  );

  const renderViewMode = () => {
    if (!agreement) return null;

    return (
      <div className="space-y-6">
        <div>
          <Label className="text-sm text-gray-500">Status</Label>
          <p className="font-medium">{agreement.agreementStatus}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-500">Contact</Label>
          <p className="font-medium">{agreement.contact.fullName}</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Dates</h4>
          <div>
            <Label className="text-sm text-gray-500">Start date</Label>
            <p>{formatDate(new Date(agreement.startDate))}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-500">End date</Label>
            <p>{formatDate(new Date(agreement.endDate))}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-500">Review date</Label>
            <p>{formatDate(new Date(agreement.reviewDate))}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-500">Notice</Label>
            <p>{agreement.amendmentDays} days</p>
          </div>
          <div>
            <Label className="text-sm text-gray-500">Invoice terms</Label>
            <p>{agreement.sendInvoicesAfter} days</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Support Items</h4>
          {agreement.supportItems.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <p><span className="font-medium">NDIS item no.:</span> {item.NDISNumber}</p>
                <p><span className="font-medium">NDIS item name:</span> {item.NDISName}</p>
                <p><span className="font-medium">Description:</span> {item.description}</p>
                <p><span className="font-medium">Rate:</span> ${typeof item.amountExclGst === 'string' ? item.amountExclGst : item.amountExclGst?.toFixed(2)}</p>
                <p><span className="font-medium">Location:</span> {item.location}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">User's Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1">
            {agreement.userResponsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Participant's Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1">
            {agreement.contactResponsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Clauses</h4>
          <p><span className="font-medium">Cancellation fee:</span> {agreement.canChargeCancellation ? 'Yes' : 'No'}</p>
        </div>

        {agreement.attachments && agreement.attachments.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">Attachments</h4>
            <div className="space-y-2">
              {agreement.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{attachment.name}</span>
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' && 'New Agreement'}
            {mode === 'edit' && 'Edit Agreement'}
            {mode === 'view' && `View Agreement ${agreement?.code || ''}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'new' && 'Create a new service agreement'}
            {mode === 'edit' && 'Edit the service agreement details'}
            {mode === 'view' && 'View the service agreement details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isReadOnly ? (
            renderViewMode()
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="support">Support Items</TabsTrigger>
                <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                <TabsTrigger value="clauses">Clauses</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4">
                {renderBasicInfoTab()}
              </TabsContent>

              <TabsContent value="support" className="mt-4">
                {renderSupportItemsTab()}
              </TabsContent>

              <TabsContent value="responsibilities" className="mt-4">
                {renderResponsibilitiesTab()}
              </TabsContent>

              <TabsContent value="clauses" className="mt-4">
                {renderClausesTab()}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex justify-between mt-6">
            <div className="flex space-x-2">
              {mode === 'view' && onEdit && (
                <Button type="button" variant="outline" onClick={() => onEdit(agreement!)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {mode === 'view' && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this agreement?')) {
                      onDelete(agreement!.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>

            {!isReadOnly && (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : mode === 'new' ? 'Create Agreement' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

